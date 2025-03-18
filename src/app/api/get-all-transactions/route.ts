// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";

// Input validation schema
const QuerySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("2"),
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const validatedParams = QuerySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const { page, limit } = validatedParams;
    const skip = (page - 1) * limit;

    // Execute queries in parallel for better performance
    const [transactions, totalItems, aggregates] = await Promise.all([
      // Get paginated transactions
      prisma.transaction.findMany({
        where: {
          userId: user.id,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          paymentMethod: true,
          attachments: true,
        },
      }),

      // Get total count for user's transactions
      prisma.transaction.count({
        where: {
          userId: user.id,
        },
      }),

      // Get aggregated amounts by type
      prisma.transaction.groupBy({
        by: ["type"],
        where: {
          userId: user.id,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Calculate total income and expenses
    const totalIncome = aggregates.find(agg => agg.type === "INCOME")?._sum.amount ?? 0;
    const totalExpenses = aggregates.find(agg => agg.type === "EXPENSE")?._sum.amount ?? 0;
    revalidatePath("/New-Expenses");
    return NextResponse.json({
      transactions,
      pagination: {
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        currentPage: page,
        itemsPerPage: limit,
      },
      summary: {
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
      },
    });

  } catch (error) {
    console.error("Transaction fetch error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle POST requests for creating new transactions
// export async function POST(request: NextRequest) {
//   try {
//     const user = await requireAuth();
//     if (!user) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();

//     // Create transaction with associated payment method
//     const transaction = await prisma.transaction.create({
//       data: {
//         ...body,
//         userId: user.id,
//         paymentMethod: {
//           create: body.paymentMethod,
//         },
//       },
//       include: {
//         paymentMethod: true,
//         attachments: true,
//       },
//     });

//     return NextResponse.json(transaction, { status: 201 });

//   } catch (error) {
//     console.error("Transaction creation error:", error);
//     return NextResponse.json(
//       { error: "Failed to create transaction" },
//       { status: 500 }
//     );
//   }
// }

// Add PUT method for updating transactions
// export async function PUT(request: NextRequest) {
//   try {
//     const user = await requireAuth();
//     if (!user) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const transactionId = searchParams.get("id");
    
//     if (!transactionId) {
//       return NextResponse.json(
//         { error: "Transaction ID is required" },
//         { status: 400 }
//       );
//     }

//     const body = await request.json();

//     // Verify transaction belongs to user
//     const existingTransaction = await prisma.transaction.findFirst({
//       where: {
//         id: transactionId,
//         userId: user.id,
//       },
//     });

//     if (!existingTransaction) {
//       return NextResponse.json(
//         { error: "Transaction not found" },
//         { status: 404 }
//       );
//     }

//     // Update transaction and payment method
//     const updatedTransaction = await prisma.transaction.update({
//       where: {
//         id: transactionId,
//       },
//       data: {
//         ...body,
//         paymentMethod: body.paymentMethod ? {
//           update: body.paymentMethod,
//         } : undefined,
//       },
//       include: {
//         paymentMethod: true,
//         attachments: true,
//       },
//     });

//     return NextResponse.json(updatedTransaction);

//   } catch (error) {
//     console.error("Transaction update error:", error);
//     return NextResponse.json(
//       { error: "Failed to update transaction" },
//       { status: 500 }
//     );
//   }
// }

// Add DELETE method
// export async function DELETE(request: NextRequest) {
//   try {
//     const user = await requireAuth();
//     if (!user) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const transactionId = searchParams.get("id");

//     if (!transactionId) {
//       return NextResponse.json(
//         { error: "Transaction ID is required" },
//         { status: 400 }
//       );
//     }

//     // Verify transaction belongs to user
//     const existingTransaction = await prisma.transaction.findFirst({
//       where: {
//         id: transactionId,
//         userId: user.id,
//       },
//     });

//     if (!existingTransaction) {
//       return NextResponse.json(
//         { error: "Transaction not found" },
//         { status: 404 }
//       );
//     }

//     // Delete transaction (will cascade delete payment method and attachments)
//     await prisma.transaction.delete({
//       where: {
//         id: transactionId,
//       },
//     });

//     return NextResponse.json(
//       { message: "Transaction deleted successfully" },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("Transaction deletion error:", error);
//     return NextResponse.json(
//       { error: "Failed to delete transaction" },
//       { status: 500 }
//     );
//   }
// }
