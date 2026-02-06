import { useState, useEffect } from 'react';





export default function ReservationCarousal  ()  {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample slides - you can replace these with your actual images and content
  const slides = [
    {
      image: "/reservation/img1.webp",
      title: "Reservations",
      subtitle: "Book your table today"
    },
    {
      image: "/reservation/img2.webp", // Replace with your actual images
      title: "Fresh Pastries",
      subtitle: "Made daily with love"
    },
    {
      image: "/reservation/img3.webp", // Replace with your actual images
      title: "Artisan Breads",
      subtitle: "Traditional recipes"
    },
    {
      image: "/reservation/img4.webp", // Replace with your actual images
      title: "Cozy Atmosphere",
      subtitle: "Perfect for any occasion"
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index : number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden group pt-5">
      {/* Carousel Container */}
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="relative min-w-full h-full flex items-center justify-center">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                // opacity: 0.7
              }}
            />
            
            {/* Overlay for better text readability */}
            <div className="absolute " />
            
            {/* Content */}
            <div className="relative z-10 text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 transform transition-all duration-700">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-lg md:text-xl opacity-90 transform transition-all duration-700 delay-150">
                  {slide.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-110' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {/* <div className="absolute bottom-0 left-0 w-full h-1 bg-black bg-opacity-20">
        <div 
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div> */}
    </div>
  );
};

