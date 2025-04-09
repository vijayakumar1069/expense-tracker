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
import {
  AvailableBanks,
  PAYMENT_METHODS,
  transferModeOption,
} from "@/utils/constants/consts";
import { FormSectionProps } from "@/utils/types";

export const PaymentSection: React.FC<FormSectionProps> = ({ form }) => {
  console.log(form.getValues());
  return (
    <div className="grid grid-cols-3 gap-1">
      {/* Payment Method */}
      <FormField
        control={form.control}
        name="paymentMethodType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Method</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl className="w-full">
                <SelectTrigger className="border-primary/20 w-full focus:border-primary/30">
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
            <FormItem className="col-span-2">
              <FormLabel>Received By</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="border-primary/20 w-full focus:border-primary/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      {form.watch("paymentMethodType") === "BANK" && (
        <>
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                {/* <FormControl>
                  <Input
                    {...field}
                    className="border-primary/20 w-full focus:border-primary/30"
                  />
                </FormControl> */}
                <Select
                  onValueChange={field.onChange}
                  value={
                    AvailableBanks.find((option) => option.name === field.value)
                      ?.name || ""
                  }
                >
                  <FormControl>
                    <SelectTrigger className="border-primary/20 focus:border-primary/30 w-full">
                      <SelectValue placeholder="Select transfer mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AvailableBanks.map((option) => (
                      <SelectItem key={option.id} value={option.name}>
                        {option.name}
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
            name="transferMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transfer Mode</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={
                    transferModeOption.find(
                      (option) => option.value === field.value
                    )?.label || ""
                  }
                >
                  <FormControl>
                    <SelectTrigger className="border-primary/20 focus:border-primary/30 w-full">
                      <SelectValue placeholder="Select transfer mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {transferModeOption.map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
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
                  <Input
                    {...field}
                    className="border-primary/20 w-full focus:border-primary/30"
                  />
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
                  <Input
                    type="date"
                    {...field}
                    className="border-primary/20 w-full focus:border-primary/30"
                  />
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
            <FormItem className="col-span-2">
              <FormLabel>Invoice Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="border-primary/20 w-full focus:border-primary/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};
