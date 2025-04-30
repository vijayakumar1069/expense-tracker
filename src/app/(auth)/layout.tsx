import { FinancialYearProvider } from "../context/FinancialYearContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <FinancialYearProvider>
      <div>{children}</div>
    </FinancialYearProvider>
  );
}
