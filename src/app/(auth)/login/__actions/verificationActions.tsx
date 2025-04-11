"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";

export async function verifyPassword(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if user is authenticated
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    // Extract password from formData
    const enteredPassword = formData.get("password");
    if (typeof enteredPassword !== "string") {
      return {
        success: false,
        message: "Invalid password input",
      };
    }

    // Fetch user from the database
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!existingUser || !existingUser.password) {
      return {
        success: false,
        message: "User record not found",
      };
    }

    // Compare entered password with stored hashed password
    const passwordMatch = await bcrypt.compare(
      enteredPassword,
      existingUser.password
    );

    if (!passwordMatch) {
      return {
        success: false,
        message: "Incorrect password",
      };
    }

    return {
      success: true,
      message: "Password verified",
    };
  } catch (error) {
    console.error("Error verifying password:", error);
    return {
      success: false,
      message: "Error verifying password",
    };
  }
}
