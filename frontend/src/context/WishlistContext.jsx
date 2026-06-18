import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        fetchWishlist,
        setWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);