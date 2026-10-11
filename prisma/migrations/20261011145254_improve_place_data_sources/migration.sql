-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "imageAttribution" TEXT,
ADD COLUMN     "imageLicense" TEXT,
ADD COLUMN     "imageSource" TEXT,
ADD COLUMN     "ratingCount" INTEGER,
ADD COLUMN     "ratingSource" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'openstreetmap',
ALTER COLUMN "rating" DROP NOT NULL,
ALTER COLUMN "rating" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Place_source_idx" ON "Place"("source");
