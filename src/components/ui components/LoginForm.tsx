// components/auth/LoginForm.tsx
"use client";

import { useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { LoginHeader } from "./LoginHeader";
import { EmailField } from "./EmailField";
import { PasswordField } from "./PasswordField";
import { LoginButton } from "./LoginButton";
import { loginFunction } from "@/app/(auth)/login/__actions/authActions";
import { LoginSchema } from "@/utils/schema/LoginSchema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

type LoginFormValues = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const router = useRouter();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormValues) => {
      // Clear previous errors
      setError(null);
      setFieldErrors({});

      try {
        // Show loading toast
        toast.loading("Authenticating...", {
          id: "login",
          duration: 3000, // Will be dismissed on success/error
        });

        // Wrap the server action in startTransition
        startTransition(async () => {
          const response = await loginFunction(data);

          if (!response.success) {
            // Handle field-specific validation errors
            if (response.errors) {
              setFieldErrors(response.errors);

              // Set the errors in the form
              Object.entries(response.errors).forEach(([field, messages]) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                form.setError(field as any, {
                  type: "manual",
                  message: messages[0],
                });
              });
            }

            // Display the general error message
            setError(response.message || "Authentication failed");

            toast.error(response.message || "Authentication failed", {
              id: "login",
              duration: 3000,
            });

            return;
          }

          // Dismiss loading toast and show success
          toast.success("Welcome back!", {
            id: "login",
            duration: 3000,
            position: "top-center",
          });

          // Redirect to dashboard
          router.push("/dashboard");
        });
      } catch (error) {
        // Handle unexpected errors
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";

        setError(errorMessage);

        toast.error(errorMessage, {
          id: "login",
          duration: 3000,
        });
      }
    },
    [router, form]
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-sidebar-accent">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <LoginHeader />
            </CardHeader>

            <CardContent className="space-y-6">
              <EmailField control={form.control} />
              <PasswordField control={form.control} />
            </CardContent>

            <CardFooter className="flex flex-col gap-4 mt-5">
              <LoginButton isLoading={isPending} />
            </CardFooter>

            {error && (
              <div className="px-6 mb-4 mt-3">
                <Alert
                  variant="destructive"
                  className="border-red-500 bg-red-50"
                >
                  <ShieldAlert className="h-4 w-4 text-red-600 mr-2" />
                  <AlertDescription className="text-red-700">
                    {error}
                    {fieldErrors && Object.keys(fieldErrors).length > 0 && (
                      <div className="list-disc pl-4">
                        {Object.entries(fieldErrors).map(([field, errors]) => (
                          <div key={field}>
                            {errors.map((error, index) => (
                              <span key={index}>{error}</span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </form>
        </Form>
        <div className="flex justify-center mt-4 flex-col gap-2 items-center">
          <div>User Name : v@gmail.com</div>
          <div>Password : 2</div>
        </div>
      </Card>
    </div>
  );
};
