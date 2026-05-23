-- DropForeignKey
ALTER TABLE "announcements" DROP CONSTRAINT "announcements_created_by_fkey";

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
