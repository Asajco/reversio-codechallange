import type { Metadata } from "next";
import { ThemeToggle } from "@/app/components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shopify Return Creator",
  description: "Create a Shopify return from an order ID and customer email.",
};

const themeInitScript = `(()=>{try{var k="reversio-theme";var s=localStorage.getItem(k);var dark=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark)}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
