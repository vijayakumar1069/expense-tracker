"use server"

import { cookies } from "next/headers"
import { SignJWT } from "jose"
import { nanoid } from "nanoid"
import bcrypt from "bcryptjs"
import { prisma } from "@/utils/prisma"
import { LoginSchema } from "@/utils/schema/LoginSchema"

export type LoginFormValues = {
    email: string;
    password: string;
    rememberMe?: boolean;
}
type LoginResponse = {
    success: boolean
    message: string
    errors?: Record<string, string[]>
}
export async function loginFunction(data: LoginFormValues): Promise<LoginResponse> {
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
        console.log(secret)
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
            message: "An unexpected error occurred"
        }
    }
}
