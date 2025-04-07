/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"
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
        const mediumFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

        // Modern color scheme
        const colors = {
            primary: rgb(0.17254901960784313, 0.6745098039215687, 0.40784313725490196),    // Professional green color
            secondary: rgb(0.2, 0.2, 0.2),        // Dark gray
            accent: rgb(0.95, 0.95, 0.95),        // Light gray
            text: rgb(0.2, 0.2, 0.2),             // Main text
            success: rgb(0.176, 0.706, 0.176),     // Green for totals
            danger: rgb(0.95, 0.15, 0.15),     // Red for totals
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
            { text: "Gliggo Technologies India Pvt. Ltd.", size: fontSize.large },
            { text: "57/1-A, VOC Nagar 2nd Cross Street,", size: fontSize.base },
            { text: "Anna Nagar East, Chennai - 600 102,Tamil Nadu,India.", size: fontSize.base },
            { text: "Phone: +91 72006 58885 | Email: furqaan.hussain@gliggo.com", size: fontSize.base },
            {
                text: "Web: www.gliggo.com", size: fontSize.base
            }

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

        yPosition -= 90; // Adjusted position after company info

        // Invoice title moved below company details
        const invoiceTitle = "TAX INVOICE";
        const titleWidth = boldFont.widthOfTextAtSize(invoiceTitle, fontSize.medium);
        page.drawText(invoiceTitle, {
            x: (width - titleWidth) / 2,
            y: yPosition,
            size: fontSize.medium,
            font: boldFont,
            color: colors.primary
        });

        // Add underline to the INVOICE title
        const underlineExtension = 2.5; // Slight extension beyond text on each side
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

        yPosition -= 29; // ; // Continue to adjust vertical position after the title and underline
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


        // Only add phone if it exists
        if (invoice.clientPhone1 && invoice.clientPhone1.trim() && invoice.clientEmail && invoice.clientEmail.trim()) {
            clientDetails.push(`Phone: ${invoice.clientPhone1} ${invoice.clientPhone2 ? ` ${invoice.clientPhone2}` : ''} | Email: ${invoice.clientEmail}`);
        }
        clientDetails.push(`Place of Supply: Tamil Nadu.`);





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



        yPosition -= 127; // Adjusted position after client & company address

        // Enhanced Table Constants
        const tableConfig = {
            headerHeight: 18,
            rowHeight: 20,
            columnWidths: {
                description: contentWidth * 0.6,
                total: contentWidth * 0.4
            },
            padding: {
                vertical: 8,
                horizontal: 12
            }
        };


        // ====== Items Table ======
        const tableStartY = yPosition;
        const rowCount = invoice.invoiceContents.length;
        const totalsRowCount = 3; // Subtotal, Tax, Total
        const totalTableHeight =
            tableConfig.headerHeight +
            (rowCount * tableConfig.rowHeight) +
            (totalsRowCount * tableConfig.rowHeight) - 18;

        page.drawRectangle({
            x: margin.left,
            y: tableStartY - totalTableHeight,
            width: contentWidth,
            height: totalTableHeight,
            borderColor: colors.primary,
            borderWidth: 1,
        });

        // Remove main container border drawing (we'll handle borders per-row)

        // Table Header
        page.drawRectangle({
            x: margin.left,
            y: tableStartY,
            width: contentWidth,
            height: tableConfig.headerHeight,
            color: colors.primary,
            opacity: 1,
            borderColor: colors.primary,
            borderWidth: 1,
        });
        page.drawRectangle({
            x: margin.left,
            y: tableStartY,
            width: contentWidth,
            height: tableConfig.headerHeight,
            color: colors.primary
        });

        // Draw column headers
        // Column Headers with perfect alignment
        ["DESCRIPTION", "AMOUNT (INR)"].forEach((header, index) => {
            const isAmountColumn = index === 1;
            const xPosition = margin.left + (isAmountColumn ? tableConfig.columnWidths.description : 0);

            page.drawText(header, {
                x: isAmountColumn
                    ? xPosition + tableConfig.columnWidths.total - boldFont.widthOfTextAtSize(header, fontSize.base) - tableConfig.padding.horizontal
                    : xPosition + tableConfig.padding.horizontal + 130,
                y: tableStartY + (tableConfig.headerHeight - fontSize.base) / 2 + 1,
                size: fontSize.base,
                font: boldFont,
                color: rgb(1, 1, 1),
                opacity: 0.95
            });
        });


        // Table Rows with full borders
        const currentY = tableStartY
        invoice.invoiceContents.forEach((item: any, index: number) => {
            const rowY = currentY - (index * tableConfig.rowHeight);

            // Zebra striping
            if (index % 2 === 0) {
                page.drawRectangle({
                    x: margin.left + 2,
                    y: rowY - tableConfig.rowHeight,
                    width: contentWidth - 4,
                    height: tableConfig.rowHeight,
                    color: colors.accent,
                    opacity: 0.6
                });
            }

            // Vertical line between columns
            page.drawLine({
                start: { x: margin.left + tableConfig.columnWidths.description + 50, y: rowY },
                end: { x: margin.left + tableConfig.columnWidths.description + 50, y: rowY - tableConfig.rowHeight },
                thickness: 0.8,
                color: colors.primary,
                opacity: 1
            });

            // Horizontal lines (top border for each row)
            page.drawLine({
                start: { x: margin.left, y: rowY },
                end: { x: margin.left + contentWidth, y: rowY },
                thickness: 0.5,
                color: colors.primary,
                opacity: 1
            });

            // Content
            const description = truncateText(item.description, 65);
            const total = `${parseFloat(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

            // Description
            page.drawText(description, {
                x: margin.left + tableConfig.padding.horizontal - 8,
                y: rowY - tableConfig.rowHeight + (tableConfig.rowHeight - fontSize.base) / 2 + 2,
                size: fontSize.base,
                font: regularFont,
                color: colors.text
            });

            // Amount (right-aligned)
            const amountX = margin.left + tableConfig.columnWidths.description +
                tableConfig.columnWidths.total -
                regularFont.widthOfTextAtSize(total, fontSize.base) -
                tableConfig.padding.horizontal;

            page.drawText(total, {
                x: amountX,
                y: rowY - tableConfig.rowHeight + (tableConfig.rowHeight - fontSize.base) / 2 + 2,
                size: fontSize.base,
                font: regularFont,
                color: colors.text
            });

            // Draw bottom border for last row
            if (index === rowCount - 1) {
                page.drawLine({
                    start: { x: margin.left, y: rowY - tableConfig.rowHeight },
                    end: { x: margin.left + contentWidth, y: rowY - tableConfig.rowHeight },
                    thickness: 0.8,
                    color: colors.primary,
                    opacity: 1
                });
            }
        });






        let totalsStartY = currentY - (rowCount * tableConfig.rowHeight) - 20;
        const totals = [
            { label: "Subtotal : ", value: invoice.subtotal },
            { label: `Tax (${invoice.taxRate}%) : `, value: invoice.taxAmount },
            { label: "Total : ", value: Math.round(invoice?.invoiceTotal ?? 0) }
        ];

        totals.forEach((total, index) => {
            const rowY = totalsStartY - (index * tableConfig.rowHeight);

            // Horizontal line above total row
            if (index === totals.length - 1) {
                page.drawLine({
                    start: { x: margin.left + 347, y: rowY + tableConfig.rowHeight },
                    end: { x: margin.left + contentWidth, y: rowY + tableConfig.rowHeight },
                    thickness: 0.8,
                    color: colors.primary
                });
            }

            // Vertical line between columns
            page.drawLine({
                start: { x: margin.left + tableConfig.columnWidths.description + 50, y: rowY + tableConfig.rowHeight },
                end: { x: margin.left + tableConfig.columnWidths.description + 50, y: rowY },
                thickness: 0.8,
                color: colors.primary,
                opacity: 1
            });



            // Total content
            const isTotal = index === totals.length - 1;
            const labelX = margin.left + tableConfig.padding.horizontal;
            const valueX = margin.left + tableConfig.columnWidths.description +
                tableConfig.columnWidths.total -
                regularFont.widthOfTextAtSize(total.value.toFixed(2), fontSize.base) -
                tableConfig.padding.horizontal - 15;

            page.drawText(total.label, {
                x: labelX + 340,
                y: rowY + (tableConfig.rowHeight - fontSize.base) / 2,
                size: fontSize.base,
                font: isTotal ? boldFont : regularFont,
                color: isTotal ? colors.success : colors.text
            });


            page.drawText(`${total.value.toFixed(2)}`, {
                x: valueX + 15,
                y: rowY + (tableConfig.rowHeight - fontSize.base) / 2,
                size: fontSize.base,
                font: isTotal ? boldFont : regularFont,
                color: isTotal ? colors.success : colors.text
            });
        });
        // Amount in Words
        try {
            const amountWords = "INR " + toWords(invoice.invoiceTotal)
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ') + " Only."

            // Fixed width constraints
            const maxWidth = 260; // Adjust based on your layout
            const lineHeight = 15;
            const startX = margin.left + 8;
            let currentY = totalsStartY - 0;

            // Split into multiple lines if needed`
            const words = amountWords.split(' ');
            let currentLine: string[] = [];

            // First line with "Amount in Words:" label
            page.drawText("Amount in words:", {
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
            totalsStartY = currentY - 20;

        } catch (error) {
            console.error("Amount words conversion error:", error);
        }

        // Payment Details Section with compact layout
        const paymentY = totalsStartY - 115; // Reduced distance from totals section

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
            { label: "Account Name:", value: process.env.ACCOUNT_NAME || "ABC Bank" },
            { label: "Account Number:", value: process.env.ACCOUNT_NUMBER || "1234567890" },
            { label: "Bank Name:", value: process.env.BANK_NAME || "ABC Bank" },
            { label: "Branch:", value: process.env.BRANCH_NAME || "XYZ Branch" },
            { label: "IFSC Code:", value: process.env.IFSC_CODE || "ABCD0123456" },
        ];

        // Column positions - reduced spacing
        const labelX = margin.left + leftPadding;
        const valueX = margin.left + 110; // Reduced from 150

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
        const notesWidth = contentWidth * 0.65; // 70% of available width
        const signatureWidth = contentWidth * 0.35; // 30% of available width
        const noteText = "Note:";
        const noteTextWidth = boldFont.widthOfTextAtSize(noteText, fontSize.medium);
        // NOTES SECTION (Left 70%)
        // Draw "Note:" text
        page.drawText(noteText, {
            x: margin.left,
            y: notesY,
            size: fontSize.medium,
            font: boldFont,
            color: colors.danger
        });

        // Draw underline specifically for "Note:" text
        page.drawLine({
            start: { x: margin.left, y: notesY - 4 },  // 4 units below text baseline
            end: { x: margin.left + noteTextWidth, y: notesY - 4 },
            thickness: 1.2,
            color: colors.danger
        });



        // Notes content (with width restriction to stay in 70% area)
        const notesContent = invoice.notes || [
            `1. Our PAN No: ${process.env.PAN_NUMBER || "ABC123456789"}`,
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
                    const numberPrefixWidth = regularFont.widthOfTextAtSize(numberPrefix, fontSize.small);

                    // Draw the number prefix
                    page.drawText(numberPrefix, {
                        x: margin.left,
                        y: currentY,
                        size: fontSize.small,
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
                            const lineWidth = regularFont.widthOfTextAtSize(testLine, fontSize.small);

                            if (lineWidth > availableWidth) {
                                // Draw current line and start a new one
                                const xPosition = isFirstLine
                                    ? margin.left + numberPrefixWidth
                                    : margin.left + numberPrefixWidth; // Both indented

                                page.drawText(currentLine.join(' '), {
                                    x: xPosition,
                                    y: currentY,
                                    size: fontSize.small,
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
                            size: fontSize.small,
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
                        const lineWidth = regularFont.widthOfTextAtSize(testLine, fontSize.small);

                        if (lineWidth <= maxNoteWidth) {
                            currentLine.push(word);
                        } else {
                            // Draw current line and start a new one
                            page.drawText(currentLine.join(' '), {
                                x: margin.left,
                                y: currentY,
                                size: fontSize.small,
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
                            size: fontSize.small,
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
        const signatureText = "For Gliggo Technologies India Pvt Ltd.";
        const signatureTextWidth = regularFont.widthOfTextAtSize(signatureText, fontSize.base);
        page.drawText(signatureText, {
            x: signatureCenterX - (signatureTextWidth / 2), // Center text
            y: signatureLineY + 20,
            size: fontSize.base,
            font: regularFont,
            color: colors.text
        });
        const signatureText1 = "Authorized Signature";
        const signatureTextWidth1 = regularFont.widthOfTextAtSize(signatureText1, fontSize.base);
        page.drawText(signatureText1, {
            x: signatureCenterX - (signatureTextWidth1 / 2), // Center text
            y: signatureLineY - 32,
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
            y: 23 + footerBottomPadding, // Using the renamed variable
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


const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.substring(0, maxLength - 3)}...` : text;
