"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect } from "react";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

const WhatWeOffer = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback items in case fetch fails
  const fallbackItems = [
    {
      id: 1,
      name: "Fresh Daily Special",
      price: 21,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      image: "/whatweoffer/offer3.webp",
    },
    {
      id: 2,
      name: "Chef's Choice",
      price: 21,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      image: "/whatweoffer/offer2.webp",
    },
    {
      id: 3,
      name: "Seasonal Favorite",
      price: 21,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      image: "/whatweoffer/offer1.webp",
    },
    {
      id: 4,
      name: "House Special",
      price: 21,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      image: "/whatweoffer/offer4.webp",
    },
  ];

  useEffect(() => {
    const fetchRandomItems = async () => {
      try {
        const res = await fetch(
          "http://localhost/petite-backend/menu/get_menu_item.php",
        );
        const data = await res.json();

        // Flatten all items from all categories
        const allItems: MenuItem[] = data.flatMap(
          (category: { items: MenuItem[] }) =>
            (category.items || []).map((item: MenuItem) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              description:
                item.description || "Delicious fresh item made with love",
              image: item.image
                ? `http://localhost/petite-backend/${item.image}`
                : "/whatweoffer/offer1.webp",
            })),
        );

        // Shuffle and take 4 random items
        const shuffled = allItems.sort(() => Math.random() - 0.5);
        const randomFour = shuffled.slice(0, 4);

        if (randomFour.length > 0) {
          setItems(randomFour);
        } else {
          setItems(fallbackItems);
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setItems(fallbackItems);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRandomItems();
  }, []);

  // Show loading skeleton or fallback while loading
  const displayItems = isLoading ? fallbackItems : items;

  return (
    <div className="bg-[#F5F1E8] py-10">
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor. ipsum dolor sit amet, piscin elit, sed do eiusmod
            tempor incididunt
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
            {displayItems.map((item, i) => (
              <div
                key={item.id || i}
                className="flex flex-col group"
                style={{ fontFamily: "arial" }}
              >
                {/* Image Wrapper with Hover */}
                <div className="overflow-hidden">
                  <img
                    width={400}
                    height={400}
                    src={item.image}
                    alt={item.name}
                    className="w-full h-60 object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex justify-between mt-4 font-medium text-gray-700">
                  <span>{item.name}</span>
                  <span>
                    $
                    {typeof item.price === "number"
                      ? item.price.toFixed(2)
                      : item.price}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
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
