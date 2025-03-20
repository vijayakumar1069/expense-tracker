import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const TransactionFormSubmitButton = ({
  isPending,
  mode,
}: {
  isPending: boolean;
  mode: "add" | "edit";
}) => {
  return (
    <Button
      type="submit"
      className="bg-gradient-to-r from-primary to-[#8b5cf6] w-24 h-8 rounded-md text-white font-bold text-sm cursor-pointer"
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : mode === "add" ? (
        "Add"
      ) : (
        "Edit"
      )}
    </Button>
  );
};
