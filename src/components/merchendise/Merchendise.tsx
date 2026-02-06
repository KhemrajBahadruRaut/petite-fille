"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContexts';
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  priceDisplay: string;
  image: string;
  category: 'merchandise';
}

interface BackendProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  image_url: string;
  category: string;
}

// Fixed Animation variants with proper TypeScript types
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

// Enhanced Product Card with Cart Integration
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  const { addToCart, addToFavorites, removeFromFavorites, isFavorite } = useCart();
  const isItemFavorite = isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        description: product.description,
        image: product.image,
        alt: product.title,
        category: product.category
      }, quantity);

      setShowAddedMessage(true);
      setTimeout(() => setShowAddedMessage(false), 2000);

      console.log(`Added ${quantity} x ${product.title} to cart`);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart. Make sure CartProvider is set up correctly.');
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isItemFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        id: product.id,
        name: product.title,
        price: product.price,
        description: product.description,
        image: product.image,
        alt: product.title,
        category: product.category
      });
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center text-center group cursor-pointer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full max-w-sm aspect-square overflow-hidden shadow-md">
        {/* Image or placeholder */}
        {!imageError ? (
          <motion.div 
            className="relative w-full h-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src={product.image}
              alt={product.title}
              className="object-cover transition-transform duration-500 group-hover:brightness-75"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              onError={() => setImageError(true)}
            />
          </motion.div>
        ) : (
          <motion.div 
            className="w-full h-full border border-blue-500 flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 font-medium">{product.title}</p>
            </div>
          </motion.div>
        )}

        {/* Favorite button - top right */}
        <motion.button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 
                   flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 
                   hover:bg-white shadow-md z-10"
          aria-label={isItemFavorite ? "Remove from favorites" : "Add to favorites"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${isItemFavorite
                ? 'text-red-500 fill-red-500'
                : 'text-gray-600 hover:text-red-500'
              }`}
          />
        </motion.button>

        {/* Hover overlay with actions */}
        <motion.div 
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.div 
            className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center gap-3"
            initial={{ y: 2 }}
            whileHover={{ y: 0 }}
          >
            {/* Add to cart button */}
            <motion.button
              onClick={handleAddToCart}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-medium text-sm 
                       flex items-center gap-2 shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Product details */}
      <motion.div 
        className="mt-4 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-medium text-gray-800 group-hover:text-amber-600 transition-colors duration-200" style={{ fontFamily: 'fairplay' }}>
          {product.title}
        </h3>
        <p className="text-sm text-gray-700" style={{ fontFamily: 'arial' }}>{product.description}</p>
        <span className="text-base font-medium text-gray-500" style={{ fontFamily: 'arial' }}>
          {product.priceDisplay}
        </span>

        {/* Added to cart message */}
        <AnimatePresence>
          {showAddedMessage && (
            <motion.div 
              className="text-center mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                ✓ Added to cart!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Reusable grid component
function ProductGrid({ items }: { items: Product[] }) {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {items.map((product) => (
        <motion.div key={product.id} variants={fadeInUp}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function Merchendise() {
  const [mugs, setMugs] = useState<Product[]>([]);
  const [candles, setCandles] = useState<Product[]>([]);
  const [totes, setTotes] = useState<Product[]>([]);
  const [tshirt, setTshirts] = useState<Product[]>([]);
  const [caps, setCaps] = useState<Product[]>([]);
  const [hoodies, setHoodies] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost/petite-backend/merch/get_merch_items.php');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data: BackendProduct[] = await response.json();
        
        // Transform backend data to frontend format
        const transformProduct = (item: BackendProduct): Product => ({
          id: `${item.category}-${item.id}`,
          title: item.name,
          description: item.description || '',
          price: item.price,
          priceDisplay: `$${item.price.toFixed(2)} AUD`,
          image: item.image_url || item.image,
          category: 'merchandise'
        });

        // Filter and categorize products
        const mugProducts = data
          .filter(item => item.category === 'mug')
          .map(transformProduct);
        
        const candleProducts = data
          .filter(item => item.category === 'candle')
          .map(transformProduct);
        
        const toteProducts = data
          .filter(item => item.category === 'tote')
          .map(transformProduct);

        const tshirtProducts = data
          .filter(item => item.category === 'tshirt')
          .map(transformProduct);

        const capProducts = data
          .filter(item => item.category === 'cap')
          .map(transformProduct);

        const hoodieProducts = data
          .filter(item => item.category === 'hoodie')
          .map(transformProduct);

        setMugs(mugProducts);
        setCandles(candleProducts);
        setTotes(toteProducts);
        setTshirts(tshirtProducts);
        setCaps(capProducts);
        setHoodies(hoodieProducts);
        
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="w-full container mx-auto bg-white py-12 px-6 lg:px-20 flex flex-col md:flex-row items-center justify-between sm:gap-10">
        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
          className="flex-1 text-center md:text-left"
        >
          <motion.h2
            className="text-3xl md:text-5xl font-semibold text-gray-800 mb-4"
            style={{ fontFamily: 'fairplaybold' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Petite fille Merch
          </motion.h2>
          <motion.p 
            className="text-gray-600 mb-6 max-w-md" 
            style={{ fontFamily: 'arial' }}
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
              style={{ fontFamily: 'arial' }}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Take a look at our merch →
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Section - Collage */}
        <motion.div 
          className="hidden md:flex flex-1 relative w-full max-w-lg h-[500px]"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Background decorative squares */}
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

          {/* Product Images */}
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
              className="object-cover shadow-md"
            />
          </motion.div>

          <motion.div
            className="absolute top-28 left-0 w-40 h-48"
            initial={{ opacity: 0, x: -20, rotate: 5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, rotate: 2, transition: { duration: 0.3 } }}
          >
            <img
              src="/merchendise/coffee.webp"
              alt="Coffee Bag"
              className="object-cover shadow-md"
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
              className="object-cover shadow-md"
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
              className="object-cover shadow-md"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="w-full py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-amber-500"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      )}
      {/* Sections - Only show if there are items */}
      {!isLoading && mugs.length > 0 && (
        <motion.section 
          className="w-full bg-white py-12 px-6 md:px-12 lg:px-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            className="text-2xl md:text-3xl font-semibold text-center mb-10 text-gray-700" 
            style={{ fontFamily: 'fairplaybold' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Mugs and Cups
          </motion.h2>
          <ProductGrid items={mugs} />
        </motion.section>
      )}
      {!isLoading && candles.length > 0 && (
        <motion.section 
          className="w-full bg-white py-12 px-6 md:px-12 lg:px-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            className="text-2xl md:text-3xl font-semibold text-center mb-10 text-gray-700" 
            style={{ fontFamily: 'fairplaybold' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Scented Candles
          </motion.h2>
          <ProductGrid items={candles} />
        </motion.section>
      )}
      {!isLoading && totes.length > 0 && (
        <motion.section 
          className="w-full bg-white py-12 px-6 md:px-12 lg:px-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            className="text-2xl md:text-3xl font-semibold text-center mb-10 text-gray-700" 
            style={{ fontFamily: 'fairplaybold' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Tote Bags
          </motion.h2>
          <ProductGrid items={totes} />
        </motion.section>
      )}
      {!isLoading && tshirt.length > 0 && (
        <motion.section 
          className="w-full bg-white py-12 px-6 md:px-12 lg:px-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            className="text-2xl md:text-3xl font-semibold text-center mb-10 text-gray-700" 
            style={{ fontFamily: 'fairplaybold' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            T-shirts
          </motion.h2>
          <ProductGrid items={tshirt} />
        </motion.section>
      )}
      {!isLoading && caps.length > 0 && (
        <motion.section 
          className="w-full bg-white py-12 px-6 md:px-12 lg:px-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            className="text-2xl md:text-3xl font-semibold text-center mb-10 text-gray-700" 
            style={{ fontFamily: 'fairplaybold' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Caps
          </motion.h2>
          <ProductGrid items={caps} />
        </motion.section>
      )}
      {!isLoading && hoodies.length > 0 && (
        <motion.section 
          className="w-full bg-white py-12 px-6 md:px-12 lg:px-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            className="text-2xl md:text-3xl font-semibold text-center mb-10 text-gray-700" 
            style={{ fontFamily: 'fairplaybold' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Hoodies
          </motion.h2>
          <ProductGrid items={hoodies} />
        </motion.section>
      )}

      {/* Empty State */}
      {!isLoading && mugs.length === 0 && candles.length === 0 && totes.length === 0 && tshirt.length === 0 && caps.length === 0 && hoodies.length === 0 && (
        <div className="w-full py-20 text-center">
          <p className="text-gray-500 text-lg">No products available at the moment.</p>
          <p className="text-gray-400 text-sm mt-2">Please check back later!</p>
        </div>
      )}
    </div>
  );
}