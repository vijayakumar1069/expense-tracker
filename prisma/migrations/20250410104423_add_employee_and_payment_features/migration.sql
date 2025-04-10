-- CreateEnum
CREATE TYPE "PaymentTransferMode" AS ENUM ('UPI', 'NEFT', 'IMPS', 'RTGS');

-- AlterEnum
ALTER TYPE "InvoiceStatus" ADD VALUE 'Raised';

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "transferMode" "PaymentTransferMode";

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
