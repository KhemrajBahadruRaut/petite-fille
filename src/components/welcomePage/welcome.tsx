"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "@/utils/api";

interface WelcomeContent {
  heading: string;
  subheading: string;
  opening_hours: string;
  paragraph_one: string;
  paragraph_two: string;
  image_left: string;
  image_right: string;
}

const FALLBACK: WelcomeContent = {
  heading: "Welcome to Petite Fille",
  subheading: "The Freshest and Cutest Cafe in Rosanna, Melbourne",
  opening_hours: "Weekdays 7:30 AM – 3 PM | Sat & Sun 8 AM – 3 PM",
  paragraph_one:
    "Welcome to Petite Fille, proudly based in Rosanna. We created Petite Fille to be a café that feels thoughtful without being overcomplicated. A place where quality speaks for itself — in the coffee, on the plate, and in the way you're looked after from the moment you walk in. Our approach is simple: well-made coffee, carefully prepared food, and service that's consistent and genuine.",
  paragraph_two:
    "We focus on the details that matter — balanced flavours, fresh ingredients, and drinks made properly every time. Whether you're stopping in for your morning takeaway, meeting friends for brunch, sitting down for a relaxed lunch, or squeezing in a quick business catch-up, our space is designed to move with your day. Being part of Rosanna means everything to us. Petite Fille isn't about trends. It's about creating a place you choose to return to. We look forward to welcoming you in.",
  image_left:  "uploads/welcome/WelcomeFrameLeft.webp",
  image_right: "uploads/welcome/WelcomeFrameRight.webp",
};

const imgUrl = (path: string) => apiUrl(path);

const Welcome = () => {
  const [content, setContent] = useState<WelcomeContent>(FALLBACK);

  useEffect(() => {
    fetch(apiUrl("welcome/welcome.php"))
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: WelcomeContent) => setContent(data))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white py-10">
      <section className="w-full bg-white py-12 px-6 md:px-16 container mx-auto">

        {/* Heading */}
        <div className="text-center mb-10 text-gray-700" style={{ fontFamily: "fairplaybold" }}>
          <h2 className="text-xl md:text-2xl font-semibold">{content.heading}</h2>
          <h3 className="text-2xl md:text-3xl font-bold mt-2">{content.subheading}</h3>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* Left Image */}
          <div className="flex justify-center relative">
            <div className="border-2 border-[#E6CFAF] absolute -top-4 -left-4 w-full h-full -z-10" />
            <motion.img
              initial={{ x: 200, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              src={imgUrl(content.image_left)}
              alt="Smoothies"
              className="w-full max-w-sm object-cover"
            />
          </div>

          {/* Text */}
          <div className="text-center space-y-4 px-2 z-9">
            <div className="text-gray-700">
              <p className="mt-4 text-2xl" style={{ fontFamily: "fairplay" }}>
                We are now open everyday
                <br />
                <span className="block mt-1">{content.opening_hours}</span>
              </p>
            </div>
            <div className="pt-10 flex-col px-1 space-y-4" style={{ fontFamily: "arial" }}>
              <p className="text-gray-700 text-justify">{content.paragraph_one}</p>
              <p className="text-gray-700 text-justify">{content.paragraph_two}</p>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center relative">
            <div className="border-2 border-[#E6CFAF] absolute -bottom-4 -right-4 w-full h-full -z-10" />
            <motion.img
              initial={{ x: -200, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              src={imgUrl(content.image_right)}
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