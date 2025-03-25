// InvoiceContentsItem.tsx
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
  // Calculate item total when quantity or price changes
  // const calculateItemTotal = () => {
  //   const quantity = form.getValues(`invoiceContents.${index}.quantity`) || 0;
  //   const price = form.getValues(`invoiceContents.${index}.price`) || 0;
  //   const total = quantity * price;

  //   form.setValue(`invoiceContents.${index}.total`, total, {
  //     shouldValidate: true,
  //   });
  // };

  // Handle quantity changes
  // const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.valueAsNumber || 0;
  //   form.setValue(`invoiceContents.${index}.quantity`, value, {
  //     shouldValidate: true,
  //   });

  //   // Calculate the total after setting the quantity
  //   setTimeout(calculateItemTotal, 0);
  // };

  // Handle price changes
  // const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.valueAsNumber || 0;
  //   form.setValue(`invoiceContents.${index}.price`, value, {
  //     shouldValidate: true,
  //   });

  //   // Calculate the total after setting the price
  //   setTimeout(calculateItemTotal, 0);
  // };

  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-5">
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

      {/* <div className="col-span-2">
        <FormField
          control={form.control}
          name={`invoiceContents.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Qty"
                  onChange={handleQuantityChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-2">
        <FormField
          control={form.control}
          name={`invoiceContents.${index}.price`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Price"
                  onChange={handlePriceChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div> */}

      <div className="col-span-2">
        <FormField
          control={form.control}
          name={`invoiceContents.${index}.total`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total</FormLabel>
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
      </div>

      <div className="col-span-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={remove}
          className="h-10 w-10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
