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
            paymentMethodType: formData.get("paymentMethodType"),
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
            // First create the transaction without attachments
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


export async function updateTransaction(transactionId: string, formData: FormData) {
    try {
        console.log("=========== UPDATE TRANSACTION START ===========");
        console.log("TransactionId:", transactionId);
        console.log("FormData keys:", [...formData.keys()]);

        // Authentication check
        const user = await requireAuth();
        if (!user) {
            console.log("Authentication failed");
            return { success: false, error: "Authentication required" };
        }
        console.log("User authenticated:", user.id);

        // Get all image files (not just the first one)
        const imageFiles = formData.getAll("images");
        console.log("Number of new images:", imageFiles.length);

        // Handle deleted images
        const deleteImagesStr = formData.get("deleteImages");
        console.log("Images to delete:", deleteImagesStr);

        const formDataObj: any = {};
        for (const [key, value] of formData.entries()) {
            // Skip the images field as we handle it separately
            if (key === "images") continue;

            // Special handling for existingImages - convert from string to array
            if (key === "existingImages") {
                if (typeof value === "string") {
                    // Convert comma-separated string to array, or use empty array if no value
                    formDataObj[key] = value ? value.split(",") : [];
                    console.log("Parsed existingImages:", formDataObj[key]);
                }
                continue;
            }

            // Store other fields normally
            formDataObj[key] = value;
        }

        // Add images array to formDataObj for validation
        formDataObj.images = imageFiles.length > 0 ? imageFiles : [];

        console.log("FormData object keys:", Object.keys(formDataObj));

        // Parse and validate using zod schema
        try {
            const validatedData = expenseFormSchema.parse(formDataObj);
            console.log("Validation succeeded");
            console.log("Transaction type:", validatedData.transactionType);
            console.log("Amount:", validatedData.amount);
        } catch (validationError) {
            console.error("Validation error:", validationError);
            if (validationError instanceof z.ZodError) {
                return {
                    success: false,
                    error: "Validation error",
                    details: validationError.errors,
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
            console.log("Transaction not found");
            return { success: false, error: "Transaction not found" };
        }

        if (existingTransaction.userId !== user.id) {
            console.log("Permission denied");
            return { success: false, error: "You don't have permission to update this transaction" };
        }

        console.log("Existing transaction found:", existingTransaction.id);
        console.log("Existing attachments:", existingTransaction.attachments.length);

        // Process all new images
        const newAttachments = [];

        for (const imageFile of imageFiles) {
            if (imageFile instanceof File && imageFile.size > 0) {
                try {
                    console.log("Processing new image:", imageFile.name, "Size:", imageFile.size);

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

                    console.log("Image uploaded to Cloudinary:", uploadResponse.secure_url);

                    newAttachments.push({
                        url: uploadResponse.secure_url,
                    });
                } catch (error) {
                    console.error("Image upload error:", error);
                    return { success: false, error: "Failed to upload image" };
                }
            }
        }

        console.log("New attachments to add:", newAttachments.length);

        // Process deleted images
        const imagesToDelete = deleteImagesStr ? String(deleteImagesStr).split(",") : [];
        console.log("Images to delete (IDs):", imagesToDelete);

        // Use transaction to ensure data consistency
        const updatedTransaction = await prisma.$transaction(async (tx) => {
            // 1. Update payment method
            const validatedData = expenseFormSchema.parse(formDataObj);
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
            console.log("Payment method updated");

            // 2. Delete attachments marked for deletion
            if (imagesToDelete.length > 0) {
                for (const attachmentId of imagesToDelete) {
                    if (!attachmentId.trim()) continue;

                    // Get the attachment to delete
                    const attachmentToDelete = await tx.attachment.findUnique({
                        where: { id: attachmentId }
                    });

                    if (attachmentToDelete) {
                        console.log("Deleting attachment:", attachmentId);

                        // Extract Cloudinary public ID to delete the resource
                        if (attachmentToDelete.url) {
                            try {
                                const urlParts = attachmentToDelete.url.split("/");
                                const publicId = urlParts[urlParts.length - 1].split(".")[0];

                                if (publicId) {
                                    await cloudinary.uploader.destroy(`transactions/${user.id}/${publicId}`);
                                    console.log("Deleted from Cloudinary:", publicId);
                                }
                            } catch (error) {
                                console.error("Error deleting from Cloudinary:", error);
                                // Continue with DB deletion even if Cloudinary fails
                            }
                        }

                        // Delete from database
                        await tx.attachment.delete({
                            where: { id: attachmentId }
                        });
                    }
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
            console.log("New attachments added:", newAttachments.length);

            // 4. Update main transaction
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

        console.log("Transaction updated successfully");
        console.log("Updated attachments count:", updatedTransaction.attachments.length);

        return {
            success: true,
            data: updatedTransaction
        };
    } catch (error) {
        // Detailed error handling
        console.error("Transaction update error:", error);

        if (error instanceof z.ZodError) {
            console.log("Zod validation error:", error.errors);
            return {
                success: false,
                error: "Validation error",
                details: error.errors,
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update transaction",
        };
    } finally {
        console.log("=========== UPDATE TRANSACTION END ===========");
    }
}




