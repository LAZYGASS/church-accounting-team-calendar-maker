const CALENDAR_CONFIG = Object.freeze({
    MIN_YEAR: 1900,
    MAX_YEAR: 9999,
    MONTHS_PER_YEAR: 12,
    EXPORT_WIDTH: 800,
    EXPORT_VIEWPORT_WIDTH: 1024,
    EXPORT_SCALE: 2,
    DOWNLOAD_URL_LIFETIME_MS: 60000,
    BACKGROUND_COLOR: '#F4F8FB'
});

const validateCalendarDate = (year, month) => {
    if (!Number.isInteger(year) || year < CALENDAR_CONFIG.MIN_YEAR || year > CALENDAR_CONFIG.MAX_YEAR ||
        !Number.isInteger(month) || month < 1 || month > CALENDAR_CONFIG.MONTHS_PER_YEAR) {
        throw new RangeError('올바른 연도와 월을 입력해 주세요.');
    }
};

// ===== 날짜 계산 함수 =====

/**
 * 특정 월의 둘째주/넷째주 화요일 찾기
 */
function getSecondAndFourthTuesday(year, month) {
    const tuesdays = [];
    const date = new Date(year, month - 1, 1);

    // 해당 월의 모든 화요일 찾기
    while (date.getMonth() === month - 1) {
        if (date.getDay() === 2) { // 화요일
            tuesdays.push(date.getDate());
        }
        date.setDate(date.getDate() + 1);
    }

    // 둘째주, 넷째주 반환
    const executionDays = [];
    if (tuesdays.length >= 2) executionDays.push(tuesdays[1]); // 둘째주
    if (tuesdays.length >= 4) executionDays.push(tuesdays[3]); // 넷째주

    return executionDays;
}

/**
 * 집행일의 전주 금요일, 토요일 계산
 */
function getApprovalDays(year, month, executionDays) {
    const approvalDays = [];

    executionDays.forEach(day => {
        // 금요일 (4일 전)
        const friday = new Date(year, month - 1, day - 4);
        if (friday.getMonth() === month - 1) {
            approvalDays.push(friday.getDate());
        }

        // 토요일 (3일 전)
        const saturday = new Date(year, month - 1, day - 3);
        if (saturday.getMonth() === month - 1) {
            approvalDays.push(saturday.getDate());
        }
    });

    return approvalDays;
}

/**
 * 마지막주 전주 일요일 찾기
 */
function getCommitteeDay(year, month) {
    const lastDay = new Date(year, month, 0); // 해당 월의 마지막 날
    const lastDate = lastDay.getDate();

    // 마지막 주 찾기
    let lastSunday = null;
    for (let day = lastDate; day >= 1; day--) {
        const date = new Date(year, month - 1, day);
        if (date.getDay() === 0) { // 일요일
            lastSunday = day;
            break;
        }
    }

    // 마지막주 전주 일요일
    if (lastSunday) {
        const prevSunday = lastSunday - 7;
        if (prevSunday > 0) {
            return prevSunday;
        }
    }

    return null;
}

/**
 * 전체 일정 계산
 */
function calculateSchedule(year, month) {
    validateCalendarDate(year, month);
    const executionDays = getSecondAndFourthTuesday(year, month);
    const approvalDays = getApprovalDays(year, month, executionDays);
    const committeeDay = getCommitteeDay(year, month);

    return { executionDays, approvalDays, committeeDay };
}

// ===== 캘린더 생성 함수 =====

/**
 * 월별 캘린더 HTML 생성
 */
