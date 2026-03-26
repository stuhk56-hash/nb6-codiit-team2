-- CreateTable
CREATE TABLE "ProductSizeSpec" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "sizeLabel" TEXT NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "totalLengthCm" DOUBLE PRECISION,
  "shoulderCm" DOUBLE PRECISION,
  "chestCm" DOUBLE PRECISION,
  "sleeveCm" DOUBLE PRECISION,
  "waistCm" DOUBLE PRECISION,
  "hipCm" DOUBLE PRECISION,
  "thighCm" DOUBLE PRECISION,
  "riseCm" DOUBLE PRECISION,
  "hemCm" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductSizeSpec_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSizeSpec_productId_sizeLabel_key"
ON "ProductSizeSpec"("productId", "sizeLabel");

-- CreateIndex
CREATE INDEX "ProductSizeSpec_productId_displayOrder_idx"
ON "ProductSizeSpec"("productId", "displayOrder");

-- AddForeignKey
ALTER TABLE "ProductSizeSpec"
ADD CONSTRAINT "ProductSizeSpec_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
