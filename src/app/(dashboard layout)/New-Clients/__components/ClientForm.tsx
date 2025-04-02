"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { ClientFormValues, clientSchema } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type ClientFormProps = {
  defaultValues?: ClientFormValues;
  onSubmit: (data: ClientFormValues) => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
};

const ClientForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  isEditMode = false,
}: ClientFormProps) => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      companyName: "",
      phone: "",
      streetName: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 p-4 grid grid-cols-2 gap-3"
      >
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Full Name</FormLabel>
              <FormControl>
                <Input
                  className="rounded-md border border-accent focus:border-secondary focus:ring-secondary"
                  placeholder="Enter full name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Email</FormLabel>
              <FormControl>
                <Input
                  className="rounded-md border border-accent focus:border-secondary focus:ring-secondary"
                  placeholder="Enter email address"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Name Field */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Company Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter company name"
                  className="rounded-md border border-accent focus:border-secondary focus:ring-secondary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Field */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Phone Number</FormLabel>
              <FormControl>
                <Input
                  className="rounded-md border border-accent focus:border-secondary focus:ring-secondary"
                  placeholder="Enter phone number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Street Address */}
        <FormField
          control={form.control}
          name="streetName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Street Name</FormLabel>
              <FormControl>
                <Input
                  className="rounded-md border border-accent focus:border-secondary focus:ring-secondary"
                  placeholder="Enter street address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City */}
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">City</FormLabel>
              <FormControl>
                <Input
                  className="rounded-md border border-accent focus:border-secondary focus:ring-secondary"
                  placeholder="Enter city"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* State */}
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">State</FormLabel>
              <FormControl>
                <Input
                  className="rounded-md border border-accent focus:border-secondary focus:ring-secondary"
                  placeholder="Enter state"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ZIP Code */}
        <FormField
          control={form.control}
          name="zip"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">ZIP Code</FormLabel>
              <FormControl>
                <Input
                  className="rounded-md border border-accent focus:border-secondary focus:ring-secondary"
                  placeholder="Enter ZIP code"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Country</FormLabel>
              <FormControl>
                <Input
                  className="rounded-md border border-accent focus:border-secondary focus:ring-secondary"
                  placeholder="Enter country"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Text Area */}
        {/* <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Full Address</FormLabel>
              <FormControl>
                <Textarea
                  className="rounded-md border border-accent focus:border-secondary focus:ring-secondary"
                  placeholder="Enter complete address (if necessary)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Submit Button */}
        <div className="w-full flex justify-end mt-5">
          <Button
            type="submit"
            disabled={isSubmitting}
            // onClick={form.handleSubmit(onSubmit)}
            className="w-fit flex justify-center items-end bg-primary text-white hover:bg-primary/90 focus:ring-primary"
          >
            {isSubmitting
              ? "Submitting..."
              : isEditMode
                ? "Update Client"
                : "Add Client"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;
