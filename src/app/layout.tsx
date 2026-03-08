"use client"
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContexts";
import { UserAuthProvider } from "@/contexts/UserAuthContext";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <UserAuthProvider>
          {!isAdmin && <Header />}
          <main>
            <CartProvider>{children}</CartProvider>
          </main>
          {!isAdmin && <Footer />}
          <Toaster />
        </UserAuthProvider>
      </body>
    </html>
  );
}
