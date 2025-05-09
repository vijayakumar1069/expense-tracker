// app/actions/invoice.ts
"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { InvoiceStatus } from "@prisma/client";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/utils/prisma";


// Zod schemas for validation
const invoiceItemSchema = z.object({
    id: z.string().optional(), // For updates
    description: z.string().min(1, "Description is required"),


    total: z.number(),
});

const invoiceSchema = z.object({
    id: z.string().optional(), // Optional for creating new invoices
    clientId: z.string().min(1, "Client is required"),
    clientName: z.string().min(1, "Client name is required"),
    clientCompanyName: z.string().optional(),
    clientEmail: z.string().email("Invalid email address"),
    clientPhone1: z.string().min(1, "Phone is required"),
    clientPhone2: z.string().optional(),
    clientStreetName: z.string().min(1, "Address is required"),
    clientCity: z.string().min(1, "City is required"),
    clientState: z.string().min(1, "State is required"),
    clientZip: z.string().min(1, "Zip code is required"),
    clientCountry: z.string().min(1, "Country is required"),
    invoiceNumber: z.string().min(1, "Invoice number is required"),

    status: z.nativeEnum(InvoiceStatus).default("SENT"),
    invoiceContents: z.array(invoiceItemSchema).min(1, "At least one item is required"),
    subtotal: z.number().min(0),
    taxRate1: z.number().min(0).max(100),
    taxRate2: z.number().min(0).max(100).optional(),
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
    const { user, authenticated } = await requireAuth();

    if (!authenticated) {
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
                    clientCompanyName: validatedData.clientCompanyName ?? "",
                    clientPhone1: validatedData.clientPhone1,
                    clientPhone2: validatedData.clientPhone2 ?? undefined,
                    clientStreetName: validatedData.clientStreetName,
                    clientCity: validatedData.clientCity,
                    clientState: validatedData.clientState,
                    clientZip: validatedData.clientZip,
                    clientCountry: validatedData.clientCountry,
                    invoiceNumber: validatedData.invoiceNumber,

                    status: validatedData.status,
                    subtotal: validatedData.subtotal,
                    taxRate1: validatedData.taxRate1,
                    taxRate2: validatedData.taxRate2 ?? undefined,
                    taxAmount: validatedData.taxAmount,
                    invoiceTotal: validatedData.invoiceTotal,
                    userId: user ? user.id : "",
                    // Create the invoice contents
                    invoiceContents: {
                        create: validatedData.invoiceContents.map(item => ({
                            description: item.description,

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



        await prisma.invoice.update({
            where: { id: newInvoice.id },
            data: { status: "Raised" },
        });
        return {
            success: true,
            data: newInvoice,
        };
    } catch (error) {
        console.error("Error creating invoice:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}





export async function updateInvoice(formData: z.infer<typeof invoiceSchema>): Promise<ActionResponse> {
    try {


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
                userId: user?.id
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

        // Check if status is changing from DRAFT to SENT
        // const isStatusChangingToSent = existingInvoice.status === "DRAFT" && validatedData.status === "SENT";

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
                    clientCompanyName: validatedData.clientCompanyName ?? "",
                    clientPhone1: validatedData.clientPhone1,
                    clientPhone2: validatedData.clientPhone2 ?? undefined,
                    clientStreetName: validatedData.clientStreetName,
                    clientCity: validatedData.clientCity,
                    clientState: validatedData.clientState,
                    clientZip: validatedData.clientZip,
                    clientCountry: validatedData.clientCountry,
                    invoiceNumber: existingInvoice.invoiceNumber,

                    status: validatedData.status,
                    subtotal: validatedData.subtotal,
                    taxRate1: validatedData.taxRate1,
                    taxRate2: validatedData.taxRate2 ?? undefined,
                    taxAmount: validatedData.taxAmount,
                    invoiceTotal: validatedData.invoiceTotal,
                    // Create new invoice contents
                    invoiceContents: {
                        create: validatedData.invoiceContents.map(item => ({
                            description: item.description,
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

export async function deleteInvoice(id: string): Promise<ActionResponse> {
    try {

        // Get current user
        const user = await getCurrentUser();

        // Check if the invoice exists and belongs to the user
        const existingInvoice = await prisma.invoice.findUnique({
            where: {
                id,
                userId: user?.id,
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
// export async function getClientSuggestions(searchTerm: string): Promise<ActionResponse> {
//     try {
//         // Get current user
//         const user = await getCurrentUser();

//         // Search for clients matching the search term
//         const clients = await prisma.client.findMany({
//             where: {
//                 userId: user.id,
//                 OR: [
//                     { name: { contains: searchTerm, } },
//                     { email: { contains: searchTerm, } },
//                 ]
//             },
//             select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 phone: true,
//                 address: true,
//             },
//             take: 10, // Limit to 10 suggestions
//         });

//         return {
//             success: true,
//             data: clients
//         };
//     } catch (error) {
//         console.error("Error getting client suggestions:", error);
//         return {
//             success: false,
//             error: error instanceof Error ? error.message : "An unexpected error occurred"
//         };
//     }
// }

/**
 * Generate a new invoice number
 */
export async function generateInvoiceNumber(): Promise<ActionResponse> {
    try {
        // Get current user
        const user = await getCurrentUser();

        // Get the latest invoice number
        const latestInvoice = await prisma.invoice.findFirst({
            where: { userId: user?.id },
            orderBy: { createdAt: 'desc' },
            select: { invoiceNumber: true },
        });

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
        const invoiceNumber = `GT-INV-${newNumber.toString().padStart(3, '0')}`;

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
            clientPhone1: rawData.clientPhone as string,
            clientPhone2: rawData.clientPhone2 as string,

            clientStreetName: rawData.clientStreetName as string,
            clientCity: rawData.clientCity as string,
            clientState: rawData.clientState as string,
            clientZip: rawData.clientZip as string,
            clientCountry: rawData.clientCountry as string,
            invoiceNumber: rawData.invoiceNumber as string,

            status: rawData.status as InvoiceStatus,
            invoiceContents: JSON.parse(rawData.invoiceContents as string),
            subtotal: parseFloat(rawData.subtotal as string),
            taxRate1: parseFloat(rawData.taxRate1 as string),
            taxRate2: parseFloat(rawData.taxRate2 as string),
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
