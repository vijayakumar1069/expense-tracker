import { Badge } from "@/components/ui/badge";

import { CATEGORIES } from "@/utils/constants/consts";
import { Receipt } from "lucide-react";

// Function to get category details
export const getCategoryDetails = (categoryName: string) => {
  const category = CATEGORIES.find((cat) => cat.name === categoryName);
  if (!category) {
    // Default fallback if category not found
    return {
      icon: Receipt,
      color: "#64748b",
      name: categoryName,
    };
  }
  return category;
};

// Category Badge Component
export const CategoryBadge = ({ categoryName }: { categoryName: string }) => {
  const category = getCategoryDetails(categoryName);
  const Icon = category.icon;

  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1 w-fit p-2"
      style={{
        borderColor: category.color + "40",
        color: category.color,
        backgroundColor: category.color + "10",
      }}
    >
      <Icon className="h-3 w-3" />
      {category.name}
    </Badge>
  );
};
