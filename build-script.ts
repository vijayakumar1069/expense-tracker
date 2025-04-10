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

    // if (env === 'preview' || env === 'production') {
    //     // Add more verbose output for debugging
    //     console.log(`Running migrations for ${env} environment...`);
    //     execSync('npx prisma migrate deploy', {
    //         stdio: 'inherit',
    //         env: { ...process.env, NODE_ENV: env === 'preview' ? 'development' : env }
    //     });
    // }

    console.log("Building Next.js application...");
    execSync('next build', { stdio: 'inherit' });

    console.log("Build completed successfully!");
} catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
}
