import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UK Visitor Visa Agent",
  description: "A privacy-minded preparation assistant for UK Standard Visitor visa applications.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
