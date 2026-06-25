import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Take a look inside Petite Fille — food, coffee, and the space we've built in Rosanna. Browse our gallery and see what's waiting for you.",
  alternates: {
    canonical: "https://petitefille.com.au/gallery",
  },
  openGraph: {
    title: "Gallery | Petite Fille Cafe, Rosanna",
    description:
      "Take a look inside Petite Fille — food, coffee, and the space we've built in Rosanna. Browse our gallery and see what's waiting for you.",
    url: "https://petitefille.com.au/gallery",
    images: [
      {
        url: "https://petitefille.com.au/mainimage/main-image.webp",
        width: 1200,
        height: 630,
        alt: "Petite Fille Cafe Rosanna Gallery",
      },
    ],
  },
};

export default function Page() {
  return <GalleryClient />;
}
