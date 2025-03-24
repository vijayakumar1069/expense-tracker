"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ClientDetails({ form }: { form: any }) {
  return (
    <div className="grid gap-4 mt-4">
      <FormField
        control={form.control}
        name="clientEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client Email</FormLabel>
            <FormControl>
              <Input {...field} readOnly className="bg-muted" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clientPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client Phone</FormLabel>
            <FormControl>
              <Input {...field} readOnly className="bg-muted" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="clientAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client Address</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                readOnly
                className="bg-muted resize-none h-20"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
