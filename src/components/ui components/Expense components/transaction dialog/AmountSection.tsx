import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateTotal } from "@/utils/calculateTotal";
import { TAX_TYPES } from "@/utils/constants/consts";
import { FormSectionProps } from "@/utils/types";

export const AmountSection: React.FC<FormSectionProps> = ({ form }) => {
  const handleAmountOrTaxChange = (field: string, value: string) => {
    form.setValue(field, value);
    const currentAmount = field === "amount" ? value : form.getValues("amount");
    const currentTaxType =
      field === "taxType" ? value : form.getValues("taxType");
    const newTotal = calculateTotal(currentAmount, currentTaxType);
    form.setValue("total", newTotal);
  };

  return (
    <div className=" grid grid-cols-3 gap-2">
      {/* Amount */}
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) =>
                  handleAmountOrTaxChange("amount", e.target.value)
                }
                className="border-primary/20 w-full focus:border-primary/30"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Tax Type */}
      <FormField
        control={form.control}
        name="taxType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tax Type</FormLabel>
            <Select
              onValueChange={(value) =>
                handleAmountOrTaxChange("taxType", value)
              }
              value={field.value || ""}
            >
              <FormControl className="w-full">
                <SelectTrigger className="border-primary/20 w-full focus:border-primary/30">
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TAX_TYPES.map((tax) => (
                  <SelectItem key={tax.id} value={tax.id}>
                    {tax.id} ({(tax.rate * 100).toFixed(0)}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Total */}
      <FormField
        control={form.control}
        name="total"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total</FormLabel>
            <FormControl>
              <Input {...field} readOnly className="bg-muted" />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
