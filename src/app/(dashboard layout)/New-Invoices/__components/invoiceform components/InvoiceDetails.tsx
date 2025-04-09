"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { CalendarIcon } from "lucide-react";
// import { format, parseISO } from "date-fns";
// import { cn } from "@/lib/utils";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { generateInvoiceNumber } from "../../__actions/invoiceActions";
import { UseFormReturn } from "react-hook-form";
import { InvoiceFormValues } from "../InvoiceForm";

export function InvoiceDetails({
  form,
  defaultValues,
}: {
  form: UseFormReturn<InvoiceFormValues>;
  defaultValues?: Partial<InvoiceFormValues>;
}) {
  useEffect(() => {
    if (!defaultValues) {
      const getInvoice = async () => {
        const res = await generateInvoiceNumber();
        if (res.success && typeof res.data === "string") {
          form.setValue("invoiceNumber", res.data);
        }
      };
      getInvoice();
      // Set initial status
      form.setValue("status", "DRAFT");
      return;
    }

    // For existing invoices, set all fields including status
    form.reset({
      ...defaultValues,
      status: defaultValues.status || "DRAFT",
    });
  }, [form, defaultValues]);

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-6">
      <FormField
        control={form.control}
        name="invoiceNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Invoice Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="INV-0001" readOnly />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select
              onValueChange={(
                value:
                  | "DRAFT"
                  | "Raised"
                  | "SENT"
                  | "PAID"
                  | "OVERDUE"
                  | "CANCELLED"
              ) => {
                field.onChange(value);
                form.setValue("status", value, { shouldValidate: true });
              }}
              value={field.value || "DRAFT"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="Raised">Raised</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
