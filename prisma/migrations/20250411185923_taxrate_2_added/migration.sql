/*
  Warnings:

  - You are about to drop the column `taxRate` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "taxRate",
ADD COLUMN     "taxRate1" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "taxRate2" DOUBLE PRECISION NOT NULL DEFAULT 0;
