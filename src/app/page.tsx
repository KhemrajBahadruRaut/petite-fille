import type { Metadata } from "next";
import GiftCard from "@/components/giftCard/GiftCard";
import MainPage from "@/components/mainpage/MainPage";
import Welcome from "@/components/welcomePage/welcome";
import WhatWeOffer from "@/components/whatWeOffer/WhatWeOffer";
import InstagramFeed from "@/components/instagramFeed/InstagramFeed";
import "./globals.css";

export const metadata: Metadata = {
  title: "Petite Fille | Cafe Rosanna - Breakfast, Brunch & Coffee",
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
  alternates: {
    canonical: "https://petitefille.com.au",
  },
  openGraph: {
    title: "Petite Fille | Cafe Rosanna - Breakfast, Brunch & Coffee",
    description:
      "Enjoy fresh breakfast, brunch, and specialty coffee at Petite Fille, your local cafe in Rosanna. Visit us today for great food, coffee, and friendly service.",
    url: "https://petitefille.com.au",
    images: [
      {
        url: "https://petitefille.com.au/mainimage/main-image.webp",
        width: 1200,
        height: 630,
        alt: "Petite Fille Cafe Rosanna",
      },
    ],
  },
};

export default async function Home() {
  return (
    <div>
      <MainPage />
      <Welcome />
      <WhatWeOffer />
      <GiftCard />
      <InstagramFeed />
    </div>
  );
}
