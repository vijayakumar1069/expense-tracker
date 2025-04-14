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
  form: UseFormReturn<InvoiceFormValues>;
}) {
  const [selectedTax1, setSelectedTax1] = useState<string>("");
  const [selectedTax2, setSelectedTax2] = useState<string>("");
  // Keep track of selected tax names to prevent duplicate selection
  const [selectedTaxName1, setSelectedTaxName1] = useState<string>("");
  const [selectedTaxName2, setSelectedTaxName2] = useState<string>("");
  // Initialize tax selections when component mounts or form values change
  useEffect(() => {
    // Add a flag to track if this is initial setup
    const isInitialSetup = !selectedTax1 && !selectedTax2;
    if (isInitialSetup) {
      const taxRate1 = form.getValues("taxRate1") || 0;
      const taxRate2 = form.getValues("taxRate2") || 0;

      // Find tax types that match these rates
      const matchingTax1 = TAX_TYPES.find((tax) => tax.rate === taxRate1);
      const matchingTax2 = TAX_TYPES.find(
        (tax) => tax.rate === taxRate2 && tax.id !== matchingTax1?.id
      );

      // If matches are found, set the selections
      if (matchingTax1) {
        setSelectedTax1(matchingTax1.id);
        setSelectedTaxName1(matchingTax1.name);
      }

      if (matchingTax2) {
        setSelectedTax2(matchingTax2.id);
        setSelectedTaxName2(matchingTax2.name);
      }
    }
  }, [form]);
  // Calculate tax amount and total whenever relevant values change
  useEffect(() => {
    const calculateTotals = () => {
      const subtotal = Number(form.getValues("subtotal") || 0);
      // Get tax rates from the selected tax types
      const tax1 = TAX_TYPES.find((t) => t.id === selectedTax1);
      const tax2 = TAX_TYPES.find((t) => t.id === selectedTax2);

      const tax1Rate = tax1?.rate || 0;
      const tax2Rate = tax2?.rate || 0;

      // Calculate tax amount (subtotal * combined tax rate)
      const taxAmount = subtotal * (tax1Rate + tax2Rate);

      // Calculate total (subtotal + tax amount)
      const total = subtotal + taxAmount;

      // Update form values
      form.setValue("taxAmount", taxAmount);
      form.setValue("invoiceTotal", total);
    };

    // Calculate initially
    calculateTotals();

    // Watch for changes to recalculate
    const subscription = form.watch((value, { name }) => {
      if (name === "taxRate1" || name === "taxRate2" || name === "subtotal") {
        calculateTotals();
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
                    key={selectedTax1 || "tax1-default"}
                    value={selectedTax1}
                    onValueChange={(value) => {
                      setSelectedTax1(value);

                      // Find the selected tax type
                      const selectedTax = TAX_TYPES.find((t) => t.id === value);
                      if (selectedTax) {
                        // Store the name for comparison
                        setSelectedTaxName1(selectedTax.name);
                        // Store the rate in the form
                        form.setValue("taxRate1", selectedTax.rate);
                      } else {
                        setSelectedTaxName1("");
                        form.setValue("taxRate1", 0);
                      }
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
                          // Disable if this tax name is already selected in Tax 2
                          disabled={tax.name === selectedTaxName2}
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
                    key={selectedTax2 || "tax2-default"}
                    value={selectedTax2}
                    onValueChange={(value) => {
                      setSelectedTax2(value);

                      // Find the selected tax type
                      const selectedTax = TAX_TYPES.find((t) => t.id === value);
                      if (selectedTax) {
                        // Store the name for comparison
                        setSelectedTaxName2(selectedTax.name);
                        // Store the rate in the form
                        form.setValue("taxRate2", selectedTax.rate);
                      } else {
                        setSelectedTaxName2("");
                        form.setValue("taxRate2", 0);
                      }
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
                          // Disable if this tax name is already selected in Tax 1
                          disabled={tax.name === selectedTaxName1}
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
