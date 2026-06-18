import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";

const ProductCard = ({ product, index, onAddToCart, onToggleWishlist, isWishlisted }) => {
  const {
    _id,
    name,
    price,
    images,
    category,
    rating,
    stock,
    discount
  } = product;

  const discountedPrice = discount ? price - (price * discount / 100) : price;
  const hasStock = stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <Link to={`/products/${_id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-stone-50">
          <img
            src={images?.[0] || "https://via.placeholder.com/400"}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
              -{discount}%
            </span>
          )}
          {!hasStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-white text-stone-900 text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Link to={`/products/${_id}`}>
              <h3 className="font-medium text-stone-900 hover:text-stone-600 transition-colors line-clamp-1">
                {name}
              </h3>
            </Link>
            <p className="text-xs text-stone-400 mt-0.5">{category?.name || "Uncategorized"}</p>
          </div>
          <button
            onClick={() => onToggleWishlist?.(product)}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-stone-400"}`}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-stone-700">{rating.toFixed(1)}</span>
            </div>
          )}
          <span className="text-xs text-stone-400">({stock} left)</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {discount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-stone-900">
                  ₹{discountedPrice.toLocaleString()}
                </span>
                <span className="text-sm text-stone-400 line-through">
                  ₹{price.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-stone-900">
                ₹{price.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={() => onAddToCart?.(product)}
            disabled={!hasStock}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${hasStock
                ? "bg-stone-900 text-white hover:bg-stone-800"
                : "bg-stone-100 text-stone-400 cursor-not-allowed"
              }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;