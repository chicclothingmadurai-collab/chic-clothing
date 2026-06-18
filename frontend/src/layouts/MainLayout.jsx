import React, { useState, useEffect } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, User, Menu, X, Search, LogOut, Instagram, Facebook, Twitter } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/products" },
  { label: "Contact", to: "/contact" },
];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartCount = (cart?.items || cart || []).reduce?.((sum, item) => sum + (item.quantity || 1), 0) || 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className={`sticky top-0 z-40 transition-all ${scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-white"} border-b border-stone-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              CHIC
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-900"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => navigate("/products")} className="p-2 rounded-full hover:bg-stone-100 transition-colors hidden sm:inline-flex">
                <Search className="w-5 h-5 text-stone-700" />
              </button>

              <Link to="/wishlist" className="p-2 rounded-full hover:bg-stone-100 transition-colors">
                <Heart className="w-5 h-5 text-stone-700" />
              </Link>

              <Link to="/cart" className="p-2 rounded-full hover:bg-stone-100 transition-colors relative">
                <ShoppingBag className="w-5 h-5 text-stone-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/profile" className="p-2 rounded-full hover:bg-stone-100 transition-colors">
                    <User className="w-5 h-5 text-stone-700" />
                  </Link>
                  <button onClick={handleLogout} className="p-2 rounded-full hover:bg-stone-100 transition-colors">
                    <LogOut className="w-5 h-5 text-stone-700" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:inline-flex px-5 py-2 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors">
                  Sign In
                </Link>
              )}

              <button onClick={() => setMobileOpen((s) => !s)} className="p-2 rounded-full hover:bg-stone-100 transition-colors md:hidden">
                {mobileOpen ? <X className="w-5 h-5 text-stone-700" /> : <Menu className="w-5 h-5 text-stone-700" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-stone-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50"}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50">
                      Profile
                    </Link>
                    <Link to="/orders" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50">
                      My Orders
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium bg-stone-900 text-white text-center">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-stone-950 text-stone-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-2xl font-serif font-bold text-white mb-3">CHIC</h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              Premium fashion for the modern individual. Crafted with quality, designed with intention.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-amber-400 hover:text-stone-900 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-amber-400 hover:text-stone-900 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-amber-400 hover:text-stone-900 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=men" className="hover:text-white transition-colors">Men</Link></li>
              <li><Link to="/products?category=women" className="hover:text-white transition-colors">Women</Link></li>
              <li><Link to="/products?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 py-6 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} CHIC Clothing. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;