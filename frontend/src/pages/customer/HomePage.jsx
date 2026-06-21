import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import api from "../../api/api";

// Framer Motion variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, -50]);

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
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* -------- HERO SECTION -------- */}
      <section className="relative h-screen flex items-center overflow-hidden bg-[#1A1A1A]">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black opacity-90"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {/* Subtle overlay shine */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />

        {/* Hero content – with parallax effect */}
        <motion.div
          style={{ y: yHero }}
          className="relative max-w-7xl mx-auto px-6 sm:px-10 w-full"
        >
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-[0.4em] text-amber-400 mb-6"
          >
            Spring/Summer 2026
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white leading-[0.9]"
          >
            CHIC
            <br />
            <span className="text-amber-400">CLOTHING</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="mt-6 text-base sm:text-lg text-gray-400 max-w-lg"
          >
            Discover the finest curated t‑shirts from the world's most
            celebrated fashion houses.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/products"
              className="group relative overflow-hidden bg-amber-400 text-black px-8 py-4 font-semibold uppercase tracking-wider text-sm transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/30"
            >
              <span className="relative z-10">Shop Now</span>
              <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>

            <Link
              to="/products"
              className="border border-white/30 text-white px-8 py-4 font-semibold uppercase tracking-wider text-sm hover:border-white transition-colors duration-300"
            >
              Explore
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 text-xs tracking-widest"
        >
          <span>SCROLL</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-white/30"
          />
        </motion.div>
      </section>

      {/* -------- CURATED COLLECTION (replaces brand list) -------- */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-600 mb-3">
              Curated Selection
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
              Editor's Picks
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium uppercase tracking-wider border-b-2 border-black pb-1 hover:text-amber-600 hover:border-amber-600 transition-colors"
          >
            View All →
          </Link>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product._id}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group cursor-pointer"
            >
              <Link to={`/products/${product._id}`}>
                <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                  <img
                    src={
                      product.images?.[0]?.url ||
                      "https://via.placeholder.com/400x500"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <span className="absolute top-4 left-4 bg-amber-400 text-black text-[10px] uppercase tracking-widest px-3 py-1 font-medium">
                    New
                  </span>
                </div>

                <div className="pt-5">
                  <h3 className="font-medium text-sm uppercase tracking-wide text-stone-800">
                    {product.name}
                  </h3>
                  <p className="text-stone-400 text-xs mt-1">
                    {product.brand || "CHIC"}
                  </p>
                  <p className="font-semibold text-base mt-2 text-stone-900">
                    ₹{product.finalPrice || product.price}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* -------- PROMO BANNER (luxury minimal) -------- */}
      <section className="relative bg-[#1A1A1A] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h3 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tight">
                Free Shipping
                <br />
                <span className="text-amber-400">On Every Order</span>
              </h3>
              <p className="mt-3 text-gray-400 max-w-md">
                Premium quality, delivered to your doorstep.
              </p>
            </div>
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 bg-amber-400 text-black px-8 py-4 font-semibold uppercase tracking-wider text-sm hover:bg-white transition-colors duration-300"
            >
              Shop Collection
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* -------- FOOTER (optional but adds polish) -------- */}
      <footer className="bg-white border-t border-stone-100 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <h4 className="font-serif text-2xl font-semibold">CHIC</h4>
              <p className="text-stone-400 text-sm mt-2 max-w-xs">
                Curated luxury t‑shirts for the modern wardrobe.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div>
                <p className="font-medium uppercase tracking-wider text-stone-400 text-xs">
                  Shop
                </p>
                <ul className="mt-3 space-y-2">
                  <li><Link to="/products" className="text-stone-600 hover:text-amber-600">All</Link></li>
                  <li><Link to="/products" className="text-stone-600 hover:text-amber-600">New</Link></li>
                  <li><Link to="/products" className="text-stone-600 hover:text-amber-600">Sale</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-medium uppercase tracking-wider text-stone-400 text-xs">
                  Support
                </p>
                <ul className="mt-3 space-y-2">
                  <li><Link to="/contact" className="text-stone-600 hover:text-amber-600">Contact</Link></li>
                  <li><Link to="/faq" className="text-stone-600 hover:text-amber-600">FAQ</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-100 mt-10 pt-8 text-center text-stone-400 text-xs">
            © {new Date().getFullYear()} CHIC Clothing. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}