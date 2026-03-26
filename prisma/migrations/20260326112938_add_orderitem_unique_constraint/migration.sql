/*
  Warnings:

  - A unique constraint covering the columns `[buyerId,orderItemId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Made the column `orderItemId` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_orderItemId_fkey";

-- DropIndex
DROP INDEX "Review_buyerId_idx";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "orderItemId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_buyerId_orderItemId_key" ON "Review"("buyerId", "orderItemId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
