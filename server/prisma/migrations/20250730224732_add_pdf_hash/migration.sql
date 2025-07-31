/*
  Warnings:

  - A unique constraint covering the columns `[pdfHash]` on the table `Ledger` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Ledger" ADD COLUMN     "pdfHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Ledger_pdfHash_key" ON "public"."Ledger"("pdfHash");
