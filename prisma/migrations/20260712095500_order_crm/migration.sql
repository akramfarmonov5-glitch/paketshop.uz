ALTER TABLE "Order"
  ADD COLUMN "preferredPaymentMethod" TEXT,
  ADD COLUMN "assignedToId" TEXT;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Order_assignedToId_status_createdAt_idx"
  ON "Order"("assignedToId", "status", "createdAt");