function generateCalendar(year, month) {
    const schedule = calculateSchedule(year, month);
    const { executionDays, approvalDays, committeeDay } = schedule;

    // 월의 첫날과 마지막날
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0=일요일

    // 이전 달 정보
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth, 0).getDate();

    // 캘린더 카드 생성
    let html = `
        <div class="calendar-card" id="calendar-${month}" data-year="${year}">
            <div class="month-number">${month}</div>
            <div class="header-box">
                <h3>예산집행캘린더</h3>
                <p>${String(year).slice(-2)}.${String(month).padStart(2, '0')}</p>
            </div>
            
            <div class="calendar-table-wrapper">
                <table class="calendar-table">
                    <thead>
                        <tr>
                            <th class="sunday">Sun</th>
                            <th>Mon</th>
                            <th>Tue</th>
                            <th>Wed</th>
                            <th>Thu</th>
                            <th>Fri</th>
                            <th>Sat</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    let dayCounter = 1;
    let nextMonthCounter = 1;

    // 주 단위로 행 생성 (최대 6주)
    for (let week = 0; week < 6; week++) {
        html += '<tr>';

        // 요일별 셀 생성
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            const cellIndex = week * 7 + dayOfWeek;

            if (cellIndex < startDayOfWeek) {
                // 이전 달 날짜
                const prevDay = prevMonthLastDay - (startDayOfWeek - cellIndex - 1);
                html += `<td><span class="date-number prev-month">${prevDay}</span></td>`;
            } else if (dayCounter <= daysInMonth) {
                // 현재 달 날짜
                const day = dayCounter;
                let dateClass = 'date-number';
                let eventBox = '';

                // 요일별 색상
                if (dayOfWeek === 0) dateClass += ' sunday';
                else if (dayOfWeek === 6) dateClass += ' saturday';

                // 집행일
                if (executionDays.includes(day)) {
                    dateClass += ' execution-day';
                    eventBox = '<div class="event-box execution">예산집행일</div>';
                }

                // 집행 안내는 날짜를 가리지 않도록 같은 주 목요일에 표시한다.
                if (executionDays.includes(day - 2) && dayOfWeek === 4) {
                    eventBox = '<div class="event-box execution-note">전 주 토요일 24:00까지 결재 완료</div>';
                }

                // 결재일 (금요일에만 박스 표시, 금토 2칸에 걸침)
                if (approvalDays.includes(day) && dayOfWeek === 5) {
                    eventBox = '<div class="event-box approval">결재일</div>';
                }

                // 운영위원회의
                if (day === committeeDay) {
                    eventBox = '<div class="event-box committee">운영위원회</div>';
                }

                html += `<td><span class="${dateClass}">${day}</span>${eventBox}</td>`;
                dayCounter++;
            } else {
                // 다음 달 날짜
                html += `<td><span class="date-number prev-month">${nextMonthCounter}</span></td>`;
                nextMonthCounter++;
            }
        }

        html += '</tr>';

        // 모든 날짜를 표시했으면 종료
        if (dayCounter > daysInMonth && nextMonthCounter > 7) break;
    }

    html += `
                    </tbody>
                </table>
            </div>
            
            <div class="footer-note">
                * 예산집행일: 둘째·넷째 화요일 (전 주 토요일 24:00까지 결재 완료)<br>
                * 운영위원회의: 마지막 일요일의 7일 전
            </div>
            
            <p class="download-status" role="status" aria-live="polite" data-html2canvas-ignore="true"></p>
            <button data-html2canvas-ignore="true" class="download-btn" onclick="downloadCalendarImage(${month})">
                ${month}월 이미지 다운로드
            </button>
        </div>
    `;

    return html;
}

/**
 * 12개월 캘린더 생성
 */
function generateAllCalendars(year) {
    const container = document.getElementById('calendars-container');
    container.innerHTML = '';

    for (let month = 1; month <= 12; month++) {
        const calendarHTML = generateCalendar(year, month);
        container.innerHTML += calendarHTML;
    }

    // 콘솔에 일정 출력 (검증용)
    console.log(`=== ${year}년 재정집행일정 ===`);
    for (let month = 1; month <= 12; month++) {
        const schedule = calculateSchedule(year, month);
        console.log(`${month}월:`);
        console.log(`  집행일: ${schedule.executionDays.join(', ')}`);
        console.log(`  결재일: ${schedule.approvalDays.join(', ')}`);
        console.log(`  운영위원회의: ${schedule.committeeDay || '없음'}`);
    }
}

// ===== 이미지 다운로드 함수 =====

/**
 * 특정 월 캘린더를 이미지로 다운로드
 */
const downloadCalendarImage = async (month) => {
    const calendarElement = document.getElementById(`calendar-${month}`);
    if (!calendarElement) return;
    const downloadButton = calendarElement.querySelector('.download-btn');
    const statusElement = calendarElement.querySelector('.download-status');
    if (downloadButton.disabled) return;

    // 선택창이 바뀌어도 실제로 표시된 달력의 연도로 저장한다.
    const displayedYear = Number(calendarElement.dataset.year);
    const originalLabel = downloadButton.textContent;
    downloadButton.disabled = true;
    downloadButton.textContent = '이미지 생성 중…';
    statusElement.textContent = '';
    try {
        validateCalendarDate(displayedYear, month);
        if (typeof html2canvas !== 'function') {
            throw new Error('이미지 도구를 불러오지 못했습니다. 인터넷 연결을 확인하고 새로고침해 주세요.');
        }
        await document.fonts.ready;
        const canvas = await html2canvas(calendarElement, {
            scale: CALENDAR_CONFIG.EXPORT_SCALE,
            backgroundColor: CALENDAR_CONFIG.BACKGROUND_COLOR,
            logging: false,
            windowWidth: CALENDAR_CONFIG.EXPORT_VIEWPORT_WIDTH,
            // 작은 화면에서도 저장본은 기존 800px 디자인을 유지한다.
            onclone: (clonedDocument) => {
                const clonedCalendar = clonedDocument.getElementById(calendarElement.id);
                clonedCalendar.style.width = `${CALENDAR_CONFIG.EXPORT_WIDTH}px`;
                clonedCalendar.style.maxWidth = 'none';
            }
        });
        const imageBlob = await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('이미지 파일 생성에 실패했습니다.'));
            }, 'image/png');
        });
        const imageUrl = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.download = `${displayedYear}_${String(month).padStart(2, '0')}_예산집행캘린더.png`;
        link.href = imageUrl;
        try {
            document.body.appendChild(link);
            link.click();
        } finally {
            link.remove();
            // 브라우저가 파일을 읽기 전에 URL을 해제하지 않는다.
            setTimeout(() => URL.revokeObjectURL(imageUrl), CALENDAR_CONFIG.DOWNLOAD_URL_LIFETIME_MS);
        }
        statusElement.textContent = '이미지 저장을 요청했습니다.';
    } catch (error) {
        console.error('캘린더 이미지 생성 실패:', error);
        statusElement.textContent = error instanceof Error && typeof html2canvas !== 'function'
            ? error.message
            : '이미지 생성에 실패했습니다. 다시 시도해 주세요.';
    } finally {
        downloadButton.disabled = false;
        downloadButton.textContent = originalLabel;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const yearSelect = document.getElementById('year-select');
    document.getElementById('generate-btn').addEventListener('click', () => {
        generateAllCalendars(Number(yearSelect.value));
    });
    generateAllCalendars(Number(yearSelect.value));
});
