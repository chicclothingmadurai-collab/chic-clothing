const express = require("express");
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

const { protect } = require("../middleware/auth");

router.post("/", protect, (req, res, next) => {
  console.log("🔥 ORDERS ROUTE HIT");
  console.log("BODY:", req.body);
  console.log("USER:", req.user);
  next();
}, createOrder);
router.get("/my-orders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);

module.exports = router;