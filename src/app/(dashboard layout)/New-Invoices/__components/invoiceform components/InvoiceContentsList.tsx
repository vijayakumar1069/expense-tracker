"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useFieldArray, UseFormReturn, useWatch } from "react-hook-form"; // Added useWatch
import { InvoiceContentsItem } from "./InvoiceContentsItem";
import { PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceFormValues } from "../InvoiceForm";

export function InvoiceContentsList({
  form,
}: {
  form: UseFormReturn<InvoiceFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "invoiceContents",
  });

  // Watch the invoice contents and tax rate
  const invoiceContents = useWatch({
    control: form.control,
    name: "invoiceContents",
  });

  const taxRate = useWatch({
    control: form.control,
    name: "taxRate",
  });

  // Add empty line item if none exist
  useEffect(() => {
    if (fields.length === 0) {
      append({ description: "", quantity: 0, price: 0, total: 0 });
    }
  }, [fields.length, append]);

  // Calculate totals when invoice contents or tax rate changes
  useEffect(() => {
    // Calculate subtotal
    const subtotal = invoiceContents.reduce(
      (sum, item) => sum + (item?.quantity || 0) * (item?.price || 0),
      0
    );

    // Update subtotal in form WITHOUT triggering validation (to avoid loops)
    form.setValue("subtotal", subtotal, { shouldValidate: false });

    // Calculate tax
    const taxAmount = subtotal * ((taxRate || 0) / 100);
    form.setValue("taxAmount", taxAmount, { shouldValidate: false });

    // Calculate total
    const total = subtotal + taxAmount;
    form.setValue("invoiceTotal", total, { shouldValidate: false });
  }, [form, invoiceContents, taxRate]);

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
