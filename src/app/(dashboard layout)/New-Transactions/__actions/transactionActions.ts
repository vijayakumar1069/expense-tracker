"use server"


import { requireAuth } from "@/lib/auth";
import cloudinary from "@/lib/clodinary";
import { prisma } from "@/utils/prisma";
import { expenseFormSchema } from "@/utils/schema/expenseSchema";
import { UpdateTransactionResult } from "@/utils/types";
import { PaymentMethodType, PaymentTransferMode, TransactionType } from "@prisma/client";
import { z } from "zod";



export async function createExpense(formData: FormData) {
    try {
        const user = await requireAuth();
        if (!user) {
            throw new Error("Authentication required");
        }

        // Extract images before validation
        const imageFiles = formData.getAll("images") as File[];

        // Convert FormData to object for validation
        const formDataObj = {
            transactionType: formData.get("transactionType"),
            name: formData.get("name"),
            description: formData.get("description"),
            category: formData.get("category"),
            amount: formData.get("amount"),
            taxType: formData.get("taxType"),
            total: formData.get("total"),
            transactionNumber: formData.get("transactionNumber"),
            paymentMethodType: formData.get("paymentMethodType"),
            transferMode: formData.get("transferMode"),
            receivedBy: formData.get("receivedBy"),
            bankName: formData.get("bankName"),
            chequeNo: formData.get("chequeNo"),
            chequeDate: formData.get("chequeDate"),
            invoiceNo: formData.get("invoiceNo"),
            date: formData.get("date"),
            images: imageFiles.length > 0 ? imageFiles : [],
        };



        // Validate the data
        const validatedData = expenseFormSchema.parse(formDataObj);
        console.log("Validated data:", validatedData);

        // Upload images to Cloudinary first
        const uploadedImageUrls: string[] = [];

        if (imageFiles && imageFiles.length > 0) {
            for (const imageFile of imageFiles) {
                try {
                    if (imageFile.size === 0) continue;

                    const bytes = await imageFile.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const base64String = buffer.toString('base64');
                    const dataURI = `data:${imageFile.type};base64,${base64String}`;

                    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                        folder: `transactions/${user.id}`,
                        resource_type: "auto",
                        transformation: [
                            { quality: "auto:best" },
                            { width: 1500, crop: "limit" }
                        ],
                    });

                    uploadedImageUrls.push(uploadResponse.secure_url);
                } catch (error) {
                    console.error("Cloudinary upload error:", error);
                }
            }
        }

        // Create the transaction and related records in a transaction
        const expense = await prisma.$transaction(async (tx) => {
            const transactionNumber = await generateTransactionNumber(
                validatedData.transactionType as TransactionType,

            );
            // First create the transaction without attachments
            const createdExpense = await tx.transaction.create({
                data: {
                    name: validatedData.name,
                    type: validatedData.transactionType,
                    description: validatedData.description,
                    amount: parseFloat(String(validatedData.amount)),
                    tax: validatedData.taxType,
                    total: parseFloat(String(validatedData.total)),
                    transactionNumber: transactionNumber,
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
                            transferMode: validatedData.transferMode as PaymentTransferMode | null,
                        },
                    },
                },
                include: {
                    paymentMethod: true,
                },
            });

            // Then create each attachment individually
            const attachments = [];
            for (const imageUrl of uploadedImageUrls) {
                const attachment = await tx.attachment.create({
                    data: {
                        url: imageUrl,
                        transactionId: createdExpense.id, // Use the ID from the created transaction
                    }
                });
                attachments.push(attachment);
            }

            // Return the transaction with attachments
            return {
                ...createdExpense,
                attachments: attachments
            };
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

