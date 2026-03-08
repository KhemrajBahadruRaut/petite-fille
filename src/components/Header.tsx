"use client";

import React, { useState } from "react";
import Link from "next/link";
// import Image from "next/image";
import { PiUserCircle } from "react-icons/pi";
import { HiMenu, HiX } from "react-icons/hi";
import { useUserAuth } from "@/contexts/UserAuthContext";


const navLinks = [
  { href: "/aboutUs", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/merchandise", label: "Merchandise" },
  { href: "/catering", label: "Catering" },
  { href: "/careers", label: "Careers" },
];

const mobileNavLinks = [...navLinks, { href: "/menu", label: "Menu" }];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useUserAuth();
  const profileLink = isAuthenticated ? "/profile" : "/auth/login?next=/profile";

  return (
    <header className="w-full absolute z-100">
      <div className="container mx-auto flex items-center justify-between rounded-full  bg-black/30 px-5  backdrop-blur-md sm:py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/logo/logo.webp"
            alt="logo"
            width={50}
            height={50}
            className="cursor-pointer hover:scale-110 transition-all duration-500"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative group transition-all hover:text-[#d5cfc8] hover:scale-110 "
              style={{ fontFamily: "arial" }}
            >
              {label}
              <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-[#B7AA99] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <span className="group relative hidden cursor-pointer transition-all hover:scale-105 hover:text-[#B7AA99] md:block">
            <Link href="/menu" style={{ fontFamily: "arial" }}>
              Menu
            </Link>
            <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-[#B7AA99] transition-all duration-300 group-hover:w-full"></span>
          </span>
          <Link href={profileLink} aria-label="User Profile">
            <PiUserCircle className="size-8" />
          </Link>

          {/* Mobile Hamburger */}
          <div
            aria-label="Toggle Navigation"
            className="text-[#3f3428] focus:outline-none md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <HiX className="size-7" /> : <HiMenu className="size-7" />}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav className="container mx-auto mt-2 flex flex-col items-center gap-4 rounded-2xl border border-[#e7dccb] bg-white/95 py-4 text-[#3f3428] backdrop-blur-md md:hidden">
          {mobileNavLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-[#B7AA99]"
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
