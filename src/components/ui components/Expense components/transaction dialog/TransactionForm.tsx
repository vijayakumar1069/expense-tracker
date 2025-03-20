"use client";
import { Form } from "@/components/ui/form";
import { TransactionFormValues } from "@/utils/types";
import { BasicInfoSection } from "./BasicInfoSection";
import { AmountSection } from "./AmountSection";
import { PaymentSection } from "./PaymentSection";
import { DateImageSection } from "./DateImageSection";
// import { DialogFooter } from "@/components/ui/dialog";
import { TransactionFormSubmitButton } from "./TransActionFormSubmitButton";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { updateTransaction } from "@/app/(dashboard layout)/New-Transactions/__actions/transactionActions";
// import { UseFormReturn } from "react-hook-form";

export const TransactionForm: React.FC<{
  form: UseFormReturn<TransactionFormValues>;
  onSubmit: (data: TransactionFormValues) => void;
  isPending: boolean;
  mode: "add" | "edit";
  initialValues?: TransactionFormValues;
  id?: string;
  //   setOpen: (open: boolean) => void;
}> = ({ form, onSubmit, isPending, mode, initialValues, id }) => {
  useEffect(() => {
    if (initialValues) {
      // Only set values that are empty or different
      Object.entries(initialValues).forEach(([key, value]) => {
        if (
          value &&
          form.getValues(key as keyof TransactionFormValues) !== value
        ) {
          form.setValue(key as keyof TransactionFormValues, value);
        }
      });
    }
  }, [form, mode, initialValues]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
          <BasicInfoSection form={form} isPending={isPending} />
          <AmountSection form={form} isPending={isPending} />
          <PaymentSection form={form} isPending={isPending} />
          <DateImageSection form={form} isPending={isPending} mode={mode} />
        </div>
        <div className="flex justify-end items-end w-full">
          <TransactionFormSubmitButton isPending={isPending} mode={mode} />
          {/* // Add a button outside your form to test direct submission */}
          {/* <button
            type="button"
            onClick={() => {
              const data = form.getValues();
              const formData = new FormData();

              // Add regular form fields
              Object.entries(data).forEach(([key, value]) => {
                if (
                  value !== undefined &&
                  value !== null &&
                  key !== "images" &&
                  key !== "existingImages"
                ) {
                  formData.append(key, String(value));
                }
              });
              // Handle images separately and correctly
              if (data.images && Array.isArray(data.images)) {
                // Using append multiple times with same key creates an array on server
                data.images.forEach((file: File) => {
                  if (file instanceof File) {
                    formData.append("images", file);
                  }
                });
              } else {
                // IMPORTANT: If no images, send an empty array as JSON
                formData.append("images", JSON.stringify([]));
              }

              // Handle existing images
              if (data.existingImages && Array.isArray(data.existingImages)) {
                formData.append(
                  "existingImages",
                  JSON.stringify(data.existingImages)
                );
              }
            
              if (id) {
                updateTransaction(id, formData)
                  .then((response) => console.log("Server response:", response))
                  .catch((error) => console.error("Server error:", error));
              }
            }}
          >
            Debug Submit
          </button> */}
        </div>

        {/* <DialogFooter isPending={isPending} mode={mode} setOpen={setOpen} /> */}
      </form>
    </Form>
  );
};
