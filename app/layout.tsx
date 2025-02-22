import type { Metadata } from "next";
import "./globals.css";
import { schibstedGrotesk, candu } from "./ui/fonts"; 

export const metadata: Metadata = {
  title: "The Emerging Markets Network",
  description: "Explore the finance, economics and poltiics of emerging markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${candu.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
