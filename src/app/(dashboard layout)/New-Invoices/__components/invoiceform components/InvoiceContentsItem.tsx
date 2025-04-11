"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { InvoiceFormValues } from "../InvoiceForm";

export function InvoiceContentsItem({
  form,
  index,
  remove,
}: {
  form: UseFormReturn<InvoiceFormValues>;
  index: number;
  remove: () => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-8">
        <FormField
          control={form.control}
          name={`invoiceContents.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-3">
        <FormField
          control={form.control}
          name={`invoiceContents.${index}.total`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={
                    typeof field.value === "undefined" ||
                    field.value === null ||
                    field.value === 0
                      ? ""
                      : field.value.toString()
                  }
                  onChange={(e) => {
                    const inputValue = e.target.value;

                    // If the user clears the input (backspace), allow empty string
                    if (inputValue === "") {
                      field.onChange(0);
                      return;
                    }

                    // Remove leading zeros
                    const cleanedValue = inputValue.replace(/^0+(?=\d)/, "");

                    // Update field value
                    field.onChange(Number(cleanedValue));
                  }}
                  placeholder="0.00"
                  onBlur={() => {
                    // On blur, if the field is empty, reset to 0
                    if (
                      field.value === 0 ||
                      typeof field.value === "undefined" ||
                      field.value === null
                    ) {
                      field.onChange(0);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-1 flex items-center justify-center mt-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={remove}
          className="h-10 w-10 bg-red-400 hover:bg-red-500"
        >
          <Trash2 className="h-4 w-4 text-red-900 hover:text-red-700" />
        </Button>
      </div>
    </div>
  );
}
