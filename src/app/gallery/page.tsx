"use client";

import React, { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { motion, AnimatePresence } from "framer-motion";

interface Image {
  id: number;
  image_url: string;
}

type SectionData = {
  [key: number]: Image[];
};

export default function Gallery() {
  const [sections, setSections] = useState<SectionData>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const res = await fetch(
          "http://localhost/petite-backend/gallery/gallery.php",
          { signal: controller.signal },
        );
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }
        const data = await res.json();
        setSections(data);
      } catch {
        // Silently handle fetch errors - gallery will show empty state
        setSections({});
      }
    };

    fetchGallery();
  }, []);

  const rows = [
    { direction: "left", images: sections[1] || [] },
    { direction: "right", images: sections[2] || [] },
    { direction: "left", images: sections[3] || [] },
  ];

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
          {rows.map((row, i) => (
            <Marquee
              key={i}
              direction={row.direction as "left" | "right"}
              speed={40}
              pauseOnHover
              gradient={false}
            >
              {row.images.map((img) => (
                <motion.div
                  key={img.id}
                  className="mx-3 cursor-pointer"
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <div className="overflow-hidden shadow-md">
                    <img
                      src={`http://localhost/petite-backend/gallery/${img.image_url}`}
                      alt="gallery"
                      width={200}
                      height={140}
                      className="object-cover transition-transform duration-500 hover:scale-110"
                    />

                  </div>
                </motion.div>
              ))}
            </Marquee>
          ))}
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
                src={`http://localhost/petite-backend/gallery/${selectedImage}`}
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
