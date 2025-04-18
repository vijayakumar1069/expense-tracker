import { execSync } from "child_process";
import 'dotenv/config';
// VERCEL_ENV is automatically set by Vercel
const env = process.env.VERCEL_ENV || 'development';

console.log(`Building for environment: ${env}`);
console.log("DATABASE_URL configured:", !!process.env.DATABASE_URL);

try {
    // Always generate the Prisma client
    console.log("Generating Prisma client...");
    execSync('npx prisma generate', { stdio: 'inherit' });



    console.log("Building Next.js application...");
    execSync('next build', { stdio: 'inherit' });

    console.log("Build completed successfully!");
} catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
}
