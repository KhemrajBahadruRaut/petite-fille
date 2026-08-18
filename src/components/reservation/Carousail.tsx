"use client";

import { useCallback, useEffect, useState } from "react";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { preloadImages } from "@/utils/preloadImage";
import {
  apiUrl,
  normalizeApiAssetUrl,
  withCacheVersion,
} from "@/utils/api";

interface ReservationCarouselImage {
  id: number;
  image_url: string;
  updated_at?: string;
}

export default function ReservationCarousal() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<string[]>([]);

  const fetchSlides = useCallback(async (signal: AbortSignal) => {
    try {
      const response = await fetch(apiUrl("reservation/carousel_images.php"), {
        cache: "no-store",
        signal,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch reservation carousel");
      }

      const images: ReservationCarouselImage[] = Array.isArray(data.images)
        ? data.images
        : [];
      const remoteSlides = images
        .filter((image) => image.image_url)
        .map((image) => {
          const parsedVersion = image.updated_at
            ? Date.parse(`${image.updated_at.replace(" ", "T")}Z`)
            : 0;
          return withCacheVersion(
            normalizeApiAssetUrl(image.image_url),
            Number.isFinite(parsedVersion) ? parsedVersion : 0,
          );
        });

      await preloadImages(remoteSlides);
      if (signal.aborted) return;
      setSlides(remoteSlides);
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        console.error("Failed to refresh reservation carousel:", error);
      }
    }
  }, []);

  useLiveRefresh(fetchSlides);

  useEffect(() => {
    setCurrentSlide((current) =>
      slides.length === 0 ? 0 : Math.min(current, slides.length - 1),
    );
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;

    const timer = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () =>
    setCurrentSlide((current) => (current + 1) % slides.length);
  const previousSlide = () =>
    setCurrentSlide(
      (current) => (current - 1 + slides.length) % slides.length,
    );

  return (
    <div className="group relative h-64 overflow-hidden md:h-80 lg:h-96">
      {slides.length === 0 ? (
        <div
          className="h-full w-full animate-pulse bg-gray-200"
          role="status"
          aria-label="Loading reservation carousel images"
        />
      ) : (
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide} className="relative h-full min-w-full">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide})` }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="px-4 text-center text-white">
          <h2 className="mb-2 text-4xl font-bold md:text-5xl lg:text-6xl">
            Reservations
          </h2>
          <p className="text-lg opacity-90 md:text-xl">Book your table today</p>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={previousSlide}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg
              className="h-6 w-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <svg
              className="h-6 w-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide}
              onClick={() => goToSlide(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "scale-110 bg-white"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
