# GitHub Pages 자동 배포 구성 가이드

> 교회 재정팀 캘린더 메이커를 GitHub Pages로 자동 배포하고, 현재 연도를 자동으로 감지하도록 구성한 내용을 정리한 학습 자료입니다.

**작성일**: 2026-02-09
**배포 URL**: https://lazygass.github.io/church-accounting-team-calendar-maker/

---

## 📚 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [구현한 기능](#구현한-기능)
3. [GitHub Actions 자동 배포](#github-actions-자동-배포)
4. [현재 연도 자동 감지](#현재-연도-자동-감지)
5. [작동 원리 상세 설명](#작동-원리-상세-설명)
6. [학습 포인트](#학습-포인트)
7. [트러블슈팅](#트러블슈팅)
8. [추가 확장 아이디어](#추가-확장-아이디어)

---

## 프로젝트 개요

### 기술 스택
- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript
- **배포**: GitHub Pages (정적 호스팅)
- **CI/CD**: GitHub Actions
- **외부 라이브러리**: html2canvas (CDN), Google Fonts

### 프로젝트 구조
```
church-accounting-team-calendar-maker/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 배포 워크플로우
├── web/
│   ├── index.html              # 메인 HTML
│   ├── css/
│   │   └── style.css           # 스타일시트
│   └── js/
│       └── calendar.js         # 캘린더 생성 로직 (★ 수정)
├── README.md
└── DEPLOYMENT_GUIDE.md         # 이 문서
```

### 배포 전후 비교

| 구분 | Before (배포 전) | After (배포 후) |
|------|-----------------|----------------|
| 접근 방식 | 로컬 파일 다운로드 → index.html 열기 | 웹 URL 접속 |
| 연도 설정 | 2026년 하드코딩 | 현재 연도 자동 감지 |
| 연도 변경 | 코드 수정 필요 | 자동 갱신 (2027년 되면 자동) |
| 배포 방법 | 수동 | GitHub push 시 자동 배포 |

---

## 구현한 기능

### 1. GitHub Pages 자동 배포 ✅
- `main` 브랜치의 `web/` 폴더가 변경되면 자동으로 GitHub Pages에 배포
- `gh-pages` 브랜치를 통해 배포 (별도 관리)

### 2. 현재 연도 자동 감지 ✅
- JavaScript에서 `new Date().getFullYear()`로 현재 연도 자동 감지
- 페이지 로드 시 현재 연도의 12개월 달력 자동 생성

### 3. 동적 연도 드롭다운 ✅
- 하드코딩된 연도 목록 제거
- 현재 연도 ± 5년 범위를 동적으로 생성
- 2027년이 되면 자동으로 2026-2032년 범위로 변경

---

## GitHub Actions 자동 배포

### 워크플로우 파일 위치
```
.github/workflows/deploy.yml
```

### 전체 코드
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
    paths:
      - 'web/**'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./web
          publish_branch: gh-pages
          force_orphan: true
```

### 코드 분석

#### 1. 트리거 설정 (on)
```yaml
on:
  push:
    branches:
      - main          # main 브랜치에 push 시
    paths:
      - 'web/**'      # web/ 폴더 변경 시만 실행 (효율성)
  workflow_dispatch:  # GitHub UI에서 수동 실행 가능
```

**학습 포인트**:
- `paths` 필터를 사용하면 특정 폴더 변경 시만 워크플로우 실행
- `workflow_dispatch`로 수동 트리거 가능 (디버깅에 유용)

#### 2. 권한 설정 (permissions)
```yaml
permissions:
  contents: write    # gh-pages 브랜치에 쓰기 위해 필요
```

**학습 포인트**:
- GitHub Actions는 기본적으로 읽기 권한만 가짐
- 브랜치에 푸시하려면 `contents: write` 필요

#### 3. 배포 작업 (jobs)
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest    # Ubuntu 환경에서 실행
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4    # 저장소 코드 가져오기

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./web           # web/ 폴더만 배포
          publish_branch: gh-pages     # gh-pages 브랜치로 푸시
          force_orphan: true           # 깨끗한 히스토리 유지
```

**학습 포인트**:
- `uses`: 미리 만들어진 액션(플러그인) 사용
- `actions/checkout@v4`: 표준 체크아웃 액션
- `peaceiris/actions-gh-pages@v3`: GitHub Pages 배포 전용 액션
- `force_orphan: true`: gh-pages 브랜치의 커밋 히스토리를 단순화

### 작동 흐름

```
1. 개발자가 web/ 폴더의 파일 수정
         ↓
2. git add, git commit, git push origin main
         ↓
3. GitHub Actions 자동 트리거
         ↓
4. Ubuntu 가상 머신 시작
         ↓
5. 저장소 코드 체크아웃
         ↓
6. web/ 폴더를 gh-pages 브랜치로 복사 및 푸시
         ↓
7. GitHub Pages가 gh-pages 브랜치 감지
         ↓
8. 자동으로 웹사이트 업데이트 (약 1-2분)
         ↓
9. https://lazygass.github.io/church-accounting-team-calendar-maker/ 갱신
```

### 실행 확인 방법
1. GitHub 저장소 → **Actions** 탭
2. "Deploy to GitHub Pages" 워크플로우 확인
3. 녹색 체크 표시 = 성공
4. 빨간 X 표시 = 실패 (로그 확인)

---

## 현재 연도 자동 감지

### 수정한 파일
```
web/js/calendar.js (Line 267-293)
```

### Before (하드코딩 방식)
```javascript
document.addEventListener('DOMContentLoaded', function () {
    const yearSelect = document.getElementById('year-select');
    const generateBtn = document.getElementById('generate-btn');

    // 생성 버튼 클릭
    generateBtn.addEventListener('click', function () {
        const year = parseInt(yearSelect.value);
        generateAllCalendars(year);
    });

    // 초기 로드 시 2026년 캘린더 생성 (하드코딩!)
    generateAllCalendars(2026);
});
```

**문제점**:
- 2027년이 되어도 2026년 달력만 표시됨
- 연도를 바꾸려면 코드를 직접 수정해야 함
- 드롭다운 연도도 하드코딩 (HTML에서 직접 작성)

### After (자동 감지 방식)
```javascript
document.addEventListener('DOMContentLoaded', function () {
    const yearSelect = document.getElementById('year-select');
    const generateBtn = document.getElementById('generate-btn');

    // 현재 연도 가져오기 (핵심!)
    const currentYear = new Date().getFullYear();

    // 연도 드롭다운 동적 생성 (현재 연도 ± 5년)
    yearSelect.innerHTML = '';
    for (let year = currentYear - 1; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;  // 현재 연도를 기본 선택
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
```

**장점**:
- 2027년이 되면 자동으로 2027년 달력 표시
- 코드 수정 없이 자동 갱신
- 드롭다운도 자동으로 범위 조정 (2026-2032년)

### 코드 분석

#### 1. 현재 연도 가져오기
```javascript
const currentYear = new Date().getFullYear();
```

**학습 포인트**:
- `new Date()`: 현재 날짜/시간 객체 생성
- `.getFullYear()`: 4자리 연도 반환 (예: 2026)
- 브라우저의 시스템 시간을 사용 (사용자 컴퓨터 기준)

#### 2. 드롭다운 동적 생성
```javascript
yearSelect.innerHTML = '';  // 기존 옵션 제거
for (let year = currentYear - 1; year <= currentYear + 5; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year === currentYear) {
        option.selected = true;  // 현재 연도를 기본 선택
    }
    yearSelect.appendChild(option);
}
```

**학습 포인트**:
- `innerHTML = ''`: 기존 HTML 제거
- `document.createElement('option')`: 새 `<option>` 엘리먼트 생성
- `option.value`: 선택 시 전달되는 값
- `option.textContent`: 화면에 표시되는 텍스트
- `option.selected = true`: 기본 선택 설정
- `appendChild()`: DOM에 엘리먼트 추가

**2026년 실행 시 생성되는 HTML**:
```html
<select id="year-select">
    <option value="2025">2025</option>
    <option value="2026" selected>2026</option>  <!-- 기본 선택 -->
    <option value="2027">2027</option>
    <option value="2028">2028</option>
    <option value="2029">2029</option>
    <option value="2030">2030</option>
    <option value="2031">2031</option>
</select>
```

**2027년 실행 시 생성되는 HTML**:
```html
<select id="year-select">
    <option value="2026">2026</option>
    <option value="2027" selected>2027</option>  <!-- 자동 변경! -->
    <option value="2028">2028</option>
    <option value="2029">2029</option>
    <option value="2030">2030</option>
    <option value="2031">2031</option>
    <option value="2032">2032</option>
</select>
```

#### 3. 초기 로드 시 캘린더 생성
```javascript
generateAllCalendars(currentYear);
```

**학습 포인트**:
- 페이지 로드 시 자동으로 현재 연도의 12개월 달력 생성
- 사용자가 "생성" 버튼을 누르지 않아도 바로 사용 가능

---

## 작동 원리 상세 설명

### 시나리오: 2027년 1월 1일에 사이트 접속

```
1. 사용자가 https://lazygass.github.io/.../ 접속
         ↓
2. 브라우저가 index.html 다운로드
         ↓
3. <script src="js/calendar.js"> 로드
         ↓
4. DOMContentLoaded 이벤트 발생
         ↓
5. const currentYear = new Date().getFullYear()
   → 2027 반환 (사용자 컴퓨터 시간 기준)
         ↓
6. 드롭다운 동적 생성
   → 2026, 2027(선택), 2028, ..., 2032
         ↓
7. generateAllCalendars(2027) 실행
         ↓
8. 2027년 1월~12월 캘린더 자동 생성 및 화면 표시
         ↓
9. 사용자는 코드 수정 없이 최신 달력 확인
```

### 자동 배포 시나리오

```
상황: 개발자가 CSS 파일 수정 (예: 색상 변경)

1. web/css/style.css 수정
         ↓
2. git add web/css/style.css
   git commit -m "style: 색상 변경"
   git push origin main
         ↓
3. GitHub Actions 트리거
   (web/** 경로 변경 감지)
         ↓
4. deploy.yml 워크플로우 실행
   - 저장소 체크아웃
   - web/ 폴더를 gh-pages로 푸시
         ↓
5. GitHub Pages 자동 빌드
         ↓
6. 1-2분 후 웹사이트 갱신
         ↓
7. 사용자가 URL 접속 시 변경된 색상 확인
```

---

## 학습 포인트

### 1. GitHub Actions 핵심 개념

#### CI/CD란?
- **CI (Continuous Integration)**: 지속적 통합 - 코드 변경 시 자동 테스트
- **CD (Continuous Deployment)**: 지속적 배포 - 자동으로 프로덕션 환경에 배포

#### 왜 GitHub Actions를 사용하나?
- **자동화**: 수동 배포 불필요
- **일관성**: 항상 같은 방식으로 배포
- **무료**: 공개 저장소는 무료 (월 2000분 제공)

#### YAML 문법 기초
```yaml
# 키: 값 형식
name: Deploy to GitHub Pages

# 리스트 (배열)
branches:
  - main
  - develop

# 중첩 구조
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Step 1
```

### 2. JavaScript DOM 조작

#### DOM이란?
- **Document Object Model**: HTML을 프로그램적으로 제어하는 인터페이스
- JavaScript로 HTML 엘리먼트를 생성, 수정, 삭제 가능

#### 주요 메서드
```javascript
// 엘리먼트 선택
document.getElementById('year-select')
document.querySelector('.calendar')

// 엘리먼트 생성
document.createElement('option')
document.createElement('div')

// 엘리먼트 추가
parent.appendChild(child)
parent.innerHTML = '<div>...</div>'

// 이벤트 리스너
element.addEventListener('click', function() { ... })
```

### 3. JavaScript Date 객체

```javascript
// 현재 날짜/시간
const now = new Date();

// 연도 추출
now.getFullYear()    // 2026

// 월 추출 (0-11)
now.getMonth()       // 1 (2월)

// 일 추출
now.getDate()        // 9

// 특정 날짜 생성
const date = new Date(2026, 2, 15);  // 2026년 3월 15일
```

### 4. Git/GitHub 워크플로우

```bash
# 로컬 변경 → 원격 저장소
git add <파일>
git commit -m "메시지"
git push origin main

# 브랜치 확인
git branch -a

# 상태 확인
git status
git log
```

### 5. GitHub Pages 원리

```
저장소의 특정 브랜치/폴더 → 정적 웹사이트로 호스팅

옵션:
1. main 브랜치의 루트 폴더
2. main 브랜치의 /docs 폴더
3. gh-pages 브랜치의 루트 폴더 (★ 우리가 사용)
```

**왜 gh-pages 브랜치를 사용하나?**
- 소스 코드(main)와 배포 파일(gh-pages) 분리
- main 브랜치가 깔끔하게 유지됨
- Python 파일 등 불필요한 파일 제외 가능

---

## 트러블슈팅

### 문제 1: GitHub Pages가 404 에러

**원인**: Source 설정이 잘못됨

**해결**:
```
GitHub → Settings → Pages
→ Source: gh-pages / (root)
```

### 문제 2: Actions 워크플로우 실패

**확인 사항**:
1. Actions 탭에서 에러 로그 확인
2. `permissions: contents: write` 설정 확인
3. `publish_dir: ./web` 경로 확인

**해결**:
```bash
# 로컬에서 워크플로우 문법 확인
cat .github/workflows/deploy.yml

# 원격 저장소와 동기화
git pull origin main
```

### 문제 3: 현재 연도가 표시되지 않음

**원인**: 브라우저 캐시

**해결**:
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
→ 하드 새로고침
```

**개발자 도구로 확인**:
```javascript
// F12 → Console 탭
new Date().getFullYear()  // 2026 출력 확인
```

### 문제 4: 드롭다운이 비어있음

**원인**: JavaScript 로드 실패 또는 오류

**해결**:
```
F12 → Console 탭에서 에러 확인
→ 빨간 에러 메시지 확인
```

**코드 검증**:
```javascript
// HTML에 year-select ID가 있는지 확인
<select id="year-select"></select>

// JavaScript에서 올바르게 선택했는지 확인
const yearSelect = document.getElementById('year-select');
console.log(yearSelect);  // null이면 문제
```

---

## 추가 확장 아이디어

### 1. 매월 자동 업데이트 알림

**목적**: 매월 1일에 자동으로 README 업데이트

**구현**:
```yaml
# .github/workflows/monthly-update.yml
name: Monthly Auto Update

on:
  schedule:
    - cron: '0 0 1 * *'  # 매월 1일 00:00 UTC

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Update README
        run: |
          echo "Last updated: $(date +%Y-%m-%d)" >> README.md
          git config user.name "GitHub Actions Bot"
          git config user.email "actions@github.com"
          git add README.md
          git commit -m "Auto-update: $(date +%Y-%m)" || true
          git push
```

### 2. SEO 최적화

**web/index.html 수정**:
```html
<head>
    <!-- 기본 메타 태그 -->
    <meta name="description" content="교회 재정팀 예산집행일정 캘린더 - 자동 계산">
    <meta name="keywords" content="교회, 재정, 캘린더, 예산집행일정">

    <!-- Open Graph (소셜 미디어 공유) -->
    <meta property="og:title" content="재정집행일정 캘린더">
    <meta property="og:description" content="매월 둘째주/넷째주 화요일 자동 계산">
    <meta property="og:url" content="https://lazygass.github.io/church-accounting-team-calendar-maker/">
    <meta property="og:type" content="website">
</head>
```

### 3. CDN Integrity 체크

**보안 강화 (web/index.html)**:
```html
<!-- 변조 방지 -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
  integrity="sha512-dq9YI5dGsqkgbGldklGCxKfvI3CDPZBjQKDYEt85wVqrb8LYX9fPWlf3vVpRnxO5zLTqRB0eA4zGZOyQz8hSkg=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer">
</script>
```

**Integrity 값 얻는 방법**:
```bash
# 라이브러리 다운로드 후
openssl dgst -sha512 -binary html2canvas.min.js | openssl base64 -A
```

### 4. 404 페이지 추가

**web/404.html 생성**:
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="3;url=/">
    <title>페이지를 찾을 수 없습니다</title>
    <style>
        body {
            font-family: 'Noto Sans KR', sans-serif;
            text-align: center;
            padding: 50px;
        }
        h1 { font-size: 72px; color: #0061FF; }
        p { font-size: 18px; color: #666; }
        a { color: #0061FF; text-decoration: none; }
    </style>
</head>
<body>
    <h1>404</h1>
    <p>페이지를 찾을 수 없습니다.</p>
    <p>3초 후 <a href="/">홈페이지</a>로 이동합니다.</p>
</body>
</html>
```

### 5. 다크 모드 지원

**web/css/style.css 추가**:
```css
/* 다크 모드 미디어 쿼리 */
@media (prefers-color-scheme: dark) {
    :root {
        --color-bg: #1a1a1a;
        --color-text: #ffffff;
        --color-header-bg: #2a2a2a;
    }

    body {
        background-color: var(--color-bg);
        color: var(--color-text);
    }
}
```

### 6. Google Analytics 추가

**web/index.html `<head>` 내 추가**:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 7. 프린트 최적화

**web/css/style.css 추가**:
```css
/* 프린트용 스타일 */
@media print {
    .header-container,
    .download-btn {
        display: none;  /* 버튼 숨기기 */
    }

    .calendar-card {
        page-break-inside: avoid;  /* 캘린더 분할 방지 */
    }

    body {
        background: white;
        color: black;
    }
}
```

### 8. 테스트 자동화

**.github/workflows/test.yml 생성**:
```yaml
name: Test

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate HTML
        run: |
          sudo apt-get install -y tidy
          tidy -q -e web/index.html || true

      - name: Check JavaScript syntax
        run: |
          node --check web/js/calendar.js
```

---

## 참고 자료

### 공식 문서
- [GitHub Pages 문서](https://docs.github.com/en/pages)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [MDN JavaScript Date](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN DOM 조작](https://developer.mozilla.org/ko/docs/Web/API/Document_Object_Model)

### 학습 리소스
- [YAML 문법](https://yaml.org/)
- [GitHub Actions 예제](https://github.com/actions/starter-workflows)
- [HTML2Canvas 문서](https://html2canvas.hertzen.com/)

### 유용한 도구
- [YAML Validator](https://www.yamllint.com/)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Can I Use](https://caniuse.com/) - 브라우저 호환성 확인

---

## 요약

### 핵심 개념 3가지

1. **GitHub Actions = 자동화 도구**
   - `main` 브랜치 push → 자동 배포
   - 수동 작업 제거, 실수 방지

2. **JavaScript로 동적 생성 = 유연성**
   - 하드코딩 제거 → 자동 갱신
   - DOM 조작으로 HTML 동적 생성

3. **GitHub Pages = 무료 호스팅**
   - 정적 웹사이트 무료 배포
   - `gh-pages` 브랜치로 소스와 분리

### 배운 기술

✅ YAML 문법 (GitHub Actions)
✅ JavaScript DOM 조작
✅ JavaScript Date 객체
✅ Git 브랜치 전략
✅ CI/CD 개념
✅ 정적 사이트 배포

### 다음 단계

1. **모니터링**: GitHub Actions 실행 로그 정기 확인
2. **최적화**: 추가 기능 구현 (위 아이디어 참고)
3. **학습**: JavaScript 고급 기능 (async/await, fetch API 등)
4. **확장**: 다른 프로젝트에 동일한 배포 방식 적용

---

**작성**: Claude Sonnet 4.5
**라이선스**: MIT
**업데이트**: 2026-02-09
