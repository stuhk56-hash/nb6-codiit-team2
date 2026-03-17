# API 테스트 컨벤션

이 문서는 `products`, `stores` 모듈에서 적용한 테스트 작성 방식을 프로젝트 공통 컨벤션으로 정리한 문서입니다.

## 1) 테스트 파일 구조

- 모듈별 테스트 폴더는 `src/modules/<module>/tests` 를 사용한다.
- 통합 테스트는 `public` / `auth` 로 분리한다.
  - 예: `products.public.integration.spec.ts`
  - 예: `products.auth.integration.spec.ts`
- 공통 시드/앱 생성/헤더 생성 로직은 `*.test-util.ts` 로 분리한다.
  - 예: `products.test-util.ts`, `stores.test-util.ts`
- 유닛 테스트는 책임별로 분리한다.
  - 서비스: `<module>.service.spec.ts`
  - 서비스 유틸: `<module>.service.util.spec.ts`

## 2) 파일명 규칙

- 통합 테스트: `<module>.<public|auth>.integration.spec.ts`
- 유닛 테스트: `<module>.service.spec.ts`, `<module>.service.util.spec.ts`
- 공통 유틸: `<module>.test-util.ts`

## 3) describe/test 작성 규칙

- `describe`는 API 경계/도메인 단위로 작성한다.
  - 예: `인증이 필요한 상품 API 통합 테스트`
- 엔드포인트는 별도 `describe`로 묶는다.
  - 예: `describe('PATCH /api/products/:productId', ...)`
- 시나리오 문장(`test`)은 한글로 작성하고, 결과가 명확해야 한다.
  - 좋은 예: `다른 판매자가 수정하면 403을 반환한다`

## 4) 통합 테스트 규칙

- 실제 라우터 + 미들웨어를 포함한 테스트 앱을 사용한다.
- HTTP 통합 테스트는 `supertest`를 사용한다.
- DB는 테스트마다 정리한다.
  - `beforeEach`: 테스트 데이터 초기화
  - `afterAll`: 데이터 초기화 + `prisma.$disconnect()`
- 인증 API는 실제 access token 기반으로 호출한다.
  - `Authorization: Bearer <token>`
- 최소 1개 성공 케이스 + 핵심 실패 케이스를 포함한다.
  - 인증 실패 `401`
  - 권한 실패 `403`
  - 잘못된 입력 `400`
  - 미존재 리소스 `404`

## 5) 유닛 테스트 규칙

- 서비스 유닛은 `service, service.util`, 외부 의존성(`s3`, auth util 등)을 mock/spy 한다.
- 서비스 유틸 유닛은 경계값/예외 중심으로 작성한다.
  - 날짜/숫자/필수값 검증
  - 정렬/필터/페이지네이션
- 테스트는 호출 여부 + 입력값 + 반환값을 함께 검증한다.

## 6) 엔드포인트 커버리지 규칙

- Swagger에 있는 `products`, `stores` 엔드포인트는 통합 테스트에 모두 존재해야 한다.
- 신규 엔드포인트 추가 시 아래를 동시에 업데이트한다.
  1. `public/auth` 통합 테스트 파일
  2. 필요한 경우 `<module>.test-util.ts` 시드 함수
  3. 관련 서비스/유틸 유닛 테스트

## 7) 실행 명령어

- 전체 테스트: `npm test`
- 커버리지: `npm run test:coverage`
- 커버리지 HTML 열기: `npm run coverage:open`
- 모듈 단위 예시:
  - `npx jest src/modules/products/tests --runInBand`
  - `npx jest src/modules/stores/tests --runInBand`

## 8) PR 전 체크리스트

- [ ] Swagger 엔드포인트가 통합 테스트에 모두 반영되었는가
- [ ] `public/auth` 분리가 유지되는가
- [ ] 공통 로직이 `*.test-util.ts`로 정리되었는가
- [ ] 성공/실패 시나리오(401/403/400/404)가 적절히 포함되었는가
- [ ] 테스트가 로컬에서 모두 통과하는가
