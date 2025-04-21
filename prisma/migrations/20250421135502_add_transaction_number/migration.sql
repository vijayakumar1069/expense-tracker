-- Step 1: Add the column as nullable first
ALTER TABLE "Transaction" ADD COLUMN "transactionNumber" TEXT;

-- Step 2: Update expense transactions
WITH numbered_expenses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY date) AS row_num
  FROM "Transaction"
  WHERE type = 'EXPENSE'
)
UPDATE "Transaction" t
SET "transactionNumber" = 'EXP-' || LPAD(ne.row_num::TEXT, 3, '0')
FROM numbered_expenses ne
WHERE t.id = ne.id;

-- Step 3: Update income transactions
WITH numbered_incomes AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY date) AS row_num
  FROM "Transaction"
  WHERE type = 'INCOME'
)
UPDATE "Transaction" t
SET "transactionNumber" = 'INC-' || LPAD(ni.row_num::TEXT, 3, '0')
FROM numbered_incomes ni
WHERE t.id = ni.id;

-- Step 4: Update any remaining transactions
WITH numbered_others AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY date) AS row_num
  FROM "Transaction"
  WHERE "transactionNumber" IS NULL
)
UPDATE "Transaction" t
SET "transactionNumber" = 'TXN-' || LPAD(no.row_num::TEXT, 3, '0')
FROM numbered_others no
WHERE t.id = no.id;

-- Step 5: Make the column non-nullable
ALTER TABLE "Transaction" ALTER COLUMN "transactionNumber" SET NOT NULL;

-- Step 6: Add the unique constraint
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transactionNumber_key" UNIQUE ("transactionNumber");
