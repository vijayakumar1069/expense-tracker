/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateInvoicePDF(invoice: any) {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const { width, height } = page.getSize();

        // Embed fonts
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Enhanced color scheme
        const colors = {
            primary: rgb(0.05, 0.31, 0.55), // Deeper blue
            secondary: rgb(0.3, 0.3, 0.3), // Darker gray for better contrast
            accent: rgb(1, 1, 1), // White for header text
            background: rgb(1, 1, 1),
            tableHeader: rgb(0.1, 0.2, 0.4), // Professional dark blue
            rowOdd: rgb(0.95, 0.97, 1), // Light blue tint
            rowEven: rgb(1, 1, 1),
            paymentBg: rgb(0.95, 0.95, 0.98),
            footerBg: rgb(0.95, 0.95, 0.95),
            highlight: rgb(0.8, 0.2, 0.2) // Red for highlighting important info
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

        // Initial y position
        let y = height - margin.top;

        // Header Section - Increased height to 120px to fit all content
        page.drawRectangle({
            x: 0,
            y: height - 140,
            width,
            height: 160,
            color: rgb(0.97, 0.97, 1)
        });

        // Company name positioned properly
        page.drawText("GLIGGO INC", {
            x: margin.left,
            y: y - 0,
            size: fontSize.xl,
            font: boldFont,
            color: colors.primary
        });

        // Company Info - adjusted spacing
        const companyInfo = [
            "57/1-A VOC Nagar 2nd Cross Street,",
            "Anna Nagar East,Chennai- 600 102,",
            "Tamil Nadu, India",
            "Phone:+91 72006 58885| Email: info@gliggo.com",
            "Tax ID: 12-3456789"
        ];

        let infoY = y - 15;
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

        // Invoice Details - aligned to the right
        const invoiceDetails = [
            { label: "Invoice Number:", value: invoice.invoiceNumber },
            { label: "Date:", value: new Date(invoice.createdAt).toLocaleDateString() },
            { label: "Due Date:", value: new Date(invoice.dueDate).toLocaleDateString() }
        ];

        let detailY = y - 20;
        invoiceDetails.forEach(detail => {
            // Right-aligned labels
            page.drawText(detail.label, {
                x: width - margin.right - 150,
                y: detailY,
                size: fontSize.base,
                font: regularFont,
                color: colors.secondary
            });

            // Right-aligned values with fixed position
            page.drawText(detail.value, {
                x: width - margin.right - 40,
                y: detailY,
                size: fontSize.base,
                font: boldFont,
                color: colors.primary
            });

            detailY -= 18;
        });

        // Billed To Section with beautiful design - adjusted after header
        y = height - 150; // Start after header
        page.drawRectangle({
            x: margin.left,
            y: y - 90,
            width: contentWidth / 1.5,
            height: 90,
            color: rgb(0.98, 0.98, 1)
        });

        page.drawText("BILL TO:", {
            x: margin.left + 10,
            y: y - 15,
            size: fontSize.base,
            font: boldFont,
            color: colors.secondary
        });

        page.drawText(invoice.clientName, {
            x: margin.left + 20,
            y: y - 35,
            size: fontSize.md,
            font: boldFont,
            color: colors.secondary
        });

        const clientAddressLines = invoice.clientAddress.split("\n");
        let addressY = y - 55;

        // Ensure we don't overflow the bill-to box
        const maxLines = Math.min(clientAddressLines.length, 3); // Limit to 3 lines max

        for (let i = 0; i < maxLines; i++) {
            const line = clientAddressLines[i];
            page.drawText(line, {
                x: margin.left + 20,
                y: addressY,
                size: fontSize.base,
                font: regularFont,
                color: colors.secondary,
            });
            addressY -= 15;
        }

        // Items Table with beautiful design - properly positioned after bill-to
        y = y - 110; // Good spacing after bill-to section

        // Table columns with better spacing
        const colWidths = {
            description: contentWidth * 0.5,
            qty: contentWidth * 0.1,
            price: contentWidth * 0.2,
            total: contentWidth * 0.2
        };

        // Table header with proper styling
        page.drawRectangle({
            x: margin.left,
            y: y - 25,
            width: contentWidth,
            height: 25,
            color: colors.tableHeader
        });

        // Header text properly aligned
        const headers = [
            { text: "DESCRIPTION", x: margin.left + 10 },
            { text: "QTY", x: margin.left + colWidths.description + 10 },
            { text: "UNIT PRICE", x: margin.left + colWidths.description + colWidths.qty + 10 },
            { text: "TOTAL", x: margin.left + colWidths.description + colWidths.qty + colWidths.price + 10 }
        ];

        headers.forEach(header => {
            page.drawText(header.text, {
                x: header.x,
                y: y - 15, // Centered vertically in header
                size: fontSize.base,
                font: boldFont,
                color: colors.accent // White text on dark header
            });
        });

        // Table Rows with proper height and spacing
        let subtotal = 0;
        const rowHeight = 30; // Increased row height for better visibility

        invoice.invoiceContents.forEach((item: any, index: number) => {
            const rowY = y - 25 - (index * rowHeight); // Start below header with consistent spacing
            const total = item.quantity * item.price;
            subtotal += total;

            // Row background with proper height
            page.drawRectangle({
                x: margin.left,
                y: rowY - rowHeight + 5, // Adjust for proper alignment
                width: contentWidth,
                height: rowHeight,
                color: index % 2 === 0 ? colors.rowEven : colors.rowOdd
            });

            // Center content vertically within row
            const textY = rowY - rowHeight / 2 + 5;

            // Description - limit text length if needed
            const maxDescLength = 40; // Approximate character limit
            const description = item.description.length > maxDescLength
                ? item.description.substring(0, maxDescLength) + "..."
                : item.description;

            page.drawText(description, {
                x: margin.left + 10,
                y: textY,
                size: fontSize.base,
                font: regularFont,
                color: colors.primary
            });

            // Quantity - right aligned in its column
            const qtyText = item.quantity.toString();
            page.drawText(qtyText, {
                x: headers[1].x + colWidths.qty / 2 - (qtyText.length * 3), // Center in column
                y: textY,
                size: fontSize.base,
                font: regularFont,
                color: colors.primary
            });

            // Unit price - right aligned
            const priceText = `${item.price.toFixed(2)}`;
            page.drawText(priceText, {
                x: headers[2].x + 5,
                y: textY,
                size: fontSize.base,
                font: regularFont,
                color: colors.primary
            });

            // Total - right aligned
            const totalText = `Rs.${total.toFixed(2)}`;
            page.drawText(totalText, {
                x: headers[3].x + 5,
                y: textY,
                size: fontSize.base,
                font: regularFont,
                color: colors.primary
            });
        });

        // Calculate table bottom position
        const tableBottom = y - 25 - (invoice.invoiceContents.length * rowHeight);

        // Totals Section aligned with table
        const tax = subtotal * (invoice.taxRate / 100);
        const total = subtotal + tax;

        // Background for totals - properly positioned and sized
        page.drawRectangle({
            x: margin.left + contentWidth - 150, // Aligned with right side of table
            y: tableBottom - 65,
            width: 150,
            height: 65,
            color: rgb(0.96, 0.96, 1)
        });

        // Totals with better alignment
        const totals = [
            { label: "Subtotal:", value: subtotal },
            { label: `Tax (${invoice.taxRate}%):`, value: tax },
            { label: "Total:", value: total }
        ];

        let totalsY = tableBottom - 15;
        totals.forEach((totalItem, index) => {
            const isLast = index === totals.length - 1;

            // Label aligned left
            page.drawText(totalItem.label, {
                x: margin.left + contentWidth - 140,
                y: totalsY,
                size: isLast ? fontSize.md : fontSize.base,
                font: boldFont,
                color: isLast ? colors.highlight : colors.primary
            });

            // Value aligned right
            const valueText = `Rs.${totalItem.value.toFixed(2)}`;
            page.drawText(valueText, {
                x: margin.left + contentWidth - 10 - (valueText.length * (isLast ? 7 : 5)), // Right aligned
                y: totalsY,
                size: isLast ? fontSize.md : fontSize.base,
                font: isLast ? boldFont : regularFont,
                color: isLast ? colors.highlight : colors.primary
            });

            totalsY -= 20;
        });

        // Payment Details - positioned properly below totals
        const paymentY = tableBottom - 90;
        page.drawRectangle({
            x: margin.left,
            y: paymentY,
            width: contentWidth / 2,
            height: 80,
            color: rgb(0.95, 0.95, 1)
        });

        page.drawText("Payment Details:", {
            x: margin.left + 10,
            y: paymentY + 60,
            size: fontSize.md,
            font: boldFont,
            color: colors.primary
        });

        const paymentDetails = [
            `Bank Name: ${invoice.bankDetails?.name || "Global Trust Bank"}`,
            `Account Number: ${invoice.bankDetails?.accountNumber || "XXXX-XXXX-XXXX-1234"}`,
            `IFSC Code: ${invoice.bankDetails?.ifsc || "ABCD0123456"}`
        ];

        let paymentDetailY = paymentY + 40;
        paymentDetails.forEach((detail) => {
            page.drawText(detail, {
                x: margin.left + 10,
                y: paymentDetailY,
                size: fontSize.base,
                font: regularFont,
                color: colors.primary
            });
            paymentDetailY -= 15;
        });

        // Terms and conditions section - properly spaced
        const termsY = paymentY - 40;
        page.drawText("Terms & Conditions:", {
            x: margin.left,
            y: termsY,
            size: fontSize.md,
            font: boldFont,
            color: colors.primary
        });

        const termsContent = [
            "1. Payment is due within 30 days of invoice date.",
            "2. Late payments are subject to a 2% monthly interest charge.",
            "3. All prices are in Indian Rupees unless otherwise specified.",
            "4. Please include invoice number in payment reference."
        ];

        let currentY = termsY - 20;
        termsContent.forEach(line => {
            page.drawText(line, {
                x: margin.left,
                y: currentY,
                size: fontSize.sm,
                font: regularFont,
                color: colors.secondary
            });
            currentY -= 15;
        });

        // Notes section - with better spacing
        currentY -= 10;
        page.drawText("Notes:", {
            x: margin.left,
            y: currentY,
            size: fontSize.md,
            font: boldFont,
            color: colors.primary
        });

        // Notes with background box for better visibility
        const notesContent = invoice.notes || "Thank you for your business. We appreciate your prompt payment.";
        page.drawRectangle({
            x: margin.left,
            y: currentY - 30,
            width: contentWidth,
            height: 25,
            color: rgb(0.98, 0.98, 0.98)
        });

        page.drawText(notesContent, {
            x: margin.left + 10,
            y: currentY - 15,
            size: fontSize.base,
            font: regularFont,
            color: colors.secondary
        });

        // Signature area - properly aligned
        currentY -= 50;
        page.drawText("Authorized Signature:", {
            x: width - margin.right - 150,
            y: currentY,
            size: fontSize.base,
            font: boldFont,
            color: colors.primary
        });

        page.drawLine({
            start: { x: width - margin.right - 150, y: currentY - 25 },
            end: { x: width - margin.right, y: currentY - 25 },
            thickness: 1,
            color: colors.secondary
        });

        // Footer with background
        page.drawRectangle({
            x: 0,
            y: 0,
            width,
            height: 50,
            color: rgb(0.97, 0.97, 1)
        });

        page.drawText("Thank you for your business!", {
            x: width / 2 - 75,
            y: 30,
            size: fontSize.base,
            font: boldFont,
            color: colors.primary
        });

        page.drawText("This is a computer-generated invoice. No signature required.", {
            x: width / 2 - 140,
            y: 15,
            size: fontSize.sm,
            font: regularFont,
            color: colors.secondary
        });

        const pdfBuffer = await pdfDoc.save();
        return pdfBuffer;
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
}
