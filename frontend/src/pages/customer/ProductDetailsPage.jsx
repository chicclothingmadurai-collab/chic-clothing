import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { PageContainer, Spinner, ErrorMessage } from "../../components/ui";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { fetchWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [activeImage, setActiveImage] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      // Force no-cache to avoid browser caching
      const res = await api.get(`/products/${id}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      console.log("PRODUCT DETAILS:", res.data.product);
      setProduct(res.data.product);
      setActiveImage(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    setActionLoading(true);
    setActionMessage("");
    try {
      await addToCart(product._id, selectedSize, null, quantity);
      setActionMessage("Added to cart!");
    } catch (err) {
      setActionMessage(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    setActionLoading(true);
    setActionMessage("");
    try {
      await addToCart(product._id, selectedSize, null, quantity);
      navigate("/checkout", {
        state: {
          buyNowProduct: product,
          quantity,
          size: selectedSize,
        },
      });
    } catch (err) {
      setActionMessage(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    setActionLoading(true);
    setActionMessage("");
    try {
      await api.post("/wishlist", { productId: product._id });
      await fetchWishlist();
      setActionMessage("Added to wishlist!");
    } catch (err) {
      setActionMessage(err.response?.data?.message || "Failed to add to wishlist");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProduct} />;
  if (!product) return <ErrorMessage message="Product not found" />;

  const images =
    product.images?.length > 0
      ? product.images.map((img) => img.url)
      : ["https://via.placeholder.com/500"];

  // Safely check if a discount exists
const displayPrice = product.finalPrice || product.price;

const originalPrice =
  product.discount > 0
    ? Math.round(
        displayPrice / (1 - product.discount / 100)
      )
    : displayPrice;

  return (
    <PageContainer>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <motion.img
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={images[activeImage]}
            alt={product.name}
            className="w-full h-96 object-cover rounded-2xl shadow-sm"
          />
          {images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    idx === activeImage ? "border-indigo-600" : "border-transparent"
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">{product.name}</h1>

          {product.brand && (
            <p className="text-gray-500 mb-2">Brand: {product.brand}</p>
          )}

      <div className="flex items-center gap-3 mb-4">
  <span className="text-3xl font-bold text-indigo-600">
    ₹{displayPrice}
  </span>

  {product.discount > 0 && (
    <>
      <span className="line-through text-gray-400 text-lg">
        ₹{originalPrice}
      </span>

      <span className="text-green-600 font-semibold">
        {product.discount}% OFF
      </span>
    </>
  )}
</div>
          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <label className="block font-medium text-gray-700 mb-2">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              >
                {product.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mb-6">
              <label className="block font-medium text-gray-700 mb-2">Colors</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <span
                    key={c._id || c}
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm"
                  >
                    {c.name || c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <label className="font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {actionMessage && (
            <p className="text-sm text-indigo-600 mb-4">{actionMessage}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || actionLoading}
              className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0 || actionLoading}
              className="flex-1 bg-yellow-500 text-black py-3 rounded-lg font-medium hover:bg-yellow-400 disabled:opacity-50 transition-colors"
            >
              Buy Now
            </button>

            <button
              onClick={handleAddToWishlist}
              disabled={actionLoading}
              className="w-12 h-12 border rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProductDetailsPage;