/*
  Warnings:

  - The values [ARCHIVED] on the enum `AnnouncementStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `marked_by` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `head_employee_id` on the `departments` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- AlterEnum
BEGIN;
CREATE TYPE "AnnouncementStatus_new" AS ENUM ('DRAFT', 'PUBLISHED');
ALTER TABLE "public"."announcements" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "announcements" ALTER COLUMN "status" TYPE "AnnouncementStatus_new" USING ("status"::text::"AnnouncementStatus_new");
ALTER TYPE "AnnouncementStatus" RENAME TO "AnnouncementStatus_old";
ALTER TYPE "AnnouncementStatus_new" RENAME TO "AnnouncementStatus";
DROP TYPE "public"."AnnouncementStatus_old";
ALTER TABLE "announcements" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_marked_by_fkey";

-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "marked_by";

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "head_employee_id";

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
