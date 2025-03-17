// components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
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

// Validation Schema
const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      // Handle login logic here
      console.log(data);
      // toast({
      //   title: "Success",
      //   description: "Logged in successfully",
      // });
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to login",
      //   variant: "destructive",
      // });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

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
              <LoginButton isLoading={isLoading} />
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
