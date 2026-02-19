# 📜 feature 최신 작업 반영 가이드

# 📜 꼭 개인 폴더에 클론 하세요!!!

git clone https://github.com/Leon97-dev/nb6-team3-project.git

레포를 clone하면
작업 폴더 안에 nb6-team3-project 폴더가 생성됩니다.
이 폴더가 실제 Git 프로젝트이니 그 안에서 작업하시면 됩니다.
만약 상위에 다른 폴더 없이 바로 프로젝트로 쓰고 싶다면,
로컬에서 nb6-team3-project 폴더를 원하는 위치로 옮겨도 됩니다.
(.git 폴더만 삭제하지 않으면 문제 없습니다.)

# 📜 git 가이드

0️⃣ STEP0: (사전 확인) Node.js 버전 체크

```bash
# Node.js 버전 확인 (필수!)
node --version
# v18.18.0 이상이어야 함 (v20.x 권장)

# 버전이 낮다면
# Windows: https://nodejs.org → LTS 다운로드
# Mac: brew upgrade node
# 또는: nvm install 20 && nvm use 20
```

⚠️ **Node.js 18.18.0 미만이면 npm install 실패합니다!**

1️⃣ STEP1 : (git 작업) 현재 작업 저장

```bash
# 현재 작업중인 브랜치에서 작업 내용 커밋 (예시 브랜치명:feature-api)

git add .
git commit -m "fix: feature api 작업 중"
```

2️⃣ STEP2 : (git 작업) feature 브랜치 최신화

```bash
git fetch origin
git checkout feature
git pull origin feature
```

3️⃣ STEP3 : (git 작업) rebase 실행

```bash
git checkout feature-api
git rebase feature
```

4️⃣ STEP4 : (git 작업) 충돌 발생 하면 충돌 부분 해결

```bash
# 충돌 발생 시
git status
# → 충돌 파일 확인

# VSCode에서 충돌 해결
code .

# 해결 후
git add .
git rebase --continue

# 복잡하면 git을 다시 clone해서 아래 초기 설정을 다시 하는 것을 추천합니다.
```

5️⃣ STEP5 : (터미널 작업) 의존성 재설치

```bash
# package.json이 변경되었음
rm -rf node_modules package-lock.json
npm install
```

6️⃣ STEP6 : (터미널 작업) Prisma 마이그레이션

```bash
# schema.prisma가 변경되었으므로 강제 리셋 후 마이그래이션
npx prisma migrate reset --force

# 더미데이터 생성기 실행
npm run seed
```

7️⃣ STEP7 : (터미널 작업) 확인 및 작업 재개

```bash
# Prisma studio 실행해서 더미데이터 정상 생성되었는지 확인
npx prisma studio

# 서버 실행 확인
npm run dev
```

🧑‍💻 git 너무 어렵다 그러면 아래 방법추천

- 기존 작업한 파일을 별도 폴더에 백업해놓기
- git repo 다시 clone 해오기 (feature 브랜치)
- 초급 프로젝트 개발가이드 적용 방법에 따라 다시 수행
- 설정 완료후 아래 더미데이터 생성 명령어만 실행

```bash
npm run seed
```

---

# 📜 Git 커밋 메시지

[형식]

<타입>: <제목>

<본문 (선택)>

[타입종류]

- feat: 새로운 기능 추가
- fix: 버그 수정
- refactor: 코드 리팩토링
- style: 코드 포맷팅, 세미콜론 누락 등
- docs: 문서 수정
- test: 테스트 코드 추가
- chore: 빌드, 패키지 등 기타 작업

[예시]

✅ 좋은 예:

- feat: 그룹 생성 API 구현
- fix: 그룹 목록 조회 시 페이지네이션 수정

❌ 나쁜 예:

- update
- 작업완료
- 기능 추가함

---

# 📜 코드 리뷰 체크리스트

- [ ] 네이밍 컨벤션 준수
- [ ] 에러 처리 적절히 구현
- [ ] 응답 형식 통일
- [ ] 불필요한 주석 제거
- [ ] (권장) console.log 대신 debugLog 사용
- [ ] 민감 정보 로깅 금지
- [ ] 하드코딩된 값 없음
- [ ] async/await 일관성

---

# 📜 PR(Pull Request) 전 확인

- [ ] 네이밍 컨벤션 준수 (camelCase, PascalCase, kebab-case)
- [ ] API 응답 형식 통일 (message, data)
- [ ] 에러 처리 구현 (try-catch, 커스텀 에러)
- [ ] console.log 대신 debugLog 사용
- [ ] 민감 정보 로깅 금지 (비밀번호, API 키 등)
- [ ] 불필요한 주석 제거
- [ ] .env 변수 사용 (하드코딩 금지)
- [ ] 커밋 메시지 형식 준수
- [ ] 코드 포맷팅 (2칸 들여쓰기, 세미콜론)
- [ ] async/await 일관성 유지

---

# 📜 PR 주의 사항

- PR 제목은 간결하고 명확하게 작성
- commit add . 지양 (작업 단위별로 커밋)
- PR 본문에 작업 내용 상세히 작성
- 리뷰어가 이해하기 쉽게 변경 사항 설명
- 리뷰어 피드백 적극 반영
- main push 금지 (개발 브랜치 활용)
- feature 브랜치로 PR 날리기
- 예를 들어 feature/group-controller 같이 브랜치 생성후 작업 진행
- feautre 브랜치로 머지되면 pull 가져오고 추가 작업 진행

1. **절대 .env 파일을 Git에 올리지 마세요!**
   - 민감 정보가 포함되어 있습니다
   - `.gitignore`에 포함되어 있으므로 자동으로 제외됩니다

2. **main 브랜치에 직접 푸시하지 마세요!**
   - 반드시 feature 브랜치에서 작업 브랜치를 만들어서 작업
   - Pull Request를 통해 feature에 병합

3. **node_modules를 Git에 올리지 마세요!**
   - `.gitignore`에 포함되어 있으므로 자동으로 제외됩니다
   - `package.json`으로 의존성 관리

4. **개인 파일은 temp/ 폴더를 활용하세요!**
   - 테스트 코드, 임시 작업 파일은 `temp/` 폴더에 보관
   - 이 폴더는 Git에 추적되지 않습니다

---

# 📜 쉽게 설명

- 레포 클론
- 팀원은 반드시 feature에서 분기
- feature/개인작업 브랜치 생성
- 작업
- PR → feature
- feature 최신화
- 다시 작업 브랜치 생성 반복
- 프로젝트 완성 시점에 feature → main 한 번 merge
- 최종 발표 때 베포

---

**date**: 2025-12-17
**version**: 1.0.0
