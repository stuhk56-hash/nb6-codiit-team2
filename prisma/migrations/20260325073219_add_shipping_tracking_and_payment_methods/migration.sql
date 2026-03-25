/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentMethod` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_PHONE');

-- CreateEnum
CREATE TYPE "ShippingStatus" AS ENUM ('ReadyToShip', 'InShipping', 'Delivered');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "cardNumber" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "transactionId" TEXT;

-- CreateTable
CREATE TABLE "Shipping" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "ShippingStatus" NOT NULL DEFAULT 'ReadyToShip',
    "trackingNumber" TEXT NOT NULL,
    "carrier" TEXT NOT NULL DEFAULT '로켓배송',
    "readyToShipAt" TIMESTAMP(3),
    "inShippingAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingHistory" (
    "id" TEXT NOT NULL,
    "shippingId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipping_orderId_key" ON "Shipping"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipping_trackingNumber_key" ON "Shipping"("trackingNumber");

-- CreateIndex
CREATE INDEX "Shipping_status_idx" ON "Shipping"("status");

-- CreateIndex
CREATE INDEX "Shipping_orderId_idx" ON "Shipping"("orderId");

-- CreateIndex
CREATE INDEX "Shipping_trackingNumber_idx" ON "Shipping"("trackingNumber");

-- CreateIndex
CREATE INDEX "ShippingHistory_shippingId_idx" ON "ShippingHistory"("shippingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- AddForeignKey
ALTER TABLE "Shipping" ADD CONSTRAINT "Shipping_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingHistory" ADD CONSTRAINT "ShippingHistory_shippingId_fkey" FOREIGN KEY ("shippingId") REFERENCES "Shipping"("id") ON DELETE CASCADE ON UPDATE CASCADE;
