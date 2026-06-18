const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");

// Dashboard Stats
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders: 0,
        totalRevenue: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Users
router.get("/users", async (req, res) => {
  res.json({
    success: true,
    users: []
  });
});

// Orders
router.get("/orders", async (req, res) => {
  res.json({
    success: true,
    orders: []
  });
});

// Products
router.get("/products", async (req, res) => {
  try {
    const { page = 1, limit = 8, search = "" } = req.query;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
module.exports = router;