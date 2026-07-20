"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "../globals.css";
import {
  apiUrl,
  normalizeApiAssetUrl,
  withCacheVersion,
} from "../../utils/api";

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

function AboutUsLoading() {
  return (
    <div className="min-h-screen bg-white pt-24" aria-busy="true">
      <span className="sr-only">Loading About Us content</span>
      <section className="mx-auto max-w-6xl animate-pulse px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-12 flex flex-col items-center gap-4">
          <div className="h-9 w-40 rounded-md bg-stone-200" />
          <div className="h-4 w-full max-w-md rounded bg-stone-100" />
        </div>

        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div className="space-y-4">
            <div className="h-4 rounded bg-stone-200" />
            <div className="h-4 rounded bg-stone-200" />
            <div className="h-4 w-5/6 rounded bg-stone-200" />
            <div className="h-4 w-2/3 rounded bg-stone-100" />
          </div>
          <div className="mx-auto h-72 w-full max-w-sm rounded-3xl bg-stone-100 sm:h-80" />
        </div>

        <div className="mt-12 hidden grid-cols-2 items-center gap-10 md:grid">
          <div className="mx-auto h-72 w-full max-w-sm rounded-3xl bg-stone-100" />
          <div className="space-y-4">
            <div className="h-4 rounded bg-stone-200" />
            <div className="h-4 rounded bg-stone-200" />
            <div className="h-4 w-5/6 rounded bg-stone-200" />
            <div className="h-4 w-2/3 rounded bg-stone-100" />
          </div>
        </div>
      </section>
    </div>
  );
}

function normalizeAboutSection(
  section?: AboutSection,
  version = Date.now(),
): AboutSection {
  return {
    paragraph1: section?.paragraph1 || "",
    paragraph2: section?.paragraph2 || "",
    image1: section?.image1
      ? withCacheVersion(normalizeApiAssetUrl(section.image1), version)
      : "",
    image2: section?.image2
      ? withCacheVersion(normalizeApiAssetUrl(section.image2), version)
      : "",
  };
}

export default function AboutUs() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let hasLoaded = false;
    let controller: AbortController | null = null;

    const fetchContent = async () => {
      controller?.abort();
      controller = new AbortController();
      const requestController = controller;
      const timeoutId = window.setTimeout(() => requestController.abort(), 5000);
      const version = Date.now();

      try {
        const res = await fetch(
          withCacheVersion(apiUrl("about/aboutus.php"), version),
          {
            cache: "no-store",
            signal: requestController.signal,
          },
        );

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }
        const data: AboutContent = await res.json();
        if (active) {
          setContent({
            top: normalizeAboutSection(data.top, version),
            bottom: normalizeAboutSection(data.bottom, version),
          });
          hasLoaded = true;
        }
      } catch {
        // Preserve already-rendered content if a background refresh fails.
        if (active && requestController === controller && !hasLoaded) {
          setContent(null);
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (active && requestController === controller) setIsLoading(false);
      }
    };

    fetchContent();
    // An editor commonly switches from the admin tab to this page to check the
    // result. Refetch on focus so that check does not require a hard refresh.
    window.addEventListener("focus", fetchContent);

    return () => {
      active = false;
      window.removeEventListener("focus", fetchContent);
      controller?.abort();
    };
  }, []);

  if (isLoading) return <AboutUsLoading />;

  if (!content) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-white px-6 pt-24 text-center">
        <div>
          <h1 className="text-3xl font-semibold text-stone-700">About Us</h1>
          <p className="mt-3 text-sm text-stone-500">
            This content is temporarily unavailable. Please try again shortly.
          </p>
        </div>
      </div>
    );
  }

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
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-600 mb-4"
            style={{ fontFamily: "fairplaybold" }}
          >
            About Us <p className="sr-only"> Petite Fille Cafe Rosanna</p>
          </h1>
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
          <div className="md:col-span-6 relative w-full max-w-100 h-87.5 sm:h-87.5 md:h-100 mx-auto">
            <motion.div {...fadeIn} className="absolute inset-0 z-10">
              <img
                src="/about/frame/Frame1.webp"
                alt=""
                aria-hidden="true"
                className="object-contain"
              />
            </motion.div>
            <motion.div
              {...slideIn(50, 50)}
              className="absolute top-3 sm:right-48 md:right-44 w-42 sm:w-40 md:w-50 z-12"
            >
              <img
                src={content.top.image1}
                alt="Petite Fille Cafe Rosanna dining experience"
                width={200}
                height={200}
                decoding="async"
                className="object-contain"
              />
            </motion.div>
            <motion.div
              {...slideIn(-50, -50)}
              className="absolute -bottom-13.75 sm:bottom-4 right-4 sm:right-6 w-42 sm:w-44 md:w-48 z-11"
            >
              <img
                src={content.top.image2}
                alt="Fresh food served at Petite Fille Cafe Rosanna"
                width={200}
                height={200}
                decoding="async"
                className="object-contain"
              />
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start relative">
          <div className="md:col-span-6 max-sm:hidden relative w-full max-w-100 h-75 sm:h-87.5 md:h-100 mx-auto">
            <motion.div {...fadeIn} className="absolute inset-0 z-10">
              <img
                src="/about/frame/Frame2.webp"
                alt=""
                aria-hidden="true"
                className="object-contain"
              />
            </motion.div>
            <motion.div
              {...slideIn(-50, 50)}
              className="absolute right-2 top-5 sm:right-3 w-32 sm:w-40 md:w-46 z-11"
            >
              <img
                src={content.bottom.image1}
                alt="Cafe atmosphere at Petite Fille Rosanna"
                width={180}
                height={180}
                loading="lazy"
                decoding="async"
                className="object-contain"
              />
            </motion.div>
            <motion.div
              {...slideIn(50, -50)}
              className="absolute bottom-5 left-2 sm:left-3 w-44 sm:w-52 md:w-60 z-12"
            >
              <img
                src={content.bottom.image2}
                alt="Breakfast and brunch at Petite Fille Cafe"
                width={240}
                height={240}
                loading="lazy"
                decoding="async"
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
