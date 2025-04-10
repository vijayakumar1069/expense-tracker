// app/employees/page.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getEmployees } from "./__actions/employeeActions";
import EmployeeForm from "./__components/EmployeeForm";
import EmployeesTable from "./__components/EmployeesTable";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

// Change to default export and remove "use client" directive
export default async function Page() {
  const response = await getEmployees();
  const employees = response.success ? response.data : [];

  return (
    <div className="container mx-auto py-10">
      <Toaster position="top-right" />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-muted-foreground">
          Add, edit, delete and manage your employee records.
        </p>
      </div>

      {/* <Separator className="my-6" /> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Employee</CardTitle>
              <CardDescription>
                Create a new employee record by filling out the form below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeForm />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Employee Records</CardTitle>
              <CardDescription>
                View, edit or delete your employee records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeesTable employees={employees || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
