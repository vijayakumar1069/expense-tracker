"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { verifyPassword } from "@/app/(auth)/login/__actions/verificationActions";

// Password validation schema
const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface PasswordVerificationProps {
  onVerificationSuccess: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  verifyPasswordFn?: (password: string) => Promise<boolean>;
}

export function PasswordVerification({
  onVerificationSuccess,
  onCancel,
  title = "Authentication Required",
  description = "Please enter your password to continue",
}: PasswordVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Password form handling
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  // Default password verification function (replace with API call in production)

  const handleSubmit = async (data: PasswordFormValues) => {
    setIsVerifying(true);
    setPasswordError("");

    try {
      const formData = new FormData();
      formData.append("password", data.password);
      const isVerified = await verifyPassword(formData);

      if (isVerified.success) {
        passwordForm.reset();
        onVerificationSuccess();
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    } catch (error) {
      setPasswordError("Failed to verify password. Please try again.");
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };
  return (
    <div className="space-y-4 py-4">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-primary" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-center">{title}</h3>
      <p className="text-center text-muted-foreground mb-4">{description}</p>

      <form
        onSubmit={passwordForm.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...passwordForm.register("password")}
            className={passwordError ? "border-destructive" : ""}
            autoFocus
          />
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}
        </div>

        <div className="flex space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isVerifying}
            >
              Cancel
            </Button>
          )}

          <Button type="submit" className="flex-1" disabled={isVerifying}>
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
