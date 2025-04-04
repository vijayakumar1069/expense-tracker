import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/ui components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Tracker | Manage Your Finances",
  description:
    "A simple and intuitive expense tracker application to help you monitor your income and expenses, create budgets, and track your financial goals.",
  keywords: [
    "expense tracker",
    "finance",
    "budget",
    "money management",
    "financial planner",
    "income tracking",
  ],
  authors: [{ name: "Your Name" }],
  viewport: "width=device-width, initial-scale=1.0",
  openGraph: {
    title: "Expense Tracker | Manage Your Finances",
    description:
      "Track your income and expenses with our simple yet powerful Expense Tracker app",
    type: "website",
    siteName: "Expense Tracker",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  themeColor: "#4ade80",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full bg-primary-foreground`}
      >
        <QueryProvider>
          {children}
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
