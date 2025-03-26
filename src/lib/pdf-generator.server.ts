/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { toWords } from "number-to-words";

export async function generateInvoicePDF(invoice: any) {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const { width, height } = page.getSize();

        // Font setup
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Modern color scheme
        const colors = {
            primary: rgb(0.17254901960784313, 0.6745098039215687, 0.40784313725490196),    // Professional green color
            secondary: rgb(0.2, 0.2, 0.2),        // Dark gray
            accent: rgb(0.95, 0.95, 0.95),        // Light gray
            text: rgb(0.2, 0.2, 0.2),             // Main text
            success: rgb(0.176, 0.706, 0.176)     // Green for totals
        };

        // Layout constants
        const margin = {
            top: 80,
            right: 50,
            bottom: 50,
            left: 50
        };
        const contentWidth = width - margin.left - margin.right;
        const fontSize = {
            small: 9,
            base: 10,
            medium: 12,
            large: 16
        };

        let yPosition = height - margin.top;
        const invoiceTitle = "INVOICE";
        const titleWidth = boldFont.widthOfTextAtSize(invoiceTitle, fontSize.large);
        page.drawText(invoiceTitle, {
            x: (width - titleWidth) / 2,
            y: yPosition + 27,
            size: fontSize.large,
            font: boldFont,
            color: colors.primary
        });

        // Header Section with logo placeholder
        const headerY = yPosition;
        page.drawRectangle({
            x: margin.left,
            y: headerY + 50,
            width: 40,
            height: 50,
            color: colors.primary,
            borderColor: colors.primary,
            borderWidth: 1
        });

        // Company Info with modern layout
        const companyInfo = [
            { text: "Gliggo Technologies India Pvt Ltd", size: fontSize.large },
            { text: "57/1-A VOC Nagar 2nd Cross Street,", size: fontSize.base },
            { text: "Anna Nagar East, Chennai - 600 102.", size: fontSize.base },
            { text: "Phone: +91 72006 58885 | Email: info@gliggo.com", size: fontSize.small },
            { text: "PAN No: AANP9454P | GSTIN: 36AACCT3456B1Z0 | TAN: 123456789012345", size: fontSize.small }
        ];

        companyInfo.forEach((line, index) => {
            page.drawText(line.text, {
                x: margin.left + 1,
                y: yPosition - (index * 16),
                size: line.size,
                font: index === 0 ? boldFont : regularFont,
                color: index === 0 ? colors.primary : colors.secondary
            });
        });
        yPosition -= 90;

        // Invoice Details in card-like layout
        page.drawRectangle({
            x: margin.left,
            y: yPosition - 65,
            width: contentWidth,
            height: 80,
            color: rgb(0.98, 0.98, 0.98),
            borderColor: colors.accent,
            borderWidth: 1
        });

        const invoiceDetails = [
            { label: "Invoice Number", value: invoice.invoiceNumber },
            { label: "Issue Date", value: new Date().toLocaleDateString() },
            { label: "Due Date", value: new Date(invoice.dueDate).toLocaleDateString() },
            { label: "Payment Terms", value: "Net 30 Days" }
        ];

        const detailColumnWidth = contentWidth / 4;
        invoiceDetails.forEach((detail, index) => {
            const xPos = margin.left + (detailColumnWidth * index);

            // Label
            page.drawText(detail.label.toUpperCase(), {
                x: xPos + 10,
                y: yPosition - 25,
                size: fontSize.small,
                font: regularFont,
                color: colors.secondary
            });

            // Value
            page.drawText(detail.value, {
                x: xPos + 10,
                y: yPosition - 40,
                size: fontSize.base,
                font: boldFont,
                color: colors.text
            });
        });
        yPosition -= 100;

        // Client & Company Address Section
        const addressColumns = [
            {
                title: "BILL TO",
                content: [
                    `${invoice.clientName},`,
                    `${invoice.clientStreetName},`,
                    `${invoice.clientCity}, ${invoice.clientState} - ${invoice.clientZip},`,
                    `${invoice.clientCountry}.`
                ]
            },

        ];

        addressColumns.forEach((column, colIndex) => {
            const xPos = margin.left + ((contentWidth / 2) * colIndex);

            // Column title
            page.drawText(column.title, {
                x: xPos,
                y: yPosition,
                size: fontSize.medium,
                font: boldFont,
                color: colors.primary
            });

            // Content
            column.content.forEach((line, lineIndex) => {
                if (line && line.trim()) {
                    page.drawText(line, {
                        x: xPos,
                        y: yPosition - 20 - (lineIndex * 16),
                        size: fontSize.base,
                        font: regularFont,
                        color: colors.text
                    });
                }
            });
        });
        yPosition -= 120;

        // Items Table with 2 columns
        const tableHeaderY = yPosition;
        const rowHeight = 20;
        const columnWidths = {
            description: contentWidth * 0.6,  // 60% for description
            total: contentWidth * 0.4         // 40% for total
        };

        // Table Header
        page.drawRectangle({
            x: margin.left,
            y: tableHeaderY + 2,
            width: contentWidth,
            height: rowHeight,
            color: colors.primary
        });

        // Draw column headers
        ["DESCRIPTION", "TOTAL"].forEach((header, index) => {
            const xPos = margin.left + Object.values(columnWidths)
                .slice(0, index)
                .reduce((a, b) => a + b, 0);

            // Right-align total header
            const alignRight = index === 1;
            const textX = alignRight ?
                xPos + columnWidths.total - regularFont.widthOfTextAtSize(header, fontSize.base) - 10 :
                xPos + 10;

            page.drawText(header, {
                x: textX,
                y: tableHeaderY + 8,
                size: fontSize.base,
                font: boldFont,
                color: rgb(1, 1, 1) // White text
            });
        });

        // Table Rows
        let currentY = tableHeaderY - rowHeight;
        invoice.invoiceContents.forEach((item: any, index: number) => {
            // Alternate row colors
            if (index % 2 === 0) {
                page.drawRectangle({
                    x: margin.left,
                    y: currentY - 2,
                    width: contentWidth,
                    height: rowHeight,
                    color: colors.accent
                });
            }

            // Row content
            const description = item.description.length > 40 ?
                `${item.description.substring(0, 37)}...` :
                item.description;

            const total = `${parseFloat(item.total).toFixed(2)}`;

            // Description column
            page.drawText(description, {
                x: margin.left + 10,
                y: currentY + 4,
                size: fontSize.base,
                font: regularFont,
                color: colors.text
            });

            // Total column (right-aligned)
            const totalTextX = margin.left + columnWidths.description +
                columnWidths.total -
                regularFont.widthOfTextAtSize(total, fontSize.base) - 10;

            page.drawText(total, {
                x: totalTextX,
                y: currentY + 4,
                size: fontSize.base,
                font: regularFont,
                color: colors.text
            });

            currentY -= rowHeight;
        });

        // Table Footer
        let totalsY = currentY - 10;
        const totals = [
            { label: "Subtotal", value: invoice.subtotal },
            { label: `Tax (${invoice.taxRate}%)`, value: invoice.taxAmount },
            { label: "Total", value: invoice.invoiceTotal }
        ];

        // In the totals.forEach block:

        totals.forEach((total, index) => {
            const yPos = totalsY - (index * 20);

            // Label
            page.drawText(total.label, {
                x: margin.left + columnWidths.description,
                y: yPos,
                size: fontSize.base,
                font: boldFont,
                color: colors.text
            });

            // Value
            page.drawText(`${total.value.toFixed(2)}`, {
                x: margin.left + columnWidths.description + columnWidths.total - 55,
                y: yPos,
                size: fontSize.base,
                font: boldFont,
                color: colors.success
            });

            // Add line between tax and total
            if (index === 1) { // Index 1 is the tax entry
                const lineY = yPos - 8; // Adjust this value to position the line
                page.drawLine({
                    start: { x: margin.left + columnWidths.description, y: lineY },
                    end: { x: margin.left + columnWidths.description + columnWidths.total - 0, y: lineY },
                    thickness: 1,
                    color: colors.primary
                });
            }
        });
        // Amount in Words
        try {
            const amountWords = toWords(invoice.invoiceTotal)
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ') + " Rupees Only";

            // Fixed width constraints
            const maxWidth = 230; // Adjust based on your layout
            const lineHeight = 15;
            const startX = margin.left;
            let currentY = totalsY - 0;

            // Split into multiple lines if needed
            const words = amountWords.split(' ');
            let currentLine: string[] = [];

            // First line with "Amount in Words:" label
            page.drawText("Amount in Words:", {
                x: startX,
                y: currentY,
                size: fontSize.base,
                font: regularFont,
                color: colors.secondary
            });
            currentY -= lineHeight;

            // Build lines with word wrapping
            words.forEach(word => {
                const testLine = currentLine.concat(word).join(' ');
                const testWidth = regularFont.widthOfTextAtSize(testLine, fontSize.base);

                if (testWidth > maxWidth) {
                    // Draw current line
                    page.drawText(currentLine.join(' '), {
                        x: startX,
                        y: currentY,
                        size: fontSize.base,
                        font: regularFont,
                        color: colors.secondary
                    });
                    currentY -= lineHeight;
                    currentLine = [word];
                } else {
                    currentLine.push(word);
                }
            });

            // Draw remaining text
            if (currentLine.length > 0) {
                page.drawText(currentLine.join(' '), {
                    x: startX,
                    y: currentY,
                    size: fontSize.base,
                    font: regularFont,
                    color: colors.secondary
                });
                currentY -= lineHeight;
            }

            // Adjust totals position based on lines used
            totalsY = currentY - 20;

        } catch (error) {
            console.error("Amount words conversion error:", error);
        }

        // Payment Details Section
        const paymentY = totalsY - 80;
        page.drawRectangle({
            x: margin.left,
            y: paymentY,
            width: contentWidth,
            height: 80,
            color: colors.accent,
            borderColor: colors.accent,
            borderWidth: 1
        });

        const paymentDetails = [
            `Bank Name: ${invoice.bankDetails?.name || "Global Trust Bank"}`,
            `Account Number: ${invoice.bankDetails?.accountNumber || "XXXX-XXXX-XXXX-1234"}`,
            `IFSC Code: ${invoice.bankDetails?.ifsc || "ABCD0123456"}`,
            `UPI ID: ${invoice.bankDetails?.upi || "gliggo@axisbank"}`
        ];

        paymentDetails.forEach((detail, index) => {
            page.drawText(detail, {
                x: margin.left + 20,
                y: paymentY + 58 - (index * 16),
                size: fontSize.base,
                font: regularFont,
                color: colors.text
            });
        });

        // // Notes Section
        const notesY = paymentY - 50;

        // After Notes Section
        const signatureY = notesY;
        const signatureWidth = 150;

        // Signature Line (Right aligned)
        const signatureLineY = signatureY - 40;


        // Signature Text (Right aligned)
        page.drawText("Authorized Signature", {
            x: width - margin.right - signatureWidth + 30,
            y: signatureLineY + 20,
            size: fontSize.base,
            font: regularFont,
            color: colors.text
        });
        page.drawLine({
            start: { x: width - margin.right - signatureWidth, y: signatureLineY },
            end: { x: width - margin.right, y: signatureLineY },
            thickness: 1,
            color: colors.text
        });

        // Modified Notes Section (Left aligned)
        const notesContent = invoice.notes || [
            "1. Please make payments by the due date",
            "2. Late payments will incur 2% monthly interest",
            "3. All payments should include invoice number"
        ];

        // Draw notes title
        page.drawText("Notes:", {
            x: margin.left,
            y: notesY,
            size: fontSize.medium,
            font: boldFont,
            color: colors.primary
        });

        // Draw notes content
        notesContent.forEach((note: string, index: number) => {
            page.drawText(note, {
                x: margin.left + 10,
                y: notesY - 20 - (index * 16),
                size: fontSize.base,
                font: regularFont,
                color: colors.text
            });
        });

        // Footer
        page.drawText("Thank you for your business!", {
            x: margin.left,
            y: 40,
            size: fontSize.medium,
            font: boldFont,
            color: colors.primary
        });

        page.drawText("A Gliggo Technologies Product | www.gliggo.com | support@gliggo.com", {
            x: margin.left,
            y: 25,
            size: fontSize.small,
            font: regularFont,
            color: colors.secondary
        });

        const pdfBuffer = await pdfDoc.save();
        return pdfBuffer;

    } catch (error) {
        console.error("PDF Generation Error:", error);
        throw error;
    }
}