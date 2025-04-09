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
import DateComponent from "./DateComponent";

export const TransactionForm: React.FC<{
  form: UseFormReturn<TransactionFormValues>;
  onSubmit: (data: TransactionFormValues) => void;
  isPending: boolean;
  mode: "add" | "edit";
  initialValues?: TransactionFormValues;
  viewMode: boolean;
  setViewMode?: (viewMode: boolean) => void;
  id?: string;
}> = ({
  form,
  onSubmit,
  isPending,
  mode,
  initialValues,
  viewMode = false,
  setViewMode = () => {},
  id,
}) => {
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
        className="space-y-2 overflow-y-auto"
      >
        <div className="flex flex-col space-y-3">
          <BasicInfoSection
            form={form}
            isPending={isPending}
            viewMode={viewMode}
          />
          <AmountSection
            form={form}
            isPending={isPending}
            viewMode={viewMode}
          />
          <PaymentSection
            form={form}
            isPending={isPending}
            viewMode={viewMode}
          />
          <DateComponent
            form={form}
            isPending={isPending}
            viewMode={viewMode}
          />
          <DateImageSection
            form={form}
            isPending={isPending}
            mode={mode}
            viewMode={viewMode}
          />
        </div>
        <div className="flex justify-end items-center w-full">
          <TransactionFormSubmitButton
            isPending={isPending}
            mode={mode}
            viewMode={viewMode}
            setViewMode={setViewMode}
            id={id}
          />
        </div>
      </form>
    </Form>
  );
};
