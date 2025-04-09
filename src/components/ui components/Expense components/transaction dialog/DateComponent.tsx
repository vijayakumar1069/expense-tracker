import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSectionProps } from "@/utils/types";
import React from "react";

const DateComponent: React.FC<FormSectionProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 gap-4 max-w-40">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Transaction Date</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                value={field.value ?? ""}
                className="border-gray-300"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DateComponent;
