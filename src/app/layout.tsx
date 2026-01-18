import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mechanic Driver - Doorstep Car Service",
  description: "Effortless car repair, from your doorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-[#FDFDFD] text-gray-800 antialiased selection:bg-lime-200`}>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
