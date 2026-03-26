-- NOTE:
-- 마이그레이션 디렉토리명에 order_seller_snapshot가 포함되어 있지만,
-- 최종 반영 스코프는 StoreAuditLog 생성/인덱스/FK만 포함합니다.
-- (중간 설계에서 주문 스냅샷 변경안은 제외됨)

-- CreateEnum
CREATE TYPE "StoreAuditAction" AS ENUM ('CREATED', 'UPDATED');

-- CreateTable
CREATE TABLE "StoreAuditLog" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "action" "StoreAuditAction" NOT NULL,
    "before" JSONB,
    "after" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreAuditLog_storeId_createdAt_idx" ON "StoreAuditLog"("storeId", "createdAt");

-- CreateIndex
CREATE INDEX "StoreAuditLog_sellerId_createdAt_idx" ON "StoreAuditLog"("sellerId", "createdAt");

-- AddForeignKey
ALTER TABLE "StoreAuditLog"
ADD CONSTRAINT "StoreAuditLog_storeId_fkey"
FOREIGN KEY ("storeId") REFERENCES "Store"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
