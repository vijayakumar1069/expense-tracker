import Navbar from "@/components/ui components/admin components/Navbar";

export default function AdminDashboard_Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-primary-foreground min-h-full">
      <Navbar />
      {children}
    </div>
  );
}
