// components/TopCategories.tsx
"use client";

import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import { useState } from "react";

interface Category {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export default function TopCategories({
  categories,
}: {
  categories: Category[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4 w-full">
      {/* Fixed position button container */}
      <div className="flex justify-end w-full mb-7">
        <div className="group relative inline-block">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-sm font-medium transition-all duration-300 
               bg-accent-foreground
               text-white  rounded-lg px-4 py-2.5
               shadow-md hover:shadow-lg
               transform "
          >
            <BarChart2 className="h-5 w-5 text-white group-hover:text-white " />
            <span className="group-hover:translate-x-0.5 transition-transform">
              {isOpen ? "Hide Categories" : "Show Categories"}
            </span>
          </Button>
        </div>
      </div>

      {/* Categories container that expands/collapses */}
      <div
        className={`overflow-hidden transition-all duration-1500 ease-in-out w-full pb-2 ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid gap-3">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 transition-all hover:shadow-md"
            >
              <div className="flex justify-between mb-1.5">
                <div className="flex items-center">
                  <div
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <span className="text-sm font-semibold">
                  ${category.amount.toLocaleString()}{" "}
                  <span className="text-xs text-gray-500">
                    ( {category.percentage}% of total)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: category.color,
                  }}
                />
              </div>
              <div className="mt-1 text-right"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
