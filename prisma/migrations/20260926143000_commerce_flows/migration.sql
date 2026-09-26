CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "ShippingScope" AS ENUM ('INTERNATIONAL', 'NATIONAL');

ALTER TABLE "User" ADD COLUMN "countryCode" TEXT;
ALTER TABLE "User" ADD COLUMN "currencyCode" TEXT;

ALTER TABLE "SellerProfile" ADD COLUMN "originCountry" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN "originCountryCode" TEXT;

ALTER TABLE "Product" ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "Product" ADD COLUMN "shippingScope" "ShippingScope" NOT NULL DEFAULT 'INTERNATIONAL';
ALTER TABLE "Product" ADD COLUMN "originCountry" TEXT;
ALTER TABLE "Product" ALTER COLUMN "description" SET DEFAULT '';
ALTER TABLE "Product" ALTER COLUMN "price" SET DEFAULT 0;
ALTER TABLE "Product" ALTER COLUMN "imageUrl" SET DEFAULT '';
ALTER TABLE "Product" ALTER COLUMN "categoryId" DROP NOT NULL;

CREATE INDEX "Product_status_idx" ON "Product"("status");

UPDATE "Review" SET "body" = '' WHERE "body" IS NULL;
ALTER TABLE "Review" ALTER COLUMN "body" SET NOT NULL;
ALTER TABLE "Review" ADD COLUMN "sellerResponse" TEXT;
ALTER TABLE "Review" ADD COLUMN "sellerRespondedAt" TIMESTAMP(3);
ALTER TABLE "Review" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Review_userId_idx" ON "Review"("userId");

CREATE TABLE "ProductView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductView_userId_createdAt_idx" ON "ProductView"("userId", "createdAt");
CREATE INDEX "ProductView_userId_productId_idx" ON "ProductView"("userId", "productId");
CREATE INDEX "ProductView_categoryId_idx" ON "ProductView"("categoryId");
CREATE INDEX "ProductView_subcategoryId_idx" ON "ProductView"("subcategoryId");

ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
