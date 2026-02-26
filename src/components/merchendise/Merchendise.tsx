"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, Heart, CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContexts";
import { apiUrl, normalizeApiAssetUrl } from "@/utils/api";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  priceDisplay: string;
  image: string;
  category: string;
}

interface BackendProduct {
  id: number;
  name: string;
  price: string | number;
  description: string;
  image: string;
  image_url?: string;
  category: string;
}

interface MerchCategory {
  id: number;
  name: string;
}

interface CategorySection {
  categoryName: string;
  displayName: string;
  products: Product[];
}

const normalizeCategoryKey = (value: string) => value.trim().toLowerCase();

const formatCategoryName = (categoryName: string): string =>
  categoryName
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const transformProduct = (item: BackendProduct): Product => {
  const parsedPrice =
    typeof item.price === "number" ? item.price : Number(item.price);
  const safePrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;
  const imagePath = item.image_url || `merch/uploads/${item.image || ""}`;

  return {
    id: `${item.category}-${item.id}`,
    title: item.name,
    description: item.description || "",
    price: safePrice,
    priceDisplay: `$${safePrice.toFixed(2)} AUD`,
    image: normalizeApiAssetUrl(imagePath),
    category: item.category,
  };
};

const ProductCard = React.memo(function ProductCard({
  product,
}: {
  product: Product;
}) {
  const [imageError, setImageError] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; productName: string }>({ 
    show: false, 
    message: "", 
    productName: "" 
  });
  const { addToCart, addToFavorites, removeFromFavorites, isFavorite } =
    useCart();
  const isItemFavorite = isFavorite(product.id);

  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => setToast({ show: false, message: "", productName: "" }), 3000);
    return () => clearTimeout(timer);
  }, [toast.show]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      addToCart(
        {
          id: product.id,
          name: product.title,
          price: product.price,
          description: product.description,
          image: product.image,
          alt: product.title,
          category: "merchandise",
        },
        1,
      );
      setToast({ 
        show: true, 
        message: `${product.title} added to cart!`,
        productName: product.title
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isItemFavorite) {
      removeFromFavorites(product.id);
      return;
    }

    addToFavorites({
      id: product.id,
      name: product.title,
      price: product.price,
      description: product.description,
      image: product.image,
      alt: product.title,
      category: "merchandise",
    });
  };

  return (
    <article className="flex flex-col items-center text-center group cursor-pointer">
      <div className="relative w-full max-w-sm aspect-square overflow-hidden shadow-md">
        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-75"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full border border-blue-500 flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-500 font-medium">{product.title}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-md z-10"
          aria-label={
            isItemFavorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${
              isItemFavorite
                ? "text-red-500 fill-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleAddToCart}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h3
          className="text-lg font-medium text-gray-800 group-hover:text-amber-600 transition-colors duration-200"
          style={{ fontFamily: "fairplay" }}
        >
          {product.title}
        </h3>
        <p className="text-sm text-gray-700" style={{ fontFamily: "arial" }}>
          {product.description}
        </p>
        <span
          className="text-base font-medium text-gray-500"
          style={{ fontFamily: "arial" }}
        >
          {product.priceDisplay}
        </span>
      </div>

      {/* Beautiful Toast Notification - Top Right */}
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
              onClick={() => setToast({ show: false, message: "", productName: "" })}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
});

function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function Merchendise() {
  const [categorySections, setCategorySections] = useState<CategorySection[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch(apiUrl("merch/categories/get_categories.php"), {
            signal: controller.signal,
          }),
          fetch(apiUrl("merch/get_merch_items.php"), { signal: controller.signal }),
        ]);

        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }

        const categories: MerchCategory[] = await categoriesResponse.json();
        const products: BackendProduct[] = await productsResponse.json();

        const groupedProducts = new Map<string, Product[]>();
        for (const item of products) {
          const key = normalizeCategoryKey(item.category);
          const transformed = transformProduct(item);
          const existing = groupedProducts.get(key);

          if (existing) {
            existing.push(transformed);
          } else {
            groupedProducts.set(key, [transformed]);
          }
        }

        const sections: CategorySection[] = categories
          .map((category) => {
            const categoryKey = normalizeCategoryKey(category.name);
            return {
              categoryName: category.name,
              displayName: formatCategoryName(category.name),
              products: groupedProducts.get(categoryKey) || [],
            };
          })
          .filter((section) => section.products.length > 0);

        if (isMounted) {
          setCategorySections(sections);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error fetching merch data:", error);
        }
        if (isMounted) {
          setCategorySections([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="bg-white pt-25">
      <section className="w-full container mx-auto bg-white py-12 px-6 lg:px-20 flex flex-col md:flex-row items-center justify-between sm:gap-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
          className="flex-1 text-center md:text-left"
        >
          <motion.h2
            className="text-3xl md:text-5xl font-semibold text-gray-800 mb-4"
            style={{ fontFamily: "fairplaybold" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Petite fille Merch
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-6 max-w-md"
            style={{ fontFamily: "arial" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </motion.p>
          <motion.div
            className="flex justify-center md:justify-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="px-6 py-3 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
              style={{ fontFamily: "arial" }}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={() => {
                const firstSection = document.querySelector(
                  "section[data-category-section]",
                );
                firstSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Take a look at our merch {"->"}
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          className="hidden md:flex flex-1 relative w-full max-w-lg h-[500px]"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            className="absolute top-14 left-14 w-40 h-48 border-2 border-amber-400"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="absolute bottom-28 right-14 w-40 h-48 border-2 border-amber-400"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="absolute bottom-20 left-5 w-32 h-24 border-2 border-amber-400"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="absolute top-0 right-12 w-28 h-24 border-2 border-amber-400"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            viewport={{ once: true }}
          />

          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-40 h-48"
            initial={{ opacity: 0, y: -20, rotate: -5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, rotate: -2, transition: { duration: 0.3 } }}
          >
            <img
              src="/merchendise/merch1.webp"
              alt="T-Shirts"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover shadow-md"
            />
          </motion.div>

          <motion.div
            className="absolute top-28 left-0 w-40 h-48"
            initial={{ opacity: 0, x: -20, rotate: 5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, rotate: 2, transition: { duration: 0.3 } }}
          >
            <img
              src="/merchendise/coffee.webp"
              alt="Coffee Bag"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover shadow-md"
            />
          </motion.div>

          <motion.div
            className="absolute top-61 left-1/2 -translate-x-1/2 w-40 h-48"
            initial={{ opacity: 0, y: 20, rotate: 5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, rotate: -2, transition: { duration: 0.3 } }}
          >
            <img
              src="/merchendise/bag1.webp"
              alt="Tote Bag"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover shadow-md"
            />
          </motion.div>

          <motion.div
            className="absolute top-18 right-0 w-40 h-48"
            initial={{ opacity: 0, x: 20, rotate: -5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, rotate: 2, transition: { duration: 0.3 } }}
          >
            <img
              src="/merchendise/cup2.webp"
              alt="Mugs"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover shadow-md"
            />
          </motion.div>
        </motion.div>
      </section>

      {isLoading && (
        <div className="w-full py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-amber-500" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      )}

      {!isLoading &&
        categorySections.map((section) => (
          <section
            key={section.categoryName}
            data-category-section
            className="w-full bg-white py-4 px-6 md:px-12 lg:px-20"
          >
            <h2
              className="text-2xl md:text-3xl font-semibold text-center mb-10 text-gray-700"
              style={{ fontFamily: "fairplaybold" }}
            >
              {section.displayName}
            </h2>
            <ProductGrid items={section.products} />
          </section>
        ))}

      {!isLoading && categorySections.length === 0 && (
        <div className="w-full py-20 bg-gray-50">
          <div className="max-w-md mx-auto text-center px-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3
              className="text-2xl font-semibold text-gray-800 mb-3"
              style={{ fontFamily: "fairplaybold" }}
            >
              No Products Available
            </h3>
            <p className="text-gray-500 text-lg mb-2">
              We&apos;re currently updating our merchandise collection.
            </p>
            <p className="text-gray-400 text-sm">
              Please check back later for exciting new products!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
