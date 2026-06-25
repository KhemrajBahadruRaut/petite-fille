"use client";
import React, { useState, useEffect } from "react";
import { Heart, X } from "lucide-react";
import MenuCarousel from "./MenuCarousel";
import { useCart } from "@/contexts/CartContexts";
import Image from "next/image";
import { apiUrl, normalizeApiAssetUrl } from "../../utils/api";
import Link from "next/link";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  alt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  items: MenuItem[];
}

// skeleton loading
const SkeletonCard: React.FC<{ index: number }> = ({ index }) => (
  <div className="animate-pulse" style={{ animationDelay: `${index * 0.07}s` }}>
    <div className="mb-3 aspect-square w-full rounded-lg bg-gray-200 sm:mb-4" />
    <div className="space-y-2">
      <div className="flex justify-between gap-2">
        <div className="h-4 w-3/5 rounded bg-gray-200" />
        <div className="h-4 w-1/5 rounded bg-gray-200" />
      </div>
      <div className="h-3 w-full rounded bg-gray-100" />
      <div className="h-3 w-4/5 rounded bg-gray-100" />
    </div>
  </div>
);

// One skeleton section (title + grid of cards)
const SkeletonSection: React.FC<{ cardCount?: number }> = ({
  cardCount = 4,
}) => (
  <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
    {/* Section title placeholder */}
    <div className="mb-6 h-8 w-48 rounded-md bg-gray-200 animate-pulse sm:mb-8" />
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
      {Array.from({ length: cardCount }).map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </div>
  </section>
);
const MenuItemCard: React.FC<{ item: MenuItem; index: number }> = React.memo(
  function MenuItemCard({ item, index }) {
    const [imageError, setImageError] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    const { addToFavorites, removeFromFavorites, isFavorite } = useCart();
    const isItemFavorite = isFavorite(item.id);
    const normalizedImage = normalizeApiAssetUrl(item.image);

    // Staggered entrance when card mounts
    useEffect(() => {
      const t = setTimeout(() => setVisible(true), index * 60);
      return () => clearTimeout(t);
    }, [index]);

    const handleToggleFavorite = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isItemFavorite) {
        removeFromFavorites(item.id);
      } else {
        addToFavorites(item);
      }
    };

    return (
      <>
        <div
          className="group transition-all duration-500 hover:scale-[1.02]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 0.45s ease, transform 0.45s ease",
          }}
        >
          <h1 className="sr-only">Menu | Petite Fille Cafe Rosanna</h1>
          <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-gray-200 shadow-md sm:mb-4">
            {!imageError ? (
              <Image
                src={normalizedImage}
                alt={item.alt || item.name}
                fill
                className="cursor-zoom-in object-cover w-full h-full transition-all duration-300 group-hover:brightness-75"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                onError={() => setImageError(true)}
                onClick={() => setIsPreviewOpen(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-xs text-gray-500 font-medium">{item.name}</p>
              </div>
            )}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm opacity-100 transition-all duration-300 hover:scale-110 md:opacity-0 md:group-hover:opacity-100"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-300 ${isItemFavorite ? "text-red-500 fill-red-500" : "text-gray-600 hover:text-red-500"}`}
              />
            </button>
            {!imageError && (
              <div className="absolute inset-0 hidden items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="rounded-full border border-white/60 bg-white/90 px-4 py-2 text-xs font-semibold text-gray-800"
                >
                  View Image
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="line-clamp-2 pr-2 text-sm font-semibold text-gray-800">
                {item.name}
              </h3>
              <span className="shrink-0 text-sm font-bold text-gray-900">
                ${item.price}
              </span>
            </div>
            <p className="line-clamp-2 text-xs text-gray-600">
              {item.description}
            </p>
          </div>
        </div>

        {isPreviewOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setIsPreviewOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-800"
              onClick={() => setIsPreviewOpen(false)}
              aria-label="Close image preview"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={normalizedImage}
              alt={item.alt || item.name}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    );
  },
);

// Menu section
const MenuSection: React.FC<{ title: string; items: MenuItem[] }> = ({
  title,
  items,
}) => (
  <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
    <h2 className="mb-6 text-2xl font-light text-gray-800 sm:mb-8 sm:text-3xl">
      {title}
    </h2>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
      {items.map((item, index) => (
        <MenuItemCard key={item.id} item={item} index={index} />
      ))}
    </div>
  </section>
);

// Root component
const RestaurantMenu: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);

  // Fade-in the whole page once it mounts
  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(apiUrl("menu/get_menu_item.php"));
        if (!res.ok) throw new Error("Failed to fetch menu categories");
        const data: Category[] = await res.json();

        const normalizedData: Category[] = data.map((category) => ({
          ...category,
          items: (category.items || []).map((item) => ({
            ...item,
            image:
              typeof item.image === "string"
                ? normalizeApiAssetUrl(item.image)
                : item.image,
          })),
        }));

        setCategories(
          normalizedData.filter((cat) => cat.items && cat.items.length > 0),
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div
      className="bg-linear-to-b from-amber-50 to-stone-100 min-h-screen"
      style={{
        opacity: pageReady ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
       <h1 className="sr-only">
      Menu | Petite Fille Cafe Rosanna
    </h1>
      <div className="relative isolate">
        <MenuCarousel />
      </div>
      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 flex justify-center">
        <Link
          href="/detailedmenu"
          className="relative z-50 pointer-events-auto rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-gray-800"
        >
          Full Menu
        </Link>
      </div>

      {loading ? (
        // Show 2 skeleton sections while data loads
        <>
          <SkeletonSection cardCount={4} />
          <SkeletonSection cardCount={4} />
        </>
      ) : (
        categories.map((cat) => (
          <MenuSection key={cat.id} title={cat.name} items={cat.items} />
        ))
      )}
    </div>
  );
};

export default RestaurantMenu;
