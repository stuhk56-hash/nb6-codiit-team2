# 📜 네이밍 컨벤션

## 📄 1) 파일명

[kebab-case]

- 가장 많이 쓰고 인기가 많다.
- 명확한 역할 표시를 줄 수 있다.

✅ 좋은 예:
group-controller.js
user-service.ts

❌ 나쁜 예:
groupController.ts
userService.ts

## 📄 2) 변수명 & 함수명

[camelCase]

- 동사 + 명사 조합 (함수)
- 명확한 의미 전달을 줄 수 있다.

✅ 좋은 예:

```ts
const createdGroup = await createGroup(data);
function validatePassword(password) {}
```

❌ 나쁜 예:

```ts
const g = await create(data);
function check(pwd) {}
```

## 📄 3) 상수명

[UPPER_SNAKE_CASE]

✅ 좋은 예:

```ts
const DEFAULT_PAGE_SIZE = 10;
const BADGE_TYPES = {
  PARTICIPANT_10: "PARTICIPANT_10",
  RECORD_100: "RECORD_100",
  LIKE_100: "LIKE_100",
};
```

❌ 나쁜 예:

```ts
const defaultPageSize = 10;
const max_image_count = 3;
```

## 📄 4) 클래스명

[PascalCase]

✅ 좋은 예:

```ts
class GroupController {}
class ValidationError extends Error {}
```

❌ 나쁜 예:

```ts
class groupController {}
class validation_error {}
```

---

# 📜 주석 작성 컨벤션 (선택)

```ts
// ✅ 복잡한 로직에만 간결하게 작성
// 배지 조건 체크: 참여자 10명 이상
if (participantCount >= 10) {
  badges.push("PARTICIPANT_10");
}

// ✅ 함수 설명 (JSDoc)
/**
 * 그룹의 배지 목록을 계산합니다
 * @param {number} groupId - 그룹 ID
 * @returns {Promise<string[]>} 배지 이름 배열
 */
async function calculateBadges(groupId) {
  // ...
}

// ❌ 불필요한 주석
// 변수에 groupId 할당
const groupId = req.params.groupId;

// ❌ 코드와 불일치하는 주석
// 사용자 삭제
await prisma.group.delete({ where: { id } }); // ???
```

---

# 📜 폴더 구조 컨벤션

- 폴더명은 복수형, 파일명은 단수형
- 예시: constrollers -> user-controller.ts

main: (개발자 취향)
✅ [controllers]
✅ [middlewares]
✅ [routes]
✅ [services]
✅ [repositories]
❌ [main.ts] -> ✅ [app.ts]

etc:
❌ [lib] -> ✅ [util],
❌ [struct] -> ✅ [validator]
✅ [config]

---

# 📜 Prisma 스키마 컨벤션

```prisma
// ✅ 모델명: PascalCase (단수형)
model Group {
  id          Int      @id @default(autoincrement())
  name        String   // camelCase
  description String?  // nullable은 ? 표시
  imageUrl    String?  @map("image_url") // DB는 snake_case
  createdAt   DateTime @default(now()) @map("created_at")

  // 관계는 복수형
  participants Participant[]
  records      Record[]

  @@map("groups") // 테이블명은 복수형 snake_case
}

// ❌ 나쁜 예
model group {  // 소문자 ❌
  ID Int  // 대문자 ❌
  Name String  // PascalCase ❌
}
```

---

# 📜 베스트 프랙티스 컨벤션

## 📄 1) 비동기 처리

```ts
// ✅ async/await 사용
async function getGroup(id) {
  const group = await prisma.group.findUnique({
    where: { id },
  });
  return group;
}

// ❌ .then() 체이닝 지양
function getGroup(id) {
  return prisma.group
    .findUnique({
      where: { id },
    })
    .then((group) => {
      return group;
    });
}
```

## 📄 2) 매직 넘버 금지

```ts
// ✅ 상수로 정의
const MAX_IMAGE_COUNT = 3;
const DEFAULT_PAGE_SIZE = 10;

if (images.length > MAX_IMAGE_COUNT) {
  throw new ValidationError("이미지는 최대 3장까지 업로드 가능합니다");
}

// ❌ 하드코딩
if (images.length > 3) {
  // 3이 무엇을 의미하는지 불명확
  throw new ValidationError("이미지는 최대 3장까지 업로드 가능합니다");
}
```

## 📄 3) Early Return 패턴

```ts
// ✅ 조건 불만족 시 빠르게 리턴
async function deleteGroup(req, res) {
  const group = await findGroup(id);

  if (!group) {
    throw new NotFoundError();
  }

  if (group.password !== password) {
    throw new UnauthorizedError();
  }

  await prisma.group.delete({ where: { id } });
  res.status(200).json({ message: "삭제 성공" });
}

// ❌ 중첩된 if문
async function deleteGroup(req, res) {
  const group = await findGroup(id);

  if (group) {
    if (group.password === password) {
      await prisma.group.delete({ where: { id } });
      res.status(200).json({ message: "삭제 성공" });
    } else {
      throw new UnauthorizedError();
    }
  } else {
    throw new NotFoundError();
  }
}
```

