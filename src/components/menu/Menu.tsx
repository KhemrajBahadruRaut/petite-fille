"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Heart, CheckCircle, X } from "lucide-react";
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
    const [toast, setToast] = useState<{ show: boolean; message: string; itemName: string }>({ 
      show: false, 
      message: "", 
      itemName: "" 
    });
    const { addToCart, addToFavorites, removeFromFavorites, isFavorite } =
      useCart();
    const isItemFavorite = isFavorite(item.id);

    useEffect(() => {
      if (!toast.show) return;
      const timer = setTimeout(() => setToast({ show: false, message: "", itemName: "" }), 3000);
      return () => clearTimeout(timer);
    }, [toast.show]);

    const handleAddToCart = (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        addToCart(item, 1);
        setToast({ 
          show: true, 
          message: `${item.name} added to cart!`,
          itemName: item.name
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    };

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
          className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="relative aspect-square overflow-hidden rounded-lg mb-4 shadow-md bg-gray-200">
            {!imageError ? (
              <Image
                src={normalizeApiAssetUrl(item.image)}
                alt={item.alt || item.name}
                fill
                className="object-cover w-full h-full transition-all duration-300 group-hover:brightness-75"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-xs text-gray-500 font-medium">{item.name}</p>
              </div>
            )}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-300 ${isItemFavorite ? "text-red-500 fill-red-500" : "text-gray-600 hover:text-red-500"}`}
              />
            </button>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                onClick={handleAddToCart}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
              <span className="font-bold text-gray-900 text-sm">
                ${item.price}
              </span>
            </div>
            <p className="text-xs text-gray-600">{item.description}</p>
          </div>
        </div>

        {/* Beautiful Toast Notification */}
        {toast.show && (
          <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 flex items-center gap-3 max-w-sm">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500 animate-bounce" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">Success!</p>
                <p className="text-gray-600 text-xs mt-0.5">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast({ show: false, message: "", itemName: "" })}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
    <section className="py-12 px-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-light text-gray-800 mb-8">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
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
