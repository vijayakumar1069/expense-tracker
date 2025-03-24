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
export function InvoiceSummary({ form }: { form: any }) {
  // Recalculate tax and total whenever subtotal or tax rate changes
  useEffect(() => {
    const subtotal = form.watch("subtotal") || 0;
    const taxRate = form.watch("taxRate") || 0;

    const taxAmount = subtotal * (taxRate / 100);
    form.setValue("taxAmount", taxAmount);

    const total = subtotal + taxAmount;
    form.setValue("invoiceTotal", total);
  }, [form.watch("subtotal"), form.watch("taxRate"), form]);

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
