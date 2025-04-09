"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const TransactionFormSubmitButton = ({
  isPending,
  mode,
  viewMode = false,
  setViewMode,
}: {
  isPending: boolean;
  mode: "add" | "edit";
  viewMode: boolean;
  setViewMode: (viewMode: boolean) => void;
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If we're in view mode, switch to edit mode when the button is clicked
    if (viewMode) {
      e.preventDefault(); // Prevent form submission
      setViewMode(false);
    }
    // If we're in edit mode, the form's native submit behavior will trigger
  };
  console.log("viewMode", viewMode);

  return (
    <Button
      type={viewMode ? "button" : "submit"}
      onClick={handleClick}
      className="bg-gradient-to-r from-primary to-[#8b5cf6] w-24 h-8 rounded-md text-white font-bold text-sm cursor-pointer"
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : viewMode ? (
        "Edit"
      ) : mode === "add" ? (
        "Add"
      ) : (
        "Save"
      )}
    </Button>
  );
};
