import ClientTable from "./__components/ClientTable";
export const dynamic = "force-dynamic";
export default function NewClients() {
  return (
    <div className=" max-w-7xl mx-auto py-8 px-4">
      <ClientTable />
    </div>
  );
}
