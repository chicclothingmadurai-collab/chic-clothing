import React, { useEffect, useState } from "react";
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
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

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

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) params.set("search", search);
    else params.delete("search");
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
      {!loading && error && <ErrorMessage message={error} onRetry={fetchProducts} />}
      {!loading && !error && products.length === 0 && (
        <EmptyState title="No products found" description="Try adjusting your filters or search term." />
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <motion.div
              key={product._id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
            >
              <Link to={`/products/${product._id}`}>
                <img
  src={
    product.images?.[0]?.url ||
    "https://via.placeholder.com/300"
  }
  alt={product.name}
  className="w-full h-40 object-cover"
/>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                  <p className="text-indigo-600 font-bold mt-1">${product.price?.toFixed(2)}</p>
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