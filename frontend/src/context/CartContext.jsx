import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { cartAPI } from "../api/api";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState({
    items: [],
    couponDiscount: 0,
  });

  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);

    try {
      const { data } = await cartAPI.get();

      setCart(
        data.cart || {
          items: [],
          couponDiscount: 0,
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (
    productId,
    size,
    color,
    quantity = 1
  ) => {
    const { data } = await cartAPI.add({
      productId,
      size,
      color,
      quantity,
    });

    setCart(data.cart);

    return data;
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await cartAPI.updateItem(itemId, {
      quantity,
    });

    setCart(data.cart);
  };

  const removeItem = async (itemId) => {
    const { data } = await cartAPI.removeItem(itemId);

    setCart(data.cart);
  };

  const clearCart = async () => {
    await cartAPI.clear();

    setCart({
      items: [],
      couponDiscount: 0,
    });
  };

  const cartItems = cart?.items || [];

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const itemsTotal = cartItems.reduce(
    (sum, item) =>
      sum +
      ((item.finalPrice || item.price || 0) *
        item.quantity),
    0
  );

  const deliveryCharge = 0;


const grandTotal = itemsTotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        itemsTotal,
        deliveryCharge,
        grandTotal,
        fetchCart,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return ctx;
};