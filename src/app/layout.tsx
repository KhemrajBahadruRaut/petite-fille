"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContexts";
import { UserAuthProvider } from "@/contexts/UserAuthContext";
import { usePathname } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://petitefille.com.au"),
  title: {
    default: "Petite Fille Cafe",
    template: "%s",
  },
  openGraph: {
    type: "website",
    siteName: "Petite Fille Cafe",
    locale: "en_AU",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
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
