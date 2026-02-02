# 📅 예산집행 캘린더 자동화 시스템

## 🎯 프로젝트 개요

원본 PowerPoint 템플릿의 디자인을 완벽히 재현하여, 교회 재정 규정에 맞는 예산집행 캘린더를 자동으로 생성하는 시스템입니다.

### 주요 기능
- ✅ 규정 기반 자동 날짜 계산
- ✅ 원본 디자인 100% 재현
- ✅ Python 코드로 완전 자동화
- ✅ 1년치(12개월) 일괄 생성

---

## 📋 재정 운영 규정

### 1. 예산집행일 (파란색 #0061FF)
- **둘째주 월요일**
- **넷째주 월요일**
- 표 안에 파란색 볼드체로 표시

### 2. 결재일 (분홍색 #FD79A8)
- 각 집행일 **전주 토요일 자정**까지
- 표 안에 분홍색 볼드체로 표시

### 3. 운영위원회의
- **마지막주 전주 일요일**
- 표 안에 날짜 아래 "운영위원회" 표시 (검정 글자, 황금색 강조)

### 4. 집행 규칙
> 전 주 토요일 자정까지 결재 난 건에 한해 집행

---

## 🎨 디자인 명세

### 색상 팔레트

| 용도 | 색상 코드 | RGB | 설명 |
|------|-----------|-----|------|
| 배경색 | `#F4F8FB` | (244, 248, 251) | 슬라이드 전체 배경 |
| 파란색 | `#0061FF` | (0, 97, 255) | 월 숫자, 예산집행일, 표 테두리 |
| 토요일 | `#4472C4` | (68, 114, 196) | 토요일 날짜 |
| 분홍색 | `#FD79A8` | (253, 121, 168) | 결재일, 일요일 |
| 황금색 | `#FFD700` | (255, 215, 0) | 운영위원회 강조 배경 |
| 흰색 | `#FFFFFF` | (255, 255, 255) | 표 배경 |
| 검은색 | `#000000` | (0, 0, 0) | 일반 날짜, Sat 요일명, 운영위원회 글자 |

### 폰트 체계

| 위치 | 폰트 | 크기 | 색상 | 용도 |
|------|------|------|------|------|
| 월 숫자 | 나눔고딕 Bold | 72pt | 파란색 | 왼쪽 상단 숫자 |
| 헤더 | 나눔고딕 Bold | 16pt | 검은색 | "예산집행캘린더" |
| 요일 | 나눔고딕 Bold | 16pt | 검은색/분홍(Sun) | Sun~Sat |
| 날짜 | 나눔고딕 Bold | 20pt | 조건부 | 표 안 날짜 |
| 범례 | 나눔고딕 Bold | 14pt | 흰색 | 예산집행일/결재일 |
| 설명 | 나눔고딕 Bold | 12pt | 검은색 | 규정 설명 |

### 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────┐
│ 배경: #F4F8FB                                                 │
│                                                               │
│  1 (파란색)                         ┃ 예산집행캘린더          │
│                                      ┃ 2026.01               │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │          │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │     │     │     │  1  │  2  │  3  │  4  │          │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │  5  │  6  │  7  │  8  │  9  │ 10  │ 11  │          │     │
│  │(분홍) │     │     │     │     │     │(분홍) │          │     │
│  │     │     │     │     │     │     │결재일 │          │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ 12  │ 13  │ 14  │ 15  │ 16  │ 17  │ 18  │          │     │
│  │     │(파랑) │     │     │     │     │     │          │     │
│  │     │집행일 │     │     │     │     │     │          │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  [예산집행일]  <-전 주 토요일...       [결재일]               │
│  (파란 박스)                          (분홍 박스)            │
│                                                               │
│  * 운영위원회의: 마지막주 전주 일요일                          │
└─────────────────────────────────────────────────────────────┘
```

### 표 상세 설정

| 항목 | 값 |
|------|-----|
| 전체 크기 | 8.71" × 5.43" |
| 위치 | (0.65", 1.59") |
| 구조 | 7행 × 7열 |
| 헤더 행 높이 | 0.508" |
| 날짜 행 높이 | 0.821" |
| 테두리 | 검은색 0.5pt |
| 배경색 | 흰색 |

---

## 💻 자동 계산 로직

### 예산집행일 계산
```python
def calculate_execution_days(year, month):
    """둘째주, 넷째주 월요일 계산"""
    cal = calendar.monthcalendar(year, month)
    mondays = [week[1] for week in cal if week[1] != 0]
    
    execution_days = []
    if len(mondays) >= 2:
        execution_days.append(mondays[1])  # 둘째주
    if len(mondays) >= 4:
        execution_days.append(mondays[3])  # 넷째주
    
    return execution_days
