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
        const { user, authenticated } = await requireAuth();
        if (!authenticated) {
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
                        folder: `transactions/${user?.id}`,
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
                    userId: user?.id || "",
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
        const { user, authenticated } = await requireAuth();
        if (!authenticated) {
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

        if (expense.userId !== user?.id) {
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
        const { user, authenticated } = await requireAuth();
        if (!authenticated) {
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

        if (existingTransaction.userId !== user?.id) {
            return { success: false, error: "You don't have permission to update this transaction" };
        }

        // Check if transaction type has changed
        const newTransactionType = validatedData.transactionType as TransactionType;
        const typeChanged = existingTransaction.type !== newTransactionType;

        // Initialize transaction number
        let transactionNumber = validatedData.transactionNumber;

        // Generate new transaction number if type changed
        if (typeChanged) {


            // Use the improved function with built-in duplicate prevention
            transactionNumber = await generateTransactionNumber(newTransactionType);


            // Double-check the number doesn't already exist (extra safety)
            let isUnique = false;
            let attempts = 0;
            const maxAttempts = 10;

            while (!isUnique && attempts < maxAttempts) {
                const exists = await prisma.transaction.findFirst({
                    where: {
                        transactionNumber,
                        id: { not: transactionId }
                    }
                });

                if (!exists) {
                    isUnique = true;

                } else {

                    const prefix = newTransactionType === 'INCOME' ? 'INC-' : 'EXP-';
                    const currentNum = parseInt(transactionNumber.substring(prefix.length), 10);
                    transactionNumber = `${prefix}${(currentNum + 1).toString().padStart(3, '0')}`;
                    attempts++;
                }
            }

            if (!isUnique) {
                throw new Error("Unable to generate a unique transaction number after multiple attempts");
            }
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

            // 4. Update main transaction - use the new transaction number when type has changed
            return await tx.transaction.update({
                where: { id: transactionId },
                data: {
                    name: validatedData.name,
                    type: newTransactionType,
                    description: validatedData.description,
                    amount: parseFloat(String(validatedData.amount)),
                    tax: validatedData.taxType as string,
                    transactionNumber: transactionNumber, // Use the new transaction number
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
        console.error("Transaction update error:", error);

        // Check for Prisma unique constraint error


        // Handle other validation errors
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

async function generateTransactionNumber(transactionType: TransactionType) {
    // Get the prefix based on transaction type
    const prefix = transactionType === 'INCOME' ? 'INC-' : 'EXP-';

    // Find the highest existing transaction number using a more reliable approach
    const highestNumber = await findHighestTransactionNumber(prefix);

    // Generate a new unique transaction number
    const newTransactionNumber = `${prefix}${(highestNumber + 1).toString().padStart(3, '0')}`;

    return newTransactionNumber;
}

async function findHighestTransactionNumber(prefix: string): Promise<number> {
    // Get all transaction numbers with this prefix
    const transactions = await prisma.transaction.findMany({
        where: {
            transactionNumber: {
                startsWith: prefix
            }
        },
        select: {
            transactionNumber: true
        }
    });



    // If no transactions found, start from 0
    if (transactions.length === 0) {
        return 0;
    }

    // Extract and find the highest number
    let highestNumber = 0;

    for (const transaction of transactions) {
        const numberPart = transaction.transactionNumber.substring(prefix.length);
        const numericValue = parseInt(numberPart, 10);

        // Check if it's a valid number and higher than current highest
        if (!isNaN(numericValue) && numericValue > highestNumber) {
            highestNumber = numericValue;
        }
    }


    return highestNumber;
}







