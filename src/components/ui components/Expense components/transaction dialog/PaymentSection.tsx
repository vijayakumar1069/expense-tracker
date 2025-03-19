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
import { PAYMENT_METHODS } from "@/utils/constants/consts";
import { FormSectionProps } from "@/utils/types";

export const PaymentSection: React.FC<FormSectionProps> = ({ form }) => {
  return (
    <>
      {" "}
      {/* Payment Method */}
      <FormField
        control={form.control}
        name="paymentMethodType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Method</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Conditional Fields */}
      {form.watch("paymentMethodType") === "CASH" && (
        <FormField
          control={form.control}
          name="receivedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Received By</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      {form.watch("paymentMethodType") === "BANK" && (
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      {form.watch("paymentMethodType") === "CHEQUE" && (
        <>
          <FormField
            control={form.control}
            name="chequeNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cheque Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chequeDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cheque Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      {form.watch("paymentMethodType") === "INVOICE" && (
        <FormField
          control={form.control}
          name="invoiceNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
