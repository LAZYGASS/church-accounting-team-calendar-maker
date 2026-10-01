# 프로젝트 작업 규칙

## 변경 후 Git 반영

- 사용자가 이 프로젝트의 변경 작업을 요청하면, 작업 단위로 구현·검증·관련 문서 갱신을 마친 후 커밋하고 현재 브랜치의 upstream remote에 push한다. 매번 별도 승인을 요청하지 않는다.
- 사용자가 해당 작업에서 커밋 또는 push를 하지 말라고 명시하면 그 지시를 우선한다. 개별 파일 저장마다 push하는 것이 아니라 요청한 변경 작업이 검증된 시점에 수행한다.
- 시작 시 Git 상태와 upstream을 확인하고 fetch한다. 원격 변경을 보존하며 필요한 동기화를 수행한다. force push, reset, 기존 사용자 변경 폐기는 하지 않는다.
- 작업과 무관한 로컬 변경, 개인 설정, 비밀정보, 임시 산출물은 임의로 커밋하지 않는다.
- push 전에 README.md, TODO.md, WORKLOG.md를 최신화하고 GitHub의 한글 Description과 church Topic을 확인한다. 기존 관련 Topics를 유지한다.
- push 후 원격 브랜치의 커밋과 세 문서, Description 및 Topics를 확인한다. 실패하거나 검증하지 못했다면 완료로 보고하지 않는다.

## 폴더 구성

- 웹 앱은 web/, 상세 문서는 docs/, 원본 PPT와 참고 이미지는 assets/, 보관할 생성 PPT는 outputs/, 보조 스크립트는 scripts/, 자동 테스트는 tests/에 둔다.
- 메인 실행 파일은 ppt_template_generator.py이며 기본 실행 결과는 Git에서 제외된 outputs/generated/에 저장한다.
- 파일 이동 시 문서 링크·import·실행 경로를 함께 갱신한다. 사용자 원본과 기존 자료는 임의로 삭제하지 않는다.
