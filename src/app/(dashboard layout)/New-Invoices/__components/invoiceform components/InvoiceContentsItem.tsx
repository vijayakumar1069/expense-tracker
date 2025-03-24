// InvoiceContentsItem.tsx
"use client";
import { useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvoiceContentsItem({ form, index, remove }) {
  const watchQuantity = form.watch(`invoiceContents.${index}.quantity`);
  const watchPrice = form.watch(`invoiceContents.${index}.price`);

  useEffect(() => {
    // Calculate line item total whenever quantity or price changes
    if (watchQuantity && watchPrice) {
      const total = parseFloat(watchQuantity) * parseFloat(watchPrice);
      form.setValue(`invoiceContents.${index}.total`, total);
    }
  }, [watchQuantity, watchPrice, form, index]);

  return (
    <div className="grid grid-cols-12 gap-2 items-end mb-2">
      <div className="col-span-4">
        <FormField
          control={form.control}
          name={`invoiceContents.${index}.description`}
          render={({ field }) => (
            <FormItem>
              {index === 0 && (
                <div className="text-xs mb-2 font-medium">Description</div>
              )}
              <FormControl>
                <Input {...field} placeholder="Item description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-2">
        <FormField
          control={form.control}
          name={`invoiceContents.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              {index === 0 && (
                <div className="text-xs mb-2 font-medium">Qty</div>
              )}
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
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

      <div className="col-span-2">
        <FormField
          control={form.control}
          name={`invoiceContents.${index}.price`}
          render={({ field }) => (
            <FormItem>
              {index === 0 && (
                <div className="text-xs mb-2 font-medium">Price</div>
              )}
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="1"
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

      <div className="col-span-3">
        <FormField
          control={form.control}
          name={`invoiceContents.${index}.total`}
          render={({ field }) => (
            <FormItem>
              {index === 0 && (
                <div className="text-xs mb-2 font-medium">Total</div>
              )}
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
        {index === 0 && <div className="text-xs mb-2 font-medium">&nbsp;</div>}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => remove(index)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove item</span>
        </Button>
      </div>
    </div>
  );
}
