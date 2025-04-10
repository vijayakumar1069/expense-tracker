import { execSync } from "child_process";

// VERCEL_ENV is automatically set by Vercel
const env = process.env.VERCEL_ENV || 'development';

console.log(`Building for environment: ${env}`);

// Add verbose logging
console.log("Checking DATABASE_URL is set:", !!process.env.DATABASE_URL);

try {
    // Always generate the Prisma client first
    console.log("Generating Prisma client...");
    execSync('npx prisma generate', { stdio: 'inherit' });

    if (env === 'preview' || env === 'production') {
        // Run migrations carefully
        console.log("Running database migrations...");
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }

    // Build the Next.js application
    console.log("Building Next.js application...");
    execSync('next build', { stdio: 'inherit' });
} catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
}
