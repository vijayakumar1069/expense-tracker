"use server"


import { requireAuth } from "@/lib/auth";
import cloudinary from "@/lib/clodinary";
import { prisma } from "@/utils/prisma";
import { expenseFormSchema } from "@/utils/schema/expenseSchema";
import { PaymentMethodType } from "@prisma/client";



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

// export async function updateExpense(expenseId: string, formData: FormData) {
//     try {
//         const session = await auth();
//         if (!session?.user) {
//             throw new Error("Unauthorized");
//         }

//         // Validate ownership
//         const existingExpense = await prisma.expense.findUnique({
//             where: { id: expenseId },
//             include: { attachment: true },
//         });

//         if (!existingExpense) {
//             throw new Error("Expense not found");
//         }

//         if (existingExpense.userId !== user.id) {
//             throw new Error("Not authorized to update this expense");
//         }

//         // Parse and validate form data
//         const rawFormData = Object.fromEntries(formData.entries());
//         const validatedData = ExpenseSchema.parse({
//             ...rawFormData,
//             tax: rawFormData.tax ? Number(rawFormData.tax) : undefined,
//         });

//         let attachmentData = null;
//         const imageFile = formData.get("image") as File;

//         // Handle image upload if new image is provided
//         if (imageFile && imageFile.size > 0) {
//             try {
//                 const bytes = await imageFile.arrayBuffer();
//                 const buffer = Buffer.from(bytes);
//                 const base64String = buffer.toString('base64');
//                 const dataURI = `data:${imageFile.type};base64,${base64String}`;

//                 const uploadResponse = await cloudinary.uploader.upload(dataURI, {
//                     folder: `expenses/${user.id}`,
//                     resource_type: "auto",
//                     transformation: [
//                         { quality: "auto:best" },
//                         { width: 1500, crop: "limit" }
//                     ],
//                 });

//                 attachmentData = {
//                     url: uploadResponse.secure_url,
//                 };

//                 // Delete old image if exists
//                 if (existingExpense.attachment?.[0]?.url) {
//                     const publicId = existingExpense.attachment[0].url
//                         .split("/")
//                         .pop()
//                         ?.split(".")[0];
//                     if (publicId) {
//                         await cloudinary.uploader.destroy(publicId);
//                     }
//                 }
//             } catch (error) {
//                 console.error("Cloudinary upload error:", error);
//                 throw new Error("Failed to upload image");
//             }
//         }

//         // Update expense with transaction
//         const updatedExpense = await prisma.$transaction(async (tx) => {
//             // Update payment method
//             await tx.paymentMethod.update({
//                 where: { expenseId },
//                 data: {
//                     name: validatedData.paymentMethodName,
//                     type: validatedData.paymentMethodType,
//                     receivedBy: validatedData.receivedBy,
//                     bankName: validatedData.bankName,
//                     chequeNo: validatedData.chequeNo,
//                     chequeDate: validatedData.chequeDate
//                         ? new Date(validatedData.chequeDate)
//                         : null,
//                 },
//             });

//             // Update attachment if new image was uploaded
//             if (attachmentData) {
//                 await tx.attachment.upsert({
//                     where: { expenseId },
//                     create: {
//                         ...attachmentData,
//                         expenseId,
//                     },
//                     update: attachmentData,
//                 });
//             }

//             // Update expense
//             return await tx.expense.update({
//                 where: { id: expenseId },
//                 data: {
//                     name: validatedData.name,
//                     description: validatedData.description,
//                     amount: parseFloat(validatedData.amount),
//                     tax: validatedData.tax,
//                     total: parseFloat(validatedData.total),
//                     date: new Date(validatedData.date),
//                     category: validatedData.category,
//                 },
//                 include: {
//                     paymentMethod: true,
//                     attachment: true,
//                 },
//             });
//         });

//         revalidatePath("/expenses");
//         return { success: true, data: updatedExpense };
//     } catch (error) {
//         console.error("Update expense error:", error);
//         return {
//             success: false,
//             error: error instanceof Error ? error.message : "Failed to update expense",
//         };
//     }
// }

// // Usage in your component:
// // src/app/expenses/page.tsx
// "use client";

// import { createExpense, updateExpense, deleteExpense } from "@/lib/actions/expense";
// import cloudinary from "@/lib/clodinary";
// import { prisma } from "@/utils/prisma";
// import { requireAuth } from "@/lib/auth";

// export default function ExpensePage() {
//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const formData = new FormData(e.currentTarget);
//         const result = await createExpense(formData);
//         if (result.success) {
//             // Handle success
//         } else {
//             // Handle error
//         }
//     };

//     return (
//         <form onSubmit= { handleSubmit } >
//         {/* Your form fields here */ }
//         </form>
//   );
// }
