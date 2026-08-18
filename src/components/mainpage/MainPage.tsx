"use client";
import { motion } from "framer-motion";
import { Variants } from "framer-motion";
// import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { apiUrl } from "@/utils/api";

const buttonBase =
  "px-10 py-3 shadow-md text-sm sm:text-2xl transition-all duration-300";
const bookTableBtn =
  "border border-[#B7AA99] text-[#B7AA99] rounded-tr-3xl rounded-bl-3xl hover:rounded-tl-3xl hover:rounded-br-3xl hover:rounded-tr-none hover:rounded-bl-none transition-all duration-300 ease-in-out px-6 py-2";
const orderOnlineBtn =
  // "bg-[#B7AA99] text-white hover:rounded-bl-3xl hover:rounded-tr-3xl rounded-tl-3xl rounded-br-3xl";
  "bg-[#B7AA99] text-white border border-[#B7AA99] text-[#B7AA99] rounded-tr-3xl rounded-bl-3xl hover:rounded-tl-3xl hover:rounded-br-3xl hover:rounded-tr-none hover:rounded-bl-none transition-all duration-300 ease-in-out px-6 py-2";
const externalBookingUrl = "https://petite-file-cafe.resos.com/booking";

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
  const [reservationsEnabled, setReservationsEnabled] = useState<boolean | null>(
    null,
  );

  const fetchReservationSettings = useCallback(async (signal: AbortSignal) => {
    try {
      const response = await fetch(
        apiUrl("reservation/reservation-settings/get_settings.php"),
        { cache: "no-store", signal },
      );
      const data: {
        success?: boolean;
        settings?: { reservations_enabled?: boolean };
      } = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Failed to fetch reservation settings");
      }

      setReservationsEnabled(data.settings?.reservations_enabled === true);
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        console.error("Failed to refresh homepage reservation setting:", error);
      }
    }
  }, []);

  useLiveRefresh(fetchReservationSettings);

  const useInternalReservationPage = reservationsEnabled === true;
  const bookingHref = useInternalReservationPage
    ? "/reservation"
    : externalBookingUrl;

  return (
    <div className="bg-white pb-14 pt-20">
      <h1 className="sr-only">Petite Fille Cafe Rosanna</h1>
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
            style={{ fontFamily: "fairplay" }}
          >
            <Link
              href={bookingHref}
              target={useInternalReservationPage ? undefined : "_blank"}
              rel={useInternalReservationPage ? undefined : "noopener noreferrer"}
              className={`${buttonBase} ${bookTableBtn}`}
            >
              Book A Table
            </Link>
            <Link href="/menu" className={`${buttonBase} ${orderOnlineBtn}`}>
              {/* Order Online */}
              See Menu
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
          <Link
            href={bookingHref}
            target={useInternalReservationPage ? undefined : "_blank"}
            rel={useInternalReservationPage ? undefined : "noopener noreferrer"}
            className={`${buttonBase} ${bookTableBtn}`}
          >
            Book A Table
          </Link>
          <Link href="/menu" className={`${buttonBase} ${orderOnlineBtn}`}>
            See Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
