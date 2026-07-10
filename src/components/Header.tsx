"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
// import Image from "next/image";
import { PiUserCircle } from "react-icons/pi";
import { HiMenu, HiX } from "react-icons/hi";
import { ShoppingCart } from "lucide-react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { apiUrl } from "@/utils/api";

const navLinks = [
  { href: "/aboutUs", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/merchandise", label: "Merchandise" },
  { href: "/catering", label: "Catering" },
  { href: "/careers", label: "Careers" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const { isAuthenticated } = useUserAuth();

  const profileLink = isAuthenticated
    ? "/profile"
    : "/auth/login?next=/profile";

  useEffect(() => {
    let isMounted = true;

    const fetchMerchSettings = async () => {
      try {
        const response = await fetch(apiUrl("merch/get_settings.php"), {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch merch settings");
        }

        if (isMounted) {
          setShowCart(data.settings?.online_purchase_enabled !== false);
        }
      } catch {
        if (isMounted) {
          setShowCart(true);
        }
      }
    };

    fetchMerchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const mobileNavLinks = useMemo(
    () => [
      ...navLinks,
      { href: "/menu", label: "Menu" },
      ...(showCart ? [{ href: "/cart", label: "Cart" }] : []),
    ],
    [showCart],
  );

  return (
    <header className="w-full absolute z-100">
      <div className="container mx-auto flex items-center justify-between rounded-full bg-black/30 px-5 backdrop-blur-md sm:py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/logo/logo.webp"
            alt="logo"
            width={50}
            height={50}
            className="cursor-pointer transition-all duration-500 hover:scale-110"
          />
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden gap-8 text-sm font-medium text-white md:flex"
          style={{ fontFamily: "arial" }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="group relative transition-all hover:scale-110 hover:text-[#d5cfc8]"
            >
              {label}
              <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-[#B7AA99] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4 text-white">
          {/* Menu Link */}
          <span className="group relative hidden cursor-pointer transition-all hover:scale-105 hover:text-[#d5cfc8] md:block">
            <Link href="/menu" style={{ fontFamily: "arial" }}>
              Menu
            </Link>
            <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-[#B7AA99] transition-all duration-300 group-hover:w-full"></span>
          </span>

          {/* Cart */}
          {showCart && (
            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className="transition-all hover:scale-110 hover:text-[#d5cfc8]"
            >
              <ShoppingCart className="size-6" />
            </Link>
          )}

          {/* Profile */}
          <Link
            href={profileLink}
            aria-label="User Profile"
            className="transition-all hover:scale-110 hover:text-[#d5cfc8]"
          >
            <PiUserCircle className="size-8" />
          </Link>

          {/* Mobile Hamburger */}
          <div
            aria-label="Toggle Navigation"
            className="text-white focus:outline-none md:hidden cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <HiX className="size-7" />
            ) : (
              <HiMenu className="size-7" />
            )}
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
