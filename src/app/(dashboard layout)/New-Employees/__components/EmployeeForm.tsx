// components/EmployeeForm.tsx
"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createEmployee, updateEmployee } from "../__actions/employeeActions";
import { toast } from "sonner";

type Employee = {
  id: string;
  name: string;
  email: string;
};

interface EmployeeFormProps {
  employee?: Employee;
  closeModal?: () => void;
}

const EmployeeForm = ({ employee, closeModal }: EmployeeFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = async (formData: FormData) => {
    setLoading(true);
    try {
      if (employee) {
        // Update existing employee
        const result = await updateEmployee(employee.id, formData);
        if (result.success) {
          toast.success("Employee updated successfully");
          if (closeModal) closeModal();
        } else {
          toast.error(result.error || "Failed to update employee");
        }
      } else {
        // Create new employee
        const result = await createEmployee(formData);
        if (result.success) {
          toast.success("Employee created successfully");
          formRef.current?.reset();
        } else {
          toast.error(result.error || "Failed to create employee");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{employee ? "Edit Employee" : "Add New Employee"}</CardTitle>
      </CardHeader>
      <form ref={formRef} action={handleAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={employee?.name || ""}
              placeholder="Employee Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={employee?.email || ""}
              placeholder="employee@example.com"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {closeModal && (
            <Button variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : employee
                ? "Update Employee"
                : "Add Employee"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EmployeeForm;
