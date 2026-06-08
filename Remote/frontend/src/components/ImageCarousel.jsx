import React, { useState, useEffect } from 'react';

const ImageCarousel = () => {
  const images = [
    '/dashboard_carousel_1.png',
    '/dashboard_carousel_2.png'
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-[300px] overflow-hidden rounded-xl bg-black mb-8">
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={img}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>
      ))}
      <div className="absolute bottom-6 left-8 text-white z-10">
        <h2 className="text-3xl font-bold mb-2 tracking-tight">ELEVATE YOUR TEAM</h2>
        <p className="text-gray-300 text-lg">Performance tracking for the modern era.</p>
      </div>
      <div className="absolute bottom-6 right-8 flex space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
