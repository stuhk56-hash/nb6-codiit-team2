# TypeScript 컨벤션

이 문서는 현재 `codiit` 프로젝트 구현 기준으로 정리한 팀 공통 TypeScript 컨벤션입니다.

목표는 아래 3가지입니다.

- 파일 역할이 한눈에 보이게 작성한다.
- 컨트롤러, 서비스, 레포지토리 책임을 명확하게 나눈다.
- 프론트/백엔드 협업 중에도 구조를 쉽게 유지보수할 수 있게 한다.

---

## 1. 네이밍 규칙

### 파일명

- 파일명은 `kebab-case`를 사용합니다.
- 모듈 내부 파일은 역할이 드러나게 작성합니다.

좋은 예:

```ts
users.controller.ts;
users.service.ts;
users.repository.ts;
users.mapper.ts;
users.service.util.ts;
users.struct.ts;
users.type.ts;
users.upload.ts;
```

피해야 하는 예:

```ts
usersController.ts;
UserService.ts;
helper.ts;
misc.ts;
```

### 변수명 / 함수명 ()

- 변수명과 함수명은 `camelCase`를 사용합니다.
- 함수명은 역할이 보이도록 작성합니다.
- 검증 함수는 `validate*`
- 변환 함수는 `to*`
- 정규화 함수는 `normalize*`

좋은 예:

```ts
const currentPassword = req.body.currentPassword;
const normalizedQuery = normalizeProductListQuery(query);

function requireUserById(userId: string) {}
function ensureSeller(user: AuthUser) {}
function toUserResponse(user: UserWithGrade) {}
```

### 상수명

- 상수명은 `UPPER_SNAKE_CASE`를 사용합니다.
- 의미가 반복되는 값은 반드시 상수로 분리합니다.

좋은 예:

```ts
const DEFAULT_IMAGE = '/icon/image_fail.svg';
const TOP_SALES_LIMIT = 5;
```

### 클래스명

- 클래스명은 `PascalCase`를 사용합니다.
- 현재 프로젝트에서는 `Service`, `Repository`, `Error` 클래스 위주로 사용합니다.

좋은 예:

```ts
class UsersService {}
class OrdersRepository {}
class ForbiddenError extends Error {}
```

---

## 2. 함수 선언 규칙

### 기본 원칙

- 기능 단위 함수는 `function` 선언식을 사용합니다.
- 불필요한 arrow function 사용은 지양합니다.
- 콜백(`map`, `filter`, `reduce`)처럼 문맥상 필요한 경우에만 arrow function을 사용합니다.

좋은 예:

```ts
export function requireAuthUser(req: AuthenticatedRequest) {}
export async function createUser(req: Request, res: Response) {}
```

허용되는 예:

```ts
items.map((item) => item.id);
ratings.reduce((sum, rating) => sum + rating, 0);
```

### async 사용 기준

- 함수 내부에서 `await`를 사용할 때만 `async`를 붙입니다.
- Prisma가 반환하는 `Promise`를 그대로 반환만 할 경우 `async`를 붙이지 않습니다.

좋은 예:

```ts
findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

async updateMe(userId: string, data: UpdateUserDto) {
  const user = await requireUserById(userId);
  return usersRepository.updateById(userId, data);
}
```

피해야 하는 예:

```ts
async findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
```

### async/await vs then

- 컨트롤러와 서비스는 `async/await`를 기본으로 사용합니다.
- `.then()` 체이닝은 가독성을 해치므로 사용하지 않습니다.

좋은 예:

```ts
export async function getMe(req: AuthenticatedRequest, res: Response) {
  const user = requireAuthUser(req);
  const data = await usersService.getMe(user.id);
  res.send(data);
}
```

피해야 하는 예:

```ts
return usersService.getMe(user.id).then((data) => res.send(data));
```

---

## 3. 레이어별 역할

### Controller

- 요청 파싱
- `superstruct` 검증
- 인증 유저 추출
- 서비스 호출
- 응답 반환

컨트롤러에서는 아래를 지양합니다.

- 비즈니스 로직 작성
- 권한 검사 세부 구현
- 응답 객체를 길게 직접 조립하는 것

좋은 예:

```ts
export async function updateMe(req: UsersMulterRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const body = structCreate(req.body, UpdateMeBodyStruct);
  const user = await usersService.updateMe(authUser.id, body, req.file);
  res.send(user);
}
```

### Service

- 비즈니스 흐름을 담당합니다.
- 여러 레포지토리 호출을 조합합니다.
- 권한 확인 / 검증 보조 함수는 `service.util`로 분리할 수 있습니다.(필수아님)

