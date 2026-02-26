"use client";

import React, { useState } from "react";
import Link from "next/link";
// import Image from "next/image";
import { PiUserCircle } from "react-icons/pi";
import { MdOutlineShoppingCart } from "react-icons/md";
import { HiMenu, HiX } from "react-icons/hi";


const navLinks = [
  { href: "/aboutUs", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/merchandise", label: "Merchandise" },
  { href: "/catering", label: "Catering" },
  { href: "/careers", label: "Careers" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full absolute z-100">
      <div className="flex items-center justify-between px-5 sm:py-3 bg-black/20 rounded-full container mx-auto">
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
        <nav className="hidden md:flex gap-8 text-sm font-medium ">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative group transition-all hover:text-[#B7AA99] hover:scale-105 "
              style={{fontFamily: 'arial'}}
            >
              {label}
              <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-[#B7AA99] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <span className="hidden md:block relative group cursor-pointer transition-all hover:text-[#B7AA99] hover:scale-105">
            <Link href="/menu"
                        style={{fontFamily: 'arial'}}>
            Menu
            </Link>
            <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-[#B7AA99] transition-all duration-300 group-hover:w-full"></span>
          </span>
          <div aria-label="User Profile">
            <PiUserCircle className="size-8" />
          </div>
          <div
            aria-label="Shopping Cart"
            className="p-2 rounded-full bg-gray-500 hover:scale-105 transition-transform cursor-pointer"
          >
            <Link href="/cart">
            <MdOutlineShoppingCart className="text-white" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div
            aria-label="Toggle Navigation"
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <HiX className="size-7" /> : <HiMenu className="size-7" />}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav className="flex flex-col items-center gap-4 py-4 bg-black/80 md:hidden">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-[#B7AA99]">
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
