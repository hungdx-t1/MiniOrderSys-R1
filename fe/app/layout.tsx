import type { Metadata } from "next";
import { Manrope, Sora, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import NavHeader from "@/components/layout/nav-header";
import CartSidebar from "@/components/order/cart-sidebar";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Order Cafe",
  description: "Giao diện đặt món cafe chất lượng cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        manrope.variable,
        sora.variable,
        geist.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <AuthProvider>
            <NavHeader />
            <CartSidebar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Toaster richColors closeButton position="top-right" />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
