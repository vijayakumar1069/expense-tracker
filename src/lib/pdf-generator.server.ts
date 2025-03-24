import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Helper function to convert number to words
function numberToWords(num: number): string {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
        'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const dollars = Math.floor(num);
    const cents = Math.round((num - dollars) * 100);

    function convertLessThanThousand(n: number): string {
        if (n === 0) return '';

        if (n < 20) {
            return ones[n];
        } else if (n < 100) {
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '');
        } else {
            return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
        }
    }

    function convert(n: number): string {
        if (n === 0) return 'zero';

        let result = '';

        if (n >= 1000000000) {
            result += convertLessThanThousand(Math.floor(n / 1000000000)) + ' billion ';
            n %= 1000000000;
        }

        if (n >= 1000000) {
            result += convertLessThanThousand(Math.floor(n / 1000000)) + ' million ';
            n %= 1000000;
        }

        if (n >= 1000) {
            result += convertLessThanThousand(Math.floor(n / 1000)) + ' thousand ';
            n %= 1000;
        }

        if (n > 0) {
            result += convertLessThanThousand(n);
        }

        return result.trim();
    }

    const dollarsText = convert(dollars);
    const centsText = cents > 0 ? ' and ' + convert(cents) + ' cents' : '';

    return dollarsText.charAt(0).toUpperCase() + dollarsText.slice(1) + ' dollars' + centsText;
}

// Function to draw a rounded rectangle since PDF-Lib doesn't natively support it
const drawRoundedRect = (page: any, x: number, y: number, width: number, height: number, radius: number, color: any, borderColor?: any, borderWidth?: number) => {
    // Draw the main rectangle (slightly smaller to account for the rounded corners)
    page.drawRectangle({
        x: x + radius,
        y: y + radius,
        width: width - 2 * radius,
        height: height - 2 * radius,
        color,
        borderColor,
        borderWidth
    });

    // Draw the left and right rectangles
    page.drawRectangle({
        x: x,
        y: y + radius,
        width: radius,
        height: height - 2 * radius,
        color,
        borderColor,
        borderWidth
    });

    page.drawRectangle({
        x: x + width - radius,
        y: y + radius,
        width: radius,
        height: height - 2 * radius,
        color,
        borderColor,
        borderWidth
    });

    // Draw the top and bottom rectangles
    page.drawRectangle({
        x: x + radius,
        y: y,
        width: width - 2 * radius,
        height: radius,
        color,
        borderColor,
        borderWidth
    });

    page.drawRectangle({
        x: x + radius,
        y: y + height - radius,
        width: width - 2 * radius,
        height: radius,
        color,
        borderColor,
        borderWidth
    });

    // Draw the four quarter-circles at the corners
    // Top-left
    page.drawCircle({
        x: x + radius,
        y: y + radius,
        size: radius,
        color
    });

    // Top-right
    page.drawCircle({
        x: x + width - radius,
        y: y + radius,
        size: radius,
        color
    });

    // Bottom-left
    page.drawCircle({
        x: x + radius,
        y: y + height - radius,
        size: radius,
        color
    });

    // Bottom-right
    page.drawCircle({
        x: x + width - radius,
        y: y + height - radius,
        size: radius,
        color
    });
};

