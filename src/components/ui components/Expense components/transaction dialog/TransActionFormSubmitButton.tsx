"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import DownloadSingleTransActionCSV from "../DownloadSingleTransActionCSV";

export const TransactionFormSubmitButton = ({
  isPending,
  mode,
  viewMode = false,
  setViewMode,
  id,
}: {
  isPending: boolean;
  mode: "add" | "edit";
  viewMode: boolean;
  setViewMode: (viewMode: boolean) => void;
  id?: string;
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If we're in view mode, switch to edit mode when the button is clicked
    if (viewMode) {
      e.preventDefault(); // Prevent form submission
      setViewMode(false);
    }
    // If we're in edit mode, the form's native submit behavior will trigger
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {viewMode && <DownloadSingleTransActionCSV id={id} />}
      <Button
        type={viewMode ? "button" : "submit"}
        onClick={handleClick}
        className="bg-gradient-to-r from-primary to-[#8b5cf6]  rounded-md text-white font-bold text-sm cursor-pointer"
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
    </div>
  );
};
