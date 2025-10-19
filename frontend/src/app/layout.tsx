import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UploadProvider } from "@/context/UploadContext";
import AppWrapper from "./AppWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bajaj Finserv AMC",
  description: "RAG chatbot for Bajaj AMC factsheets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <UploadProvider>
          <AppWrapper>{children}</AppWrapper>
        </UploadProvider>
      </body>
    </html>
  );
}
