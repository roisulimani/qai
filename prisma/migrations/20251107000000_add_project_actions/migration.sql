-- CreateEnum
CREATE TYPE "ProjectActionStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ProjectAction" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "actionKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "ProjectActionStatus" NOT NULL DEFAULT 'RUNNING',
    "metadata" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectAction"
  ADD CONSTRAINT "ProjectAction_projectId_fkey"
  FOREIGN KEY ("projectId")
  REFERENCES "Project"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "ProjectAction_projectId_idx" ON "ProjectAction"("projectId");
CREATE INDEX "ProjectAction_status_idx" ON "ProjectAction"("status");