서비스 파일에는 “흐름”만 남기는 것을 권장합니다.

좋은 예:

```ts
async update(user: ProductAuthUser, productId: string, body: UpdateProductBody) {
  await requireSellerOwnedProduct(
    user,
    productId,
    '판매자만 상품을 수정할 수 있습니다.',
    '상품 수정 권한이 없습니다.',
  );

  const payload = toUpdateProductPayload(body);
  return productsRepository.update(productId, payload);
}
```

### Repository

- Prisma를 통한 DB 접근만 담당합니다.
- 쿼리 조합(`include`, `select`)은 `queries/*.query.ts`로 분리할 수 있습니다.
- 로컬 비즈니스 로직은 두지 않습니다.

좋은 예:

```ts
findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { grade: true },
  });
}
```

### Mapper

- DB 결과나 내부 데이터를 응답 DTO로 변환합니다.
- `to*Response`, `to*Item`, `to*Dto` 형태의 함수는 기본적으로 mapper에 둡니다.

좋은 예:

```ts
export function toUserResponse(user: UserWithGrade): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    type: user.type,
    points: user.points,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    grade: user.grade
      ? {
          name: user.grade.name,
          id: user.grade.id,
          rate: user.grade.rate,
          minAmount: user.grade.minAmount,
        }
      : null,
    image: user.imageUrl ?? '',
  };
}
```

### service.util / util (필수아님)

- `service.util`
  - 권한 체크
  - 입력 검증
  - update payload 조립
  - 흐름 보조 함수
- `util`
  - 순수 보조 함수
  - enum 변환
  - query 문자열 정리

예:

```ts
export function validateUpdatePassword(password?: string) {}
export function toOrderStatus(value?: string): OrderStatus | undefined {}
export function asString(value: string | string[]) {}
```

---

## 4. 타입 관리 규칙

### DTO vs Types 분리

- `dto/`
  - API 요청/응답 계약
  - Swagger/프론트 응답 구조와 직접 대응
- `types/`
  - 내부 구현용 타입
  - repository row 타입
  - mapper source 타입
  - request 확장 타입

좋은 예:

```ts
// dto
export interface UserResponseDto {}

// types
export type UserWithGrade = UserEntity & {
  grade: { id: string; name: string; rate: number; minAmount: number } | null;
};
```

### 모듈 타입 위치

- 모듈 전용 타입은 해당 모듈의 `types/`에 둡니다.
- 공통 타입만 `src/types`에 둡니다.

`src/types`에 두는 대상:

- 인증 요청 타입
- 공통 에러 응답 타입
- 토큰 타입
- 전역적으로 재사용되는 타입

현재 예:

```ts
src / types / auth - request.type.ts;
src / types / error.type.ts;
src / types / token.type.ts;
```

### 로컬 타입 선언 기준

- 여러 파일에서 재사용되면 `types`로 이동합니다.
- 한 파일 내부 구현에만 필요한 타입은 파일 내부 유지가 가능합니다.

예:

- `SyntaxJsonError` 같은 내부 전용 타입 -> 파일 내부 유지
- `AuthenticatedRequest`, `TokenPayload` -> 공통 타입으로 이동

---

## 5. 요청 검증 규칙

### superstruct 사용

- 요청 검증은 `superstruct`를 사용합니다.
- `class-validator` / decorator 방식은 사용하지 않습니다.
- DTO는 class가 아니라 `interface`를 기본으로 사용합니다.

좋은 예:

```ts
const body = structCreate(req.body, UpdateMeBodyStruct);
```

### struct 위치

- 각 모듈 검증 스키마는 `structs/*.struct.ts`에 둡니다.
- 모듈 안에서 해결하는 구조를 우선합니다.

예:

```ts
users / structs / users.struct.ts;
products / structs / products.struct.ts;
stores / structs / stores.struct.ts;
```

### 컨트롤러 검증 방식

- `structCreate(req.body, Struct)`
- `structCreate(req.query, Struct)`
- `structCreate(req.params, Struct)`

`?? {}` 같은 방어 코드는 기본적으로 사용하지 않습니다.

좋은 예:

```ts
const body = structCreate(req.body, CreateUserBodyStruct);
const query = structCreate(req.query, ProductListQueryStruct);
```

---

## 6. 업로드 / 미들웨어 규칙

### multer 업로드

- `multer()` 생성과 `upload.single(...)`은 컨트롤러에 두지 않습니다.
- 모듈별 `*.upload.ts` 파일로 분리합니다.

좋은 예:

```ts
// users.upload.ts
const upload = multer();

export const usersUpload = upload.single('image');
```

### 업로드 요청 타입

