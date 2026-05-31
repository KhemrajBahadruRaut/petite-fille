import GiftCard from "@/components/giftCard/GiftCard";
// import InstagramFeed from "@/components/instagram/InstagramFeed";
import MainPage from "@/components/mainpage/MainPage";
import Welcome from "@/components/welcomePage/welcome";
import WhatWeOffer from "@/components/whatWeOffer/WhatWeOffer";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Petite Fille Cafe | Specialty Coffee & Brunch in Rosanna Melbourne",
  description:
    "Visit Petite Fille Cafe in Rosanna for Melbourne’s best specialty coffee, all-day breakfast, brunch favourites, fresh pastries, and seasonal cafe dishes.",
  keywords: [
    "cafe in Rosanna",
    "brunch in Rosanna",
    "all day breakfast Rosanna",
    "specialty coffee Rosanna",
    "Melbourne brunch cafe",
    "cafe near Heidelberg",
    "cafe near Ivanhoe",
    "family friendly cafe Rosanna",
  ],
};

export default async function Home() {

  return (
    <div>
      <MainPage />
      <Welcome />
      <WhatWeOffer />
      <GiftCard />
    </div>
  );
}

