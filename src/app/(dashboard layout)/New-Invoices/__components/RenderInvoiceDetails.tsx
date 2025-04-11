import React from "react";
import { InvoiceWithContents } from "./InvoiceTable";

const RenderInvoiceDetails = ({
  invoice,
}: {
  invoice: InvoiceWithContents;
}) => {
  if (!invoice) return null;

  const statusColors = {
    DRAFT: "bg-gray-200 text-gray-800",
    Raised: "bg-yellow-100 text-yellow-800",
    SENT: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    OVERDUE: "bg-red-100 text-red-800",
    CANCELLED: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">
            Invoice Number
          </h3>
          <p className="text-base font-medium">{invoice.invoiceNumber}</p>
        </div>
        <div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[invoice.status]
            }`}
          >
            {invoice.status}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
        <p className="text-base font-medium">{invoice.clientName}</p>
        <p className="text-sm">{invoice.clientEmail}</p>
        <p className="text-sm">{invoice.clientPhone1}</p>
        <p className="text-sm whitespace-pre-wrap">{invoice.clientCountry}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Items</h3>
        <div className="border rounded-md divide-y">
          {invoice.invoiceContents.map((item, index) => (
            <div key={index} className="p-3 flex justify-between">
              <div>
                <p className="font-medium">{item.description}</p>
                <p className="text-sm text-muted-foreground">
                  {item.total.toFixed(2)}
                </p>
              </div>
              <p className="font-medium">{item.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t">
        <div className="flex justify-between">
          <p className="text-muted-foreground">Subtotal</p>
          <p>{invoice.subtotal.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-muted-foreground">
            Tax1 ({invoice.taxRate1.toFixed(2)}%)
          </p>
          <p className="text-muted-foreground">
            Tax2 ({invoice.taxRate2.toFixed(2)}%)
          </p>

          <p>{invoice.taxAmount.toFixed(2)}</p>
        </div>
        <div className="flex justify-between font-medium text-lg">
          <p>Total</p>
          <p>{invoice.invoiceTotal.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default RenderInvoiceDetails;
