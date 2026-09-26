ALTER TABLE "Category" ADD COLUMN "sellerId" TEXT;

CREATE INDEX "Category_sellerId_idx" ON "Category"("sellerId");

ALTER TABLE "Category" ADD CONSTRAINT "Category_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
