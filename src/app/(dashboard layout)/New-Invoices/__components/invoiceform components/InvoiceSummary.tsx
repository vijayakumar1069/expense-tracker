// InvoiceSummary.tsx
"use client";

import { useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { InvoiceFormValues } from "../InvoiceForm";

export function InvoiceSummary({
  form,
}: {
  form: UseFormReturn<InvoiceFormValues>; // Properly type the form
}) {
  // We don't need the tax recalculation here since InvoiceContentsList is handling it
  // But we'll add a subscription to watch for taxRate changes just to be safe
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "taxRate") {
        // Only handle tax rate changes here
        const subtotal = form.getValues("subtotal") || 0;
        const taxRate = form.getValues("taxRate") || 0;

        const taxAmount = subtotal * (taxRate / 100);
        form.setValue("taxAmount", taxAmount, { shouldValidate: true });

        const total = subtotal + taxAmount;
        form.setValue("invoiceTotal", total, { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Invoice Summary</h3>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="subtotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtotal</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      className="bg-muted"
                      value={field.value?.toFixed(2) || "0.00"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber || 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taxAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      className="bg-muted"
                      value={field.value?.toFixed(2) || "0.00"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      className="bg-muted font-medium text-lg"
                      value={field.value?.toFixed(2) || "0.00"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
