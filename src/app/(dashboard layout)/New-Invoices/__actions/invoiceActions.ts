// app/actions/invoice.ts
"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { InvoiceStatus } from "@prisma/client";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/utils/prisma";
import { gettingAccessToken } from "@/lib/access_token_generation";
import { render } from "@react-email/components";
import InvoiceEmail from "@/emails/InvoiceEmail";
import { mailSendFunction } from "@/lib/mail_send_Function";
// import { renderToBuffer } from "@react-pdf/renderer";
// import InvoicePDF from "../__components/invoiceform components/InvoicePDF";
import { generateInvoicePDF } from "@/lib/pdf-generator.server";

// Zod schemas for validation
const invoiceItemSchema = z.object({
    id: z.string().optional(), // For updates
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    price: z.number().min(0, "Price cannot be negative"),
    total: z.number(),
});

const invoiceSchema = z.object({
    id: z.string().optional(), // Optional for creating new invoices
    clientId: z.string().min(1, "Client is required"),
    clientName: z.string().min(1, "Client name is required"),
    clientEmail: z.string().email("Invalid email address"),
    clientPhone: z.string().min(1, "Phone is required"),
    clientAddress: z.string().min(1, "Address is required"),
    invoiceNumber: z.string().min(1, "Invoice number is required"),
    dueDate: z.date({
        required_error: "Due date is required",
    }),
    status: z.nativeEnum(InvoiceStatus).default("DRAFT"),
    invoiceContents: z.array(invoiceItemSchema).min(1, "At least one item is required"),
    subtotal: z.number().min(0),
    taxRate: z.number().min(0).max(100),
    taxAmount: z.number().min(0),
    invoiceTotal: z.number().min(0),
});

// Type for the function return values
type ActionResponse = {
    success: boolean;
    error?: string;
    data?: unknown;
};

/**
 * Helper function to get the current authenticated user
 */
const getCurrentUser = async () => {
    const user = await requireAuth();

    if (!user) {
        throw new Error("Unauthorized: You must be signed in to perform this action");
    }

    return user;
};
/**
 * Create a new invoice
 */
