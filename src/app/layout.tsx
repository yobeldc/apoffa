import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PrivacyProvider } from "@/components/privacy-provider";
import { AppShell } from "@/components/app-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "APOFF-AI - Legal Research Platform",
  description: "AI-powered legal case analysis and research platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PrivacyProvider>
            <AppShell>{children}</AppShell>
          </PrivacyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
