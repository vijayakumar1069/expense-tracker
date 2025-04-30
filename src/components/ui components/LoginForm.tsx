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
import { useFinancialYear } from "@/app/context/FinancialYearContext";
import { getCurrentFinancialYear } from "@/utils/financialYearsHelperFunctions";

type LoginFormValues = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const { setFinancialYear } = useFinancialYear();
  const year = getCurrentFinancialYear();
  console.log(year);

  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    // mode: "onChange", // ✅ instant validation
  });

  const onSubmit = useCallback(
    async (data: LoginFormValues) => {
      setError(null);
      setFieldErrors({});

      toast.loading("Authenticating...", {
        id: "login",
        duration: 3000,
      });

      startTransition(async () => {
        try {
          const response = await loginFunction(data);

          if (!response.success) {
            if (response.errors) {
              setFieldErrors(response.errors);

              for (const [field, messages] of Object.entries(response.errors)) {
                form.setError(field as keyof LoginFormValues, {
                  type: "manual",
                  message: messages[0],
                });
              }
            }

            const errorMessage = response.message || "Authentication failed";
            setError(errorMessage);

            toast.error(errorMessage, {
              id: "login",
              duration: 3000,
            });
            return;
          }

          setFinancialYear(year);

          toast.success("Welcome back!", {
            id: "login",
            duration: 3000,
            position: "top-center",
          });

          router.push("/dashboard");
          router.refresh();
        } catch (error) {
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
      });
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
                  <AlertDescription className="text-red-700 space-y-1">
                    <div>{error}</div>
                    {Object.keys(fieldErrors).length > 0 && (
                      <ul className="list-disc pl-4">
                        {Object.entries(fieldErrors).map(([field, errors]) => (
                          <li key={field}>
                            {errors.map((error, index) => (
                              <span key={index}>{error}</span>
                            ))}
                          </li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </form>
        </Form>

        {/* <div className="flex justify-center mt-4 flex-col gap-2 items-center text-sm text-muted-foreground">
          <div>
            Username: <code>v@gmail.com</code>
          </div>
          <div>
            Password: <code>2</code>
          </div>
        </div> */}
      </Card>
    </div>
  );
};
