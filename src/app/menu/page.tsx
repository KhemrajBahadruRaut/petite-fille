import type { Metadata } from "next";
import Menu from "@/components/menu/Menu";

export const metadata: Metadata = {
  title: "Our Menu ",
  description:
    "From morning coffee and breakfast to brunch and lunch — browse the full Petite Fille menu. Fresh, seasonal and made with care.",
  alternates: {
    canonical: "https://petitefille.com.au/menu",
  },
  openGraph: {
    title: "Our Menu | Petite Fille Cafe, Rosanna",
    description:
      "From morning coffee and breakfast to brunch and lunch — browse the full Petite Fille menu. Fresh, seasonal and made with care.",
    url: "https://petitefille.com.au/menu",
    images: [
      {
        url: "https://petitefille.com.au/mainimage/main-image.webp",
        width: 1200,
        height: 630,
        alt: "Petite Fille Cafe Rosanna Menu",
      },
    ],
  },
};

export default function Page() {
  return (
    <div>
      <Menu />
    </div>
  );
}
