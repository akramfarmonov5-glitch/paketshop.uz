-- Lead pipeline: status va yo'qotish sababi (spec §24.4).
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST');

ALTER TABLE "Lead"
  ADD COLUMN "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  ADD COLUMN "lostReason" TEXT;

CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