export async function updateTransaction(
    transactionId: string,
    formData: FormData
): Promise<UpdateTransactionResult> {
    try {
        // Authentication check
        const user = await requireAuth();
        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        // Extract image files and deleted images
        const imageFiles = formData.getAll("imageFiles") as File[];
        const deleteImagesStr = formData.get("deleteImages") as string | null;

        // Process form data
        const formDataObj: Record<string, string | string[] | File[]> = {};

        for (const [key, value] of formData.entries()) {
            // Skip the images field as we handle it separately
            if (key === "images") continue;

            // Special handling for existingImages - convert from string to array
            if (key === "existingImages" && typeof value === "string") {
                formDataObj[key] = value ? value.split(",") : [];
                continue;
            }

            // Store other fields normally
            formDataObj[key] = value as string;
        }

        // Add images array to formDataObj for validation
        formDataObj.images = imageFiles.length > 0 ? imageFiles : [];

        // Parse and validate using zod schema
        let validatedData;
        try {
            validatedData = expenseFormSchema.parse(formDataObj);
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                return {
                    success: false,
                    error: "Validation error",

                };
            }
            throw validationError;
        }

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

        // Process all new images
        const newAttachments: { url: string }[] = [];

        for (const imageFile of imageFiles) {
            if (imageFile instanceof File && imageFile.size > 0) {
                try {
                    // Process image for upload
                    const bytes = await imageFile.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const base64String = buffer.toString('base64');
                    const dataURI = `data:${imageFile.type};base64,${base64String}`;

                    // Upload to Cloudinary with optimizations
                    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                        folder: `transactions/${user.id}`,
                        resource_type: "auto",
                        transformation: [
                            { quality: "auto:best" },
                            { width: 1500, crop: "limit" }
                        ],
                    });

                    newAttachments.push({
                        url: uploadResponse.secure_url,
                    });
                } catch (error: unknown) {
                    return { success: false, error: error instanceof Error ? error.message : "Failed to process image" };
                }
            }
        }

        // Process deleted images
        const imagesToDelete = deleteImagesStr ? deleteImagesStr.split(",").filter(Boolean) : [];

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
                    transferMode: validatedData.transferMode as PaymentTransferMode | null,
                },
            });

            // 2. Delete attachments marked for deletion
            if (imagesToDelete.length > 0) {
                for (const attachmentId of imagesToDelete) {
                    // Get the attachment to delete
                    const attachmentToDelete = await tx.attachment.findUnique({
                        where: { id: attachmentId }
                    });

                    if (attachmentToDelete?.url) {
                        try {
                            // Extract Cloudinary public ID to delete the resource
                            const urlParts = attachmentToDelete.url.split("/");
                            const fileName = urlParts[urlParts.length - 1];
                            const publicId = fileName.split(".")[0];

                            if (publicId) {
                                await cloudinary.uploader.destroy(`transactions/${user.id}/${publicId}`);
                            }
                        } catch {
                            // Continue with DB deletion even if Cloudinary fails
                        }
                    }

                    // Delete from database
                    await tx.attachment.delete({
                        where: { id: attachmentId }
                    });
                }
            }

            // 3. Add new attachments
            for (const attachment of newAttachments) {
                await tx.attachment.create({
                    data: {
                        ...attachment,
                        transactionId,
                    },
                });
            }

            // 4. Update main transaction
            return await tx.transaction.update({
                where: { id: transactionId },
                data: {
                    name: validatedData.name,
                    type: validatedData.transactionType as TransactionType,
                    description: validatedData.description,
                    amount: parseFloat(String(validatedData.amount)),
                    tax: validatedData.taxType as string,
                    transactionNumber: validatedData.transactionNumber,
                    total: parseFloat(String(validatedData.total)),
                    date: new Date(String(validatedData.date)),
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

    } catch (error: unknown) {
        // Detailed error handling
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation error",

            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update transaction",
        };
    }

}
async function generateTransactionNumber(transactionType: TransactionType,) {
    // Get the prefix based on transaction type
    const prefix = transactionType === 'INCOME' ? 'INC-' : 'EXP-';

    // Find the latest transaction of this type
    const latestTransaction = await prisma.transaction.findFirst({
        where: {
            type: transactionType,
            transactionNumber: {
                startsWith: prefix
            }
        },
        orderBy: {
            transactionNumber: 'desc'
        }
    });

    // Get the next number in sequence
    let nextNumber = 1;

    if (latestTransaction) {
        // Extract the number part (e.g. "001" from "EXP-001")
        const currentNumberStr = latestTransaction.transactionNumber.substring(prefix.length);
        // Convert to number and increment
        nextNumber = parseInt(currentNumberStr, 10) + 1;
    }

    // Format with leading zeros (001, 002, etc.)
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}






