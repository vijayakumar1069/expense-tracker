"use client";
import { Form } from "@/components/ui/form";
import { TransactionFormValues } from "@/utils/types";
import { BasicInfoSection } from "./BasicInfoSection";
import { AmountSection } from "./AmountSection";
import { PaymentSection } from "./PaymentSection";
import { DateImageSection } from "./DateImageSection";

import { TransactionFormSubmitButton } from "./TransActionFormSubmitButton";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

export const TransactionForm: React.FC<{
  form: UseFormReturn<TransactionFormValues>;
  onSubmit: (data: TransactionFormValues) => void;
  isPending: boolean;
  mode: "add" | "edit";
  initialValues?: TransactionFormValues;

  //   setOpen: (open: boolean) => void;
}> = ({ form, onSubmit, isPending, mode, initialValues }) => {
  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [form, initialValues]);
  useEffect(() => {
    const subscription = form.watch(() => {
      // Form watching without console logs
    });
    return () => subscription.unsubscribe();
  }, [form]);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 overflow-y-auto"
      >
        <div className="flex flex-col space-y-5">
          <BasicInfoSection form={form} isPending={isPending} />
          <AmountSection form={form} isPending={isPending} />
          <PaymentSection form={form} isPending={isPending} />
          <DateImageSection form={form} isPending={isPending} mode={mode} />
        </div>
        <div className="flex justify-end items-end w-full">
          <TransactionFormSubmitButton isPending={isPending} mode={mode} />
        </div>
      </form>
    </Form>
  );
};
