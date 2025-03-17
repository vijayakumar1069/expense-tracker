// components/form-fields/EmailField.tsx
import { Control } from "react-hook-form";
import { Mail } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface EmailFieldProps {
  control: Control<any>;
}

export const EmailField = ({ control }: EmailFieldProps) => {
  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...field}
                placeholder="name@example.com"
                type="email"
                className="pl-10"
                autoComplete="email"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
