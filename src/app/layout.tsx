import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: {
    default: "Petite Fille | Cafe Rosanna - Breakfast, Brunch & Coffee",
    template: "%s | Petite Fille Cafe Rosanna",
  },
  description:
    "Enjoy fresh breakfast, brunch, and specialty coffee at Petite Fille, your local cafe in Rosanna. Visit us today for great food, coffee, and friendly service.",
  keywords: [
    "Petite Fille",
    "Cafe Rosanna",
    "breakfast cafe Rosanna",
    "breakfast and brunch cafe rosanna",
    "coffee shops rosanna",
    "cafes near Rosanna",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://petitefille.com.au",
    siteName: "Petite Fille Cafe",
    title: "Petite Fille | Cafe Rosanna - Breakfast, Brunch & Coffee",
    description:
      "Enjoy fresh breakfast, brunch, and specialty coffee at Petite Fille, your local cafe in Rosanna. Visit us today for great food, coffee, and friendly service.",
    images: [
      {
        url: "https://petitefille.com.au/mainimage/main-image.webp",
        width: 1200,
        height: 630,
        alt: "Petite Fille Cafe Rosanna",
      },
    ],
  },
  alternates: {
    canonical: "https://petitefille.com.au",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
