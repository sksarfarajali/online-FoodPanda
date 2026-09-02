-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "adminReply" TEXT,
ADD COLUMN     "repliedAt" TIMESTAMP(3),
ADD COLUMN     "repliedByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_repliedByUserId_fkey" FOREIGN KEY ("repliedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
