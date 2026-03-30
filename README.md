# 프로젝트 CODI-IT (Backend)

CODI-IT 쇼핑몰 백엔드 서버입니다.  
상품/스토어/주문/결제/배송/리뷰/문의/알림(SSE) 기능을 제공합니다.

## 프로젝트 소개

- 쇼핑몰 도메인 API 서버
- 기간: 2026.03 (진행 중)
- 문서: [팀 협업 문서(Notion)](https://www.notion.so/2de465dc83a0817eab90cebee0287992)

## 기술 스택

- Backend: Node.js, Express v5, TypeScript
- Database: PostgreSQL (RDS)
- ORM: Prisma
- Validation: Superstruct, class-validator
- Auth: JWT (Access/Refresh), HttpOnly Cookie
- Security: Helmet, scrypt 비밀번호 해시, AES-256-GCM(스토어 민감정보 암복호화)
- Storage: AWS S3
- Infra: EC2, Route 53, Nginx + Let's Encrypt, PM2
- CI/CD: GitHub Actions (PR Test, main Push Deploy)

## 핵심 구현 기능

### 인증/유저

- 이메일 로그인/토큰 재발급/로그아웃
- Access Token + Refresh Token 흐름
- HttpOnly 쿠키 기반 Refresh Token 관리

### 스토어/상품

- 스토어 생성/수정/조회
- 상품 CRUD, 사이즈별 재고 관리, 품절 상태 반영
- 사업자 정보 유효성 검증(사업자등록번호 체크섬 포함)
- 스토어 민감정보 암호화 저장

### 주문/결제/배송

- 주문 생성/조회/취소
- 결제 상태 및 결제수단 관리
- 배송 상태/이력 관리
- 주문 스냅샷(판매자 정보 포함) 기반 데이터 일관성 유지

### 리뷰/문의/알림

- 리뷰 작성/수정/삭제/조회
- 상품 문의 및 답변
- SSE 기반 실시간 알림 전송

### 파일 업로드

- Multer 기반 이미지 업로드
- S3 업로드/삭제
- 업로드 용량 제한 및 오류 응답 처리

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
