import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { Control } from "react-hook-form";

interface PasswordFieldProps {
  control: Control<any>;
}

export const PasswordField = ({ control }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...field}
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
