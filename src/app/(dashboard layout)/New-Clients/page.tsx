import ClientTable from "./__components/ClientTable";

export default function NewClients() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-primary">
          Client Management
        </h1>
        <p className="text-muted-foreground">
          Add, edit, and manage your client information
        </p>
      </header>

      <ClientTable />
    </div>
  );
}
