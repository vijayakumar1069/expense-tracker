"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/utils/prisma";
import { ClientFormValues, clientSchema, UpdateTransactionResult } from "@/utils/types";


/**
 * Add a new client
 */
export async function addClient(
    client: ClientFormValues
): Promise<UpdateTransactionResult> {
    try {
        // Authenticate user
        const user = await requireAuth();
        if (!user) {
            return {
                success: false,
                error: "Unauthorized",
            };
        }

        // Validate client data
        const validatedData = clientSchema.parse(client);
        console.log(validatedData);

        // Create client in database
        const newClient = await prisma.client.create({
            data: {
                ...validatedData,
                userId: user.id,
            },
        });

        return {
            success: true,
            data: newClient,
        };
    } catch (error) {
        console.error("Error adding client:", error);

        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation error",
                data: error.errors,
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to add client",
        };
    }
}

/**
 * Update an existing client
 */
export async function updateClient(
    client: ClientFormValues & { id: string }
): Promise<UpdateTransactionResult> {
    try {
        // Authenticate user
        const user = await requireAuth();
        if (!user) {
            return {
                success: false,
                error: "Unauthorized",
            };
        }

        // Ensure client ID exists
        if (!client?.id) {
            return {
                success: false,
                error: "Client ID is required for updates",
            };
        }

        // Validate client data
        const validatedData = clientSchema.parse(client);

        // Check if client exists and belongs to user
        const existingClient = await prisma.client.findUnique({
            where: { id: client.id },
        });

        if (!existingClient) {
            return {
                success: false,
                error: "Client not found",
            };
        }

        if (existingClient.userId !== user.id) {
            return {
                success: false,
                error: "You don't have permission to update this client",
            };
        }

        // Update client in database
        const updatedClient = await prisma.client.update({
            where: { id: client.id },
            data: {
                name: validatedData.name,
                email: validatedData.email,
                phone: validatedData.phone,
                companyName: validatedData.companyName,
                streetName: validatedData.streetName,
                city: validatedData.city,
                state: validatedData.state,
                zip: validatedData.zip,
                country: validatedData.country,

            },
        });

        return {
            success: true,
            data: updatedClient,
        };
    } catch (error) {
        console.error("Error updating client:", error);

        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: "Validation error",
                data: error.errors,
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update client",
        };
    }
}
/**
 * Delete an existing client
 */
export async function deleteClient(
    clientId: string
): Promise<UpdateTransactionResult> {
    try {
        // Authenticate user
        const user = await requireAuth();
        if (!user) {
            return {
                success: false,
                error: "Unauthorized",
            };
        }

        // Check if client exists and belongs to user
        const existingClient = await prisma.client.findUnique({
            where: { id: clientId },
        });

        if (!existingClient) {
            return {
                success: false,
                error: "Client not found",
            };
        }

        if (existingClient.userId !== user.id) {
            return {
                success: false,
                error: "You don't have permission to delete this client",
            };
        }

        // Delete client from database
        await prisma.client.delete({
            where: { id: clientId },
        });

        return {
            success: true,
            data: { id: clientId },
        };
    } catch (error) {
        console.error("Error deleting client:", error);

        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete client",
        };
    }
}

