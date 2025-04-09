import { Card, CardContent } from "@/components/ui/card";
import { ExpensePaymentMethods } from "../__components/ExpensePaymentMethods";

export default function PaymentMethodsPage() {
  return (
    <Card className="border-0 shadow-none p-2">
      <CardContent className="p-0 space-y-6">
        <ExpensePaymentMethods />
      </CardContent>
    </Card>
  );
}
