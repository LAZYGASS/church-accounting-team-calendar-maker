# 🗓️ 재정집행일정 캘린더

교회 재정팀을 위한 예산집행일정 캘린더 자동생성 도구입니다.

## 📌 빠른 시작

### 🌐 웹사이트 접속
```
https://lazygass.github.io/church-accounting-team-calendar-maker/
```

### 📖 사용방법
자세한 사용방법은 **[USAGE.md](./docs/USAGE.md)** 를 참고하세요.
- 웹사이트 사용 방법
- 캘린더 일정 해석
- 이미지 다운로드
- 문제 해결

## 🔧 기술 정보

배포 및 기술 구현 방법은 **[DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)** 를 참고하세요.

## 폴더 구성

| 경로 | 용도 |
| --- | --- |
| `web/` | 웹 앱 및 GitHub Pages 배포 대상 |
| `ppt_template_generator.py` | PPT 생성 실행 파일 |
| `docs/` | 사용·배포 가이드, 요구사항, 변경 이력, 학습 자료 |
| `assets/` | 원본 PPT 및 참고 이미지 |
| `outputs/` | 기존에 보관한 생성 PPT |
| `outputs/generated/` | 새로 생성되는 로컬 PPT (Git 제외) |
| `scripts/` | 날짜 확인 및 디버깅 보조 스크립트 |

## Python 실행

프로젝트 루트에서 실행합니다. 상세 안내: [Windows 가이드](./docs/WINDOWS_GUIDE.md).

```powershell
python ppt_template_generator.py
python scripts/test_schedule.py
python scripts/test_dates.py
```

새 PPT는 실행 위치와 관계없이 프로젝트의 `outputs/generated/`에 저장됩니다.
`save(filename)`을 직접 호출하는 경우에는 지정한 경로를 그대로 사용합니다.
`scripts/PPT.py`는 기존 서식 추출 참고 코드이며, 실행하려면 `Presentation` import와 실제 입력 파일 경로 설정이 필요합니다.

## 작업 규칙

변경 작업은 검증과 문서 갱신 후 커밋·push까지 진행합니다. 상세 규칙은 [AGENTS.md](./AGENTS.md)를 참고하세요.
