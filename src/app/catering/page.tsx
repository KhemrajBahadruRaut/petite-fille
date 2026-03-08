"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BiRightArrow } from "react-icons/bi";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface Package {
  id: number;
  image: string;
  title: string;
  desc: string;
  price: string;
}

interface MenuItem {
  name: string;
  price: string;
  description: string;
}

const packages: Package[] = [
  {
    id: 1,
    image: "/gallery/img1.webp",
    title: "The Sunrise Spread",
    desc: "The ultimate start to a productive day.",
    price: "$185 AUD / 10 people",
  },
  {
    id: 2,
    image: "/gallery/img2.webp",
    title: "The Lunch Feast",
    desc: "A hearty meal to keep you going.",
    price: "$250 AUD / 10 people",
  },
  {
    id: 3,
    image: "/gallery/img3.webp",
    title: "The Evening Delight",
    desc: "Wind down with tasty bites.",
    price: "$200 AUD / 10 people",
  },
];

const menuItems: MenuItem[] = [
  {
    name: "Fruit Platter",
    price: "$49",
    description: "Seasonal fruits & berries",
  },
  {
    name: "Gourmet Cheese Platter",
    price: "$70",
    description: "Crackers, fresh baguettes, dry fruits, cashews, walnuts, mixed cheese & capers (6–8 people)",
  },
  {
    name: "Mini Danishes and Cakes",
    price: "$80",
    description: "Mixed danishes, homemade slices and carrot cake (6–8 people)",
  },
  {
    name: "Breakfast Pack",
    price: "$18 per person",
    description: "Mini egg & bacon roll, mini pumpkin & feta quiche and yoghurt granola bowl (10 people min)",
  },
  {
    name: "Baguettes",
    price: "$13 per person",
    description: "Mix baguettes (veg, chicken, ham)",
  },
  {
    name: "Whole Carrot Cake",
    price: "$65",
    description: "Our signature homemade whole carrot cake",
  },
];

