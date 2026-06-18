const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    categories: [
      "Oversized",
      "Polo",
      "Round Neck",
      "Printed",
      "Plain",
      "Sports",
      "Casual",
      "Premium Cotton"
    ]
  });
});

module.exports = router;