---

# 📜 함수 선언 컨벤션

## 📄 1) 기능 단위는 선언식 function

```ts
export async function createUser() {}
```

## 📄 2) 콜백, 간단한 유틸은 arrow function

```ts
export const delay = (ms: number) => new Promise(...)
```

## 📄 3) 미들웨어는 function 선언식 (표준)

```ts
export function requireAuth(req, res, next) {}
```

---

# 📜 타입/인터페이스 컨벤션

## 📄 1) “구조 정의”는 Interface

DTO, API 요청 타입, DB 모델 확장 등

```ts
interface User {
  id: number;
  email: string;
}
```

## 📄 2) “타입 조합/유틸/변형”은 type

```ts
type TokenPayload = JwtPayload & { id: number };
type Nullable<T> = T | null;
```

## 📄 3) 타입 이름은 PascalCase

```ts
type UserRole = "ADMIN" | "USER";
```

---

# 📜 null vs undefined

1️⃣ 의미 복습:
undefined: 값이 “없지만, 아직 안 채워졌음 / 선택사항임”
-> undefined는 “엔진이 기본으로 주는 값”

null: 값을 “일부러 비워둠 / 명시적으로 없음이라고 표현”
-> null은 “사람이 직접 넣는 값”

2️⃣ TypeScript에서 더 중요한 차이: 타입 설계
TS에서는 아래가 전혀 다르다:

```ts
let a: string | undefined;
let b: string | null;
let c: string | null | undefined;
```

- string | null
  \_ 값은 있는데, 그 값이 “없음(null)”일 수도 있다는 뜻
  \_ DB에서 nullable 컬럼이랑 잘 어울린다.

- string | null | undefined
  \_ 상태가 3개라 처리 진짜 귀찮아짐

그래서 보통 이렇게 정리한다.

- 코드 내부(도메인 모델, 서비스 로직) -> undefined 위주
- DB/JSON/API 응답 -> null을 주로 사용
- 결론은 TS는 null보다 undefined 선호

---

# 📜 async/await 의무화 (Promise.then 금지)

```ts
const user = await prisma.user.findUnique();

// ❌ 아래 방식은 금지
prisma.user.findUnique().then(...)
```

---

# 📜 Error는 throw하고, res.status 직접 쓰지 않는다

- 컨트롤러 / 서비스는 throw 기반

```ts
throw new NotFoundError("유저 없음");
```

- 최종 응답은 전역 에러 핸들러가 처리
- 미들웨어도 동일한 원칙을 따른다.

---

# 📜 global declare

req.user 같은 커스텀 필드는 반드시 타입 확장이 필수다.