// Animation variants
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const carouselItem: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    transition: { duration: 0.4, ease: "easeIn" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const Page = () => {
  // const [current, setCurrent] = useState(0);

  // const prevSlide = () => {
  //   setCurrent((prev) => (prev === 0 ? packages.length - 1 : prev - 1));
  // };

  // const nextSlide = () => {
  //   setCurrent((prev) => (prev === packages.length - 1 ? 0 : prev + 1));
  // };

  return (
    <section className="bg-white text-center overflow-hidden pt-25">
      {/* Heading */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="mb-16"
      >
        <motion.h2
          variants={fadeIn}
          className="text-5xl text-gray-800 mb-4"
          style={{ fontFamily: 'fairplay' }}
        >
          Catering
        </motion.h2>
        <motion.p
          variants={fadeIn}
          className="mt-2 text-gray-600 max-w-xl mx-auto"
        >
          From your daily ritual to your special events, we bring quality and care
          to every cup and every plate.
        </motion.p>
      </motion.div>

      {/* Carousel Heading */}
      {/* <motion.h3
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
        className="mt-10 text-2xl font-serif text-gray-700 mb-5"
        style={{ fontFamily: 'fairplay' }}
      >
        Choose from our packages
      </motion.h3> */}

      {/* Carousel */}
      {/* <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
        className="bg-[#F8F3EA] rounded-lg overflow-hidden"
      >
        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-8">
            <div className="w-full md:w-1/2 overflow-hidden rounded-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  variants={carouselItem}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                >
                  <img
                    src={packages[current].image}
                    alt={packages[current].title}
                    width={500}
                    height={350}
                    className="w-full h-60 object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="w-full md:w-1/2 text-left md:text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h4 className="text-2xl font-serif text-gray-800 mb-2" style={{ fontFamily: 'fairplay' }}>
                    &ldquo;{packages[current].title}&rdquo;
                  </h4>
                  <p className="text-gray-600 italic mb-4" style={{ fontFamily: 'arial' }}>
                    {packages[current].desc}
                  </p>
                  <p className="text-gray-800 mb-4" style={{ fontFamily: 'arial' }}>
                    Starting at{" "}
                    <span className="font-semibold text-lg">
                      {packages[current].price}
                    </span>
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 border text-gray-700 border-gray-700 rounded-lg hover:bg-gray-100 transition"
                    style={{ fontFamily: 'arial' }}
                  >
                    Select This Package
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <motion.button
            onClick={prevSlide}
            aria-label="Previous"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -left-5 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            aria-label="Next"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -right-5 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </motion.button>
        </div>
      </motion.div> */}

      {/* ── Catering Menu ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="mt-20 max-w-2xl mx-auto px-6"
      >
        {/* <motion.h3
          variants={fadeIn}
          className="text-4xl text-[#C07A5A] font-extrabold uppercase tracking-widest mb-10"
          style={{ fontFamily: 'fairplay' }}
        >
          Catering Menu
        </motion.h3> */}

        <div className="divide-y divide-[#D9CFC3]">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              className="py-6 text-center"
            >
              <p className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'arial' }}>
                {item.name}{" "}
                <span className="font-bold">{item.price}</span>
              </p>
              <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: 'arial' }}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          variants={fadeIn}
          className="mt-8 text-sm text-gray-700 font-semibold leading-relaxed"
          style={{ fontFamily: 'arial' }}
        >
          Please Note: All preorders must be placed 24–48hr in advanced. We do
          custom catering as well. Please let us know if you have any questions.
        </motion.p>

        {/* Daisy icon */}
        <motion.div variants={fadeIn} className="mt-6 flex justify-center">
          <img
            src="/mainimage/main-image.webp"
            alt="daisy"
            width={60}
            height={60}
            className="opacity-40 object-contain"
          />
        </motion.div>
      </motion.div>

      {/* ── Build Your Own ── */}
      {/* <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="mt-20 px-6 max-w-3xl mx-auto text-center relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 pointer-events-none">
          <img
            src="/mainimage/main-image.webp"
            alt=""
            width={500}
            height={450}
            className="opacity-30 object-contain"
          />
        </div>
        <motion.h3
          variants={fadeIn}
          className="text-2xl font-serif text-gray-800 mb-4"
          style={{ fontFamily: 'fairplay' }}
        >
          We Cater to Your Unique Taste.
        </motion.h3>
        <motion.p
          variants={fadeIn}
          className="mt-3 text-gray-600"
          style={{ fontFamily: 'fairplay' }}
        >
          Love our packages but want to tweak them? Or have something entirely
          different in mind? Create the perfect menu for your event with our
          easy <strong>Build Your Own</strong> tool.
        </motion.p>
        <motion.div
          variants={fadeIn}
          className="mt-6 flex justify-center"
        >
          <Link href="/multistepcatering">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#6B5A3C", color: "white" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="px-4 flex items-center text-yellow-800 gap-3 py-2 border border-yellow-900 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-900"
              style={{ fontFamily: 'arial' }}
            >
              Build your own <BiRightArrow />
            </motion.button>
          </Link>
        </motion.div>
        <motion.p
          variants={fadeIn}
          className="mt-2 text-sm text-yellow-700"
          style={{ fontFamily: 'arial' }}
        >
          Make sure your order is at least 48 hours before the event
        </motion.p>
      </motion.div> */}

      {/* ── Contact ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
        className="mt-20 bg-[#F5F1E8] py-12 px-6 text-center rounded-lg"
      >
        <h3 className="text-2xl font-serif text-gray-800 mb-4" style={{ fontFamily: 'fairplay' }}>
          Not Sure Where to Start?
        </h3>
        <p className="text-gray-600 max-w-xl mx-auto" style={{ fontFamily: 'fairplay' }}>
          Our catering manager is always happy to help. Get in touch for
          personal advice.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 px-6 py-2 bg-yellow-800 text-white rounded-md hover:bg-gray-800 transition"
        >
          <Link href="/contacts">
            Contact us
          </Link>
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Page;