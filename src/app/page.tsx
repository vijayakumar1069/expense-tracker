import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Welcome to Expense Tracker</h1>
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    </div>
  );
}
