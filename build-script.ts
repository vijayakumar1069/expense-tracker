import { execSync } from "child_process";
import 'dotenv/config';
// VERCEL_ENV is automatically set by Vercel


try {
    // Always generate the Prisma client

    execSync('npx prisma generate', { stdio: 'inherit' });




    execSync('next build', { stdio: 'inherit' });


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (error) {
    process.exit(1);
}