// Main function to generate the PDF
export async function generateInvoicePDF(invoice: any) {
    try {
        // Create PDF document with A4 size for wider international acceptance
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const { width, height } = page.getSize();

        // Embed fonts
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

        // Elegant color palette
        const colors = {
            // Primary colors
            primary: { r: 0.22, g: 0.45, b: 0.67 },          // Professional blue (#3873AB)
            primaryLight: { r: 0.75, g: 0.85, b: 0.95 },      // Light blue (#BFD9F2)
            primaryDark: { r: 0.16, g: 0.33, b: 0.50 },       // Deep blue (#27547F)

            // Accent colors
            accent: { r: 0.84, g: 0.65, b: 0.16 },           // Gold (#D6A628)
            accentLight: { r: 0.98, g: 0.87, b: 0.60 },       // Light gold (#FADD99)

            // Background colors
            background: { r: 0.98, g: 0.98, b: 0.98 },        // Off-white (#FAFAFA)
            contentBg: { r: 1, g: 1, b: 1 },                  // Pure white

            // Text colors
            textDark: { r: 0.13, g: 0.13, b: 0.13 },          // Near black (#222222)
            textMedium: { r: 0.40, g: 0.40, b: 0.40 },        // Dark gray (#666666)
            textLight: { r: 0.60, g: 0.60, b: 0.60 },         // Medium gray (#999999)
            textWhite: { r: 1, g: 1, b: 1 },                  // White

            // Utility colors
            divider: { r: 0.85, g: 0.85, b: 0.85 },           // Light gray for dividers
            success: { r: 0.20, g: 0.67, b: 0.38 },           // Green for "Paid" status
            warning: { r: 0.95, g: 0.62, b: 0.06 },           // Orange for "Pending" status
            danger: { r: 0.90, g: 0.22, b: 0.27 },            // Red for "Overdue" status

            tableHeader: { r: 0.96, g: 0.97, b: 0.98 },       // Very light blue
            tableRowEven: { r: 1, g: 1, b: 1 },
            tableRowOdd: { r: 0.98, g: 0.98, b: 0.99 }
        };

        // Layout settings
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const contentWidth = width - margin.left - margin.right;
        const fontSize = {
            xxs: 7,
            xs: 8,
            sm: 9,
            base: 10,
            md: 12,
            lg: 14,
            xl: 18,
            xxl: 24,
            xxxl: 32
        };

        let y = height - margin.top;

        // =============================================
        // DOCUMENT BACKGROUND
        // =============================================
        // Full page background
        page.drawRectangle({
            x: 0,
            y: 0,
            width,
            height,
            color: rgb(colors.background.r, colors.background.g, colors.background.b)
        });

        // Luxury header pattern (diagonal stripes)
        const stripeSpacing = 20;
        const stripeWidth = 10;
        const stripeCount = Math.ceil(width / stripeSpacing) + 5; // Ensure coverage

        for (let i = 0; i < stripeCount; i++) {
            const startX = -100 + (i * stripeSpacing);
            page.drawLine({
                start: { x: startX, y: height },
                end: { x: startX + 200, y: height - 200 },
                thickness: stripeWidth,
                opacity: 0.04,
                color: rgb(colors.primary.r, colors.primary.g, colors.primary.b)
            });
        }

        // Page border - adds a professional touch
        page.drawRectangle({
            x: 15,
            y: 15,
            width: width - 30,
            height: height - 30,
            borderColor: rgb(colors.divider.r, colors.divider.g, colors.divider.b),
            borderWidth: 1,
            opacity: 0.5
        });

        // =============================================
        // HEADER SECTION
        // =============================================
        // Header container
        drawRoundedRect(
            page,
            margin.left,
            height - margin.top - 130,
            contentWidth,
            130,
            5,
            rgb(colors.contentBg.r, colors.contentBg.g, colors.contentBg.b),
            rgb(colors.divider.r, colors.divider.g, colors.divider.b),
            0.5
        );

        // Company logo placeholder with accent border
        drawRoundedRect(
            page,
            margin.left + 20,
            height - margin.top - 110,
            120,
            90,
            5,
            rgb(colors.primaryLight.r, colors.primaryLight.g, colors.primaryLight.b)
        );

        // Company initials (as a stand-in for logo)
        page.drawText("YC", {
            x: margin.left + 60,
            y: height - margin.top - 75,
            size: 36,
            font: boldFont,
            color: rgb(colors.primary.r, colors.primary.g, colors.primary.b)
        });

        // Company name
        page.drawText("YOUR COMPANY", {
            x: margin.left + 160,
            y: height - margin.top - 40,
            size: fontSize.xl,
            font: boldFont,
            color: rgb(colors.primary.r, colors.primary.g, colors.primary.b)
        });

        // Company tagline
        page.drawText("Premium Business Solutions", {
            x: margin.left + 160,
            y: height - margin.top - 60,
            size: fontSize.md,
            font: italicFont,
            color: rgb(colors.textMedium.r, colors.textMedium.g, colors.textMedium.b)
        });

        // Company contact info
        const companyInfo = [
            "www.yourcompany.com | contact@yourcompany.com",
            "123 Business Avenue, Suite 100, New York, NY 10001",
            "Tel: +1 (555) 123-4567 | Tax ID: 12-3456789"
        ];

        let infoY = height - margin.top - 85;
        for (const line of companyInfo) {
            page.drawText(line, {
                x: margin.left + 160,
                y: infoY,
                size: fontSize.sm,
                font: regularFont,
                color: rgb(colors.textMedium.r, colors.textMedium.g, colors.textMedium.b)
            });
            infoY -= 15;
        }

        // =============================================
        // INVOICE DETAILS SECTION
        // =============================================
        y = height - margin.top - 160;

        // INVOICE title with elegant underline
        page.drawText("INVOICE", {
            x: margin.left,
            y: y,
            size: fontSize.xxl,
            font: boldFont,
            color: rgb(colors.primary.r, colors.primary.g, colors.primary.b)
        });

        // Gold accent line
        page.drawLine({
            start: { x: margin.left, y: y - 10 },
            end: { x: margin.left + 100, y: y - 10 },
            thickness: 3,
            color: rgb(colors.accent.r, colors.accent.g, colors.accent.b)
        });

        // Invoice details box
        drawRoundedRect(
            page,
            width - margin.right - 250,
            y - 90,
            250,
            100,
            5,
            rgb(colors.primaryLight.r, colors.primaryLight.g, colors.primaryLight.b),
            rgb(colors.primary.r, colors.primary.g, colors.primary.b),
            0.5
        );

        // Invoice details
        const invoiceDetails = [
            { label: "Invoice Number:", value: invoice.invoiceNumber },
            { label: "Invoice Date:", value: new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
            { label: "Due Date:", value: new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
            { label: "Status:", value: "DUE" }
        ];

        let detailY = y - 20;
        for (const detail of invoiceDetails) {
            // Label
            page.drawText(detail.label, {
                x: width - margin.right - 230,
                y: detailY,
                size: fontSize.sm,
                font: boldFont,
                color: rgb(colors.primaryDark.r, colors.primaryDark.g, colors.primaryDark.b)
            });

            // Value
            page.drawText(detail.value, {
                x: width - margin.right - 130,
                y: detailY,
                size: fontSize.md,
                font: detail.label.includes("Status") ? boldFont : regularFont,
                color: detail.label.includes("Status")
                    ? rgb(colors.warning.r, colors.warning.g, colors.warning.b)
                    : rgb(colors.textDark.r, colors.textDark.g, colors.textDark.b)
            });

            detailY -= 20;
        }

        // =============================================
        // CLIENT SECTION
        // =============================================
        y = y - 130;

        // Client info box with subtle shadow
        // Shadow effect
        drawRoundedRect(
            page,
            margin.left + 3,
            y - 127,
            contentWidth / 2 - 20,
            130,
            5,
            rgb(0, 0, 0),
            undefined,
            undefined
        );

        // Actual box
        drawRoundedRect(
            page,
            margin.left,
            y - 130,
            contentWidth / 2 - 20,
            130,
            5,
            rgb(colors.contentBg.r, colors.contentBg.g, colors.contentBg.b),
            rgb(colors.divider.r, colors.divider.g, colors.divider.b),
            0.5
        );

        // Client section header
        drawRoundedRect(
            page,
            margin.left,
            y,
            contentWidth / 2 - 20,
            30,
            5,
            rgb(colors.primary.r, colors.primary.g, colors.primary.b)
        );

        page.drawText("BILLED TO", {
            x: margin.left + 15,
            y: y - 20,
            size: fontSize.md,
            font: boldFont,
            color: rgb(colors.textWhite.r, colors.textWhite.g, colors.textWhite.b)
        });

        // Client information
        page.drawText(invoice.clientName, {
            x: margin.left + 15,
            y: y - 45,
            size: fontSize.md,
            font: boldFont,
            color: rgb(colors.textDark.r, colors.textDark.g, colors.textDark.b)
        });

        // Client address
        const clientAddressLines = invoice.clientAddress.split("\n");
        let addressY = y - 65;
        for (const line of clientAddressLines) {
            page.drawText(line, {
                x: margin.left + 15,
                y: addressY,
                size: fontSize.base,
                font: regularFont,
                color: rgb(colors.textMedium.r, colors.textMedium.g, colors.textMedium.b)
            });
            addressY -= 15;
        }

        // Client contact
        page.drawText(`Email: ${invoice.clientEmail}`, {
            x: margin.left + 15,
            y: y - 110,
            size: fontSize.base,
            font: regularFont,
            color: rgb(colors.primary.r, colors.primary.g, colors.primary.b)
        });

        page.drawText(`Phone: ${invoice.clientPhone}`, {
            x: margin.left + 15,
            y: y - 125,
            size: fontSize.base,
            font: regularFont,
            color: rgb(colors.primary.r, colors.primary.g, colors.primary.b)
        });

        // =============================================
        // PAYMENT DETAILS SECTION 
        // =============================================
        // Payment details box
        drawRoundedRect(
            page,
            margin.left + contentWidth / 2 + 5,
            y - 130,
            contentWidth / 2 - 5,
            130,
            5,
            rgb(colors.contentBg.r, colors.contentBg.g, colors.contentBg.b),
            rgb(colors.divider.r, colors.divider.g, colors.divider.b),
            0.5
        );

        // Payment header
        drawRoundedRect(
            page,
            margin.left + contentWidth / 2 + 5,
            y,
            contentWidth / 2 - 5,
            30,
            5,
            rgb(colors.primary.r, colors.primary.g, colors.primary.b)
        );

        page.drawText("PAYMENT METHODS", {
            x: margin.left + contentWidth / 2 + 20,
            y: y - 20,
            size: fontSize.md,
            font: boldFont,
            color: rgb(colors.textWhite.r, colors.textWhite.g, colors.textWhite.b)
        });

        // Payment options
        const paymentX = margin.left + contentWidth / 2 + 20;
        let paymentY = y - 50;

        // Bank Transfer
        page.drawText("Bank Transfer", {
            x: paymentX,
            y: paymentY,
            size: fontSize.base,
            font: boldFont,
            color: rgb(colors.textDark.r, colors.textDark.g, colors.textDark.b)
        });

        paymentY -= 15;
        const bankDetails = [
            "Bank: Global Trust Bank",
            "Account Name: Your Company Ltd",
            "Account Number: XXXX-XXXX-XXXX-1234",
            "Routing: 987654321"
        ];

        for (const detail of bankDetails) {
            page.drawText(detail, {
                x: paymentX + 15,
                y: paymentY,
                size: fontSize.sm,
                font: regularFont,
                color: rgb(colors.textMedium.r, colors.textMedium.g, colors.textMedium.b)
            });
            paymentY -= 12;
        }

        // Include QR code placeholder
        drawRoundedRect(
            page,
            margin.left + contentWidth - 75,
            y - 115,
            65,
            65,
            5,
            rgb(colors.contentBg.r, colors.contentBg.g, colors.contentBg.b),
            rgb(colors.divider.r, colors.divider.g, colors.divider.b),
            1
        );

        page.drawText("Scan to Pay", {
            x: margin.left + contentWidth - 105,
            y: y - 125,
            size: fontSize.xxs,
            font: boldFont,
            color: rgb(colors.textMedium.r, colors.textMedium.g, colors.textMedium.b)
        });

        // =============================================
        // ITEMS TABLE SECTION
        // =============================================
        y = y - 170;

        // Table container with shadow
        // Shadow
        page.drawRectangle({
            x: margin.left + 3,
            y: y - 3 - (invoice.invoiceContents.length * 40 + 100),
            width: contentWidth,
            height: invoice.invoiceContents.length * 40 + 100,
            color: rgb(0, 0, 0),
            opacity: 0.03
        });

        // Table container
        drawRoundedRect(
            page,
            margin.left,
            y - (invoice.invoiceContents.length * 40 + 100),
            contentWidth,
            invoice.invoiceContents.length * 40 + 100,
            5,
            rgb(colors.contentBg.r, colors.contentBg.g, colors.contentBg.b),
            rgb(colors.divider.r, colors.divider.g, colors.divider.b),
            0.5
        );

        // Table header
        drawRoundedRect(
            page,
            margin.left,
            y,
            contentWidth,
            40,
            5,
            rgb(colors.primary.r, colors.primary.g, colors.primary.b)
        );

        page.drawText("INVOICE DETAILS", {
            x: margin.left + 20,
            y: y - 25,
            size: fontSize.md,
            font: boldFont,
            color: rgb(colors.textWhite.r, colors.textWhite.g, colors.textWhite.b)
        });

        // Define columns
        const colWidths = {
            item: contentWidth * 0.45,
            qty: contentWidth * 0.15,
            price: contentWidth * 0.2,
            amount: contentWidth * 0.2
        };

        const cols = {
            item: { x: margin.left, width: colWidths.item },
            qty: { x: margin.left + colWidths.item, width: colWidths.qty },
            price: { x: margin.left + colWidths.item + colWidths.qty, width: colWidths.price },
            amount: { x: margin.left + colWidths.item + colWidths.qty + colWidths.price, width: colWidths.amount }
        };

        // Table column headers
        y -= 60;
        const headers = [
            { col: cols.item, text: "Item Description" },
            { col: cols.qty, text: "Quantity" },
            { col: cols.price, text: "Unit Price" },
            { col: cols.amount, text: "Amount" }
        ];

        // Header row background
        page.drawRectangle({
            x: margin.left,
            y: y,
            width: contentWidth,
            height: 30,
            color: rgb(colors.tableHeader.r, colors.tableHeader.g, colors.tableHeader.b)
        });

        // Draw header texts
        for (const header of headers) {
            page.drawText(header.text, {
                x: header.col.x + 15,
                y: y - 20,
                size: fontSize.base,
                font: boldFont,
                color: rgb(colors.primary.r, colors.primary.g, colors.primary.b)
            });
        }

        // Helper to format currency
        const formatCurrency = (value: number) =>
            new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);

        // Table items
        y -= 30;
        for (let i = 0; i < invoice.invoiceContents.length; i++) {
            const item = invoice.invoiceContents[i];
            const rowHeight = 40;
            const isEven = i % 2 === 0;

            // Row background
            page.drawRectangle({
                x: margin.left,
                y: y - rowHeight,
                width: contentWidth,
                height: rowHeight,
                color: isEven
                    ? rgb(colors.tableRowEven.r, colors.tableRowEven.g, colors.tableRowEven.b)
                    : rgb(colors.tableRowOdd.r, colors.tableRowOdd.g, colors.tableRowOdd.b),
            });

            // Item data
            page.drawText(item.description, {
                x: cols.item.x + 15,
                y: y - (rowHeight / 2) - 5,
                size: fontSize.base,
                font: regularFont,
                color: rgb(colors.textDark.r, colors.textDark.g, colors.textDark.b)
            });

            page.drawText(item.quantity.toString(), {
                x: cols.qty.x + 15,
                y: y - (rowHeight / 2) - 5,
                size: fontSize.base,
                font: regularFont,
                color: rgb(colors.textDark.r, colors.textDark.g, colors.textDark.b)
            });

            page.drawText(formatCurrency(item.price), {
                x: cols.price.x + 15,
                y: y - (rowHeight / 2) - 5,
                size: fontSize.base,
                font: regularFont,
                color: rgb(colors.textDark.r, colors.textDark.g, colors.textDark.b)
            });

            page.drawText(formatCurrency(item.total), {
                x: cols.amount.x + 15,
                y: y - (rowHeight / 2) - 5,
                size: fontSize.base,
                font: boldFont,
                color: rgb(colors.primary.r, colors.primary.g, colors.primary.b)
            });

            y -= rowHeight;
        }

        // =============================================
        // TOTALS SECTION
        // =============================================
        // Divider
        page.drawLine({
            start: { x: margin.left, y: y },
            end: { x: margin.left + contentWidth, y: y },
            thickness: 1,
            color: rgb(colors.divider.r, colors.divider.g, colors.divider.b)
        });

        // Summary totals on the right side
        const summaryWidth = 250;
        const summaryX = margin.left + contentWidth - summaryWidth;
        let summaryY = y - 30;

        // Subtotal
        page.drawText("Subtotal:", {
            x: summaryX,
            y: summaryY,
            size: fontSize.base,
            font: boldFont,
            color: rgb(colors.textMedium.r, colors.textMedium.g, colors.textMedium.b)
        });

        page.drawText(formatCurrency(invoice.subtotal), {
            x: summaryX + summaryWidth - 95,
            y: summaryY,
            size: fontSize.base,
            font: regularFont,
            color: rgb(colors.textDark.r, colors.textDark.g, colors.textDark.b),

        });

        summaryY -= 20;

        // Tax
        page.drawText(`Tax (${invoice.taxRate}%):`, {
            x: summaryX,
            y: summaryY,
            size: fontSize.base,
            font: boldFont,
            color: rgb(colors.textMedium.r, colors.textMedium.g, colors.textMedium.b)
        });

        page.drawText(formatCurrency(invoice.taxAmount), {
            x: summaryX + summaryWidth - 95,
            y: summaryY,
            size: fontSize.base,
            font: regularFont,
            color: rgb(colors.textDark.r, colors.textDark.g, colors.textDark.b),

        });

        summaryY -= 25;

        // Line before total
        page.drawLine({
            start: { x: summaryX, y: summaryY },
            end: { x: summaryX + summaryWidth, y: summaryY },
            thickness: 1,
            color: rgb(colors.divider.r, colors.divider.g, colors.divider.b),
            opacity: 0.7
        });

        summaryY -= 20;

        // Total with accent background
        drawRoundedRect(
            page,
            summaryX,
            summaryY - 30,
            summaryWidth,
            30,
            5,
            rgb(colors.primary.r, colors.primary.g, colors.primary.b)
        );

        page.drawText("TOTAL:", {
            x: summaryX + 15,
            y: summaryY - 20,
            size: fontSize.md,
            font: boldFont,
            color: rgb(colors.textWhite.r, colors.textWhite.g, colors.textWhite.b)
        });

        page.drawText(formatCurrency(invoice.total), {
            x: summaryX + summaryWidth - 20,
            y: summaryY - 20,
            size: fontSize.md,

            font: boldFont,
            color: rgb(colors.textWhite.r, colors.textWhite.g, colors.textWhite.b),

        })
        const pdfBuffer = await pdfDoc.save();
        return pdfBuffer;
    }
    catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
}