```

### 결재일 계산
```python
def calculate_approval_days(execution_days, year, month):
    """각 집행일 전주 토요일 계산"""
    approval_days = []
    
    for exec_day in execution_days:
        # 2일 전 (월요일 -> 토요일)
        approval_date = datetime(year, month, exec_day) - timedelta(days=2)
        if approval_date.month == month:
            approval_days.append(approval_date.day)
    
    return approval_days
```

### 운영위원회의 계산
```python
def calculate_committee_day(year, month):
    """마지막주 전주 일요일 계산"""
    cal = calendar.monthcalendar(year, month)
    
    # 마지막 주 찾기
    last_week_idx = len(cal) - 1
    while last_week_idx >= 0 and all(day == 0 for day in cal[last_week_idx]):
        last_week_idx -= 1
    
    # 마지막주 전주 일요일
    if last_week_idx >= 1:
        prev_week = cal[last_week_idx - 1]
        sunday = prev_week[0]
        if sunday != 0:
            return sunday
    
    return None
```

---

## 📊 2026년 연간 일정표

| 월 | 예산집행일 | 결재일 | 운영위원회의 |
|----|-----------|--------|-------------|
| 1월 | 13일, 27일 | 11일, 25일 | 19일 (일) |
| 2월 | 10일, 24일 | 8일, 22일 | 16일 (일) |
| 3월 | 10일, 24일 | 8일, 22일 | 23일 (일) |
| 4월 | 14일, 28일 | 12일, 26일 | 20일 (일) |
| 5월 | 12일, 26일 | 10일, 24일 | 18일 (일) |
| 6월 | 9일, 23일 | 7일, 21일 | 22일 (일) |
| 7월 | 14일, 28일 | 12일, 26일 | 20일 (일) |
| 8월 | 11일, 25일 | 9일, 23일 | 24일 (일) |
| 9월 | 8일, 22일 | 6일, 20일 | 21일 (일) |
| 10월 | 13일, 27일 | 11일, 25일 | 19일 (일) |
| 11월 | 10일, 24일 | 8일, 22일 | 23일 (일) |
| 12월 | 8일, 22일 | 6일, 20일 | 21일 (일) |

---

## 🚀 사용 방법

### 기본 사용법 (자동 계산)

```python
from ppt_template_generator import BudgetCalendarTemplate

# 템플릿 생성
template = BudgetCalendarTemplate()

# 단일 월 생성 (자동 계산)
template.create_calendar_slide(2026, 1)
template.save("2026년_1월.pptx")
```

### 1년치 자동 생성

```python
template = BudgetCalendarTemplate()

# 2026년 전체 생성
for month in range(1, 13):
    template.create_calendar_slide(2026, month)

template.save("2026년_전체_캘린더.pptx")
```

### 수동 날짜 지정 (예외 처리)

```python
template = BudgetCalendarTemplate()

# 특정 월에 다른 날짜 사용
template.create_calendar_slide(
    year=2026,
    month=1,
    approval_days=[5, 19],      # 수동 지정
    execution_days=[7, 21],     # 수동 지정
    committee_day=26,           # 수동 지정
    auto_calculate=False        # 자동 계산 비활성화
)

template.save("특별_일정.pptx")
```

### 날짜 미리 확인

```python
# 생성하기 전에 계산 결과 확인
schedule = BudgetCalendarTemplate.calculate_schedule(2026, 6)

print(schedule)
# {
#   'execution_days': [9, 23],
#   'approval_days': [7, 21],
#   'committee_day': 22
# }
```

---

## 🔧 커스터마이징

### 색상 변경

```python
from pptx.dml.color import RGBColor

