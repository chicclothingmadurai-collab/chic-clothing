import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/api";
import { PageContainer, Spinner, ErrorMessage, EmptyState, Button, Input } from "../../components/ui";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read current filters from URL
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const search = searchParams.get("search") || "";

  // Local input state (only for the text field)
  const [searchInput, setSearchInput] = useState(search);
  const debounceTimer = useRef(null);

  // Sync input when URL search changes (e.g., from navbar)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch products whenever category, sort, or search in URL changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (category) params.category = category;
        if (sort) params.sort = sort;
        if (search) params.search = search;

        const [prodRes, catRes] = await Promise.all([
          api.get("/products", { params }),
          categories.length ? Promise.resolve({ data: { categories } }) : api.get("/categories"),
        ]);
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, search]);

  // Debounced update of the 'search' URL parameter as user types
  useEffect(() => {
    // Clear any pending timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Set a new timer to update the URL after 300ms
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      setSearchParams(params);
    }, 300);

    // Cleanup on unmount
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Optional explicit submit handler (still works if you click the button)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Immediate update (clear timer)
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Products</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>

        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage message={error} onRetry={() => setSearchParams(searchParams)} />}
      {!loading && !error && products.length === 0 && (
        <EmptyState title="No products found" description="Try adjusting your filters or search term." />
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <motion.div
  key={product._id}
  whileHover={{ y: -8 }}
  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
>
              <Link to={`/products/${product._id}`}>
                <img
  src={
    product.images?.[0]?.url ||
    "https://via.placeholder.com/400"
  }
  alt={product.name}
  className="w-full h-72 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
/>
                <div className="p-4">
  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
    {product.brand}
  </p>

  <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[48px]">
    {product.name}
  </h3>

  <div className="mt-3 flex items-center justify-between">
    <p className="text-lg font-bold text-black">
      ₹{product.price}
    </p>

    {product.stock > 0 ? (
      <span className="text-green-600 text-xs font-medium">
        In Stock
      </span>
    ) : (
      <span className="text-red-500 text-xs font-medium">
        Out of Stock
      </span>
    )}
  </div>
                  {product.stock === 0 && (
                    <span className="text-xs text-red-500 font-medium">Out of stock</span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default ProductsPage;