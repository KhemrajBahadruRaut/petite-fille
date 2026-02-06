"use client";
import { motion } from "framer-motion";
// import Image from "next/image";
import Link from "next/link";
import React from "react";

const WhatWeOffer = () => {
  const items = [
    {
      img: "/whatweoffer/offer3.webp",
      title: "Lorem ipsum",
      price: "$21",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    },
    {
      img: "/whatweoffer/offer2.webp",
      title: "Lorem ipsum",
      price: "$21",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    },
    {
      img: "/whatweoffer/offer1.webp",
      title: "Lorem ipsum",
      price: "$21",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    },
    {
      img: "/whatweoffer/offer4.webp",
      title: "Lorem ipsum",
      price: "$21",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    },
  ];

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
                        style={{fontFamily: 'fairplaybold'}}

          >
            A Taste of What We Offer
          </motion.h2>
          <motion.p
            className="text-gray-600"
            initial={{ x: -210, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, amount: 0.3 }}
                        style={{fontFamily: 'arial'}}

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
            {items.map((item, i) => (
              <div key={i} className="flex flex-col group"
              style={{fontFamily: 'arial'}}>
                {/* Image Wrapper with Hover */}
                <div className="overflow-hidden">
                  <img
                    width={400}
                    height={400}
                    src={item.img}
                    alt={item.title}
                    className="w-full h-60 object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex justify-between mt-4 font-medium text-gray-700">
                  <span>{item.title}</span>
                  <span>{item.price}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button className="px-6 py-3 border text-xl border-gray-700 rounded-md text-gray-800 hover:bg-gray-100 transition">
              <Link href="/menu"
                          style={{fontFamily: 'fairplay'}}

              >
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
