import Merchendise from "@/components/merchendise/Merchendise";

export const metadata = {
  title: "Merchandise",
  description:
    "Shop Petite Fille Merchandise — tote bags, mugs, t-shirts & coffee bags. Take a piece of Rosanna's favourite cafe home with you.",
  alternates: {
    canonical: "https://petitefille.com.au/merchandise",
  },
};

export default function Page() {
  return <Merchendise />;
}