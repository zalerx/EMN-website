import type { Metadata } from "next";
import Header from "./components/header";
import Footer from "./components/footer";
import "./ui/globals.css";
import { schibstedGrotesk } from "./ui/fonts"; 

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
      <body className={`antialiased ${schibstedGrotesk.className}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}