"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,

} from "@/components/ui/card";
import { ClientSearch } from "./invoiceform components/ClientSearch";
import { ClientDetails } from "./invoiceform components/ClientDetails";
import { InvoiceDetails } from "./invoiceform components/InvoiceDetails";
import { InvoiceContentsList } from "./invoiceform components/InvoiceContentsList";
// import { InvoiceContentsItem } from "./invoiceform components/InvoiceContentsItem";
import { InvoiceSummary } from "./invoiceform components/InvoiceSummary";
import { useEffect } from "react";

// Define the form schema
const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  price: z.number().min(0, "Price cannot be negative"),
  total: z.number(),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email address"),
  clientPhone: z.string().min(1, "Phone is required"),
  clientAddress: z.string().min(1, "Address is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  status: z
    .enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"])
    .default("DRAFT"),
  invoiceContents: z
    .array(invoiceItemSchema)
    .min(1, "At least one item is required"),
  subtotal: z.number().min(0),
  taxRate: z.number().min(0).max(100),
  taxAmount: z.number().min(0),
  invoiceTotal: z.number().min(0),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function InvoiceForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: {
  defaultValues?: Partial<InvoiceFormValues>;
  onSubmit: (data: InvoiceFormValues) => void;
  isSubmitting?: boolean;
}) {
  // Initialize form with default values
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      invoiceNumber: "",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
      status: "DRAFT",
      invoiceContents: [{ description: "", quantity: 0, price: 0, total: 0 }],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      invoiceTotal: 0,
      ...defaultValues,
    },
  });
  // Add this code inside your InvoiceForm component, just after your form initialization
  useEffect(() => {
    // Trigger initial calculation
    const contents = form.getValues("invoiceContents");

    // Calculate subtotal
    const subtotal = contents.reduce(
      (sum, item) => sum + (item.quantity * item.price || 0),
      0
    );

    // Update subtotal in form
    form.setValue("subtotal", subtotal, { shouldValidate: true });

    // Calculate tax
    const taxRate = form.getValues("taxRate") || 0;
    const taxAmount = subtotal * (taxRate / 100);
    form.setValue("taxAmount", taxAmount, { shouldValidate: true });

    // Calculate total
    const total = subtotal + taxAmount;
    form.setValue("invoiceTotal", total, { shouldValidate: true });
  }, [form]);

  const handleSubmit = (data: InvoiceFormValues) => {
    onSubmit(data);
  };

  return (
    // This outer div constrains the height to the viewport
    <div className="h-[calc(80vh-2rem)] max-h-[900px] flex flex-col">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex-1 flex flex-col h-full"
        >
          {/* This card will take the full height of the parent */}
          <Card className="max-w-7xl mx-auto h-full flex flex-col">
            {/* Fixed height header */}
            {/* <CardHeader className="px-4 md:px-6 flex-shrink-0">
              <CardTitle className="text-xl md:text-2xl">
                Create Invoice
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Generate a new invoice for your client
              </CardDescription>
            </CardHeader> */}

            {/* Scrollable content area */}
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="p-4 md:p-6 space-y-6">
                {/* Client and invoice details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <ClientSearch form={form} />
                    <ClientDetails form={form} />
                  </div>
                  <div className="space-y-4">
                    <InvoiceDetails form={form} />
                  </div>
                </div>

                {/* Invoice items */}
                <div className="w-full">
                  <InvoiceContentsList form={form} />
                </div>
                <div className="w-full">
                  <InvoiceSummary form={form} />
                </div>
              </div>
            </CardContent>

            {/* Fixed height footer */}
            <div className="px-4 md:px-6 py-4 border-t mt-auto flex-shrink-0">
              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="w-full md:w-auto min-w-[200px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : defaultValues?.clientId
                    ? "Update Invoice"
                    : "Create Invoice"}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
