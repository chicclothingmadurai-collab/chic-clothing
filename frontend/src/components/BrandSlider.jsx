import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const brands = [
  { id: 1, name: "Nike", logo: "https://via.placeholder.com/120x60?text=Nike" },
  { id: 2, name: "Adidas", logo: "https://via.placeholder.com/120x60?text=Adidas" },
  { id: 3, name: "Zara", logo: "https://via.placeholder.com/120x60?text=Zara" },
  { id: 4, name: "H&M", logo: "https://via.placeholder.com/120x60?text=H&M" },
  { id: 5, name: "Uniqlo", logo: "https://via.placeholder.com/120x60?text=Uniqlo" },
  { id: 6, name: "Gucci", logo: "https://via.placeholder.com/120x60?text=Gucci" },
  { id: 7, name: "Prada", logo: "https://via.placeholder.com/120x60?text=Prada" },
  { id: 8, name: "LV", logo: "https://via.placeholder.com/120x60?text=LV" },
];

const BrandSlider = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative py-8">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => scroll("left")}
          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-stone-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-stone-700" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth px-12"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {brands.map((brand, index) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
            className="flex-shrink-0"
          >
            <div className="w-32 h-20 bg-white rounded-xl border border-stone-100 flex items-center justify-center p-3 hover:shadow-md transition-shadow cursor-pointer">
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-w-full max-h-full object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => scroll("right")}
          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-stone-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-stone-700" />
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BrandSlider;