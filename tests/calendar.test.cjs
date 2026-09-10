const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createContext, runInContext } = require('node:vm');
const { test } = require('node:test');

const loadCalendar = () => {
    const context = createContext({ document: { addEventListener() {} }, console });
    runInContext(readFileSync('web/js/calendar.js', 'utf8'), context);
    return context;
};

test('2000~2100년의 집행·결재·운영위원회 규칙과 윤년', () => {
    const context = loadCalendar();
    for (let year = 2000; year <= 2100; year++) {
        for (let month = 1; month <= 12; month++) {
            const schedule = context.calculateSchedule(year, month);
            const days = Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => index + 1);
            const tuesdays = days.filter(day => new Date(year, month - 1, day).getDay() === 2);
            const sundays = days.filter(day => new Date(year, month - 1, day).getDay() === 0);
            assert.deepEqual(Array.from(schedule.executionDays), [tuesdays[1], tuesdays[3]]);
            assert.deepEqual(Array.from(schedule.approvalDays), [tuesdays[1] - 4, tuesdays[1] - 3, tuesdays[3] - 4, tuesdays[3] - 3]);
            assert.equal(schedule.committeeDay, sundays.at(-2));
        }
    }
    assert.throws(() => context.calculateSchedule(2026, 13));
    assert.throws(() => context.calculateSchedule(NaN, 1));
});

const prepareDownload = () => {
    const context = loadCalendar();
    const button = { disabled: false, textContent: '다운로드' };
    const status = { textContent: '' };
    const downloads = [];
    context.document = {
        body: { appendChild() {} },
        fonts: { ready: Promise.resolve() },
        getElementById: () => ({ id: 'calendar-1', dataset: { year: '2026' }, querySelector: selector => selector === '.download-btn' ? button : status }),
        createElement: () => ({ click() { downloads.push(this.download); }, remove() {} })
    };
    context.URL = { createObjectURL: () => 'blob:calendar', revokeObjectURL() {} };
    context.setTimeout = callback => callback();
    context.console = { error() {} };
    return { context, button, status, downloads };
};

test('표시 연도로 저장하고 중복 클릭을 차단한다', async () => {
    const { context, button, downloads } = prepareDownload();
    context.html2canvas = async () => ({ toBlob: callback => callback({}) });
    await Promise.all([runInContext('downloadCalendarImage(1)', context), runInContext('downloadCalendarImage(1)', context)]);
    assert.deepEqual(downloads, ['2026_01_예산집행캘린더.png']);
    assert.equal(button.disabled, false);
    assert.equal(button.textContent, '다운로드');
});

test('캡처 실패 후 안내·버튼 복구·재시도', async () => {
    const { context, button, status, downloads } = prepareDownload();
    context.html2canvas = async () => { throw new Error('capture failed'); };
    await runInContext('downloadCalendarImage(1)', context);
    assert.match(status.textContent, /다시 시도/);
    assert.equal(button.disabled, false);
    context.html2canvas = async () => ({ toBlob: callback => callback({}) });
    await runInContext('downloadCalendarImage(1)', context);
    assert.equal(downloads.length, 1);
});

test('CDN 로드 실패 시 안내하고 버튼을 복구한다', async () => {
    const { context, button, status } = prepareDownload();
    await runInContext('downloadCalendarImage(1)', context);
    assert.match(status.textContent, /인터넷 연결/);
    assert.equal(button.disabled, false);
});
