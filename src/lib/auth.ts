"use server"
import { prisma } from "@/utils/prisma";
import { AuthUser } from "@/utils/types";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getAuthUser(): Promise<AuthUser | null> {
    try {
        const sessionConst = await cookies()
        const sessionToken = sessionConst.get("Expense-tracker-session")?.value;


        if (!sessionToken) {
            return null;
        }

        // Verify JWT token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(sessionToken, secret);

        // Verify session exists and is not expired
        const session = await prisma.session.findUnique({
            where: {
                id: payload.sessionToken as string,
                expiresAt: { gt: new Date() },
            },
            include: {
                user: true,
            },
        });

        if (!session) {
            return null;
        }



        return {
            id: session.user.id,
            email: session.user.email,
            sessionToken: session.id,
        };
    } catch (error) {
        console.error("Auth error:", error);
        return null;
    }
}

// Middleware to check authentication
export async function requireAuth() {
    const user = await getAuthUser();

    if (!user) {
        redirect("/login");
    }
    return user;
}