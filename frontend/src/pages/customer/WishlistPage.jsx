import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/api";
import { useCart } from "../../context/CartContext";
import { PageContainer, Spinner, ErrorMessage, EmptyState, Button } from "../../components/ui";

const WishlistPage = () => {
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/wishlist");
setItems(res.data.wishlist || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    setBusyId(productId);
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to remove item");
    } finally {
      setBusyId(null);
    }
  };

  const handleMoveToCart = async (productId) => {
    setBusyId(productId);
    setMessage("");
    try {
      await addToCart(productId, 1);
      await api.delete(`/wishlist/${productId}`);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      setMessage("Moved to cart!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to move to cart");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchWishlist} />;

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Wishlist</h1>

      {message && <p className="text-sm text-indigo-600 mb-4">{message}</p>}

      {items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          subtitle="Save items you love to come back to them later."
          action={
            <Link to="/products">
              <Button className="mt-4">Browse Products</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={item.image || "https://via.placeholder.com/300"}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                  <p className="text-indigo-600 font-bold mt-1">${item.price?.toFixed(2)}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => handleMoveToCart(item.productId)}
                      disabled={busyId === item.productId}
                      className="flex-1 text-sm py-1.5"
                    >
                      Add to Cart
                    </Button>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={busyId === item.productId}
                      className="text-red-500 hover:text-red-700 text-sm font-medium px-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PageContainer>
  );
};

export default WishlistPage;