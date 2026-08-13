"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { apiUrl, normalizeApiAssetUrl } from "../../utils/api";

interface OfferItem {
  id: number;
  image: string;
  sort_order: number;
}

// Fallback images used when no admin-managed items exist yet
const fallbackImages = [
  "/whatweoffer/offer3.webp",
  "/whatweoffer/offer2.webp",
  "/whatweoffer/offer1.webp",
  "/whatweoffer/offer4.webp",
];

const WhatWeOffer = () => {
  const [images, setImages] = useState<string[]>(fallbackImages);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOfferItems = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(apiUrl("whatweoffer/whatweoffer.php"), {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`API responded with status ${res.status}`);
        const data = await res.json();

        const items: OfferItem[] = data.items || [];
        if (items.length > 0) {
          setImages(items.map((item) => normalizeApiAssetUrl(item.image)));
        }
        // If no items from API, keep using fallback images
      } catch {
        // Silently use fallback images if fetch fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfferItems();
  }, []);

  const displayImages = isLoading ? fallbackImages : images;

  return (
    <div className="bg-[#F5F1E8] ">
      <section className="w-full  py-16 px-6 md:px-12 lg:px-20 container mx-auto">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.h2
            initial={{ x: 210, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-3xl md:text-4xl font-semibold mb-4 text-gray-700"
            style={{ fontFamily: "fairplaybold" }}
          >
            A Taste of What We Offer
          </motion.h2>
          <motion.p
            className="text-gray-600"
            initial={{ x: -210, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            style={{ fontFamily: "arial" }}
          >
            From slow cooked lamb to perfectly toasted favourites, every dish is
            made with care using quality seasonal ingredients.
          </motion.p>
        </div>

        {/* Menu Grid */}
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          whileInView={{ x: 0, y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {displayImages.map((src, i) => (
              <div
                key={i}
                className="flex flex-col group"
                style={{ fontFamily: "arial" }}
              >
                {/* Image Wrapper with Hover */}
                <div className="overflow-hidden relative w-full h-60">
                  <Image
                    src={src}
                    alt={`What we offer ${i + 1}`}
                    fill
                    className="object-cover transform transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button className="px-6 py-3 border text-xl border-gray-700 rounded-md text-gray-800 hover:bg-gray-100 transition">
              <Link href="/menu" style={{ fontFamily: "fairplay" }}>
                Take a look at our menu →
              </Link>
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default WhatWeOffer;