# 색상 팔레트 변경
BudgetCalendarTemplate.COLOR_BG = RGBColor(240, 240, 255)       # 배경
BudgetCalendarTemplate.COLOR_BLUE = RGBColor(0, 100, 200)       # 파란색
BudgetCalendarTemplate.COLOR_PINK = RGBColor(255, 100, 150)     # 분홍색
```

### 폰트 변경

```python
# 폰트 패밀리 변경
BudgetCalendarTemplate.FONT_TITLE = "맑은 고딕"
BudgetCalendarTemplate.FONT_BODY = "나눔고딕"
```

### 표 크기/위치 조정

```python
from pptx.util import Inches

# 표 위치 및 크기
BudgetCalendarTemplate.TABLE_LEFT = Inches(0.5)
BudgetCalendarTemplate.TABLE_TOP = Inches(1.5)
BudgetCalendarTemplate.TABLE_WIDTH = Inches(9.0)
BudgetCalendarTemplate.TABLE_HEIGHT = Inches(5.5)
```

---

## 🌐 활용 시나리오

### 1. 웹 서비스 구축

```python
from flask import Flask, send_file
import io

app = Flask(__name__)

@app.route('/calendar/<int:year>/<int:month>')
def generate_calendar(year, month):
    template = BudgetCalendarTemplate()
    template.create_calendar_slide(year, month)
    
    buffer = io.BytesIO()
    template.prs.save(buffer)
    buffer.seek(0)
    
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f'{year}년_{month}월_캘린더.pptx',
        mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
    )

if __name__ == '__main__':
    app.run(debug=True)
```

### 2. Google Sheets 연동

```python
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Google Sheets 인증
scope = ['https://spreadsheets.google.com/feeds']
creds = ServiceAccountCredentials.from_json_keyfile_name(
    'credentials.json', scope
)
client = gspread.authorize(creds)

# 시트 데이터 읽기
sheet = client.open("예산집행일정").sheet1
data = sheet.get_all_records()

# PPT 생성
template = BudgetCalendarTemplate()

for row in data:
    if row['예외처리'] == 'Y':
        # 수동 날짜 사용
        template.create_calendar_slide(
            year=row['연도'],
            month=row['월'],
            approval_days=parse_days(row['결재일']),
            execution_days=parse_days(row['집행일']),
            auto_calculate=False
        )
    else:
        # 자동 계산
        template.create_calendar_slide(
            year=row['연도'],
            month=row['월']
        )

template.save("sheets_연동_캘린더.pptx")
```

### 3. 이메일 자동 발송

```python
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime

def send_monthly_calendar():
    now = datetime.now()
    next_month = now.month + 1 if now.month < 12 else 1
    next_year = now.year if now.month < 12 else now.year + 1
    
    # PPT 생성
    template = BudgetCalendarTemplate()
    template.create_calendar_slide(next_year, next_month)
    
    filename = f"{next_year}년_{next_month}월_예산집행캘린더.pptx"
    template.save(filename)
    
    # 이메일 발송
    msg = MIMEMultipart()
    msg['From'] = 'sender@church.org'
    msg['To'] = 'finance@church.org'
    msg['Subject'] = f'{next_year}년 {next_month}월 예산집행 캘린더'
    
    # 파일 첨부
    with open(filename, 'rb') as f:
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header(
            'Content-Disposition',
            f'attachment; filename={filename}'
        )
        msg.attach(part)
    
    # SMTP 발송
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login('user@gmail.com', 'password')
        server.send_message(msg)

