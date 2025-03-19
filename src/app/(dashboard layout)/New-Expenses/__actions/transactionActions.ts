"use server"


import { requireAuth } from "@/lib/auth";
import cloudinary from "@/lib/clodinary";
import { prisma } from "@/utils/prisma";
import { expenseFormSchema } from "@/utils/schema/expenseSchema";
import { PaymentMethodType, TransactionType } from "@prisma/client";
import { z } from "zod";



export async function createExpense(formData: FormData) {
    try {
        const user = await requireAuth();
        if (!user) {
            throw new Error("Authentication required");
        }


        // Convert FormData to object for validation
        const formDataObj = {
            transactionType: formData.get("transactionType"),
            name: formData.get("name"),
            description: formData.get("description"),
            category: formData.get("category"),
            amount: formData.get("amount"),
            taxType: formData.get("taxType"),
            total: formData.get("total"),
            paymentMethodType: formData.get("paymentMethodType"),
            receivedBy: formData.get("receivedBy"),
            bankName: formData.get("bankName"),
            chequeNo: formData.get("chequeNo"),
            chequeDate: formData.get("chequeDate"),
            invoiceNo: formData.get("invoiceNo"),
            date: formData.get("date"),
            image: formData.get("image"),
        };

        // Validate the data
        const validatedData = expenseFormSchema.parse(formDataObj);



        let attachmentData = null;
        const imageFile = formData.get("image") as File;

        // Handle image upload if present
        if (imageFile && imageFile.size > 0) {
            try {
                const bytes = await imageFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const base64String = buffer.toString('base64');
                const dataURI = `data:${imageFile.type};base64,${base64String}`;

                const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                    folder: `expenses`,
                    resource_type: "auto",
                    transformation: [
                        { quality: "auto:best" },
                        { width: 1500, crop: "limit" }
                    ],
                });

                attachmentData = {
                    url: uploadResponse.secure_url,
                };
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                throw new Error("Failed to upload image");
            }
        }

        const expense = await prisma.$transaction(async (tx) => {
            const createdExpense = await tx.transaction.create({
                data: {
                    name: validatedData.name,
                    type: validatedData.transactionType,
                    description: validatedData.description,
                    amount: parseFloat(String(validatedData.amount)),
                    tax: validatedData.taxType,
                    total: parseFloat(String(validatedData.total)),
                    date: new Date(String(validatedData.date)),
                    category: String(validatedData.category),
                    userId: user.id,
                    paymentMethod: {
                        create: {
                            type: validatedData.paymentMethodType as PaymentMethodType,
                            receivedBy: validatedData.receivedBy,
                            bankName: validatedData.bankName,
                            chequeNo: validatedData.chequeNo,
                            chequeDate: validatedData.chequeDate
                                ? new Date(String(validatedData.chequeDate))
                                : null,
                            invoiceNo: validatedData.invoiceNo,
                        },
                    },
                    attachments: attachmentData
                        ? {
                            create: attachmentData,
                        }
                        : undefined,
                },
                include: {
                    paymentMethod: true,
                    attachments: true,
                },
            });

            return createdExpense;
        });


        return { success: true, data: expense };
    } catch (error) {
        console.error("Create expense error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create expense",
        };
    }
}

export async function deleteExpense(transactionId: string) {
    try {
        const user = await requireAuth();
        if (!user) {
            throw new Error("Unauthorized");
        }

        // Get expense with attachment to check ownership and get attachment URL
        const expense = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { attachments: true },
        });

        if (!expense) {
            throw new Error("Expense not found");
        }

        if (expense.userId !== user.id) {
            throw new Error("Not authorized to delete this expense");
        }

        // Delete expense (will cascade to payment method and attachment)
        await prisma.transaction.delete({
            where: { id: transactionId },
        });

        // If there was an attachment, delete from Cloudinary
        if (expense.attachments?.[0]?.url) {
            const publicId = expense.attachments[0].url
                .split("/")
                .pop()
                ?.split(".")[0];
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }


        return { success: true };
    } catch (error) {
        console.error("Delete expense error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete expense",
        };
    }
}


export async function updateTransaction(transactionId: string, formData: FormData) {
    try {
        // Authentication check
        const user = await requireAuth();
        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        // Convert FormData to object
        const formDataObj = Object.fromEntries(formData.entries());

        // Parse and validate using zod schema
        const validatedData = expenseFormSchema.parse(formDataObj);

        // Check if transaction exists and verify ownership
        const existingTransaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                paymentMethod: true,
                attachments: true
            },
        });

        if (!existingTransaction) {
            return { success: false, error: "Transaction not found" };
        }

        if (existingTransaction.userId !== user.id) {
            return { success: false, error: "You don't have permission to update this transaction" };
        }

        // Handle image upload if provided
        let attachmentData = null;
        const imageFile = formData.get("image") as File;

        if (imageFile && imageFile.size > 0) {
            try {
                // Process image for upload
                const bytes = await imageFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const base64String = buffer.toString('base64');
                const dataURI = `data:${imageFile.type};base64,${base64String}`;

                // Upload to Cloudinary with optimizations
                const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                    folder: `expenses/${user.id}`,
                    resource_type: "auto",
                    transformation: [
                        { quality: "auto:best" },
                        { width: 1500, crop: "limit" }
                    ],
                });

                attachmentData = {
                    url: uploadResponse.secure_url,
                };

                // Clean up old image if it exists
                if (existingTransaction.attachments?.[0]?.url) {
                    const urlParts = existingTransaction.attachments[0].url.split("/");
                    const publicId = urlParts[urlParts.length - 1].split(".")[0];

                    if (publicId) {
                        await cloudinary.uploader.destroy(`expenses/${user.id}/${publicId}`);
                    }
                }
            } catch (error) {
                console.error("Image upload error:", error);
                return { success: false, error: "Failed to upload image" };
            }
        }

        // Use transaction to ensure data consistency
        const updatedTransaction = await prisma.$transaction(async (tx) => {
            // 1. Update payment method
            await tx.paymentMethod.update({
                where: { transactionId },
                data: {
                    type: validatedData.paymentMethodType as PaymentMethodType,
                    receivedBy: validatedData.receivedBy,
                    bankName: validatedData.bankName,
                    chequeNo: validatedData.chequeNo,
                    chequeDate: validatedData.chequeDate
                        ? new Date(String(validatedData.chequeDate))
                        : null,
                    invoiceNo: validatedData.invoiceNo,
                },
            });

            // 2. Handle attachment update
            if (attachmentData) {
                if (existingTransaction.attachments?.length > 0) {
                    // Update existing attachment
                    await tx.attachment.update({
                        where: { id: existingTransaction.attachments[0].id },
                        data: attachmentData,
                    });
                } else {
                    // Create new attachment
                    await tx.attachment.create({
                        data: {
                            ...attachmentData,

                            transactionId,
                        },
                    });
                }
            }

            // 3. Update main transaction
            return await tx.transaction.update({
                where: { id: transactionId },
                data: {
                    name: validatedData.name,
                    type: validatedData.transactionType as TransactionType,
                    description: validatedData.description,
                    amount: parseFloat(validatedData.amount),
                    tax: validatedData.taxType,
                    total: parseFloat(validatedData.total),
                    date: new Date(validatedData.date),
                    category: validatedData.category,
                },
                include: {
                    paymentMethod: true,
                    attachments: true,
                },
            });
        });

        return {
            success: true,
            data: updatedTransaction
        };
    } catch (error) {
        // Detailed error handling
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation error",
                details: error.errors,
            };
        }

        console.error("Transaction update error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update transaction",
        };
    }
}



