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
        const mediumFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

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
            top: 40,
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

        // Header Section with logo placeholder - moved to left side
        // const headerY = yPosition;
        // page.drawRectangle({
        //     x: margin.left,
        //     y: headerY + 25,
        //     width: 40,
        //     height: 50,
        //     color: colors.primary,
        //     borderColor: colors.primary,
        //     borderWidth: 1
        // });

        // Company Info with modern layout - taking 75% width
        const companyInfoWidth = contentWidth * 0.75;
        const companyInfo = [
            { text: "Gliggo Technologies India Pvt Ltd", size: fontSize.large },
            { text: "57/1-A VOC Nagar 2nd Cross Street,", size: fontSize.base },
            { text: "Anna Nagar East, Chennai - 600 102,Tamil Nadu,India.", size: fontSize.base },
            { text: "Phone: +91 72006 58885 | Email: furqaan.hussain@gliggo.com", size: fontSize.base },
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

        // Invoice number and issue date on right side - taking 25% width
        const invoiceDetailX = margin.left + companyInfoWidth + 20;
        const invoiceDetailsRight = [
            { label: "Invoice Number", value: invoice.invoiceNumber },
            { label: "Issue Date", value: new Date().toLocaleDateString() }
        ];

        invoiceDetailsRight.forEach((detail, index) => {
            // Label
            page.drawText(detail.label.toUpperCase(), {
                x: invoiceDetailX,
                y: yPosition - (index * 32),
                size: fontSize.small,
                font: regularFont,
                color: colors.secondary
            });

            // Value
            page.drawText(detail.value, {
                x: invoiceDetailX,
                y: yPosition - 15 - (index * 32),
                size: fontSize.base,
                font: boldFont,
                color: colors.text
            });
        });

        yPosition -= 83; // Adjusted position after company info

        // Invoice title moved below company details
        const invoiceTitle = "INVOICE";
        const titleWidth = boldFont.widthOfTextAtSize(invoiceTitle, fontSize.medium);
        page.drawText(invoiceTitle, {
            x: (width - titleWidth) / 2,
            y: yPosition,
            size: fontSize.medium,
            font: boldFont,
            color: colors.primary
        });

        // Add underline to the INVOICE title
        const underlineExtension = 8; // Slight extension beyond text on each side
        const underlineThickness = 1.5; // Slightly thicker than default but not too much
        const underlineGap = 5; // Space between text and underline

        page.drawLine({
            start: {
                x: (width - titleWidth) / 2 - underlineExtension,
                y: yPosition - underlineGap
            },
            end: {
                x: (width - titleWidth) / 2 + titleWidth + underlineExtension,
                y: yPosition - underlineGap
            },
            thickness: underlineThickness,
            color: colors.primary
        });

        yPosition -= 23; // Continue to adjust vertical position after the title and underline
        // position for next element

        // Client & Company Address Section
        // Client & Company Address Section with handling for missing data
        const addressColumns = [
            {
                title: "BILL TO",
                content: [] as string[]
            },
        ];

        // Build content array only with available data
        const clientDetails = [];

        // Only add client name if it exists
        if (invoice.clientName && invoice.clientName.trim()) {
            clientDetails.push(`${invoice.clientName},`);
        }

        // Only add company name if it exists
        if (invoice.clientCompanyName && invoice.clientCompanyName.trim()) {
            clientDetails.push(`${invoice.clientCompanyName},`);
        }

        // Only add street if it exists
        if (invoice.clientStreetName && invoice.clientStreetName.trim()) {
            clientDetails.push(`${invoice.clientStreetName},`);
        }

        // Combine city, state, zip if they exist
        const addressParts = [];
        if (invoice.clientCity && invoice.clientCity.trim()) addressParts.push(invoice.clientCity);
        if (invoice.clientZip && invoice.clientZip.trim()) addressParts.push(`- ${invoice.clientZip}`);
        if (invoice.clientState && invoice.clientState.trim()) addressParts.push(invoice.clientState);
        if (invoice.clientCountry && invoice.clientCountry.trim()) addressParts.push(invoice.clientCountry);

        if (addressParts.length > 0) {
            clientDetails.push(`${addressParts.join(', ')},`);
        }

        // Only add country if it exists
        // if (invoice.clientCountry && invoice.clientCountry.trim()) {
        //     clientDetails.push(`${invoice.clientCountry}.`);
        // }

        // Only add phone if it exists
        if (invoice.clientPhone && invoice.clientPhone.trim() && invoice.clientEmail && invoice.clientEmail.trim()) {
            clientDetails.push(`Phone: ${invoice.clientPhone} | Email: ${invoice.clientEmail}`);
        }




        // Assign filtered content to addressColumns
        addressColumns[0].content = clientDetails;

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

        yPosition -= 102;

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
        ["DESCRIPTION", "AMOUNT"].forEach((header, index) => {
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

        // Table Footer with right alignment
        let totalsY = currentY - 6.5;
        const totals = [
            { label: "Subtotal", value: invoice.subtotal },
            { label: `Tax (${invoice.taxRate}%)`, value: invoice.taxAmount },
            { label: "Total", value: Math.round(invoice?.invoiceTotal ?? 0) }

        ];

        // Right margin for text (padding from edge)
        const textRightPadding = 10;

        // In the totals.forEach block with right alignment:
        totals.forEach((total, index) => {
            const yPos = totalsY - (index * 20);

            // Calculate text widths for proper alignment
            const labelText = total.label;
            const valueText = `${total.value.toFixed(2)}`;
            const labelWidth = boldFont.widthOfTextAtSize(labelText, fontSize.base);
            const valueWidth = boldFont.widthOfTextAtSize(valueText, fontSize.base);

            // Right edge of the label column
            const labelColumnRightEdge = margin.left + columnWidths.description + columnWidths.total / 2;

            // Right edge of the value column
            const valueColumnRightEdge = margin.left + columnWidths.description + columnWidths.total;

            // Label (right-aligned in its area)
            page.drawText(labelText, {
                x: labelColumnRightEdge - labelWidth - textRightPadding,
                y: yPos,
                size: fontSize.base,
                font: boldFont,
                color: colors.text
            });

            // Value (right-aligned in its area)
            page.drawText(valueText, {
                x: valueColumnRightEdge - valueWidth - textRightPadding,
                y: yPos,
                size: fontSize.base,
                font: boldFont,
                color: colors.success
            });

            // Add line between tax and total
            if (index === 1) { // Index 1 is the tax entry
                const lineY = yPos - 8; // Adjust this value to position the line
                page.drawLine({
                    start: {
                        x: labelColumnRightEdge - labelWidth - textRightPadding - 5,
                        y: lineY
                    }, // Start before the label
                    end: {
                        x: valueColumnRightEdge - textRightPadding + 5,
                        y: lineY
                    }, // End after the value
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
                // Use boldFont for width calculation to maintain consistent wrapping
                const testWidth = boldFont.widthOfTextAtSize(testLine, fontSize.base);

                if (testWidth > maxWidth) {
                    // Draw current line with bold font
                    page.drawText(currentLine.join(' '), {
                        x: startX,
                        y: currentY,
                        size: fontSize.base,
                        font: boldFont,  // Changed from regularFont to boldFont
                        color: colors.secondary
                    });
                    currentY -= lineHeight;
                    currentLine = [word];
                } else {
                    currentLine.push(word);
                }
            });

            // Don't forget to update the remaining text rendering too
            // Draw remaining text with bold font
            if (currentLine.length > 0) {
                page.drawText(currentLine.join(' '), {
                    x: startX,
                    y: currentY,
                    size: fontSize.base,
                    font: boldFont,  // Changed from regularFont to boldFont
                    color: colors.secondary
                });
                currentY -= lineHeight;
            }

            // Adjust totals position based on lines used
            totalsY = currentY - 20;

        } catch (error) {
            console.error("Amount words conversion error:", error);
        }

        // Payment Details Section with compact layout
        const paymentY = totalsY - 115; // Reduced distance from totals section

        // Background rectangle - reduced height
        page.drawRectangle({
            x: margin.left,
            y: paymentY,
            width: contentWidth,
            height: 110, // Reduced from 135
            color: colors.accent,
            borderColor: colors.accent,
            borderWidth: 1
        });

        // Set more compact padding for content inside the rectangle
        const topPadding = 15; // Reduced from 20
        const leftPadding = 8; // Reduced from 10

        // Header (using bold font) - positioned at the top of the rectangle with padding
        const headerText = "Payment Instructions / Bank Account Details:";
        page.drawText(headerText, {
            x: margin.left + leftPadding,
            y: paymentY + 110 - topPadding, // Adjusted for new height
            size: fontSize.small, // Reduced from base
            font: boldFont,
            color: colors.text
        });

        // Payment details with separated labels and values
        const paymentInfo = [
            { label: "A/C Name:", value: process.env.ACCOUNT_NAME || "ABC Bank" },
            { label: "Account Number:", value: process.env.ACCOUNT_NUMBER || "1234567890" },
            { label: "Bank Name:", value: process.env.BANK_NAME || "ABC Bank" },
            { label: "Branch:", value: process.env.BRANCH_NAME || "XYZ Branch" },
            { label: "IFSC Code:", value: process.env.IFSC_CODE || "ABCD0123456" },
        ];

        // Column positions - reduced spacing
        const labelX = margin.left + leftPadding;
        const valueX = margin.left + 130; // Reduced from 150

        // Line spacing - more compact
        const lineHeight = 14; // Reduced from 16
        const headerOffset = 18; // Reduced from 23

        // Draw each payment detail line, ensuring they stay inside the rectangle
        paymentInfo.forEach((detail, index) => {
            // Calculate position from the top of the rectangle
            const yPosition = paymentY + 110 - topPadding - headerOffset - (index * lineHeight);

            // Draw label with regular font
            page.drawText(detail.label, {
                x: labelX,
                y: yPosition,
                size: fontSize.small,
                font: regularFont,
                color: colors.text
            });

            // Draw value with medium font (if available) or bold font as fallback
            page.drawText(detail.value, {
                x: valueX,
                y: yPosition,
                size: fontSize.small,
                font: mediumFont || boldFont, // Use mediumFont if available, otherwise boldFont
                color: colors.text
            });
        });

        // Safety check to ensure content fits
        const lastItemY = paymentY + 110 - topPadding - headerOffset - ((paymentInfo.length - 1) * lineHeight);
        const bottomPadding = 5; // Reduced from 7
        if (lastItemY < (paymentY + bottomPadding)) {
            console.warn("Payment details content may overflow the box. Consider increasing box height or reducing content.");
        }


        // Notes and Signature Section with 75/25 width split
        const notesY = paymentY - 18;

        // Calculate widths for the 75/25 split
        const notesWidth = contentWidth * 0.70; // 70% of available width
        const signatureWidth = contentWidth * 0.30; // 30% of available width

        // NOTES SECTION (Left 70%)
        // Draw notes title
        page.drawText("Notes:", {
            x: margin.left,
            y: notesY,
            size: fontSize.medium,
            font: boldFont,
            color: colors.primary
        });

        // Notes content (with width restriction to stay in 70% area)
        const notesContent = invoice.notes || [
            `1. PAN No: ${process.env.PAN_NUMBER || "ABC123456789"}`,
            "2. Payment can be made through Cheque/Neft in favour of Gliggo Technologies India Pvt Ltd.",
            "3. Kindly keep us informed about the remittance (online payment) by mail to furqaan.hussain@gliggo.com."
        ];

        // Helper function to wrap text within the notes section width
        function drawWrappedNotes(notes: string[], startY: number) {
            let currentY = startY;
            const maxNoteWidth = notesWidth - 20; // Allow some padding

            notes.forEach((noteText: string) => {
                // Check if this is a numbered note
                const numberedMatch = noteText.match(/^(\d+\.\s*)(.*)/);

                if (numberedMatch) {
                    // This is a numbered item
                    const numberPrefix = numberedMatch[1]; // "1. "
                    const restOfText = numberedMatch[2];  // The text after the number

                    // Calculate the width of the number prefix
                    const numberPrefixWidth = regularFont.widthOfTextAtSize(numberPrefix, fontSize.base);

                    // Draw the number prefix
                    page.drawText(numberPrefix, {
                        x: margin.left,
                        y: currentY,
                        size: fontSize.base,
                        font: regularFont,
                        color: colors.text
                    });

                    // Handle the rest of the text with proper indentation
                    const words = restOfText.split(' ');
                    let currentLine = [];
                    let isFirstLine = true;

                    // Process each word
                    for (let i = 0; i < words.length; i++) {
                        const word = words[i];
                        currentLine.push(word);

                        // Check if adding another word would exceed the width
                        if (i < words.length - 1) {
                            const nextWord = words[i + 1];
                            const testLine = [...currentLine, nextWord].join(' ');
                            const availableWidth = isFirstLine
                                ? maxNoteWidth - numberPrefixWidth
                                : maxNoteWidth;
                            const lineWidth = regularFont.widthOfTextAtSize(testLine, fontSize.base);

                            if (lineWidth > availableWidth) {
                                // Draw current line and start a new one
                                const xPosition = isFirstLine
                                    ? margin.left + numberPrefixWidth
                                    : margin.left + numberPrefixWidth; // Both indented

                                page.drawText(currentLine.join(' '), {
                                    x: xPosition,
                                    y: currentY,
                                    size: fontSize.base,
                                    font: regularFont,
                                    color: colors.text
                                });

                                currentY -= 13; // Move to next line
                                currentLine = [];
                                isFirstLine = false;
                            }
                        }
                    }

                    // Draw the last line of this numbered item
                    if (currentLine.length > 0) {
                        const xPosition = isFirstLine
                            ? margin.left + numberPrefixWidth
                            : margin.left + numberPrefixWidth;

                        page.drawText(currentLine.join(' '), {
                            x: xPosition,
                            y: currentY,
                            size: fontSize.base,
                            font: regularFont,
                            color: colors.text
                        });

                        currentY -= 16; // Extra space between notes
                    }
                } else {
                    // Regular non-numbered text - use original logic
                    const words = noteText.split(' ');
                    let currentLine = [words[0]];

                    // Process each word
                    for (let i = 1; i < words.length; i++) {
                        const word = words[i];
                        const testLine = [...currentLine, word].join(' ');
                        const lineWidth = regularFont.widthOfTextAtSize(testLine, fontSize.base);

                        if (lineWidth <= maxNoteWidth) {
                            currentLine.push(word);
                        } else {
                            // Draw current line and start a new one
                            page.drawText(currentLine.join(' '), {
                                x: margin.left,
                                y: currentY,
                                size: fontSize.base,
                                font: regularFont,
                                color: colors.text
                            });

                            currentY -= 13; // Move to next line
                            currentLine = [word];
                        }
                    }

                    // Draw the last line of this note
                    if (currentLine.length > 0) {
                        page.drawText(currentLine.join(' '), {
                            x: margin.left + 10,
                            y: currentY,
                            size: fontSize.base,
                            font: regularFont,
                            color: colors.text
                        });

                        currentY -= 16; // Extra space between notes
                    }
                }
            });

            return currentY; // Return the final Y position
        }

        // Draw the notes with improved text wrapping
        drawWrappedNotes(notesContent, notesY - 20);


        // SIGNATURE SECTION (Right 25%)
        const signatureStartX = margin.left + notesWidth; // Start after notes section
        const signatureCenterX = signatureStartX + (signatureWidth / 2); // Center of signature section

        // Signature Line
        const signatureLineY = notesY - 40;
        page.drawLine({
            start: { x: signatureStartX + 10, y: signatureLineY - 15 },
            end: { x: signatureStartX + signatureWidth - 10, y: signatureLineY - 15 },
            thickness: 1,
            color: colors.text
        });

        // Signature Text (Centered in its column)
        const signatureText = "Authorized Signature";
        const signatureTextWidth = regularFont.widthOfTextAtSize(signatureText, fontSize.base);
        page.drawText(signatureText, {
            x: signatureCenterX - (signatureTextWidth / 2), // Center text
            y: signatureLineY + 20,
            size: fontSize.base,
            font: regularFont,
            color: colors.text
        });


        // Footer with full width background and centered text (with added bottom padding)
        // Text content to center
        const thankYouText = "Thank you for your business!";
        const companyInfoText = "Gliggo Technologies India Private Limited | www.gliggo.com | info@gliggo.com";

        // Calculate text widths for centering
        const thankYouTextWidth = boldFont.widthOfTextAtSize(thankYouText, fontSize.medium);
        const companyInfoTextWidth = regularFont.widthOfTextAtSize(companyInfoText, fontSize.small);

        // Use a different variable name to avoid redeclaration
        const footerBottomPadding = 1; // Renamed to avoid conflict

        // First line background (full width)
        page.drawRectangle({
            x: 0,                       // Start at the left edge of the page
            y: 35 + footerBottomPadding, // Using the renamed variable
            width: width,               // Full page width
            height: 25,                 // Height slightly larger than font size for padding
            color: colors.primary,      // Using the primary color for background
            borderWidth: 0              // No border
        });

        // First line text (in white, centered)
        page.drawText(thankYouText, {
            x: (width - thankYouTextWidth) / 2,  // Center the text
            y: 40 + footerBottomPadding, // Using the renamed variable
            size: fontSize.medium,
            font: boldFont,
            color: rgb(1, 1, 1)         // White color (in pdf-lib, white is rgb(1,1,1))
        });

        // Second line background (full width)
        page.drawRectangle({
            x: 0,                       // Start at the left edge of the page
            y: 15 + footerBottomPadding, // Using the renamed variable
            width: width,               // Full page width
            height: 20,                 // Height slightly larger than font size
            color: colors.primary,      // Using the primary color for background
            borderWidth: 0              // No border
        });

        // Second line text (in white, centered)
        page.drawText(companyInfoText, {
            x: (width - companyInfoTextWidth) / 2,  // Center the text
            y: 20 + footerBottomPadding, // Using the renamed variable
            size: fontSize.small,
            font: regularFont,
            color: rgb(1, 1, 1)         // White color
        });





        const pdfBuffer = await pdfDoc.save();
        return pdfBuffer;

    } catch (error) {
        console.error("PDF Generation Error:", error);
        throw error;
    }
}
