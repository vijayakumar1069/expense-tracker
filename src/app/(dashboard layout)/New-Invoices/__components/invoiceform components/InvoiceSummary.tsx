// InvoiceSummary.tsx
"use client";

import { useEffect, useState } from "react";
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
  const [selectedTax1, setSelectedTax1] = useState<string>("");
  const [selectedTax2, setSelectedTax2] = useState<string>("");

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("taxRate") || name === "subtotal") {
        const subtotal = Number(form.getValues("subtotal") || 0);
        const tax1 = TAX_TYPES.find((t) => t.id === selectedTax1)?.rate || 0;
        const tax2 = TAX_TYPES.find((t) => t.id === selectedTax2)?.rate || 0;

        const taxAmount = subtotal * (tax1 + tax2);
        form.setValue("taxAmount", taxAmount);
        form.setValue("invoiceTotal", subtotal + taxAmount);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, selectedTax1, selectedTax2]);

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
              name="taxRate1"
              render={({}) => (
                <FormItem className="">
                  <FormLabel>Tax 1</FormLabel>
                  <Select
                    value={selectedTax1}
                    onValueChange={(value) => {
                      setSelectedTax1(value);
                      const rate =
                        TAX_TYPES.find((t) => t.id === value)?.rate || 0;
                      form.setValue("taxRate1", rate);
                    }}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TAX_TYPES.map((tax) => (
                        <SelectItem
                          key={tax.id}
                          value={tax.id}
                          disabled={tax.id === selectedTax2}
                        >
                          {tax.name} ({(tax.rate * 100).toFixed(0)}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxRate2"
              render={({}) => (
                <FormItem>
                  <FormLabel>Tax 2</FormLabel>
                  <Select
                    value={selectedTax2}
                    onValueChange={(value) => {
                      setSelectedTax2(value);
                      const rate =
                        TAX_TYPES.find((t) => t.id === value)?.rate || 0;
                      form.setValue("taxRate2", rate);
                    }}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TAX_TYPES.map((tax) => (
                        <SelectItem
                          key={tax.id}
                          value={tax.id}
                          disabled={tax.id === selectedTax1}
                        >
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
