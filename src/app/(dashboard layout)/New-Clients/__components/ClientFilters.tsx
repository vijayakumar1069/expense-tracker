"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Filter, Search, X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

// ClientFilters component for filtering/searching clients
const ClientFilters = ({
  onFilterChange,
}: {
  onFilterChange: (filters: { name?: string; email?: string }) => void;
}) => {
  const [nameFilter, setNameFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      name: nameFilter || undefined,
      email: emailFilter || undefined,
    });
  };

  const handleClearFilters = () => {
    setNameFilter("");
    setEmailFilter("");
    onFilterChange({});
  };

  const filtersActive = nameFilter || emailFilter;

  return (
    <Card className="mb-6 border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="pb-0 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md">
              <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium">
                Client Filters
              </CardTitle>
              <CardDescription className="text-sm">
                Narrow down your search results
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {filtersActive && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs h-8 px-3 border-gray-200 dark:border-gray-700 text-white hover:bg-destructive dark:text-gray-100  dark:hover:bg-gray-800"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              {expanded ? (
                <X size={14} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <Filter
                  size={14}
                  className="text-gray-600 dark:text-gray-400"
                />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-0">
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? "max-h-80" : "max-h-0"
          }`}
        >
          <form
            onSubmit={handleFilterSubmit}
            className="grid gap-4 mt-3 p-4 border border-gray-100 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="nameFilter"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name
                </Label>
                <div className="relative">
                  <Input
                    id="nameFilter"
                    placeholder="Search by name"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="pl-9 h-10 bg-white dark:bg-gray-950"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="emailFilter"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="emailFilter"
                    placeholder="Search by email"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="pl-9 h-10 bg-white dark:bg-gray-950"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Filter className="h-3.5 w-3.5 mr-2" />
                Apply Filters
              </Button>
            </div>
          </form>
        </div>

        {!expanded && filtersActive && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded">
              Active Filters:
            </div>

            {nameFilter && (
              <div className="text-xs flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <span className="font-medium mr-1">Name:</span> {nameFilter}
              </div>
            )}

            {emailFilter && (
              <div className="text-xs flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <span className="font-medium mr-1">Email:</span> {emailFilter}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientFilters;
