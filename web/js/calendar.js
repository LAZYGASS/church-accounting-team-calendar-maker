// ===== 날짜 계산 함수 =====

/**
 * 2026년 6월부터 시범적으로 집행일을 토요일로 적용
 * - 그 이전(2026년 5월까지): 화요일 집행
 */
function usesSaturdayRule(year, month) {
    return year > 2026 || (year === 2026 && month >= 6);
}

/**
 * 특정 월의 둘째주/넷째주 집행일 찾기
 * - 토요일 규칙: 둘째주/넷째주 토요일
 * - 화요일 규칙: 둘째주/넷째주 화요일
 */
function getExecutionDays(year, month) {
    const targetDay = usesSaturdayRule(year, month) ? 6 : 2; // 토요일=6, 화요일=2
    const matches = [];
    const date = new Date(year, month - 1, 1);

    // 해당 월의 모든 대상 요일 찾기
    while (date.getMonth() === month - 1) {
        if (date.getDay() === targetDay) {
            matches.push(date.getDate());
        }
        date.setDate(date.getDate() + 1);
    }

    // 둘째주, 넷째주 반환
    const executionDays = [];
    if (matches.length >= 2) executionDays.push(matches[1]); // 둘째주
    if (matches.length >= 4) executionDays.push(matches[3]); // 넷째주

    return executionDays;
}

/**
 * 결재일 계산
 * - 토요일 규칙: 그 주 금요일 (집행일 1일 전)
 * - 화요일 규칙: 집행일 전주 금요일(4일 전), 토요일(3일 전)
 */
function getApprovalDays(year, month, executionDays) {
    const approvalDays = [];
    const saturdayRule = usesSaturdayRule(year, month);

    executionDays.forEach(day => {
        if (saturdayRule) {
            // 그 주 금요일 (1일 전)
            const friday = new Date(year, month - 1, day - 1);
            if (friday.getMonth() === month - 1) {
                approvalDays.push(friday.getDate());
            }
        } else {
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
        }
    });

    return approvalDays;
}

/**
 * 운영위원회 날짜 계산
 * - 2026년 3월, 4월: 마지막주 일요일 (특이사항)
 * - 나머지: 마지막주 전주 일요일
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

    if (!lastSunday) {
        return null;
    }

    // 2026년 3월, 4월만 마지막주 일요일
    if (year === 2026 && (month === 3 || month === 4)) {
        return lastSunday;
    }

    // 나머지: 마지막주 전주 일요일
    const prevSunday = lastSunday - 7;
    if (prevSunday > 0) {
        return prevSunday;
    }

    return null;
}

/**
 * 전체 일정 계산
 */
function calculateSchedule(year, month) {
    const executionDays = getExecutionDays(year, month);
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
    const saturdayRule = usesSaturdayRule(year, month);

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

                // 집행 기준 안내 (노란색 설명 박스)
                if (saturdayRule) {
                    // 토요일 집행: 다음 날 일요일에 표시
                    if (executionDays.includes(day - 1) && dayOfWeek === 0) {
                        eventBox = '<div class="event-box execution-note">그 주 금요일 자정까지 결재 난 건에 한해</div>';
                    }
                } else {
                    // 화요일 집행: 다음 목요일에 표시
                    if (executionDays.includes(day - 2) && dayOfWeek === 4) {
                        eventBox = '<div class="event-box execution-note">전 주 토요일 자정까지 결재 난 건에 한해</div>';
                    }
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
                * 예산집행일: ${saturdayRule ? '그 주 금요일' : '전 주 토요일'} 자정까지 결재 난 건에 한해<br>
                * 운영위원회의: 마지막주 전주 일요일
            </div>

            <button class="download-btn" onclick="downloadCalendarImage(${month})">
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

    // 초기 로드 시 현재 연도 캘린더 자동 생성
    generateAllCalendars(currentYear);
});
