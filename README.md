# 프로젝트 CODI-IT

- [팀 협업 문서(Notion)](https://www.notion.so/Codi-it-311875261f4d80f3a1dbef277357817f?source=copy_link)
- [배포 사이트](https://codiit.shop)

## 팀원 구성 및 업무 분담

| 팀원                                                | 주요 담당                                                                                           |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 정현준 ([Github](https://github.com/stuhk56-hash/)) | 로그인/로그아웃(판매자·구매자), 회원가입/개인정보 수정, 구매자 포인트 등급/사용                     |
| 박건용 ([Github](https://github.com/pkeony/))       | 주문 생성, 장바구니 담기 기능, 상품 결제 기능, 배송조회/주문 상세조회, API 문서화                   |
| 박대용 ([Github](https://github.com/Ddragon718/))   | 문의 CRUD 및 답변, 리뷰 등록/삭제/조회, 품절/문의답변 실시간 알림(SSE), 판매 대시보드 데이터        |
| 최민수 ([Github](https://github.com/chamysj/))      | 스토어 등록/수정/조회, 관심 스토어 등록/해제, 상품 CRUD, 판매량 기반 추천상품, AWS 인프라 구축/배포 |

## 프로젝트 소개

- 패션 이커머스 플랫폼
- 기간: 2026.02.13(금) ~ 2026.04.02(목)

## 기술 스택

- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL (RDS)
- ORM: Prisma
- Validation: Superstruct
- Auth: JWT (Access/Refresh), HttpOnly Cookie, HTTPS
- Security: Helmet, scrypt 비밀번호 해시, AES-256-GCM(스토어 민감정보 암복호화)
- Storage: AWS S3
- Infra: EC2, Route 53, Nginx + Let's Encrypt, PM2
- CI/CD: GitHub Actions (PR Test, main Push Deploy)
- API 문서화: swagger
- 협업 도구: Discord, GitHub, Notion
- 일정 관리: GitHub issues, Notion 타임라인

## 팀원별 구현 기능 상세

### **정현준 (인증/회원/포인트)**

- **인증/회원**
  - 판매자/구매자 로그인 및 로그아웃 구현
  - 회원가입 및 개인정보 수정 기능 구현
  - JWT Access/Refresh + HttpOnly Cookie 인증 흐름 적용
- **포인트/등급**
  - 구매자 포인트 등급 기능 구현
  - 주문 시 포인트 사용/적립 로직 구현

### **박건용 (주문/결제/배송)**

- **주문·결제 워크플로우**
  - 장바구니 담기 기능 구현
  - 주문 생성 및 결제 처리 기능 구현
  - 주문 상태(결제 대기/완료/취소) 흐름 관리
- **배송 및 주문 조회**
  - 배송조회 기능 구현
  - 주문 상세조회 API를 통한 주문 정보 제공
  - 주문 아이템 단위 스냅샷 기반 데이터 일관성 유지
- **API 문서화**
  - 주문/결제/배송 도메인 Swagger 명세 작성 및 유지보수

### **박대용 (문의/리뷰/알림/대시보드)**

- **문의·리뷰 도메인**
  - 문의 CRUD 및 판매자 답변 기능 구현
  - 리뷰 등록/삭제/조회 기능 구현
- **실시간 알림**
  - 상품 품절 시 구매자/판매자 알림 전송
  - 문의글 답변 등록 시 실시간 알림(SSE) 전송
- **판매 대시보드**
  - 판매 데이터 집계 및 대시보드 지표 API 구현

### **최민수 (스토어/상품/인프라)**

- **스토어/상품 관리**
  - 스토어 등록/수정/조회 기능 구현
  - 관심 스토어 등록/해제 기능 구현
  - 상품 CRUD 및 사이즈/재고 관리 기능 구현
  - 메인 페이지 판매량 기반 추천상품 기능 구현
- **인프라/배포**
  - AWS 인프라(EC2, RDS, S3, Route 53, Nginx, PM2) 구성
  - GitHub Actions 기반 CI/CD 배포 파이프라인 구축

## 파일 구조

```text
src
 ┣ modules       # 도메인 모듈(auth, products, orders, reviews, stores ...)
 ┃ ┗ <module>
 ┃    ┣ *.controller.ts   # HTTP 요청/응답 처리
 ┃    ┣ *.service.ts      # 비즈니스 로직
 ┃    ┣ *.repository.ts   # DB 접근(Prisma)
 ┃    ┣ structs/          # Superstruct 유효성 검증
 ┃    ┣ dto/              # 요청/응답 DTO
 ┃    ┣ utils/            # 모듈 유틸리티
 ┃    ┣ types/            # 모듈 전용 타입
 ┃    ┗ entities/         # 엔티티 타입
 ┣ middlewares   # 인증/인가/전역 에러 핸들러
 ┣ lib           # 공통 상수, 보안, 검증, 에러, 요청 유틸
 ┣ types         # 전역 타입
 ┣ main.ts       # 서버 시작 파일
 ┣ app.module.ts # 루트 모듈
 ┗ swagger.ts    # Swagger 설정
```

## API 명세

- Swagger UI: [https://api.codiit.shop/api-docs](https://api.codiit.shop/api-docs)

## 보안/설계 포인트

- 비밀번호 해시: `scrypt` + `timingSafeEqual`
- 토큰 무결성: JWT `HS256`
- 리프레시 토큰 저장: SHA-256 해시 저장
- 스토어 PII: AES-256-GCM 암복호화
- 전역 예외 처리: `globalErrorHandler`
- 계층 구조: module/controller/service/repository 분리

## 인프라 구성

- EC2: 애플리케이션 실행(backend/frontend, PM2)
- RDS(PostgreSQL): 운영 DB
- S3: 이미지 저장
- Route 53: `codiit.shop`, `api.codiit.shop` DNS 라우팅
- Nginx + Let's Encrypt: HTTPS/TLS 종료 및 리버스 프록시

## CI/CD

- Test Workflow: PR 생성/업데이트 시 자동 테스트
- Deploy Workflow: `main` 브랜치 push 시 EC2 자동 배포
- 배포 단계: `git pull` -> `npm ci` -> `build` -> `prisma migrate deploy` -> `pm2 restart`
