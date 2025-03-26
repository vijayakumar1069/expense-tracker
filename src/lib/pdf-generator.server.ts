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

        // Enhanced color scheme - premium aesthetic
        const colors = {
            // Rich color palette for ultra attractive design
            primary: rgb(0.03, 0.22, 0.45), // Deep royal blue 
            secondary: rgb(0.25, 0.25, 0.25), // Darker gray for better readability
            accent: rgb(1, 1, 1), // White for header text
            background: rgb(1, 1, 1),
            tableHeader: rgb(0.07, 0.15, 0.33), // Deep navy blue
            rowOdd: rgb(0.95, 0.97, 1), // Light blue tint
            rowEven: rgb(1, 1, 1),
            paymentBg: rgb(0.97, 0.97, 1),
            footerBg: rgb(0.95, 0.95, 0.98),
            highlight: rgb(0.75, 0.15, 0.2), // Rich burgundy red
            gold: rgb(0.85, 0.65, 0.12), // Premium gold accent
            lightAccent: rgb(0.85, 0.9, 0.98), // Light blue for subtle highlights
            borderColor: rgb(0.8, 0.8, 0.85), // Subtle border color
            premiumGradientStart: rgb(0.97, 0.97, 1),
            premiumGradientEnd: rgb(0.9, 0.92, 0.98)
        };

        // Layout settings
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const contentWidth = width - margin.left - margin.right;
        const fontSize = {
            sm: 9,
            base: 10,
            md: 12,
            lg: 14,
            xl: 20 // Slightly larger for more impact
        };

        // Initial y position
        let y = height - margin.top;

        // Premium gradient header background
        for (let i = 0; i < 160; i++) {

            const startColor = colors.premiumGradientStart;


            // Linear interpolation between colors


            page.drawLine({
                start: { x: 0, y: height - 140 + i },
                end: { x: width, y: height - 140 + i },
                thickness: 1,
                color: startColor
            });
        }

        // Decorative border for header
        page.drawLine({
            start: { x: 0, y: height - 140 },
            end: { x: width, y: height - 140 },
            thickness: 2,
            color: colors.borderColor
        });

        // Decorative accent line at top
        page.drawRectangle({
            x: 0,
            y: height - 10,
            width: width,
            height: 10,
            color: colors.primary
        });

        // Company name positioned properly with premium styling
        page.drawText("GLIGGO INC", {
            x: margin.left,
            y: y - 0,
            size: fontSize.xl,
            font: boldFont,
            color: colors.primary
        });

        // Subtle underline for company name
        page.drawLine({
            start: { x: margin.left, y: y - 5 },
            end: { x: margin.left + 120, y: y - 5 },
            thickness: 1.5,
            color: colors.gold
        });

        // Company Info - adjusted spacing
        const companyInfo = [
            "57/1-A VOC Nagar 2nd Cross Street,",
            "Anna Nagar East,Chennai- 600 102,",
            "Tamil Nadu, India",
            "Phone:+91 72006 58885| Email: info@gliggo.com",
            "Tax ID: 12-3456789"
        ];

        let infoY = y - 19;
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

        // Premium badge for professional look
        page.drawCircle({
            x: width - margin.right - 25,
            y: height - 30,
            size: 20,
            color: colors.primary
        });

        page.drawRectangle("INVOICE", {
            x: width - margin.right - 42,
            y: height - 33,

            size: 8,
            font: boldFont,
            color: colors.accent
        });

        // Invoice Details - aligned to the right with enhanced styling
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

            // Right-aligned values with fixed position - enhanced
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

        // Premium gradient background for bill-to section
        for (let i = 0; i < 90; i++) {

            const endColor = colors.lightAccent;



            page.drawLine({
                start: { x: margin.left, y: y - 90 + i },
                end: { x: margin.left + contentWidth / 1.5, y: y - 90 + i },
                thickness: 1,
                color: endColor
            });
        }

        // Elegant border for bill-to box
        page.drawRectangle({
            x: margin.left,
            y: y - 90,
            width: contentWidth / 1.5,
            height: 90,
            borderColor: colors.borderColor,
            borderWidth: 1,
            color: colors.lightAccent
        });

        // Accent border at top of bill-to section
        page.drawRectangle({
            x: margin.left,
            y: y,
            width: contentWidth / 1.5,
            height: 3,
            color: colors.primary
        });

        page.drawText("BILL TO:", {
            x: margin.left + 10,
            y: y - 15,
            size: fontSize.base,
            font: boldFont,
            color: colors.primary
        });

        page.drawText(invoice.clientName, {
            x: margin.left + 20,
            y: y - 35,
            size: fontSize.md,
            font: boldFont,
            color: colors.primary
        });

        const clientAddressLines = invoice.clientCountry.split("\n");
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

        // Premium gradient table header
        for (let i = 0; i < 1; i++) {

            const startColor = colors.tableHeader;


            page.drawLine({
                start: { x: margin.left, y: y - 25 + i },
                end: { x: margin.left + contentWidth, y: y - 25 + i },
                thickness: 0,
                color: startColor
            });
        }

        // Header text properly aligned
        const headers = [
            { text: "DESCRIPTION", x: margin.left + 10 },
            { text: "QTY", x: margin.left + colWidths.description - 10 },
            { text: "UNIT PRICE", x: margin.left + colWidths.description + colWidths.qty + 10 },
            { text: "TOTAL", x: margin.left + colWidths.description + colWidths.qty + colWidths.price + 10 }
        ];

        headers.forEach(header => {
            page.drawText(header.text, {
                x: header.x,
                y: y - 15, // Centered vertically in header
                size: fontSize.base,
                font: boldFont,
                color: colors.secondary // White text on dark header
            });
        });

        // Table Rows with proper height and spacing
        let subtotal = 0;
        const rowHeight = 30; // Increased row height for better visibility

        invoice.invoiceContents.forEach((item: any, index: number) => {
            const rowY = y - 25 - (index * rowHeight); // Start below header with consistent spacing
            const total = item.total;
            subtotal += total;

            // Row background with proper height and subtle gradient
            if (index % 2 === 0) {
                // Even rows - subtle gradient
                for (let i = 0; i < rowHeight; i++) {

                    const startColor = colors.rowEven;




                    page.drawLine({
                        start: { x: margin.left, y: rowY - rowHeight + 5 + i },
                        end: { x: margin.left + contentWidth, y: rowY - rowHeight + 5 + i },
                        thickness: 1,
                        color: startColor
                    });
                }
            } else {
                // Odd rows - light blue tint
                page.drawRectangle({
                    x: margin.left,
                    y: rowY - rowHeight + 5, // Adjust for proper alignment
                    width: contentWidth,
                    height: rowHeight,
                    color: colors.rowOdd
                });
            }

            // Subtle separator between rows
            page.drawLine({
                start: { x: margin.left, y: rowY - rowHeight + 5 },
                end: { x: margin.left + contentWidth, y: rowY - rowHeight + 5 },
                thickness: 0.5,
                color: colors.borderColor
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

        // Table border
        page.drawRectangle({
            x: margin.left,
            y: tableBottom,
            width: contentWidth,
            height: y - tableBottom,
            borderColor: colors.borderColor,
            borderWidth: 0.5,
            color: undefined
        });

        // Totals Section aligned with table
        const tax = subtotal * (invoice.taxRate / 100);
        const total = subtotal + tax;

        // Premium gradient background for totals
        for (let i = 0; i < 1; i++) {

            // const endColor = colors.lightAccent;



            page.drawLine({
                start: { x: margin.left + contentWidth - 150, y: tableBottom - 65 + i },
                end: { x: margin.left + contentWidth, y: tableBottom - 65 + i },
                thickness: 1,
                color: undefined
            });
        }

        // Elegant border for totals box
        page.drawRectangle({
            x: margin.left + contentWidth - 180,
            y: tableBottom - 65,
            width: 180,
            height: 65,
            borderColor: colors.borderColor,
            borderWidth: 1,
            color: undefined
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

            // Highlight the total row with background
            if (isLast) {
                page.drawRectangle({
                    x: margin.left + contentWidth - 180,
                    y: totalsY - 9.5,
                    width: 180,
                    height: 20,
                    color: rgb(0.93, 0.93, 0.97)
                });
            }

            // Label aligned left
            page.drawText(totalItem.label, {
                x: margin.left + contentWidth - 175,
                y: isLast ? totalsY - 1 : totalsY,
                size: isLast ? fontSize.md : fontSize.base,
                font: boldFont,
                color: isLast ? colors.highlight : colors.primary
            });

            // Value aligned right
            const valueText = `Rs.${totalItem.value.toFixed(2)}`;
            page.drawText(valueText, {
                x: margin.left + contentWidth - 20 - (valueText.length * (isLast ? 5 : 5)), // Right aligned
                y: isLast ? totalsY - 1 : totalsY,
                size: isLast ? fontSize.md : fontSize.base,
                font: isLast ? boldFont : regularFont,
                color: isLast ? colors.highlight : colors.primary
            });

            totalsY -= 20;
        });

        // Payment Details - positioned properly below totals with gradient
        const paymentY = tableBottom - 90;

        // Premium gradient background for payment details
        for (let i = 0; i < 80; i++) {

            const endColor = colors.paymentBg;


            page.drawLine({
                start: { x: margin.left, y: paymentY + i },
                end: { x: margin.left + contentWidth / 2, y: paymentY + i },
                thickness: 1,
                color: endColor
            });
        }

        // Elegant border
        page.drawRectangle({
            x: margin.left,
            y: paymentY,
            width: contentWidth / 2,
            height: 80,
            borderColor: colors.borderColor,
            borderWidth: 1,
            color: undefined
        });

        // Accent border at top of payment details
        page.drawRectangle({
            x: margin.left,
            y: paymentY + 80,
            width: contentWidth / 2,
            height: 3,
            color: colors.primary
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
            `IFSC Code: ${invoice.bankDetails?.ifsc || "ABCD0123456"}`,

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

        // Terms and conditions section - properly spaced with elegant styling
        const termsY = paymentY - 40;

        // Section title with accent line
        page.drawText("Terms & Conditions:", {
            x: margin.left,
            y: termsY,
            size: fontSize.md,
            font: boldFont,
            color: colors.primary
        });

        page.drawLine({
            start: { x: margin.left, y: termsY - 5 },
            end: { x: margin.left + 140, y: termsY - 5 },
            thickness: 1,
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

        // Notes section - with better styling
        currentY -= 10;

        // Section title with accent line
        page.drawText("Notes:", {
            x: margin.left,
            y: currentY,
            size: fontSize.md,
            font: boldFont,
            color: colors.primary
        });

        page.drawLine({
            start: { x: margin.left, y: currentY - 5 },
            end: { x: margin.left + 50, y: currentY - 5 },
            thickness: 1,
            color: colors.primary
        });

        // Notes with premium gradient background
        const notesContent = invoice.notes || "Thank you for your business. We appreciate your prompt payment.";

        for (let i = 0; i < 25; i++) {

            const endColor = rgb(0.96, 0.96, 0.99);



            page.drawLine({
                start: { x: margin.left, y: currentY - 30 + i },
                end: { x: margin.left + contentWidth, y: currentY - 30 + i },
                thickness: 1,
                color: endColor
            });
        }

        // Border for notes
        page.drawRectangle({
            x: margin.left,
            y: currentY - 30,
            width: contentWidth,
            height: 25,
            borderColor: colors.borderColor,
            borderWidth: 0.5,
            color: undefined
        });

        page.drawText(notesContent, {
            x: margin.left + 10,
            y: currentY - 15,
            size: fontSize.base,
            font: regularFont,
            color: colors.secondary
        });

        // Signature area - properly aligned with premium styling
        currentY -= 50;
        page.drawText("Authorized Signature:", {
            x: width - margin.right - 150,
            y: currentY,
            size: fontSize.base,
            font: boldFont,
            color: colors.primary
        });

        // Signature line with styled end caps
        page.drawLine({
            start: { x: width - margin.right - 150, y: currentY - 25 },
            end: { x: width - margin.right, y: currentY - 25 },
            thickness: 1,
            color: colors.primary
        });

        // Dot end caps on signature line
        page.drawCircle({
            x: width - margin.right - 150,
            y: currentY - 25,
            size: 1.5,
            color: colors.primary
        });

        page.drawCircle({
            x: width - margin.right,
            y: currentY - 25,
            size: 1.5,
            color: colors.primary
        });

        // Footer with gradient background
        for (let i = 0; i < 50; i++) {

            const endColor = colors.premiumGradientStart;



            page.drawLine({
                start: { x: 0, y: i },
                end: { x: width, y: i },
                thickness: 1,
                color: endColor
            });
        }

        // Decorative accent line at bottom
        page.drawRectangle({
            x: 0,
            y: 0,
            width: width,
            height: 5,
            color: colors.primary
        });

        page.drawText("Thank you for your business!", {
            x: width / 2 - 75,
            y: 30,
            size: fontSize.base,
            font: boldFont,
            color: colors.primary
        });

        // Subtle separator in footer
        page.drawLine({
            start: { x: width / 2 - 100, y: 25 },
            end: { x: width / 2 + 100, y: 25 },
            thickness: 0.5,
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
