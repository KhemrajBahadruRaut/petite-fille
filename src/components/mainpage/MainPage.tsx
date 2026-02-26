"use client";
import { motion } from "framer-motion";
import { Variants } from "framer-motion";
// import Image from "next/image";
import Link from "next/link";
import React from "react";

const buttonBase =
  "px-10 py-3 shadow-md text-sm sm:text-2xl transition-all duration-300";
const bookTableBtn =
  "border border-[#B7AA99] text-[#B7AA99] rounded-tr-3xl rounded-bl-3xl hover:rounded-tl-3xl hover:rounded-br-3xl hover:rounded-tr-none hover:rounded-bl-none transition-all duration-300 ease-in-out px-6 py-2";
const orderOnlineBtn =
  // "bg-[#B7AA99] text-white hover:rounded-bl-3xl hover:rounded-tr-3xl rounded-tl-3xl rounded-br-3xl";
  "bg-[#B7AA99] text-white border border-[#B7AA99] text-[#B7AA99] rounded-tr-3xl rounded-bl-3xl hover:rounded-tl-3xl hover:rounded-br-3xl hover:rounded-tr-none hover:rounded-bl-none transition-all duration-300 ease-in-out px-6 py-2";


const fadeSlide = {
  hidden: { x: 200, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 1 } },
};

const fadeSlideDelayed = {
  hidden: { x: 210, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 1.5 } },
};


const rotateScale: Variants = {
  hidden: { scale: 0.2, rotate: -90, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { duration: 1.5, ease: "easeOut" },
  },
};


export default function MainPage() {
  return (
    <div className="bg-white pb-14 pt-20">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 container mx-auto">
        {/* Left Section */}
        <div className="flex flex-col gap-5  items-center p-6">
          {/* Top Image */}
          <div className="flex justify-center w-full md:pt-40">
            <motion.div
              variants={fadeSlide}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="w-3/4 max-w-sm md:max-w-md lg:max-w-lg"
            >
              <img
                src="/homepage/PetiteFille.webp"
                alt="Left Section"
                width={500}
                height={500}
                className="object-contain w-full h-auto"
                // priority
              />
            </motion.div>
          </div>

          {/* Desktop Buttons */}
          <motion.div
            variants={fadeSlideDelayed}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="hidden md:flex flex-wrap gap-14 justify-center w-full py-6"
            style={{fontFamily: 'fairplay'}}

          >
            <Link href="/reservation">
              <button className={`${buttonBase} ${bookTableBtn}`}>
                Book A Table
              </button>
            </Link>
            <Link href="/menu">
              <button className={`${buttonBase} ${orderOnlineBtn}`}>
                Order Online
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex justify-center items-center p-6 sm:pt-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={rotateScale}
            viewport={{ once: true, amount: 0.3 }}
            className="w-3/4 max-w-sm md:max-w-md lg:max-w-xl"
          >
            <img
              src="/mainimage/main-image.webp"
              alt="Right Section"
              width={600}
              height={600}
              className="object-contain w-full h-auto"
              // priority
            />
          </motion.div>
        </div>


        {/* Mobile Buttons */}
        <div className="flex flex-wrap md:hidden gap-5 justify-center w-full py-6">
          <button className={`${buttonBase} ${bookTableBtn}`}>
            Book A Table
          </button>
          <button
            className={`${buttonBase} ${orderOnlineBtn}`}
          >
            Order Online
          </button>
        </div>
      </div>
    </div>
  );
}
