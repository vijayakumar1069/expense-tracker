// components/auth/LoginForm.tsx
"use client";

import { useCallback, useTransition } from "react";
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

type LoginFormValues = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();

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
      // Combine both loading states for UI feedback

      try {
        // Show loading toast
        toast.loading("Authenticating...", {
          id: "login",
          duration: Infinity, // Will be dismissed on success/error
        });

        // Wrap the server action in startTransition
        startTransition(async () => {
          const response = await loginFunction(data);

          if (!response.success) {
            throw new Error(response.message || "Authentication failed");
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
        // Type checking for better error handling
        if (error instanceof Error) {
          toast.error(error.message, {
            id: "login",
          });
        } else {
          toast.error("An unexpected error occurred", {
            id: "login",
          });
        }

        // Log error for debugging
        console.error("Login error:", error);
      } finally {
        // Reset form fields
        form.reset();
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
              {/* <div className="text-center text-sm text-muted-foreground">
                <a href="/forgot-password" className="hover:text-primary">
                  Forgot password?
                </a>
              </div> */}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};
