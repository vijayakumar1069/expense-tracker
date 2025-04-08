"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ClientFilters = ({
  onFilterChange,
}: {
  onFilterChange: (filters: {
    name?: string;
    email?: string;
    companyName?: string;
  }) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [companyNameFilter, setCompanyNameFilter] = useState<string>("");

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      name: nameFilter || undefined,
      email: emailFilter || undefined,
      companyName: companyNameFilter || undefined,
    });
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setNameFilter("");
    setEmailFilter("");
    setCompanyNameFilter("");
    onFilterChange({});
  };

  const filtersActive = nameFilter || emailFilter || companyNameFilter;

  return (
    <div className="flex items-center gap-4 w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 group">
            <SlidersHorizontal className="h-4 w-4  text-white group-hover:text-primary" />
            <span className="text-white group-hover:text-primary">Search</span>
            {filtersActive && (
              <span className="ml-1 rounded-full bg-white group-hover:bg-primary w-2 h-2" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="end">
          <div className="p-4 grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameFilter">Name</Label>
              <Input
                id="nameFilter"
                placeholder="Search by name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailFilter">Email</Label>
              <Input
                id="emailFilter"
                placeholder="Search by email"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyNameFilter">Company Name</Label>
              <Input
                id="companyNameFilter"
                placeholder="Search by company"
                value={companyNameFilter}
                onChange={(e) => setCompanyNameFilter(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  handleClearFilters();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
              <Button onClick={handleFilterSubmit} className="ml-auto">
                Apply
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 border-t">
            {filtersActive && (
              <div className="hidden md:flex flex-wrap items-center gap-2">
                <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                  Active Filters:
                </div>
                {nameFilter && (
                  <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                    Name: {nameFilter}
                  </div>
                )}
                {emailFilter && (
                  <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                    Email: {emailFilter}
                  </div>
                )}
                {companyNameFilter && (
                  <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                    Company: {companyNameFilter}
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ClientFilters;
