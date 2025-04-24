import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Admin_Dashboard() {
  const { user, authenticated } = await requireAuth();
  if (!authenticated || !user) {
    redirect("/login");
  }
  return (
    <div className="min-h-[500px] flex items-center justify-center text-gray-500">
      <p>Select a tab to view dashboard data</p>
    </div>
  );
}
