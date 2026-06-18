import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import {
  PageContainer,
  Spinner,
  EmptyState,
  Button,
} from "../../components/ui";

const CartPage = () => {
  const {
    cart,
    loading,
    fetchCart,
    updateItem,
    removeItem,
    grandTotal,
  } = useCart();

  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  const cartItems = Array.isArray(cart) ? cart : cart?.items || [];

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) return;

    setUpdatingId(itemId);

    try {
      await updateItem(itemId, quantity);
      await fetchCart();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    setUpdatingId(itemId);

    try {
      await removeItem(itemId);
      await fetchCart();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse our products and add items to your cart."
          action={
            <Link to="/products">
              <Button className="mt-4">
                Continue Shopping
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 bg-white rounded-xl shadow-sm p-4"
                >
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      "https://via.placeholder.com/100"
                    }
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {item.product?.name}
                    </h3>

                    <p className="text-indigo-600 font-bold">
                      ₹
                      {item.product?.finalPrice ||
                        item.product?.price}
                    </p>
                  </div>

                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      disabled={updatingId === item._id}
                      onClick={() =>
                        handleQuantityChange(
                          item._id,
                          item.quantity - 1
                        )
                      }
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      -
                    </button>

                    <span className="px-4">
                      {item.quantity}
                    </span>

                    <button
                      disabled={updatingId === item._id}
                      onClick={() =>
                        handleQuantityChange(
                          item._id,
                          item.quantity + 1
                        )
                      }
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    disabled={updatingId === item._id}
                    onClick={() => handleRemove(item._id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Order Summary
            </h2>

            <div className="flex justify-between mb-2 text-gray-600">
              <span>Items</span>
              <span>{cartItems.length}</span>
            </div>

            <div className="flex justify-between mb-4 font-bold text-gray-800 text-lg border-t pt-4">
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>

            <Button
              onClick={() => navigate("/checkout")}
              className="w-full"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default CartPage;