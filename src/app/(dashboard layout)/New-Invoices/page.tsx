import InvoiceTable from "./__components/InvoiceTable";
export const dynamic = "force-dynamic";
export default function New_invoices_Page() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <InvoiceTable />
    </div>
  );
}
