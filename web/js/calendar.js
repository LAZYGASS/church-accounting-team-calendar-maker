// ===== localStorage 관리 함수 =====

/**
 * localStorage에서 커스텀 운영위원회 날짜 로드
 */
function loadCustomCommitteeDates() {
    const data = localStorage.getItem('customCommitteeDates');
    return data ? JSON.parse(data) : {};
}

/**
 * localStorage에 커스텀 운영위원회 날짜 저장
 */
function saveCustomCommitteeDates(dates) {
    localStorage.setItem('customCommitteeDates', JSON.stringify(dates));
}

/**
 * 특정 년월의 커스텀 날짜 가져오기
 */
function getCustomCommitteeDay(year, month) {
    const customDates = loadCustomCommitteeDates();
    const key = `${year}-${String(month).padStart(2, '0')}`;
    return customDates[key] || null;
}

/**
 * 특정 년월의 커스텀 날짜 저장
 */
function setCustomCommitteeDay(year, month, day) {
    const customDates = loadCustomCommitteeDates();
    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (day === null || day === '') {
        delete customDates[key];
    } else {
        customDates[key] = parseInt(day);
    }
    saveCustomCommitteeDates(customDates);
}

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
 * 마지막주 전주 일요일 찾기 (커스텀 날짜 지원)
 */
function getCommitteeDay(year, month) {
    // 먼저 커스텀 설정 확인
    const customDay = getCustomCommitteeDay(year, month);
    if (customDay !== null) {
        return customDay;
    }

    // 커스텀이 없으면 자동 계산
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
        <div class="calendar-card" id="calendar-${month}">
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

                // 집행일 다음 날 (수요일)에 노란색 설명 박스 표시
                if (executionDays.includes(day - 2) && dayOfWeek === 4) {
                    eventBox = '<div class="event-box execution-note">전 주 토요일 자정까지 결재 난 건에 한해</div>';
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
                * 예산집행일: 전 주 토요일 자정까지 결재 난 건에 한해<br>
                * 운영위원회의: 마지막주 전주 일요일
                <span class="custom-indicator" id="custom-indicator-${month}" style="display:none; margin-left:10px; color:#FFD700;">✓ 날짜 수정됨</span>
            </div>

            <div class="button-group">
                <button class="edit-committee-btn" onclick="openCommitteeModal(${year}, ${month})">
                    운영위원회 날짜 수정
                </button>
                <button class="download-btn" onclick="downloadCalendarImage(${month})">
                    ${month}월 이미지 다운로드
                </button>
            </div>
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

    // 커스텀 날짜 표시 업데이트
    updateCustomIndicators(year);

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

/**
 * 커스텀 날짜가 있는 월에 표시 업데이트
 */
function updateCustomIndicators(year) {
    for (let month = 1; month <= 12; month++) {
        const customDay = getCustomCommitteeDay(year, month);
        const indicator = document.getElementById(`custom-indicator-${month}`);
        if (indicator) {
            indicator.style.display = customDay !== null ? 'inline' : 'none';
        }
    }
}

// ===== 이미지 다운로드 함수 =====

/**
 * 특정 월 캘린더를 이미지로 다운로드
 */
function downloadCalendarImage(month) {
    const calendarElement = document.getElementById(`calendar-${month}`);

    // 다운로드 버튼 임시 숨김
    const downloadBtn = calendarElement.querySelector('.download-btn');
    downloadBtn.style.display = 'none';

    html2canvas(calendarElement, {
        scale: 2, // 고해상도
        backgroundColor: '#F4F8FB',
        logging: false
    }).then(canvas => {
        // 다운로드 버튼 다시 표시
        downloadBtn.style.display = 'block';

        // 이미지 다운로드
        const link = document.createElement('a');
        const year = document.getElementById('year-select').value;
        link.download = `${year}_${String(month).padStart(2, '0')}_예산집행캘린더.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// ===== 운영위원회 날짜 수정 함수 =====

/**
 * 운영위원회 날짜 수정 모달 열기
 */
function openCommitteeModal(year, month) {
    const modal = document.getElementById('committee-modal');
    const titleSpan = document.getElementById('committee-modal-title');
    const input = document.getElementById('committee-date-input');
    const autoDateSpan = document.getElementById('auto-date');
    const currentCustomDay = getCustomCommitteeDay(year, month);
    const autoDay = calculateSchedule(year, month).committeeDay;

    // 모달에 년월 데이터 저장 (클로저 문제 방지)
    modal.dataset.year = year;
    modal.dataset.month = month;

    titleSpan.textContent = `${year}년 ${month}월`;
    input.value = currentCustomDay !== null ? currentCustomDay : '';

    // 자동 계산 날짜 표시
    if (autoDay) {
        autoDateSpan.textContent = `(자동 계산: ${month}월 ${autoDay}일)`;
    } else {
        autoDateSpan.textContent = '(자동 계산 불가)';
    }

    modal.style.display = 'block';
    input.focus();
}

/**
 * 모달 닫기
 */
function closeCommitteeModal() {
    const modal = document.getElementById('committee-modal');
    modal.style.display = 'none';
}

// ===== 초기화 =====

document.addEventListener('DOMContentLoaded', function () {
    const yearSelect = document.getElementById('year-select');
    const generateBtn = document.getElementById('generate-btn');

    // 현재 연도 가져오기
    const currentYear = new Date().getFullYear();

    // 연도 드롭다운 동적 생성 (현재 연도 ± 5년)
    yearSelect.innerHTML = '';
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }

    // 생성 버튼 클릭
    generateBtn.addEventListener('click', function () {
        const year = parseInt(yearSelect.value);
        generateAllCalendars(year);
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('committee-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 모달 버튼 이벤트 (한 번만 설정)
    const modal = document.getElementById('committee-modal');
    const saveBtn = document.getElementById('committee-save-btn');
    const resetBtn = document.getElementById('committee-reset-btn');
    const dateInput = document.getElementById('committee-date-input');

    // 저장 버튼
    saveBtn.addEventListener('click', function() {
        const year = parseInt(modal.dataset.year);
        const month = parseInt(modal.dataset.month);
        const day = dateInput.value;

        if (day && (parseInt(day) < 1 || parseInt(day) > 31)) {
            alert('1~31 사이의 숫자를 입력하세요.');
            return;
        }
        setCustomCommitteeDay(year, month, day);
        modal.style.display = 'none';
        generateAllCalendars(year);
    });

    // 초기화 버튼
    resetBtn.addEventListener('click', function() {
        const year = parseInt(modal.dataset.year);
        const month = parseInt(modal.dataset.month);

        if (confirm('자동 계산으로 초기화하시겠습니까?')) {
            setCustomCommitteeDay(year, month, null);
            modal.style.display = 'none';
            generateAllCalendars(year);
        }
    });

    // 모달 Enter 키 처리
    dateInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            saveBtn.click();
        }
    });

    // 초기 로드 시 현재 연도 캘린더 자동 생성
    generateAllCalendars(currentYear);
});
