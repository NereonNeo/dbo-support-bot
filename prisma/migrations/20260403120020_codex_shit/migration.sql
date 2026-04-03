/*
  Warnings:

  - The `lang` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('RU', 'UZ', 'EN');

-- CreateEnum
CREATE TYPE "UserState" AS ENUM ('WAIT_LANGUAGE', 'WAIT_INN', 'READY_FOR_REQUEST_TYPE', 'WAIT_REQUEST_CONTENT', 'REQUEST_CREATED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('APPEAL', 'IMPROVEMENT');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('PHOTO', 'VIDEO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "inn" TEXT,
ADD COLUMN     "pendingRequestType" "RequestType",
ADD COLUMN     "state" "UserState" NOT NULL DEFAULT 'WAIT_LANGUAGE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "lang",
ADD COLUMN     "lang" "Language";

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "RequestType" NOT NULL,
    "text" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestAttachment" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "telegramFileId" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Request_requestNumber_key" ON "Request"("requestNumber");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestAttachment" ADD CONSTRAINT "RequestAttachment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
