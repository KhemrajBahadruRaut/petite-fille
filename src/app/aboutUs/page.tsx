"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "../globals.css";
import { apiUrl, normalizeApiAssetUrl } from "@/utils/api";

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  transition: { duration: 0.8 },
  viewport: { once: true, amount: 0.3 },
};

const slideIn = (x: number, y: number) => ({
  initial: { x, y, opacity: 0 },
  whileInView: { x: 0, y: 0, opacity: 1 },
  transition: { duration: 1 },
  viewport: { once: true, amount: 0.3 },
});

interface AboutSection {
  paragraph1: string;
  paragraph2: string;
  image1?: string;
  image2?: string;
}

interface AboutContent {
  top: AboutSection;
  bottom: AboutSection;
}

function normalizeAboutSection(section?: AboutSection): AboutSection {
  return {
    paragraph1: section?.paragraph1 || "",
    paragraph2: section?.paragraph2 || "",
    image1: section?.image1 ? normalizeApiAssetUrl(section.image1) : "",
    image2: section?.image2 ? normalizeApiAssetUrl(section.image2) : "",
  };
}

export default function AboutUs() {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(apiUrl("about/aboutus.php"), {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }
        const data: AboutContent = await res.json();
        setContent({
          top: normalizeAboutSection(data.top),
          bottom: normalizeAboutSection(data.bottom),
        });
      } catch {
        // Silently handle errors
        setContent(null);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchContent();
  }, []);

  if (!content) return <p>Loading...</p>;

  return (
    <div className="bg-white pt-10">
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Centered faint background image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 pointer-events-none">
          <img
            src="/mainimage/main-image.webp"
            alt=""
            width={500}
            height={500}
            className="opacity-30 object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-10 sm:mb-12">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-600 mb-4"
            style={{ fontFamily: "fairplaybold" }}
          >
            About us
          </h2>
          <p
            className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base"
            style={{ fontFamily: "arial" }}
          >
           Welcome to Petite Fille, proudly based in Rosanna.
          </p>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start relative">
          {/* Left text */}
          <div
            className="md:col-span-6 text-gray-700 leading-relaxed space-y-4 pt-10 text-sm sm:text-base text-justify"
            style={{ fontFamily: "arial" }}
          >
            <p>{content.top.paragraph1}</p>
            <p>{content.top.paragraph2}</p>
          </div>

          {/* Frame 1 with 2 images */}
          <div className="md:col-span-6 relative w-full max-w-[400px] h-[350px] sm:h-[350px] md:h-[400px] mx-auto">
            <motion.div {...fadeIn} className="absolute inset-0 z-10">
              <img
                src="/about/frame/Frame1.webp"
                alt="Frame 1"
                className="object-contain"
              />
            </motion.div>
            <motion.div
              {...slideIn(50, 50)}
              className="absolute top-3 sm:right-48 md:right-44 w-42 sm:w-40 md:w-50 z-12"
            >
              <img
                src={content.top.image1}
                alt="Image 1"
                width={200}
                height={200}
                className="object-contain"
              />
            </motion.div>
            <motion.div
              {...slideIn(-50, -50)}
              className="absolute bottom-[-55px] sm:bottom-4 right-4 sm:right-6 w-42 sm:w-44 md:w-48 z-11"
            >
              <img
                src={content.top.image2}
                alt="Image 2"
                width={200}
                height={200}
                className="object-contain"
              />
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start relative">
          <div className="md:col-span-6 max-sm:hidden relative w-full max-w-[400px] h-[300px] sm:h-[350px] md:h-[400px] mx-auto">
            <motion.div {...fadeIn} className="absolute inset-0 z-10">
              <img
                src="/about/frame/Frame2.webp"
                alt="Frame 2"
                className="object-contain"
              />
            </motion.div>
            <motion.div
              {...slideIn(-50, 50)}
              className="absolute right-2 top-5 sm:right-3 w-32 sm:w-40 md:w-46 z-11"
            >
              <img
                src={content.bottom.image1}
                alt="Image 3"
                width={180}
                height={180}
                className="object-contain"
              />
            </motion.div>
            <motion.div
              {...slideIn(50, -50)}
              className="absolute bottom-5 left-2 sm:left-3 w-44 sm:w-52 md:w-60 z-12"
            >
              <img
                src={content.bottom.image2}
                alt="Image 4"
                width={240}
                height={240}
                className="object-contain"
              />
            </motion.div>
          </div>

          {/* Right text */}
          <div
            className="md:col-span-6 text-gray-700 leading-relaxed space-y-4 pt-16 sm:pt-2 md:pt-20 text-sm sm:text-base text-justify"
            style={{ fontFamily: "arial" }}
          >
            <p>{content.bottom.paragraph1}</p>
            <p>{content.bottom.paragraph2}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
