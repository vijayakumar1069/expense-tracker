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
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, TRANSACTION_TYPES } from "@/utils/constants/consts";
import { FormSectionProps } from "@/utils/types";

export const BasicInfoSection: React.FC<FormSectionProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="transactionType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Transaction Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="bg-primary/20 w-full">
                  <SelectValue placeholder="Select Transaction type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category */}
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem className="lg:col-span-2">
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || " "}>
              <FormControl className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="lg:col-span-2">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Name and Category fields... */}
    </>
  );
};
