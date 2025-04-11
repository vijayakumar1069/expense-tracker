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

  const taxRate1 = useWatch({
    control: form.control,
    name: "taxRate1",
  });

  const taxRate2 = useWatch({
    control: form.control,
    name: "taxRate2",
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({
        description: "",
        total: 0,
      });
    }
  }, [fields.length, append]);

  useEffect(() => {
    // Calculate subtotal, ensuring each item's total is a number
    const subtotal = invoiceContents.reduce(
      (sum, item) => sum + Number(item?.total || 0),
      0
    );

    // Update subtotal in form WITHOUT triggering validation (to avoid loops)
    form.setValue("subtotal", subtotal);
    const taxRate = taxRate1 + (taxRate2 || 0);

    // Calculate tax, ensuring subtotal is a number
    const taxAmount = subtotal * ((Number(taxRate) || 0) / 100);
    form.setValue("taxAmount", taxAmount);

    // Calculate total, ensuring taxAmount is a number
    const total = subtotal + taxAmount;
    form.setValue("invoiceTotal", total);
  }, [form, invoiceContents, taxRate1, taxRate2]);

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
            append({
              description: "",
              total: 0,
            })
          }
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  );
}
