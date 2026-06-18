const express = require("express");
const Product = require("../models/Product");

const r = express.Router();

let wishlist = [];

// Get Wishlist
r.get("/", async (req, res) => {
  try {
    const result = await Promise.all(
      wishlist.map(async (item) => {
        const product = await Product.findById(item.productId);

        return {
          productId: item.productId,
          name: product?.name,
          price: product?.finalPrice || product?.price,
          image: product?.images?.[0]?.url,
        };
      })
    );

    res.json({
      success: true,
      wishlist: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Add To Wishlist
r.post("/", (req, res) => {
  wishlist.push(req.body);

  res.json({
    success: true,
    message: "Added to wishlist",
    wishlist,
  });
});

// Remove From Wishlist
r.delete("/:productId", (req, res) => {
  wishlist = wishlist.filter(
    (item) => item.productId !== req.params.productId
  );

  res.json({
    success: true,
    message: "Removed from wishlist",
    wishlist,
  });
});

module.exports = r;