export async function createInvoice(formData: z.infer<typeof invoiceSchema>): Promise<ActionResponse> {
    try {
        // Validate input data
        const validatedData = invoiceSchema.parse(formData);

        // Get current user
        const user = await getCurrentUser();

        // Check if invoice number is unique
        const existingInvoice = await prisma.invoice.findFirst({
            where: { invoiceNumber: validatedData.invoiceNumber },
        });

        if (existingInvoice) {
            return {
                success: false,
                error: "Invoice number already exists. Please use a different number."
            };
        }

        // Create the invoice and its items in a transaction
        const newInvoice = await prisma.$transaction(async (prisma) => {
            // Create the invoice
            const invoice = await prisma.invoice.create({
                data: {
                    clientId: validatedData.clientId,
                    clientName: validatedData.clientName,
                    clientEmail: validatedData.clientEmail,
                    clientPhone: validatedData.clientPhone,
                    clientAddress: validatedData.clientAddress,
                    invoiceNumber: validatedData.invoiceNumber,
                    dueDate: validatedData.dueDate,
                    status: validatedData.status,
                    subtotal: validatedData.subtotal,
                    taxRate: validatedData.taxRate,
                    taxAmount: validatedData.taxAmount,
                    invoiceTotal: validatedData.invoiceTotal,
                    userId: user.id,
                    // Create the invoice contents
                    invoiceContents: {
                        create: validatedData.invoiceContents.map(item => ({
                            description: item.description,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.total,
                        }))
                    }
                },
                include: {
                    invoiceContents: true,
                }
            });

            return invoice;
        });

        // Generate email HTML from React Email template
        const invoiceEmailHtml = await render(
            InvoiceEmail({
                invoice: newInvoice,
                previewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/preview`,
            })
        );

        // Validate environment variables
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.TENANT_ID) {
            throw new Error("Missing required environment variables");
        }

        // Get Microsoft Graph API access token
        const tokenResponse = await gettingAccessToken({
            ClientId: process.env.CLIENT_ID,
            ClientSecret: process.env.CLIENT_SECRET,
            TenantID: process.env.TENANT_ID,
        });

        // Check token acquisition
        if (!tokenResponse?.message?.access_token) {
            throw new Error("Error getting access token");
        }

        const accessToken = tokenResponse.message.access_token;

        // Generate PDF buffer with server-compatible method
        let pdfBuffer: Buffer;
        try {
            // Use our server-compatible PDF generator instead of client component
            pdfBuffer = await generateInvoicePDF(newInvoice);
        } catch (error) {
            console.error("PDF generation failed:", error);
            throw new Error("Failed to generate invoice PDF");
        }

        // Create a proper filename for the attachment
        const pdfFilename = `Invoice-${newInvoice.invoiceNumber}.pdf`;

        // Convert buffer to base64 efficiently
        const base64PDF = pdfBuffer.toString("base64");

        // Prepare email payload for Microsoft Graph API
        const emailPayload = {
            message: {
                subject: `Invoice #${newInvoice.invoiceNumber} from Gliggo`,
                body: {
                    contentType: "HTML",
                    content: invoiceEmailHtml,
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: validatedData.clientEmail,
                        },
                    },
                ],
                attachments: [
                    {
                        "@odata.type": "#microsoft.graph.fileAttachment",
                        name: pdfFilename,
                        contentType: "application/pdf",
                        contentBytes: base64PDF,
                        isInline: false,
                    },
                ],
            },
            saveToSentItems: true,
        };

        // Send email via Microsoft Graph API
        const graphResponse = await mailSendFunction(emailPayload, accessToken);

        if (graphResponse.status === 200) {
            // Update invoice status to SENT
            await prisma.invoice.update({
                where: { id: newInvoice.id },
                data: { status: "SENT" },
            });

            return {
                success: true,
                data: newInvoice,
            };
        } else {
            return {
                success: false,
                error: graphResponse.message || "Failed to send email",
            };
        }
    } catch (error) {
        console.error("Error creating invoice:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}




/**
 * Update an existing invoice
 */
export async function updateInvoice(formData: z.infer<typeof invoiceSchema>): Promise<ActionResponse> {
    try {
        console.log("Updating invoice...");
        // Validate input data
        const validatedData = invoiceSchema.parse(formData);


        // Ensure ID exists for update
        if (!validatedData.id) {
            return {
                success: false,
                error: "Invoice ID is required for updates"
            };
        }

        // Get current user
        const user = await getCurrentUser();

        // Check if the invoice exists and belongs to the user
        const existingInvoice = await prisma.invoice.findUnique({
            where: {
                id: validatedData.id,
                userId: user.id
            },
            include: {
                invoiceContents: true,
            }
        });

        if (!existingInvoice) {
            return {
                success: false,
                error: "Invoice not found or you don't have permission to update it"
            };
        }
        console.log("Existing invoice found:", existingInvoice.invoiceNumber);
        console.log("Validated data:", validatedData);


        // Update the invoice in a transaction
        const updatedInvoice = await prisma.$transaction(async (prisma) => {
            // Delete existing invoice contents to replace them
            await prisma.invoiceContents.deleteMany({
                where: {
                    invoiceId: validatedData.id,
                }
            });

            // Update the invoice and create new invoice contents
            const invoice = await prisma.invoice.update({
                where: {
                    id: validatedData.id,
                },
                data: {
                    clientId: validatedData.clientId,
                    clientName: validatedData.clientName,
                    clientEmail: validatedData.clientEmail,
                    clientPhone: validatedData.clientPhone,
                    clientAddress: validatedData.clientAddress,
                    invoiceNumber: existingInvoice.invoiceNumber,
                    dueDate: validatedData.dueDate,
                    status: validatedData.status,
                    subtotal: validatedData.subtotal,
                    taxRate: validatedData.taxRate,
                    taxAmount: validatedData.taxAmount,
                    invoiceTotal: validatedData.invoiceTotal,
                    // Create new invoice contents
                    invoiceContents: {
                        create: validatedData.invoiceContents.map(item => ({
                            description: item.description,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.total,
                        }))
                    }
                },
                include: {
                    invoiceContents: true,
                }
            });

            return invoice;
        });

        console.log("Invoice updated successfully:", updatedInvoice);

        return {
            success: true,
            data: updatedInvoice
        };
    } catch (error) {
        console.error("Error updating invoice:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}
/**
 * Delete an invoice
 */
export async function deleteInvoice(id: string): Promise<ActionResponse> {
    try {
        console.log("Deleting invoice...");
        console.log("Deleting invoice with ID:", id);
        // Get current user
        const user = await getCurrentUser();

        // Check if the invoice exists and belongs to the user
        const existingInvoice = await prisma.invoice.findUnique({
            where: {
                id,
                userId: user.id,
            }
        });

        if (!existingInvoice) {
            return {
                success: false,
                error: "Invoice not found or you don't have permission to delete it"
            };
        }

        // Delete the invoice (will cascade delete invoice contents)
        await prisma.invoice.delete({
            where: {
                id,
            }
        });

        // Revalidate the invoices page to reflect the changes
        revalidatePath("/invoices");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error deleting invoice:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

/**
 * Get a list of invoices with optional filtering
 */
// export async function getInvoices(
//   params: {
//     status?: InvoiceStatus;
//     clientId?: string;
//     search?: string;
//     sort?: 'asc' | 'desc';
//     sortBy?: 'dueDate' | 'invoiceTotal' | 'createdAt';
//     page?: number;
//     limit?: number;
//   } = {}
// ): Promise<ActionResponse> {
//   try {
//     // Get current user
//     const userId = await getCurrentUser();

//     // Default pagination values
//     const page = params.page || 1;
//     const limit = params.limit || 10;
//     const skip = (page - 1) * limit;

//     // Build the where clause for filtering
//     const where: any = {
//       userId, // Only get invoices belonging to the user
//     };

//     // Add optional filters
//     if (params.status) {
//       where.status = params.status;
//     }

//     if (params.clientId) {
//       where.clientId = params.clientId;
//     }

//     if (params.search) {
//       where.OR = [
//         { clientName: { contains: params.search, mode: 'insensitive' } },
//         { invoiceNumber: { contains: params.search, mode: 'insensitive' } },
//       ];
//     }

//     // Build the orderBy clause for sorting
//     const orderBy: any = {};
//     if (params.sortBy) {
//       orderBy[params.sortBy] = params.sort || 'desc';
//     } else {
//       orderBy.createdAt = 'desc'; // Default sort
//     }

//     // Get the invoices
//     const invoices = await prisma.invoice.findMany({
//       where,
//       orderBy,
//       skip,
//       take: limit,
//       include: {
//         invoiceContents: true,
//         client: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           }
//         },
//       }
//     });

//     // Get the total count for pagination
//     const total = await prisma.invoice.count({ where });

//     return {
//       success: true,
//       data: {
//         invoices,
//         pagination: {
//           total,
//           page,
//           limit,
//           totalPages: Math.ceil(total / limit),
//         }
//       }
//     };
//   } catch (error) {
//     console.error("Error getting invoices:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An unexpected error occurred"
//     };
//   }
// }

/**
 * Get client suggestions based on search term
 */
export async function getClientSuggestions(searchTerm: string): Promise<ActionResponse> {
    try {
        // Get current user
        const user = await getCurrentUser();

        // Search for clients matching the search term
        const clients = await prisma.client.findMany({
            where: {
                userId: user.id,
                OR: [
                    { name: { contains: searchTerm, } },
                    { email: { contains: searchTerm, } },
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
            },
            take: 10, // Limit to 10 suggestions
        });

        return {
            success: true,
            data: clients
        };
    } catch (error) {
        console.error("Error getting client suggestions:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

/**
 * Generate a new invoice number
 */
export async function generateInvoiceNumber(): Promise<ActionResponse> {
    try {
        // Get current user
        const user = await getCurrentUser();

        // Get the latest invoice number
        const latestInvoice = await prisma.invoice.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: { invoiceNumber: true },
        });
        console.log(latestInvoice);
        // Generate a new invoice number
        let newNumber = 1;

        if (latestInvoice) {
            // Try to extract the number from the latest invoice number
            // Assuming format like INV-001, INV-002, etc.
            const match = latestInvoice.invoiceNumber.match(/(\d+)$/);
            if (match) {
                newNumber = parseInt(match[1], 10) + 1;
            }
        }

        // Format the new invoice number with leading zeros
        const invoiceNumber = `INV-${newNumber.toString().padStart(3, '0')}`;

        return {
            success: true,
            data: invoiceNumber
        };
    } catch (error) {
        console.error("Error generating invoice number:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

// Example of how to use these server actions in a Next.js route handler
export async function createInvoiceAction(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());

    try {
        // Parse the form data
        const invoiceData = {
            clientId: rawData.clientId as string,
            clientName: rawData.clientName as string,
            clientEmail: rawData.clientEmail as string,
            clientPhone: rawData.clientPhone as string,
            clientAddress: rawData.clientAddress as string,
            invoiceNumber: rawData.invoiceNumber as string,
            dueDate: new Date(rawData.dueDate as string),
            status: rawData.status as InvoiceStatus,
            invoiceContents: JSON.parse(rawData.invoiceContents as string),
            subtotal: parseFloat(rawData.subtotal as string),
            taxRate: parseFloat(rawData.taxRate as string),
            taxAmount: parseFloat(rawData.taxAmount as string),
            invoiceTotal: parseFloat(rawData.invoiceTotal as string),
        };

        const result = await createInvoice(invoiceData);

        if (!result.success) {
            // Handle error
            return { error: result.error };
        }


    } catch (error) {
        console.error("Error in createInvoiceAction:", error);
        return {
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}
