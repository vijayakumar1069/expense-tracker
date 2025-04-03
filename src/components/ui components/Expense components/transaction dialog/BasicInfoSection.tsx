import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CATEGORIES, TRANSACTION_TYPES } from "@/utils/constants/consts";
import { FormSectionProps } from "@/utils/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export const BasicInfoSection: React.FC<FormSectionProps> = ({ form }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid grid-cols-2  gap-4">
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
            <FormLabel>Particulars</FormLabel>
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

      {/* Category */}
      <FormField
        control={form.control}
        name={"category"}
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Category</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild className="w-full">
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-white"
                  >
                    {field.value
                      ? CATEGORIES.find(
                          (category) => category.name === field.value
                        )?.name
                      : "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0">
                <Command>
                  <CommandInput
                    placeholder="Search category..."
                    className="h-9"
                  />
                  <CommandList className="w-full h-full">
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {CATEGORIES.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={(value) => {
                            form.setValue("category", value, {
                              shouldValidate: false,
                            });
                            setOpen(false);
                          }}
                          className="text-sm w-fit "
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === category.name
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {category.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Remarks</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={3}
                className="border-primary/20 w-full focus:border-primary/30"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
