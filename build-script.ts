import { execSync } from "child_process";

// VERCEL_ENV is automatically set by Vercel
const env = process.env.VERCEL_ENV || 'development';

console.log(`Building for environment: ${env}`);

if (env === 'preview') {
    // Run preview-specific build command
    execSync('npx prisma generate && npx prisma migrate deploy && next build', { stdio: 'inherit' });
} else if (env === 'production') {
    // Run production-specific build command
    execSync('npx prisma generate && npx prisma migrate deploy && next build', { stdio: 'inherit' });
} else {
    // Development build
    execSync('next build', { stdio: 'inherit' });
}
