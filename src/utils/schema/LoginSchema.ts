import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string()
        .email("Please enter a valid email address")
        .min(5, "Email must be at least 5 characters")
        .max(64, "Email must be less than 64 characters"),
    password: z.string()
        .min(1, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters"),
    // .regex(
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    //     "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    // ),
    rememberMe: z.boolean().optional()
})


