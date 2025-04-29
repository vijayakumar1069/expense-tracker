// components/FinancialYearDialog.tsx
"use client";

import { useFinancialYear } from "@/app/context/FinancialYearContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FinancialYearDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { setFinancialYear, availableYears } = useFinancialYear();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white p-4 rounded-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Select Financial Year
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {availableYears.map((year) => (
            <Button
              key={year}
              variant="outline"
              onClick={() => {
                setFinancialYear(year);
                onOpenChange(false);
              }}
              className="bg-white text-black "
            >
              {year}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