- `req.file`을 사용하는 요청 타입은 모듈 `types/`에 둡니다.

좋은 예:

```ts
export type UsersMulterRequest = AuthenticatedRequest & {
  file?: Express.Multer.File;
};
```

---

## 7. 에러 처리 규칙

### 글로벌 에러 핸들러 사용

- 에러 응답은 공통 에러 핸들러에서 처리합니다.
- 컨트롤러에서 직접 `try/catch`를 두지 않습니다.
- 라우트에서 `withAsync`로 감쌉니다.

좋은 예:

```ts
usersRouter.patch('/me', authenticate(), usersUpload, withAsync(updateMe));
```

### 커스텀 에러 사용

- `BadRequestError`
- `UnauthorizedError`
- `ForbiddenError`
- `NotFoundError`
- `ConflictError`

서비스/유틸에서 명확한 메시지와 함께 throw 합니다.

### 공통 에러 응답 형태

```ts
{
  message: '...',
  error: 'Bad Request',
  statusCode: 400,
}
```

필드 순서는 아래 순서로 고정합니다.

1. `message`
2. `error`
3. `statusCode`

---

## 8. 응답 조립 규칙

### 응답 객체는 가능한 mapper에서 조립

- 서비스/레포지토리에서 큰 `return { ... }` 블록을 직접 만들지 않습니다.
- 응답 DTO 조립은 `mapper`로 분리합니다.

좋은 예:

```ts
return toProductDetailResponse(product, average, reviewSummary);
```

피해야 하는 예:

```ts
return {
  id: product.id,
  name: product.name,
  image: product.imageUrl ?? '',
  ...
};
```

### 필드 순서

- 가능하면 Swagger / DTO 선언 순서에 맞춰 응답 객체를 조립합니다.
- 특히 공통 에러 응답, 주요 응답 DTO는 순서까지 통일합니다.

---

## 9. 폴더 구조 기준

현재 프로젝트 권장 구조는 아래와 같습니다.

```bash
src/
  modules/
    users/
      dto/
      entities/
      queries/
      structs/
      types/
      utils/
      users.controller.ts
      users.service.ts
      users.repository.ts
      users.module.ts
      users.upload.ts
```

### 역할별 디렉터리

- `dto/` : API 계약
- `entities/` : 응답 표현 엔터티(있을 경우)
- `queries/` : Prisma `include`, `select` 상수
- `structs/` : `superstruct` 스키마
- `types/` : 내부 타입
- `utils/` : mapper, service.util, 일반 util

---

## 10. 코드 스타일 원칙

### Early Return

- 조건이 맞지 않으면 빠르게 종료합니다.
- 중첩 `if`를 줄입니다.

좋은 예:

```ts
if (!user) {
  throw new UnauthorizedError();
}

if (user.type !== 'SELLER') {
  throw new ForbiddenError();
}
```

### 매직 넘버 지양

- 반복되는 숫자/문자열은 상수로 분리합니다.

좋은 예:

```ts
const TOP_SALES_LIMIT = 5;
const DEFAULT_PAGE_SIZE = 20;
```

### 불필요한 this / 접근제어자 지양

- 현재 프로젝트 기준으로 `private`, `public`, `protected`를 적극적으로 사용하지 않습니다.
- 클래스 내부에서도 불필요한 `this` 의존을 줄입니다.
- 가능한 경우 순수 함수/유틸로 분리합니다.

---

## 11. 체크리스트

새 기능 구현 전/후 아래를 확인합니다.

- 컨트롤러가 비즈니스 로직을 직접 갖고 있지 않은가?
- 요청 검증이 `superstruct`로 이루어지는가?
- DTO와 내부 타입이 분리되어 있는가?
- `to...` 응답 조립 함수가 mapper에 있는가?
- 레포지토리에서 불필요한 `async`를 쓰고 있지 않은가?
- `multer` 생성이 컨트롤러에 남아 있지 않은가?
- 공통 타입이 `src/types`로 정리되어 있는가?
- 에러 응답 순서가 `message -> error -> statusCode`인가?

---

## 12. 현재 프로젝트에서 허용되는 예외

- 파일 내부 전용 타입은 과도하게 `src/types`로 옮기지 않습니다.
- `reduce`, `map` 같은 콜백의 arrow function은 허용합니다.
- 레포지토리에서 매우 단순한 Prisma 호출은 그대로 두되, 쿼리 옵션이 커지면 `queries`로 분리합니다.

---

이 문서는 현재 `codiit` 코드베이스 기준입니다.
팀에서 새 규칙을 합의하면 이 문서를 먼저 갱신하고, 이후 코드에 반영합니다.
