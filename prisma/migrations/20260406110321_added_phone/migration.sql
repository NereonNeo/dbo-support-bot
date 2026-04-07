-- AlterEnum
ALTER TYPE "UserState" ADD VALUE 'WAIT_CONTACT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;
