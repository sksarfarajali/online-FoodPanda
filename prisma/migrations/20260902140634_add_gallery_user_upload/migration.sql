-- AlterTable
ALTER TABLE "GalleryImage" ADD COLUMN     "uploadedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "GalleryImage_uploadedByUserId_idx" ON "GalleryImage"("uploadedByUserId");

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
