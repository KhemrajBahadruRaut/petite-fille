"use client";
import React from "react";
import { motion } from "framer-motion";

const Welcome = () => {
  return (
    <div className="bg-white py-10">
      <section className="w-full bg-white py-12 px-6 md:px-16 container mx-auto">
        {/* Heading */}
        <div className="text-center mb-10 text-gray-700"                       
        style={{fontFamily: 'fairplaybold'}}>
          <h2 className="text-xl md:text-2xl font-semibold" >
            Welcome to Petite Fille
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold mt-2">
            The Freshest and Cutest Cafe in Rosanna, Melbourne
          </h3>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start ">
          {/* Left Image */}
          <div className="flex justify-center relative">
            <div className="border-2 border-[#E6CFAF] absolute -top-4 -left-4 w-full h-full -z-10"></div>
            <motion.img
              initial={{ x: 200, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              src="/welcomeImages/WelcomeFrameLeft.webp"
              alt="Smoothies"
              className="w-full max-w-sm object-cover"
            />
          </div>

          {/* Text Section */}
          <div className="text-center space-y-4 px-2 z-9">
            <div className="text-gray-700">
              <p className="mt-4 text-2xl "
              style={{fontFamily: 'fairplay'}}>
                We are now open everyday
                <br />
                <span className="block mt-1">
                  Weekdays 7:30 AM – 3 PM | Sat &amp; Sun 8 AM – 3 PM
                </span>
              </p>
            </div>
            <div className="pt-10 flex-col px-1 space-y-4"
            style={{fontFamily: 'arial'}}
            >
              <p className="text-gray-700 text-center">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo.
              </p>
              <p className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center relative">
            <div className="border-2 border-[#E6CFAF] absolute -bottom-4 -right-4 w-full h-full -z-10"></div>
            <motion.img
              initial={{ x: -200, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              src="welcomeImages/WelcomeFrameRight.webp"
              alt="Food"
              className="w-full max-w-sm object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
