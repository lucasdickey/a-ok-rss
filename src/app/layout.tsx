import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "A-OK RSS - Podcast RSS Hosting Platform",
  description: "A podcast RSS hosting platform with AI-powered transcription and chapter generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <Navbar />
          <main className="pt-4">{children}</main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
