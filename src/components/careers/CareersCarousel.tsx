"use client";

import { useCallback, useEffect, useState } from "react";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { preloadImages } from "@/utils/preloadImage";
import {
    apiUrl,
    normalizeApiAssetUrl,
    withCacheVersion,
} from "@/utils/api";

interface CareerCarouselImage {
    id: number;
    image_url: string;
    updated_at?: string;
}

export default function CareersCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState<string[]>([]);

    const fetchSlides = useCallback(async (signal: AbortSignal) => {
        try {
            const response = await fetch(apiUrl("jobs/carousel_images.php"), {
                cache: "no-store",
                signal,
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch careers carousel");
            }

            const images: CareerCarouselImage[] = Array.isArray(data.images)
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
                console.error("Failed to refresh careers carousel:", error);
            }
        }
    }, []);

    useLiveRefresh(fetchSlides);

    useEffect(() => {
        setCurrentSlide((current) =>
            slides.length === 0 ? 0 : Math.min(current, slides.length - 1),
        );
    }, [slides.length]);

    // Auto-advance carousel
    useEffect(() => {
        if (slides.length < 2) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [slides.length]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 overflow-hidden group ">
            {/* Background Images Container */}
            {slides.length === 0 ? (
                <div
                    className="h-full w-full animate-pulse bg-gray-200"
                    role="status"
                    aria-label="Loading careers carousel images"
                />
            ) : (
                <div
                    className="flex h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide) => (
                        <div key={slide} className="relative min-w-full h-full">
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${slide})`,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Fixed Content - This stays in place */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center text-white px-4">
                    <h5 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2">
                        Careers
                    </h5>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90">
                        Join our team
                    </p>
                </div>
            </div>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
                        aria-label="Previous slide"
                    >
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
                        aria-label="Next slide"
                    >
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Dot Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {slides.map((slide, index) => (
                        <button
                            key={slide}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                                index === currentSlide
                                    ? "bg-white scale-110"
                                    : "bg-white bg-opacity-50 hover:bg-opacity-70"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
