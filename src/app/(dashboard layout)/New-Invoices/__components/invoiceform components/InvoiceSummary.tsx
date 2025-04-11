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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TAX_TYPES } from "@/utils/constants/consts";

export function InvoiceSummary({
  form,
}: {
  form: UseFormReturn<InvoiceFormValues>; // Properly type the form
}) {
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "taxRate" || name === "subtotal") {
        // Only handle tax rate or subtotal changes here
        const subtotal = Number(form.getValues("subtotal") || 0);
        const taxRate = Number(form.getValues("taxRate") || 0);
        console.log(subtotal, taxRate);
        const taxAmount = subtotal * (taxRate / 100);
        form.setValue("taxAmount", taxAmount);
        const total = subtotal + taxAmount;
        form.setValue("invoiceTotal", total);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Card className="mt-6">
      <CardContent className="">
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
                      value={(Number(field.value) || 0).toFixed(2)}
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
                  <FormLabel>Tax Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const selectedTax = TAX_TYPES.find(
                        (tax) => tax.id === value
                      );
                      // Update the tax rate value in the form
                      field.onChange((selectedTax?.rate || 0) * 100);
                    }}
                    // Fix the value comparison to match the selected tax rate
                    value={
                      TAX_TYPES.find(
                        (tax) => Math.abs(tax.rate * 100 - field.value) < 0.01
                      )?.id || ""
                    }
                  >
                    <FormControl className="w-full">
                      <SelectTrigger className="border-primary/20 w-full focus:border-primary/30">
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TAX_TYPES.map((tax) => (
                        <SelectItem key={tax.id} value={tax.id}>
                          {tax.name} ({(tax.rate * 100).toFixed(0)}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      value={(Number(field.value) || 0).toFixed(2)}
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
                      value={(Number(field.value) || 0).toFixed(2)}
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
