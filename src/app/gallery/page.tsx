"use client";

import React, { useEffect, useMemo, useState } from "react";
import Marquee from "react-fast-marquee";
import { motion, AnimatePresence } from "framer-motion";
import { apiUrl, normalizeApiAssetUrl } from "@/utils/api";

interface Image {
  id: number;
  image_url: string;
}

type SectionData = {
  [key: number]: Image[];
};

const resolveGalleryImageUrl = (imagePath: string) => {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return normalizeApiAssetUrl(imagePath);
  const cleanPath = imagePath.replace(/^[./]+/, "");
  return apiUrl(`gallery/${cleanPath}`);
};

export default function Gallery() {
  const [sections, setSections] = useState<SectionData>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () =>
      setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    document.addEventListener("visibilitychange", onVisibilityChange);
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const res = await fetch(
          apiUrl("gallery/gallery.php"),
          { signal: controller.signal },
        );
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }
        const data: SectionData = await res.json();

        const normalizedSections: SectionData = {};
        Object.entries(data || {}).forEach(([key, images]) => {
          const sectionKey = Number(key);
          normalizedSections[sectionKey] = (images || []).map((image) => ({
            ...image,
            image_url: resolveGalleryImageUrl(image.image_url),
          }));
        });

        setSections(normalizedSections);
      } catch {
        // Silently handle fetch errors - gallery will show empty state
        setSections({});
      }
    };

    fetchGallery();
  }, []);

  const rows = useMemo(
    () =>
      [
        { direction: "left", images: sections[1] || [] },
        { direction: "right", images: sections[2] || [] },
        { direction: "left", images: sections[3] || [] },
      ].filter((row) => row.images.length > 0),
    [sections],
  );

  const shouldAnimateMarquee = isTabVisible && !prefersReducedMotion;

  return (
    <div className="bg-white pb-20">
      <section className="py-16 px-4 container mx-auto">
        <motion.div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'fairplaybold' }}>Our Gallery</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'arial' }}>
            Discover the beauty of our work through these curated moments.
          </p>
        </motion.div>

        <div className="space-y-8">
          {rows.map((row, i) => {
            const rowContent = row.images.map((img) => (
              <button
                key={img.id}
                className="mx-3 cursor-pointer"
                onClick={() => setSelectedImage(img.image_url)}
                type="button"
              >
                <div className="overflow-hidden shadow-md">
                  <img
                    src={img.image_url}
                    alt="gallery"
                    width={200}
                    height={140}
                    loading="lazy"
                    decoding="async"
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
              </button>
            ));

            if (!shouldAnimateMarquee) {
              return (
                <div
                  key={i}
                  className="flex overflow-x-auto gap-3 pb-2"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {rowContent}
                </div>
              );
            }

            return (
              <Marquee
                key={i}
                direction={row.direction as "left" | "right"}
                speed={24}
                pauseOnHover
                pauseOnClick
                gradient={false}
                play={shouldAnimateMarquee}
              >
                {rowContent}
              </Marquee>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div className="relative max-w-4xl w-full max-h-full">
              <button
                className="absolute right-[-30px] text-white text-3xl z-10"
                onClick={() => setSelectedImage(null)}
              >
                &times;
              </button>
              <img
                src={selectedImage}
                alt="Enlarged"
                className="w-full h-auto object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