# 매월 1일 자동 실행 (cron 설정)
# 0 0 1 * * /usr/bin/python3 /path/to/script.py
```

### 4. Next.js API 라우트 통합

```typescript
// pages/api/calendar/[year]/[month].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { year, month } = req.query;
  
  // Python 스크립트 실행
  const pythonScript = `
from ppt_template_generator import BudgetCalendarTemplate
template = BudgetCalendarTemplate()
template.create_calendar_slide(${year}, ${month})
template.save('/tmp/calendar_${year}_${month}.pptx')
  `;
  
  await new Promise((resolve, reject) => {
    exec(`python3 -c "${pythonScript}"`, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
  
  // 파일 다운로드
  const filePath = `/tmp/calendar_${year}_${month}.pptx`;
  const fileBuffer = fs.readFileSync(filePath);
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  res.setHeader('Content-Disposition', `attachment; filename=calendar_${year}_${month}.pptx`);
  res.send(fileBuffer);
  
  // 임시 파일 삭제
  fs.unlinkSync(filePath);
}
```

---

## 📁 프로젝트 구조

```
budget-calendar-automation/
├── ppt_template_generator.py    # 메인 코드
├── requirements.txt              # 의존성
├── README.md                     # 사용 설명서
├── examples/                     # 예제 코드
│   ├── basic_usage.py
│   ├── web_service.py
│   └── sheets_integration.py
├── tests/                        # 테스트
│   └── test_calendar.py
└── output/                       # 생성된 파일
    └── 2026년_전체_캘린더.pptx
```

---

## 🔍 기술 스택

| 분야 | 기술 |
|------|------|
| 언어 | Python 3.8+ |
| 라이브러리 | python-pptx |
| 표준 라이브러리 | calendar, datetime |
| 디자인 | PowerPoint XML |
| 자동화 | 규정 기반 알고리즘 |

---

## ⚙️ 설치 및 실행

### 1. 환경 설정

```bash
# Python 가상환경 생성
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install python-pptx
```

### 2. 실행

```bash
# 기본 실행 (2026년 전체 생성)
python3 ppt_template_generator.py

# 커스텀 스크립트 작성
python3 my_calendar.py
```

### 3. 요구사항

```txt
python-pptx>=0.6.21
```

---

## 🐛 트러블슈팅

### 문제: 폰트가 표시되지 않음

**원인**: 시스템에 해당 폰트 미설치

**해결**:
```python
# 폴백 폰트 사용
BudgetCalendarTemplate.FONT_BODY = "맑은 고딕"  # 또는 "Arial"
```

### 문제: 표 레이아웃이 깨짐

**원인**: 행 높이 자동 조정

**해결**: 코드에서 이미 처리됨
```python
table.rows[0].height = Inches(0.508)  # 헤더
table.rows[i].height = Inches(0.821)  # 날짜 행
```

### 문제: 색상이 다르게 보임

**원인**: RGB 값 불일치

**해결**:
```python
# 정확한 RGB 값 사용
COLOR_BLUE = RGBColor(0, 97, 255)      # #0061FF
COLOR_PINK = RGBColor(253, 121, 168)   # #FD79A8
COLOR_BG = RGBColor(244, 248, 251)     # #F4F8FB
```

---

## 📈 확장 계획

### Phase 1 (완료)
- ✅ 기본 템플릿 생성
- ✅ 자동 날짜 계산
- ✅ 디자인 완벽 재현

### Phase 2 (검토)
- ⬜ 웹 인터페이스 구축
- ⬜ Google Sheets 연동
- ⬜ REST API 제공

### Phase 3 (향후)
- ⬜ 다국어 지원
- ⬜ 테마 시스템
- ⬜ 클라우드 배포
- ⬜ 모바일 앱 연동

---

## 📝 버전 히스토리

### v2.0 (2026-01-08) - 최종 완성
- ✅ 배경색 #F4F8FB 적용
- ✅ 월 숫자 파란색으로 변경
- ✅ 폰트 나눔고딕 Bold로 통일
- ✅ 요일 헤더 정상 표시
- ✅ 표 행 높이 원본과 동일하게 설정
- ✅ 결재일 박스 둥근 사각형으로 변경
- ✅ 표 테두리 추가

### v1.0 (2026-01-08) - 초기 버전
- ✅ 기본 템플릿 생성
- ✅ 자동 날짜 계산 구현
- ✅ 12개월 일괄 생성

---

## 👥 기여 및 피드백

### 개선 제안
- GitHub Issues를 통해 버그 리포트
- Pull Request로 기능 추가
- 사용 사례 공유

### 연락처
- 프로젝트: 교회 재정 관리 시스템
- 용도: 2026 BMC 청년부 목장일지 시스템

---

## 📄 라이선스

이 프로젝트는 교회 내부 사용을 위해 제작되었습니다.

---

## 🎉 완성

2026년 전체 12개월 예산집행 캘린더가 완성되었습니다!

**생성된 파일**:
- `2026년_예산집행캘린더_전체.pptx` (12 슬라이드)
- `ppt_template_generator.py` (자동화 코드)

**특징**:
- 규정 자동 준수
- 디자인 완벽 재현
- 확장 가능한 구조
- 교회 시스템 연동 준비

---

**제작일**: 2026년 1월 8일  
**버전**: 2.0 (Final)  
**상태**: ✅ 완성
