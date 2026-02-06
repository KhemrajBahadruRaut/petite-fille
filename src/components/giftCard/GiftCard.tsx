"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";

const GiftCard = () => {
  return (
    <div className="bg-white overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-center px-4 md:px-16 bg-white relative container mx-auto">
        {/* Image */}
        <div className="md:w-1/2 flex justify-center md:mb-0 overflow-hidden">
          <motion.img
            initial={{ x: -150, opacity: 0 }}
            whileInView={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            src="/giftcard/giftcard.webp"
            alt="eGift Card"
            className="h-auto rounded-lg pt-15"
          />
        </div>

        {/* Text Content */}
        <div className="md:w-1/2 flex flex-col items-start md:pl-12 overflow-hidden">
          <motion.div
            className="space-y-4"
            initial={{ x: 150, opacity: 0 }}
            whileInView={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-3xl md:text-5xl font-semibold text-gray-800 mb-4"
            style={{fontFamily: 'fairplaybold'}}
            >
              eGift cards Available
            </h2>
            <p className="text-gray-600 mb-6"
                        style={{fontFamily: 'arial'}}

            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <button className="px-6 py-2 border border-gray-800 text-gray-800 rounded hover:bg-gray-100 transition">
              <Link href="/eGiftCard"
                          style={{fontFamily: 'arial'}}

              >
              Purchase now &rarr;
              </Link>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GiftCard;