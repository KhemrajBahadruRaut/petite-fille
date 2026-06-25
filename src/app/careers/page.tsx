import type { Metadata } from "next";
import CareersPage from "@/components/careers/careers";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the Petite Fille team in Rosanna. We're always looking for passionate baristas, chefs & hospitality staff. Check current openings or send us your resume.",
  alternates: {
    canonical: "https://petitefille.com.au/careers",
  },
  openGraph: {
    title: "Careers | Petite Fille Cafe, Rosanna",
    description:
      "Join the Petite Fille team in Rosanna. We're always looking for passionate baristas, chefs & hospitality staff. Check current openings or send us your resume.",
    url: "https://petitefille.com.au/careers",
    images: [
      {
        url: "https://petitefille.com.au/mainimage/main-image.webp",
        width: 1200,
        height: 630,
        alt: "Careers at Petite Fille Cafe Rosanna",
      },
    ],
  },
};

export default function Page() {
  return (
    <div>
      <CareersPage />
    </div>
  );
}
