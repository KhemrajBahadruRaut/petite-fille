"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, ShoppingCart, Heart } from "lucide-react";
import MenuCarousel from "./MenuCarousel";
import { useCart } from "@/contexts/CartContexts";
import Image from "next/image";

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
    const [quantity, setQuantity] = useState(1);
    const [showAddedMessage, setShowAddedMessage] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const { addToCart, addToFavorites, removeFromFavorites, isFavorite } =
      useCart();
    const isItemFavorite = isFavorite(item.id);

    useEffect(() => {
      const currentSection = sectionRef.current;
      if (!currentSection) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setIsVisible(true);
        },
        { threshold: 0.1 },
      );
      observer.observe(currentSection);
      return () => observer.unobserve(currentSection);
    }, []);

    const handleAddToCart = (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        addToCart(item, quantity);
        setShowAddedMessage(true);
        setTimeout(() => setShowAddedMessage(false), 2000);
        setQuantity(1);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
      e.stopPropagation();
      isItemFavorite ? removeFromFavorites(item.id) : addToFavorites(item);
    };

    return (
      <div
        ref={sectionRef}
        className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] opacity-0 translate-y-8 ${isVisible ? "animate-fade-in-up" : ""}`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="relative aspect-square overflow-hidden rounded-lg mb-4 shadow-md bg-gray-200">
          {!imageError ? (
            <Image
              src={`https://api.gr8.com.np/petite-backend/${item.image}`}
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
          {showAddedMessage && (
            <div className="text-center animate-pulse">
              <span className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                ✓ Added to cart!
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

const MenuSection: React.FC<{ title: string; items: MenuItem[] }> = ({
  title,
  items,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const currentSection = sectionRef.current;
    if (!currentSection) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    observer.observe(currentSection);
    return () => observer.unobserve(currentSection);
  }, []);
  return (
    <section ref={sectionRef} className="py-12 px-6 max-w-7xl mx-auto">
      <h2
        className={`text-3xl font-light text-gray-800 mb-8 opacity-0 -translate-x-5 ${isVisible ? "animate-fade-in-left" : ""}`}
      >
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
        {items.map((item, index) => (
          <MenuItemCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
};

// 🔥 Dynamic RestaurantMenu
const RestaurantMenu: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://api.gr8.com.np/petite-backend/menu/get_menu_item.php",
        );
        const data: Category[] = await res.json();
        // only include categories that have items
        setCategories(data.filter((cat) => cat.items && cat.items.length > 0));
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

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in-left {
          animation: fadeInLeft 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RestaurantMenu;
