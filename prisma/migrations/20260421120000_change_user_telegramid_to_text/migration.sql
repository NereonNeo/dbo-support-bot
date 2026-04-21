/*
  Warnings:

  - Changed the type of `telegramId` on the `User` table.
*/
-- DropIndex
DROP INDEX IF EXISTS "User_telegramId_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "telegramId" TYPE TEXT USING "telegramId"::TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

