import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

import { SessionProvider } from "@/context/SessionContext";
import ReactQueryProvider from "@/lib/ReactQueryProvider";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "ForFarm - Smart Farming Solutions",
  description: "Optimize your agricultural business with AI-driven insights and real-time data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <SessionProvider>
        <ReactQueryProvider>
          <body className={`${poppins.variable}`}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1 bg-background">{children}</div>
              </div>
            </ThemeProvider>
          </body>
        </ReactQueryProvider>
      </SessionProvider>
    </html>
  );
}
