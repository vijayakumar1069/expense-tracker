"use server"

import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import { nanoid } from "nanoid"
import bcrypt from "bcryptjs"
import { prisma } from "@/utils/prisma"
import { LoginSchema } from "@/utils/schema/LoginSchema"
import { getCookie } from "@/lib/sessiongetter"
import { z } from "zod"
import { revalidatePath } from "next/cache"

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
export async function loginFunction(data: z.infer<typeof LoginSchema>) {
    try {
        // 1. Validate input
        const validatedFields = LoginSchema.safeParse(data);

        if (!validatedFields.success) {
            return {
                success: false,
                message: "Validation failed",
                errors: validatedFields.error.flatten().fieldErrors
            };
        }

        const { email, password, rememberMe } = validatedFields.data;

        // 2. Check JWT secret is configured
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length === 0) {

            return {
                success: false,
                message: "Server configuration error",
                code: "AUTH_CONFIG_ERROR"
            };
        }

        // 3. Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return {
                success: false,
                message: "Invalid credentials",
                code: "AUTH_INVALID_CREDENTIALS"
            };
        }

        // 4. Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return {
                success: false,
                message: "Invalid credentials",
                code: "AUTH_INVALID_CREDENTIALS"
            };
        }

        // 5. Clean up expired sessions
        await prisma.session.deleteMany({
            where: {
                userId: user.id,
                expiresAt: { lt: new Date() }
            }
        });

        // 6. Generate session token
        const sessionToken = nanoid(32);

        // 7. Set expiration times
        const shortExpiryTime = 12 * 60 * 60 * 1000; // 12 hours
        const longExpiryTime = 12 * 24 * 60 * 60 * 1000; // 12 days
        const expiresAt = new Date(
            Date.now() + (rememberMe ? longExpiryTime : shortExpiryTime)
        );

        // 8. Create session in database
        await prisma.session.create({
            data: {
                id: sessionToken,
                userId: user.id,
                expiresAt
            }
        });


        // 9. Generate JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

        const token = await new SignJWT({
            userId: user.id,
            email: user.email,
            sessionToken,
            role: user.role
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime(rememberMe ? "12d" : "12h")
            .sign(secret);

        // 10. Set cookies
        const cookieStore = await cookies();
        cookieStore.set("Expense-tracker-session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: expiresAt
        });



        return {
            success: true,
            message: "Login successful"
        };
    } catch (error) {


        return {
            success: false,
            message: process.env.NODE_ENV === "development"
                ? (error instanceof Error ? error.message : "Unknown error")
                : "An unexpected error occurred",
            code: "AUTH_SERVER_ERROR"
        };
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

        cookieStore.delete({
            name: "Expense-tracker-session",
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });
        revalidatePath("/dashboard");

        return {
            success: true,
            message: "Logged out successfully"
        };

    } catch (error) {
        // Log error for monitoring but don't expose details to client


        // Attempt to clear cookie even if other operations fail
        try {
            cookieStore.delete("Expense-tracker-session");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (cookieError) {

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