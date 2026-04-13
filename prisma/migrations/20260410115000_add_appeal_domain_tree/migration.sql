-- AlterEnum
ALTER TYPE "UserState" ADD VALUE 'WAIT_APPEAL_DOMAIN';

-- AlterEnum
ALTER TYPE "UserState" ADD VALUE 'WAIT_APPEAL_SUBDOMAIN';

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "pendingAppealDomain" TEXT,
ADD COLUMN "pendingAppealSubdomain" TEXT;

-- AlterTable
ALTER TABLE "Request"
ADD COLUMN "domain" TEXT,
ADD COLUMN "subdomain" TEXT;
