// context/FinancialYearContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";

type FinancialYearContextType = {
  financialYear: string;
  setFinancialYear: (year: string) => void;
  availableYears: string[];
};

const FinancialYearContext = createContext<FinancialYearContextType | null>(
  null
);

export function FinancialYearProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [financialYear, setFinancialYear] = useState<string>("");

  // Generate years relative to current financial year
  const availableYears = generateFinancialYears();

  useEffect(() => {
    const savedYear = localStorage.getItem("selectedFinancialYear");
    if (savedYear && validateFYFormat(savedYear)) {
      setFinancialYear(savedYear);
    } else {
      const currentFY = getCurrentFinancialYear();
      setFinancialYear(currentFY);
      localStorage.setItem("selectedFinancialYear", currentFY);
    }
  }, []);

  const handleSetYear = (year: string) => {
    if (!validateFYFormat(year)) return;
    localStorage.setItem("selectedFinancialYear", year);
    setFinancialYear(year);
  };

  return (
    <FinancialYearContext.Provider
      value={{ financialYear, setFinancialYear: handleSetYear, availableYears }}
    >
      {children}
    </FinancialYearContext.Provider>
  );
}

// Helper functions
function validateFYFormat(year: string): boolean {
  return /^\d{4}-\d{4}$/.test(year);
}

function getCurrentFinancialYear(): string {
  const today = new Date();
  const year = today.getFullYear();
  return today.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

function generateFinancialYears(): string[] {
  const currentFY = getCurrentFinancialYear();
  const [startYearStr] = currentFY.split("-");
  const currentStartYear = parseInt(startYearStr);

  const years: string[] = [];

  // Generate last 7 years
  for (let i = 7; i > 0; i--) {
    const year = currentStartYear - i;
    years.push(`${year}-${year + 1}`);
  }

  // Include current year
  years.push(currentFY);

  // Generate next 2 years
  for (let i = 1; i <= 2; i++) {
    const year = currentStartYear + i;
    years.push(`${year}-${year + 1}`);
  }

  return years;
}

export const useFinancialYear = () => {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error(
      "useFinancialYear must be used within a FinancialYearProvider"
    );
  }
  return context;
};
