/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateInvoicePDF(invoice: any) {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        const { width, height } = page.getSize();

        // Embed fonts
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Color scheme
        const colors = {
            primary: rgb(0.12, 0.36, 0.56),
            secondary: rgb(0.4, 0.4, 0.4),
            accent: rgb(1, 1, 1), // White for header text
            background: rgb(1, 1, 1),
            tableHeader: rgb(0.15, 0.15, 0.15),
            rowEven: rgb(0.97, 0.97, 0.97),
            rowOdd: rgb(1, 1, 1),
            paymentBg: rgb(0.95, 0.95, 0.98),
            footerBg: rgb(0.95, 0.95, 0.95)
        };

        // Layout settings
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const contentWidth = width - margin.left - margin.right;
        const fontSize = {
            sm: 9,
            base: 10,
            md: 12,
            lg: 14,
            xl: 18
        };

        let y = height - margin.top;

        // Header Section
        page.drawText("GLIGGO INC", {
            x: margin.left,
            y: y - 20,
            size: fontSize.xl,
            font: boldFont,
            color: colors.primary
        });

        // Company Info
        const companyInfo = [
            "57/1-A VOC Nagar 2nd Cross Street,",
            "Anna Nagar East,Chennai- 600 102,",
            "Tamil Nadu, India",
            "Phone:+91 72006 58885| Email: info@gliggo.com",
            "Tax ID: 12-3456789"
        ];
        let infoY = y - 45;
        companyInfo.forEach(line => {
            page.drawText(line, {
                x: margin.left,
                y: infoY,
                size: fontSize.sm,
                font: regularFont,
                color: colors.secondary
            });
            infoY -= 14;
        });

        // Invoice Details
        const invoiceDetails = [
            { label: "Invoice Number:", value: invoice.invoiceNumber },
            { label: "Date:", value: new Date(invoice.createdAt).toLocaleDateString() },
            { label: "Due Date:", value: new Date(invoice.dueDate).toLocaleDateString() }
        ];
        let detailY = y - 20;
        invoiceDetails.forEach(detail => {
            page.drawText(detail.label, {
                x: width - margin.right - 150,
                y: detailY,
                size: fontSize.base,
                font: regularFont,
                color: colors.secondary
            });
            page.drawText(detail.value, {
                x: width - margin.right - 40,
                y: detailY,
                size: fontSize.base,
                font: boldFont,
                color: colors.primary
            });
            detailY -= 18;
        });

        // Billed To Section with beautiful design
        y = detailY - 50;
        page.drawRectangle({
            x: margin.left,
            y: y - 80,
            width: contentWidth / 2,
            height: 90,
            color: colors.background,

        });
        page.drawText("BILL TO:", {
            x: margin.left + 10,
            y: y - 10,
            size: fontSize.base,
            font: boldFont,
            color: colors.primary
        });
        page.drawText(invoice.clientName, {
            x: margin.left + 20,
            y: y - 30,
            size: fontSize.md,
            font: boldFont,
            color: colors.secondary
        });
        const clientAddressLines = invoice.clientAddress.split("\n");
        let addressY = y - 50;
        clientAddressLines.forEach((line: string) => {
            page.drawText(line, {
                x: margin.left + 20,
                y: addressY,
                size: fontSize.base,
                font: regularFont,
                color: colors.secondary
            });
            addressY -= 15;
        });

        // Items Table with beautiful design
        y = addressY - 25;
        const colWidths = {
            description: contentWidth * 0.5,
            qty: contentWidth * 0.15,
            price: contentWidth * 0.2,
            total: contentWidth * 0.15
        };
        page.drawRectangle({
            x: margin.left,
            y: y - 25,
            width: contentWidth,
            height: 25,
            color: colors.tableHeader
        });
        const headers = [
            { text: "DESCRIPTION", x: margin.left + 10 },
            { text: "QTY", x: margin.left + colWidths.description + 10 },
            { text: "UNIT PRICE", x: margin.left + colWidths.description + colWidths.qty + 10 },
            { text: "TOTAL", x: width - margin.right - colWidths.total + 10 }
        ];
        headers.forEach(header => {
            page.drawText(header.text, {
                x: header.x,
                y: y - 10,
                size: fontSize.base,
                font: boldFont,
                color: colors.accent // White text on dark header
            });
        });

        // Table Rows with alternating colors
        let subtotal = 0;
        invoice.invoiceContents.forEach((item: any, index: number) => {
            const rowY = y - 30 - (index * 20);
            const total = item.quantity * item.price;
            subtotal += total;

            page.drawRectangle({
                x: margin.left,
                y: rowY - 5,
                width: contentWidth,
                height: 20,
                color: index % 2 === 0 ? colors.rowEven : colors.rowOdd
            });

            page.drawText(item.description, {
                x: margin.left + 10,
                y: rowY,
                size: fontSize.base,
                font: regularFont,
                color: colors.primary
            });

            page.drawText(item.quantity.toString(), {
                x: headers[1].x + 5,
                y: rowY,
                size: fontSize.base,
                font: regularFont,
                color: colors.primary
            });

            page.drawText(`${item.price.toFixed(2)}`, {
                x: headers[2].x + 5,
                y: rowY,
                size: fontSize.base,
                font: regularFont,
                color: colors.primary
            });

            page.drawText(`Rs.${total.toFixed(2)}`, {
                x: headers[3].x + 5,
                y: rowY,
                size: fontSize.base,
                font: regularFont,
                color: colors.primary
            });
        });

        // Totals Section aligned with table
        const tableBottomY = y - 30 - (invoice.invoiceContents.length * 20);
        const tax = subtotal * (invoice.taxRate / 100);
        const total = subtotal + tax;
        const totals = [
            { label: "Subtotal:", value: subtotal },
            { label: `Tax (${invoice.taxRate}%):`, value: tax },
            { label: "Total:", value: total }
        ];
        let totalsY = tableBottomY - 20;
        totals.forEach((totalItem) => {
            page.drawText(totalItem.label, {
                x: headers[3].x - 50,
                y: totalsY,
                size: fontSize.base,
                font: boldFont,
                color: colors.primary
            });
            page.drawText(`${totalItem.value.toFixed(2)}`, {
                x: headers[3].x + 5,
                y: totalsY,
                size: fontSize.base,
                font: regularFont,
                color: colors.primary
            });
            totalsY -= 20;
        });

        // Payment Details
        const paymentY = totalsY - 30;
        page.drawText("Payment Details:", {
            x: margin.left,
            y: paymentY,
            size: fontSize.md,
            font: boldFont,
            color: colors.primary
        });
        const paymentDetails = [
            `Bank Name: ${invoice.bankDetails?.name || "Global Trust Bank"}`,
            `Account Number: ${invoice.bankDetails?.accountNumber || "XXXX-XXXX-XXXX-1234"}`,
            `IFSC Code: ${invoice.bankDetails?.ifsc || "ABCD0123456"}`
        ];
        paymentDetails.forEach((detail, index) => {
            page.drawText(detail, {
                x: margin.left,
                y: paymentY - 20 - (index * 15),
                size: fontSize.base,
                font: regularFont,
                color: colors.primary
            });
        });

        // Footer
        page.drawText("Thank you for your business!", {
            x: margin.left,
            y: margin.bottom + 30,
            size: fontSize.base,
            font: boldFont,
            color: colors.primary
        });

        const pdfBuffer = await pdfDoc.save();
        return pdfBuffer;
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
}
