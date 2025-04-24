import Navbar from "@/components/ui components/admin components/Navbar";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard_Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {  authenticated } = await requireAuth();
  if (!authenticated) {
    redirect("/login");
  }
  return (
    <div className="bg-primary-foreground min-h-full">
      <Navbar />
      {children}
    </div>
  );
}
