import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroBanner = ({ title, subtitle, backgroundImage, buttonText, buttonLink }) => {
  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage || "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600"})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight"
            >
              {title || "Premium Fashion"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-4 text-lg md:text-xl text-white/90 max-w-lg"
            >
              {subtitle || "Discover the latest trends in luxury fashion. Shop our exclusive collection today."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8"
            >
              <Link
                to={buttonLink || "/products"}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-stone-900 font-semibold hover:bg-stone-100 transition-colors group"
              >
                {buttonText || "Shop Now"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default HeroBanner;