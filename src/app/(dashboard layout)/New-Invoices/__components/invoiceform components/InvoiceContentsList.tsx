// InvoiceContentsList.tsx with fixed calculation
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useFieldArray, UseFormReturn } from "react-hook-form"; // Added UseFormReturn type
import { InvoiceContentsItem } from "./InvoiceContentsItem";
import { PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceFormValues } from "../InvoiceForm"; // Import your form type

export function InvoiceContentsList({
  form,
}: {
  form: UseFormReturn<InvoiceFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "invoiceContents",
  });

  // Add empty line item if none exist
  useEffect(() => {
    if (fields.length === 0) {
      append({ description: "", quantity: 0, price: 0, total: 0 });
    }
  }, [fields.length, append]);

  // Calculate subtotal whenever line items change
  useEffect(() => {
    // Subscribe to changes in the invoiceContents array
    const subscription = form.watch((value, { name }) => {
      // Only run calculations when invoiceContents or taxRate changes
      if (
        name?.startsWith("invoiceContents") ||
        name === "taxRate" ||
        name === undefined // Initial load
      ) {
        calculateTotals();
      }
    });

    // Initial calculation
    calculateTotals();

    // Cleanup subscription
    return () => subscription.unsubscribe();

    // Define calculation function inside useEffect to avoid dependencies issues
    function calculateTotals() {
      const contents = form.getValues("invoiceContents");

      // Calculate subtotal
      const subtotal = contents.reduce(
        (sum, item) => sum + (item.quantity * item.price || 0),
        0
      );

      // Update subtotal in form
      form.setValue("subtotal", subtotal, { shouldValidate: true });

      // Calculate tax
      const taxRate = form.getValues("taxRate") || 0;
      const taxAmount = subtotal * (taxRate / 100);
      form.setValue("taxAmount", taxAmount, { shouldValidate: true });

      // Calculate total
      const total = subtotal + taxAmount;
      form.setValue("invoiceTotal", total, { shouldValidate: true });
    }
  }, [form]);

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Invoice Items</h3>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <InvoiceContentsItem
              key={field.id}
              form={form}
              index={index}
              remove={() => fields.length > 1 && remove(index)}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() =>
            append({ description: "", quantity: 0, price: 0, total: 0 })
          }
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  );
}
