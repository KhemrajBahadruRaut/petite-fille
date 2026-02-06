// app/components/InstagramFeed.tsx
"use client";

import { motion } from "framer-motion";
// import Image from "next/image";
import React from "react";

type InstagramPost = {
  id: string;
  media_url: string;
  caption?: string;
  permalink: string;
};

type InstagramFeedProps = {
  posts: InstagramPost[];
};

const InstagramFeed: React.FC<InstagramFeedProps> = ({ posts }) => {
  // Double the array for seamless marquee
  const doubled = [...posts, ...posts];

  return (
    <div className="bg-[#F5F1E8]">
      <section className="py-16 px-6 text-center overflow-hidden container mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl text-gray-800 mb-4 font-semibold"
          initial={{ x: 150, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
                      // style={{fontFamily: 'fairplaybold'}}
                      style={{fontFamily: 'fairplaybold'}}

        >
          Instagram
        </motion.h2>

        <motion.p
          className="text-gray-600 mb-10 max-w-2xl mx-auto"
          initial={{ x: -150, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
                      style={{fontFamily: 'arial'}}

        >
          Join our community online. Follow us on Instagram for the latest updates, behind-the-scenes moments, and a glimpse into our cafe culture.
        </motion.p>

        <motion.div
          className="relative w-full overflow-hidden"
          initial={{ y: 150, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex w-max animate-marquee-rtl will-change-transform">
            {doubled.map((post, i) => {
              const displayIndex = (i % posts.length) + 1;
              return (
                <a
                  key={i}
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="mx-2 flex-shrink-0 w-64 h-64 overflow-hidden rounded-lg shadow"
                  aria-hidden={i >= posts.length}
                >
                  <img
                    src={post.media_url}
                    alt={post.caption || `Instagram post ${displayIndex}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </a>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default InstagramFeed;
