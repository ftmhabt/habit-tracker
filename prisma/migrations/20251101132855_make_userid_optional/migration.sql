-- DropForeignKey
ALTER TABLE "public"."Layout" DROP CONSTRAINT "Layout_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Theme" DROP CONSTRAINT "Theme_userId_fkey";

-- AlterTable
ALTER TABLE "Layout" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Theme" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Layout" ADD CONSTRAINT "Layout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
