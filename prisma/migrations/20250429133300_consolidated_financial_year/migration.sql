-- 1. Add column as nullable first
ALTER TABLE "Transaction" ADD COLUMN "financialYear" TEXT;

-- 2. Backfill financial years based on date
UPDATE "Transaction" 
SET "financialYear" = 
    CASE 
        WHEN EXTRACT(MONTH FROM date) >= 4
        THEN EXTRACT(YEAR FROM date) || '-' || (EXTRACT(YEAR FROM date) + 1)
        ELSE (EXTRACT(YEAR FROM date) - 1) || '-' || EXTRACT(YEAR FROM date)
    END;

-- 3. Set column to NOT NULL after backfill
ALTER TABLE "Transaction" ALTER COLUMN "financialYear" SET NOT NULL;

-- 4. Drop old unique constraint
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_transactionNumber_key";

-- 5. Create new compound unique constraint
ALTER TABLE "Transaction" 
ADD CONSTRAINT "Transaction_financialYear_transactionNumber_key" 
UNIQUE ("financialYear", "transactionNumber");