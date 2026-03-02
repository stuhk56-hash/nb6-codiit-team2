// =========================
// 추가 Enum: 알림 이벤트 타입
// 실시간 알림을 "문자열 content"만으로 처리하면 분기 처리/클릭 이동/프론트 UI 분류가 어려워서,
// 이벤트 종류를 enum으로 관리하기 위한 추가안
// =========================
enum NotificationType {
// 판매자에게: 판매 중인 상품이 품절됨
ProductSoldOut

// 구매자에게: 장바구니에 담아둔 상품(옵션)이 품절됨
CartItemSoldOut

// 구매자에게: 주문 진행 중 상품(옵션)이 품절됨
OrderItemSoldOut

// 판매자에게: 내 상품에 새 문의가 등록됨
NewInquiry

// 구매자에게: 내가 남긴 문의에 답변이 등록됨
InquiryAnswered

// 구매자에게: 주문/결제 완료 관련 알림 (확장용)
OrderCompleted
}

// =========================
// 추가 Enum: 알림이 가리키는 리소스 타입
// 알림 클릭 시 어디로 이동할지(상품/문의/주문 등) 식별하기 위한 타입
// resourceId와 함께 사용
// =========================
enum NotificationResourceType {
Product
Inquiry
Order
Store
Cart
}

model User {
// 사용자 고유 ID
id String @id @default(cuid())
// 사용자 타입(SELLER/BUYER)
type UserType
// 로그인 이메일(중복 불가)
email String @unique
// 닉네임/이름
name String
// 비밀번호 해시값(원문 비밀번호 저장 금지)
passwordHash String
// 프로필 이미지 URL
imageUrl String?
// 이미지 저장소 키(S3 key 등)
imageKey String?
// 보유 포인트
points Int @default(0)

// [추가] 누적 구매 금액
// 이유: "등급 산정 기준"이 누적 구매 금액이므로, 주문 완료 시 누적합을 빠르게 관리하기 위한 필드
// 매번 Order 전체 합계를 재계산하지 않게 해줌
totalSpent Int @default(0)

// 현재 등급 ID(없을 수도 있음)
gradeId String?
// 등급 관계
grade Grade? @relation(fields: [gradeId], references: [id], onDelete: SetNull)

// 1:1 스토어(셀러만 보유)
store Store?
// 찜한 스토어 목록
favorites StoreFavorite[]
// 바이어 장바구니(1:1)
cart Cart?
// 작성한 문의
inquiries Inquiry[]
// 작성한 리뷰
reviews Review[]
// 생성한 주문
orders Order[]
// 보유한 리프레시 토큰들
refreshTokens RefreshToken[]
// 받은 알림들
notifications Notification[]

// 생성 시각
createdAt DateTime @default(now())
// 수정 시각(자동 갱신)
updatedAt DateTime @updatedAt
// 셀러가 작성한 문의 답변 목록
inquiryAnswers InquiryAnswer[]
}

model Product {
// 상품 고유 ID
id String @id @default(cuid())
// 소속 스토어 ID
storeId String
// 스토어 관계
store Store @relation(fields: [storeId], references: [id], onDelete: Cascade)

// 상품명
name String
// 상세 설명
content String?
// 정가
price Int
// 품절 여부
isSoldOut Boolean @default(false)

// 카테고리 ID
categoryId Int
// 카테고리 관계
category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)

// 상품 대표 이미지 URL
imageUrl String?
// 상품 이미지 저장소 키
imageKey String?

// 할인율(예: 10 = 10%)
discountRate Int?

// [추가] 할인가(정액 값)
// 이유: 요구사항에 "할인 기간 + 할인가" 입력이 있음.
// discountRate만 있으면 정률 할인만 가능해서, 정액 할인가 입력 요구 대응용
discountPrice Int?

// 할인 시작 시각
discountStartTime DateTime?
// 할인 종료 시각
discountEndTime DateTime?

// [추가] 상품 이미지 목록(상세 이미지 포함 확장)
// 기존 imageUrl/imageKey는 대표 이미지 1장 용도로 두고,
// 상세 페이지용 다중 이미지는 ProductImage 테이블로 관리
images ProductImage[]

// 사이즈별 재고 목록
stocks ProductStock[]
// 상품 문의 목록
inquiries Inquiry[]
// 상품 리뷰 목록
reviews Review[]
// 주문 아이템 참조
orderItems OrderItem[]
// 장바구니 아이템 참조
cartItems CartItem[]

// 생성 시각
createdAt DateTime @default(now())
// 수정 시각
updatedAt DateTime @updatedAt

// 스토어별 상품 조회 최적화
@@index([storeId])
// 카테고리별 상품 조회 최적화
@@index([categoryId])
}

// [추가] 상품 이미지(대표/상세)
// 이유: 상품 상세 조회에서 이미지 여러 장을 표현하기 위해 별도 모델 필요
// - 대표 이미지 여부
// - 정렬 순서
// 를 함께 관리 가능
model ProductImage {
// 이미지 ID
id String @id @default(cuid())

// 소속 상품 ID
productId String

// 이미지 URL
imageUrl String

// 이미지 저장소 키(S3 key 등)
imageKey String?

// 대표 이미지 여부
// true인 이미지를 우선 노출하도록 사용 (정책은 서비스 로직에서 보장)
isPrimary Boolean @default(false)

// 정렬 순서
// 상세 페이지에서 이미지 순서대로 노출할 때 사용
sortOrder Int @default(0)

// 상품 관계
product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

// 생성 시각
createdAt DateTime @default(now())
// 수정 시각
updatedAt DateTime @updatedAt

// 상품 상세 이미지 정렬 조회 최적화
@@index([productId, sortOrder])

// 상품별 대표 이미지 조회 최적화
@@index([productId, isPrimary])
}

