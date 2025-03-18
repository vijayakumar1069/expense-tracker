"use server"

import { cookies } from "next/headers"

export async function getCookie() {
    const cookie = await cookies();
    const session = cookie.get("Expense-tracker-session")?.value

    return session;
}