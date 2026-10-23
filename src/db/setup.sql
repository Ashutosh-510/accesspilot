ALTER TABLE "AccessRequest"
ADD COLUMN IF NOT EXISTS "managerApproval" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS "applicationOwnerApproval" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'normal';

CREATE TABLE IF NOT EXISTS "ApplicationAccess" (
    "id" VARCHAR(36) PRIMARY KEY,
    "employeeId" VARCHAR(36) NOT NULL,
    "application" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);