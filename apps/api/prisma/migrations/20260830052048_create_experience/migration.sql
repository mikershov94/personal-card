/*
  Warnings:

  - Made the column `location` on table `Profile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avatarUrl` on table `Profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "avatarUrl" SET NOT NULL;

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "startedAt" DATE NOT NULL,
    "endedAt" DATE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Experience_profileId_sortOrder_idx" ON "Experience"("profileId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
