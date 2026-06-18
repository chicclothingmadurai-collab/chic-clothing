import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const SearchBar = ({ onSearch, placeholder = "Search products...", className = "" }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        // Replace with your actual API call
        // const { data } = await api.get(`/products/search?q=${query}&limit=5`);
        // setSuggestions(data.products || []);
        
        // Mock suggestions for demonstration
        setSuggestions([
          { _id: "1", name: `${query} Product 1`, price: 1999 },
          { _id: "2", name: `${query} Product 2`, price: 2999 },
          { _id: "3", name: `${query} Product 3`, price: 3999 },
        ]);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-11 pr-12 py-3 rounded-full border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-stone-400 hover:text-stone-600" />
          </button>
        )}
      </form>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-100 shadow-lg overflow-hidden z-50"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
              </div>
            ) : (
              <div>
                {suggestions.map((item) => (
                  <Link
                    key={item._id}
                    to={`/products/${item._id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0"
                  >
                    <span className="text-sm text-stone-700">{item.name}</span>
                    <span className="text-sm font-semibold text-stone-900">₹{item.price}</span>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;