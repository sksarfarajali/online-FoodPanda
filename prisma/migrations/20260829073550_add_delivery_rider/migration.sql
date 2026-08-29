-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'DELIVERY_RIDER';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "riderId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentLatitude" DECIMAL(9,6),
ADD COLUMN     "currentLongitude" DECIMAL(9,6),
ADD COLUMN     "isOnDuty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locationUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "vehicleNumber" TEXT;

-- CreateIndex
CREATE INDEX "Order_riderId_idx" ON "Order"("riderId");

-- CreateIndex
CREATE INDEX "User_role_isOnDuty_idx" ON "User"("role", "isOnDuty");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
