"use client";
import React, { useState, useEffect } from "react";
import { Heart, X } from "lucide-react";
import MenuCarousel from "./MenuCarousel";
import { useCart } from "@/contexts/CartContexts";
import Image from "next/image";
import { apiUrl, normalizeApiAssetUrl } from "@/utils/api";

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

const MenuItemCard: React.FC<{ item: MenuItem; index: number }> = React.memo(
  function MenuItemCard({ item, index }) {
    const [imageError, setImageError] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { addToFavorites, removeFromFavorites, isFavorite } = useCart();
    const isItemFavorite = isFavorite(item.id);
    const normalizedImage = normalizeApiAssetUrl(item.image);

    const handleToggleFavorite = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isItemFavorite) {
        removeFromFavorites(item.id);
        return;
      }
      addToFavorites(item);
    };

    return (
      <>
        <div
          className="group transition-all duration-300 hover:scale-[1.02]"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
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
              <h3 className="line-clamp-2 pr-2 text-sm font-semibold text-gray-800">{item.name}</h3>
              <span className="shrink-0 text-sm font-bold text-gray-900">
                ${item.price}
              </span>
            </div>
            <p className="line-clamp-2 text-xs text-gray-600">{item.description}</p>
          </div>
        </div>
        {isPreviewOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
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
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}

      </>
    );
  }
);

const MenuSection: React.FC<{ title: string; items: MenuItem[] }> = ({
  title,
  items,
}) => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <h2 className="mb-6 text-2xl font-light text-gray-800 sm:mb-8 sm:text-3xl">{title}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
        {items.map((item, index) => (
          <MenuItemCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
};

// Dynamic RestaurantMenu
const RestaurantMenu: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

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
        
        // only include categories that have items
        setCategories(
          normalizedData.filter((cat) => cat.items && cat.items.length > 0),
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-linear-to-b from-amber-50 to-stone-100">
      <MenuCarousel />
      {categories.map((cat) => (
        <MenuSection key={cat.id} title={cat.name} items={cat.items} />
      ))}
    </div>
  );
};

export default RestaurantMenu;
