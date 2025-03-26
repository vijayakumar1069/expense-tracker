"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ClientDetails({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {/* Client Email */}
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

      {/* Client Phone */}
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

      {/* Street Name */}
      <FormField
        control={form.control}
        name="clientStreetName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Name</FormLabel>
            <FormControl>
              <Input {...field} readOnly className="bg-muted" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* City */}
      <FormField
        control={form.control}
        name="clientCity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <Input {...field} readOnly className="bg-muted" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ZIP Code */}
      <FormField
        control={form.control}
        name="clientZip"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ZIP Code</FormLabel>
            <FormControl>
              <Input {...field} readOnly className="bg-muted" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* State */}
      <FormField
        control={form.control}
        name="clientState"
        render={({ field }) => (
          <FormItem>
            <FormLabel>State</FormLabel>
            <FormControl>
              <Input {...field} readOnly className="bg-muted" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Country */}
      <FormField
        control={form.control}
        name="clientCountry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input {...field} readOnly className="bg-muted" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
