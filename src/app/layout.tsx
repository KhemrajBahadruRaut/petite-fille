"use client"
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContexts";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {!isAdmin && <Header />}
        <main>
          <CartProvider>
            {children}
          </CartProvider>
        </main>
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}