model Order {
// 주문 ID
id String @id @default(cuid())
// 주문한 바이어 ID
buyerId String
// 바이어 관계
buyer User @relation(fields: [buyerId], references: [id], onDelete: Restrict)

// 주문 상태
status OrderStatus @default(WaitingPayment)

// 주문자 이름(주문 시점 스냅샷)
buyerName String
// 주문자 연락처(주문 시점 스냅샷)
phoneNumber String
// 배송 주소(주문 시점 스냅샷)
address String

// [추가] 우편번호
// 이유: 주소를 한 줄 문자열로만 저장하면 배송정보 재사용/표시/검증이 불편함
zipCode String?

// [추가] 상세 주소
// 이유: 기본 주소와 상세 주소를 분리해 저장하기 위함
addressDetail String?

// 사용한 포인트
usedPoints Int @default(0)
// 주문으로 적립된 포인트
earnedPoints Int @default(0)

// [추가] 주문 금액 스냅샷 필드들
// 이유:
// - 대시보드 집계(기간별 매출/할인 총액)
// - 주문 시점 기준 금액 보존(상품 가격 변경 영향 방지)
// - 결제 검증/정산 로직 단순화
subtotalPrice Int @default(0) // 상품 금액 합계(할인 적용 전/기준 정책에 맞게)
discountAmount Int @default(0) // 총 할인 금액
finalPrice Int @default(0) // 최종 결제 금액(포인트/할인 반영 후)

// 주문 아이템 목록
items OrderItem[]
// 결제 정보(테스트용 단순 결제)
payment Payment?

// 생성 시각
createdAt DateTime @default(now())
// 수정 시각
updatedAt DateTime @updatedAt

// 사용자별 주문 조회 최적화
@@index([buyerId])
// 상태별 주문 조회 최적화
@@index([status])
}

model OrderItem {
// 주문 아이템 ID
id String @id @default(cuid())
// 소속 주문 ID
orderId String
// 상품 ID
productId String
// 주문한 사이즈 ID
sizeId Int

// 주문 수량
quantity Int
// 주문 시점 최종 단가 스냅샷
unitPrice Int

// 주문 시점 상품명 스냅샷
productName String
// 주문 시점 상품 이미지 스냅샷
productImageUrl String?

// 주문 관계
order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
// 상품 관계
product Product @relation(fields: [productId], references: [id], onDelete: Restrict)
// 사이즈 관계
size Size @relation(fields: [sizeId], references: [id], onDelete: Restrict)

// 이 주문 아이템에 연결된 리뷰들
reviews Review[]

// 상품별 주문 아이템 조회 최적화
@@index([productId])

// [추가] 주문별 아이템 조회 최적화
// 이유: 주문 상세 조회 시 orderId로 아이템들을 자주 조회함
@@index([orderId])
}

model Payment {
// 결제 ID
id String @id @default(cuid())
// 연결된 주문 ID(주문당 결제 1건)
orderId String @unique
// 주문 관계
order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

// 결제 금액
price Int
// 결제 상태
status PaymentStatus @default(Pending)

// [추가] 결제 완료 시각
// 이유: 대시보드에서 "기간별 매출" 집계 기준을 createdAt 대신 paidAt으로 잡을 수 있음
// (결제 생성 시각과 실제 결제 완료 시각이 다를 수 있음)
paidAt DateTime?

// 생성 시각
createdAt DateTime @default(now())
// 수정 시각
updatedAt DateTime @updatedAt

// 상태별 결제 조회 최적화
@@index([status])
}

model Notification {
// 알림 ID
id String @id @default(cuid())
// 알림 수신 사용자 ID
userId String
// 사용자 관계
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

// 알림 메시지 내용
content String

// [추가] 알림 제목/요약
// 이유: 프론트에서 title + content 구조로 UI를 만들기 좋음 (선택 사항)
title String?

// [추가] 알림 이벤트 타입
// 이유: 알림 종류별 아이콘/색상/분기 처리 및 서버 로직 필터링
type NotificationType

// [추가] 연결 리소스 타입
// 이유: "무슨 리소스로 이동할 알림인지" 구분 (상품/문의/주문 등)
resourceType NotificationResourceType?

// [추가] 연결 리소스 ID
// 이유: 알림 클릭 시 상세 페이지 라우팅/조회에 사용
resourceId String?

// [추가] 이동 링크(프론트 라우팅 경로)
// 이유: 서버에서 바로 링크를 내려주면 프론트 구현 단순화 가능
linkUrl String?

// [추가] 유연한 부가 데이터(JSON)
// 이유: 품절된 옵션/문의 제목/주문번호 등 이벤트별 추가정보 저장
metadata Json?

// 읽음 여부
isChecked Boolean @default(false)

// [추가] 읽은 시각
// 이유: 읽음 처리 이력 확인, 정렬/디버깅/통계에 활용 가능
checkedAt DateTime?

// 생성 시각
createdAt DateTime @default(now())
// 수정 시각
updatedAt DateTime @updatedAt

// 사용자별 최신 알림 조회 최적화
@@index([userId, createdAt])
// 읽음/안읽음 필터 최적화
@@index([isChecked])

// [추가] 알림 타입별 조회 최적화
// 이유: 타입 기준 필터링/집계 시 성능 보조
@@index([type])
}
