-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SandboxStatus" ADD VALUE 'KILLED';
ALTER TYPE "SandboxStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "SandboxStatus" ADD VALUE 'TERMINATED';
ALTER TYPE "SandboxStatus" ADD VALUE 'UNKNOWN';

-- AlterTable
ALTER TABLE "ProjectSandbox" ADD COLUMN     "killedAt" TIMESTAMP(3),
ADD COLUMN     "killedReason" TEXT,
ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "verificationFailures" INTEGER NOT NULL DEFAULT 0;
