import React from "react";
import { motion } from "framer-motion";

const ProductSkeleton = ({ count = 8 }) => {
  const skeletons = Array(count).fill(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {skeletons.map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-2xl border border-stone-100 overflow-hidden"
        >
          <div className="aspect-square bg-stone-100 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-stone-100 rounded-lg animate-pulse w-3/4" />
            <div className="h-4 bg-stone-100 rounded-lg animate-pulse w-1/2" />
            <div className="flex items-center justify-between">
              <div className="h-6 bg-stone-100 rounded-lg animate-pulse w-1/3" />
              <div className="h-8 bg-stone-100 rounded-xl animate-pulse w-16" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductSkeleton;