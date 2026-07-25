-- Import rollback: har bir importdan oldingi holat snapshot'i (TZ §24.3).
ALTER TABLE "ImportJob"
  ADD COLUMN "rollbackData" JSONB,
  ADD COLUMN "rolledBackAt" TIMESTAMP(3);

CREATE INDEX "ImportJob_status_createdAt_idx" ON "ImportJob"("status", "createdAt");
