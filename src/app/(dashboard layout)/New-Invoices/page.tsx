import InvoiceTable from "./__components/InvoiceTable";

export default function New_invoices_Page() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-savings">
          Invoice Management
        </h1>
        <p className="text-muted-foreground">
          Add, edit, and manage your invoices
        </p>
      </header>

      <InvoiceTable />
    </div>
  );
}
