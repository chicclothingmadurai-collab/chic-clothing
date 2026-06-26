import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../context/ThemeContext";
import { productAPI } from "../api/api";
import {
  MagnifyingGlassIcon, ShoppingBagIcon, HeartIcon, UserIcon,
  SunIcon, MoonIcon, Bars3Icon, XMarkIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';
import { X } from 'lucide-react'; // New import for mobile close icon

const CATEGORIES = ['Oversized', 'Polo', 'Round Neck', 'Printed', 'Plain', 'Sports', 'Casual', 'Premium Cotton'];

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMegaMenu(null);
  }, [location]);

  const handleSearch = async (val) => {
    setSearchQuery(val);
    clearTimeout(searchTimeout.current);
    if (val.length < 2) { setSuggestions([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data } = await productAPI.getSuggestions(val);
        setSuggestions(data.suggestions);
      } catch { setSuggestions([]); }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSuggestions([]);
    }
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-luxury-900 dark:bg-black text-white text-center py-2 text-xs tracking-widest font-medium">
        FREE DELIVERY ON EVERY ORDER
      </div>

      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-luxury-900/95 backdrop-blur-md shadow-lg' : 'bg-white dark:bg-luxury-900'} border-b border-luxury-100 dark:border-luxury-800`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <span className="font-display text-lg sm:text-xl font-bold">CHIC</span>
                <span className="font-display text-lg sm:text-xl font-light text-gold-500 ml-1">CLOTHING</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <Link to="/" className="text-luxury-800 dark:text-luxury-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors duration-200 text-base px-3 py-2">
                Home
              </Link>
              
              <div className="relative" onMouseEnter={() => setMegaMenu('categories')} onMouseLeave={() => setMegaMenu(null)}>
                <button className="text-luxury-800 dark:text-luxury-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors duration-200 text-base px-3 py-2 flex items-center gap-1">
                  Categories <ChevronDownIcon className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {megaMenu === 'categories' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full left-0 w-56 bg-white dark:bg-luxury-800 shadow-2xl border border-luxury-100 dark:border-luxury-700 p-3"
                    >
                      {CATEGORIES.map(cat => (
                        <Link
                          key={cat}
                          to={`/products?category=${encodeURIComponent(cat)}`}
                          className="block text-sm text-luxury-700 dark:text-luxury-300 hover:text-gold-500 py-2 px-2 hover:bg-luxury-50 dark:hover:bg-luxury-700 transition-colors"
                        >
                          {cat} T-Shirts
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/products" className="text-luxury-800 dark:text-luxury-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors duration-200 text-sm font-medium px-3 py-2">
                New Arrivals
              </Link>
              <Link to="/contact" className="text-luxury-800 dark:text-luxury-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors duration-200 text-sm font-medium px-3 py-2">
                Contact
              </Link>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button onClick={() => setSearchOpen(true)} className="p-2 text-luxury-700 dark:text-luxury-300 hover:text-luxury-900 dark:hover:text-white transition-colors">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {isAuthenticated && (
                <Link
                  to="/my-orders"
                  className="relative p-2 text-luxury-700 dark:text-luxury-300 hover:text-gold-500 transition-colors"
                  title="My Orders"
                >
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                </Link>
              )}

              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  className="relative p-2 text-luxury-700 dark:text-luxury-300 hover:text-luxury-900 dark:hover:text-white transition-colors"
                >
                  <HeartIcon className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-luxury-700 dark:text-luxury-300 hover:text-luxury-900 dark:hover:text-white transition-colors">
                <ShoppingBagIcon className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 text-luxury-700 dark:text-luxury-300 hover:text-luxury-900 dark:hover:text-white transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-luxury-800 shadow-2xl border border-luxury-100 dark:border-luxury-700 z-50"
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b border-luxury-100 dark:border-luxury-700">
                            <p className="text-sm font-semibold text-luxury-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-luxury-500 dark:text-luxury-400 truncate">{user?.email}</p>
                          </div>
                          {isAdmin ? (
                            <Link to="/admin/dashboard" className="block px-4 py-2.5 text-sm text-luxury-700 dark:text-luxury-300 hover:bg-luxury-50 dark:hover:bg-luxury-700 hover:text-gold-500 transition-colors">
                              Admin Dashboard
                            </Link>
                          ) : (
                            <>
                              <Link to="/profile" className="block px-4 py-2.5 text-sm text-luxury-700 dark:text-luxury-300 hover:bg-luxury-50 dark:hover:bg-luxury-700 hover:text-gold-500 transition-colors">My Profile</Link>
                              <Link to="/my-orders" className="block px-4 py-2.5 text-sm text-luxury-700 dark:text-luxury-300 hover:bg-luxury-50 dark:hover:bg-luxury-700 hover:text-gold-500 transition-colors">My Orders</Link>
                              <Link to="/wishlist" className="block px-4 py-2.5 text-sm text-luxury-700 dark:text-luxury-300 hover:bg-luxury-50 dark:hover:bg-luxury-700 hover:text-gold-500 transition-colors">Wishlist</Link>
                            </>
                          )}
                          <div className="border-t border-luxury-100 dark:border-luxury-700">
                            <button onClick={logout} className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              Sign Out
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Link to="/login" className="block px-4 py-3 text-sm font-medium text-luxury-900 dark:text-white hover:bg-luxury-50 dark:hover:bg-luxury-700 transition-colors">Sign In</Link>
                          <Link to="/register" className="block px-4 py-3 text-sm text-luxury-700 dark:text-luxury-300 hover:bg-luxury-50 dark:hover:bg-luxury-700 transition-colors">Create Account</Link>
                          <div className="border-t border-luxury-100 dark:border-luxury-700"></div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-luxury-700 dark:text-luxury-300">
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setSearchOpen(false); setSuggestions([]); } }}
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              className="bg-white dark:bg-luxury-900 max-w-2xl mx-auto mt-20 mx-4 shadow-2xl"
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center border-b-2 border-gold-500">
                <MagnifyingGlassIcon className="w-5 h-5 text-luxury-400 ml-4" />
                <input
                  ref={searchRef}
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search branded t-shirts..."
                  className="flex-1 px-4 py-4 bg-transparent text-luxury-900 dark:text-white placeholder-luxury-400 text-lg focus:outline-none"
                />
                <button type="button" onClick={() => { setSearchOpen(false); setSuggestions([]); }} className="p-4">
                  <XMarkIcon className="w-5 h-5 text-luxury-500" />
                </button>
              </form>
              {suggestions.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  {suggestions.map(s => (
                    <button
                      key={s._id}
                      onClick={() => { navigate(`/products/${s._id}`); setSearchOpen(false); setSuggestions([]); setSearchQuery(''); }}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-luxury-50 dark:hover:bg-luxury-800 text-left border-b border-luxury-100 dark:border-luxury-800"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 text-luxury-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-luxury-900 dark:text-white">{s.name}</p>
                        <p className="text-xs text-luxury-500">{s.brand} · {s.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && suggestions.length === 0 && (
                <div className="px-4 py-6 text-center text-luxury-500 text-sm">No suggestions found</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- UPDATED MOBILE DRAWER ---------- */}
      {mobileOpen && (
        <>
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Side Menu */}
          <div className="fixed top-0 right-0 h-full w-72 bg-gray-900 dark:bg-luxury-900 z-50 shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 dark:border-luxury-700">
              <h2 className="text-xl font-bold text-white">
                Menu
              </h2>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Navigation */}
            <div className="p-4 space-y-3">
              <Link
                to="/"
                className="block text-white py-2 px-3 rounded hover:bg-gray-800 dark:hover:bg-luxury-800 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                 Home
              </Link>

              <Link
                to="/my-orders"
                className="block text-white py-2 px-3 rounded hover:bg-gray-800 dark:hover:bg-luxury-800 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                 My Orders
              </Link>

              <Link
                to="/wishlist"
                className="block text-white py-2 px-3 rounded hover:bg-gray-800 dark:hover:bg-luxury-800 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                 Wishlist
              </Link>

              <Link
                to="/cart"
                className="block text-white py-2 px-3 rounded hover:bg-gray-800 dark:hover:bg-luxury-800 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                 Cart
              </Link>

              <Link
                to="/profile"
                className="block text-white py-2 px-3 rounded hover:bg-gray-800 dark:hover:bg-luxury-800 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                 Profile
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}