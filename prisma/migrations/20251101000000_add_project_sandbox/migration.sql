-- CreateEnum
CREATE TYPE "SandboxStatus" AS ENUM ('STARTING', 'RUNNING', 'PAUSED');

-- CreateTable
CREATE TABLE "ProjectSandbox" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sandboxId" TEXT NOT NULL,
    "sandboxUrl" TEXT NOT NULL,
    "status" "SandboxStatus" NOT NULL DEFAULT 'STARTING',
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSandbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSandbox_projectId_key" ON "ProjectSandbox"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectSandbox" ADD CONSTRAINT "ProjectSandbox_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
