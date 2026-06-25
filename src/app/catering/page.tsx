import Catering from "./Catering";

export const metadata = {
  title: "Catering Services",
  description:
    "Petite Fille offers fresh catering for events, offices & special occasions in Rosanna. Platters, breakfast packs, bespoke menus & more. Order 24–48hrs in advance.",
  alternates: {
    canonical: "https://petitefille.com.au/catering",
  },
};

export default function Page() {
  return <Catering />;
}