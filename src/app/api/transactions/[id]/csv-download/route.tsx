// app/api/transaction/export/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/utils/prisma";
import * as XLSX from "xlsx-js-style";

// Define TypeScript interfaces for styling
interface CellStyle {
  font?: {
    name?: string;
    sz?: number;
    bold?: boolean;
    color?: { rgb: string };
  };
  fill?: {
    fgColor: { rgb: string };
  };
  alignment?: {
    horizontal?: string;
    vertical?: string;
    wrapText?: boolean;
  };
  border?: {
    top?: { style: string; color: { rgb: string } };
    bottom?: { style: string; color: { rgb: string } };
    left?: { style: string; color: { rgb: string } };
    right?: { style: string; color: { rgb: string } };
  };
  numFmt?: string;
}

interface StyledCell {
  v: string | number; // value
  t?: string; // type
  s: CellStyle; // style
}

interface FormattedRow {
  "S.No": StyledCell;
  Date: StyledCell;
  Particulars: StyledCell;
  Amount: StyledCell;
  Remarks: StyledCell;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = (await params) || {};

    // Get all transactions for the authenticated user without any filters
    const transactions = await prisma.transaction.findMany({
      where: {
        id: id,
      },
      orderBy: {
        date: "desc",
      },
      include: {
        paymentMethod: true,
      },
    });

    // Calculate total sum of all transaction totals
    const grandTotal = transactions.reduce(
      (sum, transaction) => sum + transaction.total,
      0
    );

    // Transform data for export with styles
    const formattedData: FormattedRow[] = transactions.map(
      (transaction, index) => {
        // Determine color based on whether amount is positive or negative
        const amountColor = transaction.total >= 0 ? "0000FF" : "FF0000"; // Blue for positive, Red for negative

        return {
          "S.No": {
            v: (index + 1).toString(),
            s: {
              alignment: { horizontal: "center" },
            },
          },
          Date: {
            v: transaction.date.toISOString().split("T")[0],
            s: {
              alignment: { horizontal: "center" },
            },
          },
          Particulars: {
            v: transaction.name,
            s: {
              alignment: { horizontal: "left" },
            },
          },
          Amount: {
            v: transaction.total.toFixed(2),
            s: {
              font: { color: { rgb: amountColor } },
              alignment: { horizontal: "right" },
              numFmt: "#,##0.00",
            },
          },
          Remarks: {
            v: transaction.description || "",
            s: {
              alignment: { horizontal: "left" },
            },
          },
        };
      }
    );

    // Add some spacing rows before the total
    for (let i = 0; i < 3; i++) {
      formattedData.push({
        "S.No": { v: "", s: {} },
        Date: { v: "", s: {} },
        Particulars: { v: "", s: {} },
        Amount: { v: "", s: {} },
        Remarks: { v: "", s: {} },
      });
    }

    // Add header row with styles
    const headerStyle: CellStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } }, // Blue background
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    // Append the Grand Total row with special formatting
    formattedData.push({
      "S.No": {
        v: "",
        s: {},
      },
      Date: {
        v: "",
        s: {},
      },
      Particulars: {
        v: "Grand Total",
        s: {
          font: { bold: true, color: { rgb: "000000" } }, // Black bold text
          fill: { fgColor: { rgb: "FFC000" } }, // Yellow background
          alignment: { horizontal: "center" },
        },
      },
      Amount: {
        v: grandTotal.toFixed(2),
        s: {
          font: { bold: true, color: { rgb: "000000" } }, // Black bold text
          fill: { fgColor: { rgb: "FFC000" } }, // Yellow background
          alignment: { horizontal: "center" },
          numFmt: "#,##0.00",
        },
      },
      Remarks: {
        v: "",
        s: {},
      },
    });

    // Convert the formatted data to an array that XLSX can work with
    const wbData = formattedData.map((row) => [
      row["S.No"],
      row["Date"],
      row["Particulars"],
      row["Amount"],
      row["Remarks"],
    ]);

    // Add the header row
    const headers = [
      { v: "S.No", s: headerStyle },
      { v: "Date", s: headerStyle },
      { v: "Particulars", s: headerStyle },
      { v: "Amount", s: headerStyle },
      { v: "Remarks", s: headerStyle },
    ];
    wbData.unshift(headers);

    // Create a worksheet with the styled data
    const worksheet = XLSX.utils.aoa_to_sheet(wbData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 10 }, // S.No
      { wch: 15 }, // Date
      { wch: 40 }, // Particulars
      { wch: 15 }, // Amount
      { wch: 40 }, // Remarks
    ];

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Get the Excel file as a buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Create filename with current date
    const date = new Date().toISOString().split("T")[0];
    const filename = `transactions_${date}.xlsx`;

    // Return the Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
