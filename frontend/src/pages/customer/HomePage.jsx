import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "../../api/api";

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data.products?.slice(0, 4) || []);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-black text-white min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black opacity-90" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm uppercase tracking-[0.3em] text-yellow-500 mb-4"
          >
            New Season — 2026
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-8xl font-bold tracking-tight mb-6 leading-[0.95]"
          >
            CHIC
            <br />
            CLOTHING
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-400 mb-10 max-w-md"
          >
            Premium branded t-shirts. Curated from the world's leading fashion
            houses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/products"
              className="bg-yellow-500 text-black px-8 py-4 font-semibold uppercase tracking-wider text-sm hover:bg-white transition-colors duration-300"
            >
              Shop Now
            </Link>

            <Link
              to="/products"
              className="border border-white/30 text-white px-8 py-4 font-semibold uppercase tracking-wider text-sm hover:border-white transition-colors duration-300"
            >
              Explore Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-600 mb-2">
              Curated Selection
            </p>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Featured Brands
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {[
            "Nike",
            "Adidas",
            "Puma",
            "Tommy Hilfiger",
            "Calvin Klein",
          ].map((brand) => (
            <motion.div
              key={brand}
              whileHover={{ y: -4 }}
              className="border border-gray-200 rounded-none p-8 text-center transition-shadow hover:shadow-lg cursor-pointer"
            >
              <span className="font-semibold tracking-wide text-sm uppercase">
                {brand}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-600 mb-2">
              Just Dropped
            </p>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Trending T-Shirts
            </h2>
          </div>

          <Link
            to="/products"
            className="text-sm font-semibold uppercase tracking-wider border-b-2 border-black pb-1 hover:text-yellow-600 hover:border-yellow-600 transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <motion.div
              key={product._id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="group cursor-pointer"
            >
              <Link to={`/products/${product._id}`}>
                <div className="relative h-56 sm:h-72 md:h-80 bg-gray-100 overflow-hidden">
                  <img
                    src={
                      product.images?.[0]?.url ||
                      "https://via.placeholder.com/400x500"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <span className="absolute top-3 left-3 bg-black text-white text-[10px] uppercase tracking-wider px-2 py-1">
                    New
                  </span>
                </div>

                <div className="pt-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wide">
                    {product.name}
                  </h3>

                  <p className="text-gray-500 text-xs mt-1">
                    {product.brand}
                  </p>

                  <p className="font-bold mt-2">
                    ₹{product.finalPrice || product.price}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-yellow-500 text-black py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Free Shipping on Orders Above ₹1999
            </h3>

            <p className="text-black/70">
              Premium quality, delivered to your doorstep.
            </p>
          </div>

          <Link
            to="/products"
            className="bg-black text-white px-8 py-4 font-semibold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-colors duration-300 whitespace-nowrap"
          >
            Shop Collection
          </Link>
        </div>
      </section>
    </div>
  );
}