```ts
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

선언 안할 시 "any" 지옥이 생긴다.

---

# 📜 서비스 레이어는 객체(Object Literal) 선호

```ts
export const userService = {
  async getUser(id) {},
  async createUser(data) {},
};
```

- this 필요 없음
- 인스턴스 생성 필요 없음
- 가볍고 안전함
- 테스트하기 쉬움

---

# 📜 컨트롤러는 비즈니스 로직 금지 (Thin Controller Rule)

- ✅ req 검증
- ✅ service 호출
- ✅ 응답 반환
- ❌ DB 조회
- ❌ 계산 처리
- ❌ 권한 로직

---

# 📜 환경 변수는 무조건 타입 체크한 config 모듈 사용

예시:

```ts
export const ENV = {
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
```

미들웨어에서는 그대로 쓰는 형태:

```ts
const secret = ENV.JWT_SECRET;
```

---

# 📜 Prisma 사용 시, 서비스 레이어 외부에서 Prisma 직접 호출 금지

- ❌ 컨트롤러에서 Prisma 호출
- ❌ 미들웨어에서 Prisma 호출(특수 케이스 제외)
- ✅ 무조건 서비스 레이어에서 Prisma 호출
- ✅ 단, Repo로 분리 시 Repo에서 Prisma 호출

---

# 📜 API 응답 구조 통일 (선택)

## 📄 1) 일반 응답

```ts
// 단일 데이터
return res(200).json({
  success: true, // 프론트를 위한 성공 여부 (선택)
  message: "조회 성공",
  data: {
    id: user.id,
    name: user.name,
    // ...
  },
});

// 목록 데이터 (페이지네이션 포함)
res.status(200).json({
  message: "목록 조회 성공",
  data: [
    { id: 1, name: "Group 1" },
    { id: 2, name: "Group 2" },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 50,
    totalPages: 5,
  },
});

// 생성/수정/삭제 -> 삭제는 statusCode(204) 선택이지만 비추천
res.status(201).json({
  message: "그룹이 생성되었습니다",
  data: createdGroup,
});
```

## 📄 2) 에러 응답

애플리케이션은 상황에 따라 서로 다른 HTTP 상태 코드와 에러 구조를 반환한다.
직접 res.status().json()을 사용하거나,
커스텀 에러 클래스를 throw하여 전역 에러 핸들러가 응답을 생성하도록 한다.

```ts
// 컨트롤러에서 직접 반환하는 경우
res.status(404).json({
  message: "그룹을 찾을 수 없습니다",
  error: "NOT_FOUND",
});

res.status(400).json({
  message: "입력 데이터가 올바르지 않습니다",
  error: "VALIDATION_ERROR",
  details: [{ field: "name", message: "그룹명은 필수입니다" }],
});

// 전역 에러 핸들러로 위임하는 경우
throw new BadRequestError("에러 메시지");
throw new NotFoundError("에러 메시지");
throw new UnauthorizedError("에러 메시지");
```

에러 핸들러에 따라 응답 형식은 프로젝트 요구사항에 맞게 다양하게 정의할 수 있다.

---

# 📜 모듈 export 규칙

- default export는 실수가 너무 쉽게 일어나서 실무에서는 피한다.
- named export는 안정적이고 IDE, TS 지원이 훨씬 좋다.

## 📄 1) default export는 이름이 강제되지 않는다

예시:

```ts
export default function signup() {}
```

가져올 때:

```ts
import ABC from "./signup";
```

이렇게 써도 오류가 없다.
파일 이름과 import 이름이 달라도 에러가 안 난다.
그래서 장점도 있지만 팀 전체에서 서로 다른 이름으로 같은 모듈을 부르다가 헷갈린다.
결국 코드 가독성이 떨어져 지옥이 열린다.

## 📄 2) default export는 자동 리팩토링이 깨지는 경우가 많다

VSCode에서 refactor(이름 바꾸기) 할 때:

- named export는 전 파일에 걸쳐 정확히 rename 해준다.
- default export는 rename 추적이 완벽하지 않아 엉뚱해지거나 놓치는 경우가 많다.

## 📄 3) default export는 트리 쉐이킹(tree-shaking)이 덜 안정적

번들러(Webpack, Rollup, ESBuild)는 named export 기반 구조에서 가장 최적화된 성능을 낸다.

## 📄 4) default export는 타입 충돌을 숨긴다

TS는 basic inference는 해주지만,
이름이 통일되지 않기 때문에 타입 추적이 불안정해지는 패턴이 자주 나온다.

## 📄 5) named export는 IDE 자동 완성(auto-complete)에 최적화됨

네임이 확실하면 import 할 때 어떤 함수가 있는지 IDE가 바로 보여준다.
default export는 이런 목록 제시가 약하다.

## 📄 6) default는 구조 강제되어 확장이 어렵다

예를 들어 처음에 클래스 하나만 export했는데,
나중에 헬퍼 함수를 하나 더 넣고 싶어다고 한다면,
export 방식이 섞이면서 API 구조가 더럽혀진다.
반면 named export는 처음부터 확장 가능성 열려있다.

---

# 📜 type-only import 최적화 규칙

_type-only import 최적화 규칙이란?_

TypeScript 4.x부터 도입된 개념으로,
“타입만 import하는 것과 실제 값을 import하는 것을 명확히 구분해서,
더 빠르고 더 깔끔하게 코드를 관리하는 방식”이다.

**타입은 타입으로만, 값은 값으로만 가져오자.**

이걸 체계적으로 적용한 걸 “type-only import 최적화 규칙”이라고 부른다.

## 📄 규칙 1) 타입만 쓸 경우 반드시 import type

```ts
import type { Request, Response } from "express";
```

- JS 결과물에 import가 남지 않음
- 타입/값을 혼동하지 않음
- 트리셰이킹 최적화

## 📄 규칙 2) 타입과 값을 동시에 쓸 때는 일반 import

```ts
import { Router, Request, Response } from "express";
```

Router는 실제 “값”이기 때문이다.

## 📄 규칙 3) 혼합 import를 피하려면 타입을 따로 분리해도 됨

개발 팀에 따라 더 엄격하게 이렇게 쓴다:

```ts
import { Router } from "express";
import type { Request, Response } from "express";
```

이러면 타입과 값이 더 명확하게 구분된다.

## 📄 규칙 4) ESlint 규칙으로 자동화할 수 있다 (선택)

```json
"@typescript-eslint/consistent-type-imports": "error"
```

- 타입만 사용했는데 일반 import 썼으면 에러
- 타입 import인데 일반 import를 했으면 자동 고침 제안

VSCode에서 자동으로 fix가 된다.

---

**date**: 2025-12-17
**version**: 1.0.0
