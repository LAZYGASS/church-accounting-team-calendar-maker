# 🪟 Windows 실행 가이드

## 🚀 빠른 시작 (3단계)

### 1단계: Python 설치 확인
```powershell
python --version
```

**Python이 없다면:**
- https://www.python.org/downloads/ 에서 다운로드
- 설치 시 **"Add Python to PATH"** 체크 필수!

---

### 2단계: 라이브러리 설치
```powershell
pip install python-pptx
```

---

### 3단계: 스크립트 실행
```powershell
python ppt_template_generator.py
```

**실행 결과:**
```
✅ PPT 생성 완료: 2026년_예산집행캘린더_전체.pptx
📊 슬라이드 수: 12
💾 저장 위치: C:\Users\jihyun sim\Desktop\church-accountingteam-calendar\2026년_예산집행캘린더_전체.pptx
```

파일이 **현재 폴더**에 생성됩니다! 📁

---

## 🔧 자주 발생하는 문제

### ❌ 문제 1: "python은 내부 또는 외부 명령이 아닙니다"

**해결:**
```powershell
# py 명령어로 시도
py ppt_template_generator.py

# 또는 Python 재설치 (PATH 추가)
```

---

### ❌ 문제 2: "No module named 'pptx'"

**해결:**
```powershell
pip install python-pptx

# 또는
py -m pip install python-pptx
```

---

### ❌ 문제 3: "Permission denied"

**해결:**
```powershell
# PowerShell을 관리자 권한으로 실행
# (우클릭 → "관리자 권한으로 실행")
```

---

### ❌ 문제 4: "파일 경로 오류"

**해결:**
- 파일이 **현재 폴더**에 저장됩니다
- 스크립트와 같은 폴더에서 실행하세요

```powershell
# 현재 위치 확인
pwd

# 파일 확인
dir *.pptx
```

---

## 📝 커스텀 사용법

### 특정 월만 생성
```python
# custom.py 파일 생성
from ppt_template_generator import BudgetCalendarTemplate

template = BudgetCalendarTemplate()
template.create_calendar_slide(2026, 3)  # 3월만
template.save("2026년_3월.pptx")
```

실행:
```powershell
python custom.py
```

---

### 수동 날짜 지정
```python
# manual.py 파일 생성
from ppt_template_generator import BudgetCalendarTemplate

template = BudgetCalendarTemplate()
template.create_calendar_slide(
    year=2026,
    month=1,
    approval_days=[5, 19],
    execution_days=[7, 21],
    committee_day=26,
    auto_calculate=False
)
template.save("특별일정.pptx")
```

---

## 🎯 실행 위치 확인

```powershell
# 1. 폴더로 이동
cd "C:\Users\jihyun sim\Desktop\church-accountingteam-calendar"

# 2. 파일 확인
dir

# 3. 실행
python ppt_template_generator.py

# 4. 생성된 파일 확인
dir *.pptx
```

---

## 💡 팁

### 한글 경로 문제 해결
```python
# 파일명을 영어로 변경
template.save("budget_calendar_2026.pptx")
```

### 저장 위치 지정
```python
import os

# 바탕화면에 저장
desktop = os.path.join(os.path.expanduser("~"), "Desktop")
output = os.path.join(desktop, "calendar.pptx")
template.save(output)
```

### 실행 후 자동으로 파일 열기
```python
import os
import subprocess

filename = "2026년_예산집행캘린더_전체.pptx"
template.save(filename)

# Windows에서 자동으로 열기
os.startfile(filename)
```

---

## 📦 전체 명령어 모음

```powershell
# === 설치 ===
python --version
pip install python-pptx

# === 실행 ===
python ppt_template_generator.py

# === 확인 ===
dir *.pptx

# === 열기 ===
start 2026년_예산집행캘린더_전체.pptx
```

---

## 🆘 도움이 더 필요하면

1. **오류 메시지 전체**를 복사해서 보내주세요
2. **Python 버전** 확인: `python --version`
3. **설치된 패키지** 확인: `pip list`

---

## ✅ 성공 체크리스트

- [ ] Python 설치됨 (`python --version` 성공)
- [ ] python-pptx 설치됨 (`pip show python-pptx` 성공)
- [ ] 스크립트 실행됨 (오류 없음)
- [ ] PPT 파일 생성됨 (`dir *.pptx`로 확인)
- [ ] PPT 파일 열림 (정상 표시)

모두 체크되면 완료! 🎉

---

**파일 저장 위치**: 스크립트가 있는 폴더와 **같은 위치**  
**예**: `C:\Users\jihyun sim\Desktop\church-accountingteam-calendar\2026년_예산집행캘린더_전체.pptx`
