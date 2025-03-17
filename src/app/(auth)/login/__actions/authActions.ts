"use server"

import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import { nanoid } from "nanoid"
import bcrypt from "bcryptjs"
import { prisma } from "@/utils/prisma"
import { LoginSchema } from "@/utils/schema/LoginSchema"
import { getCookie } from "@/lib/sessiongetter"

export type LoginFormValues = {
    email: string;
    password: string;
    rememberMe?: boolean;
}
type ReturnResponse = {
    success: boolean
    message: string
    errors?: Record<string, string[]>
}
export async function loginFunction(data: LoginFormValues): Promise<ReturnResponse> {
    try {
        // Extract and validate form data
        const validatedFields = LoginSchema.safeParse(data);

        // Return validation errors if any
        if (!validatedFields.success) {
            return {
                success: false,
                message: "Validation failed",
                errors: validatedFields.error.flatten().fieldErrors
            }
        }

        const { email, password, rememberMe } = validatedFields.data

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })


        if (!user) {
            return {
                success: false,
                message: "Invalid credentials"
            }
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            return {
                success: false,
                message: "Invalid credentials"
            }
        }

        // Generate session token
        const sessionToken = nanoid(32)

        // Create session in database
        await prisma.session.create({
            data: {
                id: sessionToken,
                userId: user.id,
                expiresAt: rememberMe
                    ? new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) // 30 days
                    : new Date(Date.now() + 12 * 60 * 60 * 1000) // 24 hours
            }
        })

        // Generate JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)

        const token = await new SignJWT({
            userId: user.id,
            email: user.email,
            sessionToken
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime(rememberMe ? "12d" : "12h")
            .sign(secret)

        // Set cookies
        const cookieStore = await cookies()
        cookieStore.set("Expense-tracker-session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: rememberMe
                ? new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 12 * 60 * 60 * 1000)
        })

        return {
            success: true,
            message: "Login successful"
        }

    } catch (error) {
        console.error("Login error:", error)

        // if (error instanceof AuthError) {
        //     return {
        //         success: false,
        //         message: error.message
        //     }
        // }

        return {
            success: false,
            message: "An unexpected error occurred",
            errors: {
                general: [process.env.NODE_ENV === "development"
                    ? (error as Error).message
                    : "Internal server error"]
            }
        }
    }
}


export async function logoutFunction(): Promise<ReturnResponse> {
    const cookieStore = await cookies();

    try {
        // Get session token from cookie
        const sessionToken = await getCookie();

        if (!sessionToken) {
            // If no session token exists, just clear the cookie
            cookieStore.delete("Expense-tracker-session");
            return {
                success: true,
                message: "Already logged out"
            };
        }

        // Verify JWT token
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const decoded = await jwtVerify(sessionToken, secret);
            console.log("Decoded JWT:", decoded);

            if (decoded) {
                // Delete session from database using a transaction
                await prisma.$transaction(async (tx) => {
                    // Delete all expired sessions for cleanup
                    await tx.session.deleteMany({
                        where: {
                            OR: [
                                { id: decoded.payload.sessionToken as string },
                                { expiresAt: { lt: new Date() } }
                            ]
                        }
                    });
                });
            }
        } catch (jwtError) {
            // If JWT verification fails, continue with logout
            console.warn("JWT verification failed during logout:", jwtError);
        }

        cookieStore.delete("Expense-tracker-session");

        return {
            success: true,
            message: "Logged out successfully"
        };

    } catch (error) {
        // Log error for monitoring but don't expose details to client
        console.error("Logout error:", error);

        // Attempt to clear cookie even if other operations fail
        try {
            cookieStore.delete("Expense-tracker-session");
        } catch (cookieError) {
            console.error("Failed to clear cookie:", cookieError);
        }

        return {
            success: false,
            message: "Logout encountered an error",
            errors: {
                general: [process.env.NODE_ENV === "development"
                    ? (error as Error).message
                    : "Internal server error"]
            }
        };
    }
}   