const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

/* =========================
   DASHBOARD
========================= */
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$grandTotal",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult[0]?.totalRevenue || 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");

    const orderStatusCounts = {
      processing: await Order.countDocuments({
        orderStatus: "Processing",
      }),
      shipped: await Order.countDocuments({
        orderStatus: "Shipped",
      }),
      delivered: await Order.countDocuments({
        orderStatus: "Delivered",
      }),
      cancelled: await Order.countDocuments({
        orderStatus: "Cancelled",
      }),
    };

    res.json({
      success: true,

      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,

        orderStatusCounts,
      },

      recentOrders,

      salesChart: [
        {
          label: "Sales",
          value: totalOrders,
        },
      ],

      revenueChart: [
        {
          label: "Revenue",
          revenue: totalRevenue,
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   USERS
========================= */

router.get("/users", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 8,
      search = "",
    } = req.query;

    const query = search
      ? {
          $or: [
            {
              name: {
                $regex: search,
                $options: "i",
              },
            },
            {
              email: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(
        (Number(page) - 1) *
          Number(limit)
      );

    const total =
      await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalUsers: total,
      totalPages: Math.ceil(
        total / limit
      ),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   BLOCK USER
========================= */

router.put(
  "/users/:id/block",
  async (req, res) => {
    try {
      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            isBlocked: true,
          },
          { new: true }
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      res.json({
        success: true,
        message:
          "User blocked successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================
   UNBLOCK USER
========================= */

router.put(
  "/users/:id/unblock",
  async (req, res) => {
    try {
      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            isBlocked: false,
          },
          { new: true }
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      res.json({
        success: true,
        message:
          "User unblocked successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================
   ORDERS
========================= */

router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(
        "user",
        "name email"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   UPDATE ORDER STATUS
========================= */

router.put(
  "/orders/:id/status",
  async (req, res) => {
    try {
      const { status } = req.body;

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      order.orderStatus = status;

      order.statusHistory.push({
        status,
        note:
          "Updated by admin",
      });

      await order.save();

      res.json({
        success: true,
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* =========================
   PRODUCTS
========================= */

router.get("/products", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 8,
      search = "",
    } = req.query;

    const query = search
      ? {
          $or: [
            {
              name: {
                $regex: search,
                $options: "i",
              },
            },
            {
              brand: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const products =
      await Product.find(query)
        .sort({
          createdAt: -1,
        })
        .limit(Number(limit))
        .skip(
          (Number(page) - 1) *
            Number(limit)
        );

    const total =
      await Product.countDocuments(
        query
      );

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(
        total / limit
      ),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   ANALYTICS
========================= */

router.get("/analytics", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$grandTotal",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult[0]?.totalRevenue || 0;

    const avgOrderValue =
      totalOrders > 0
        ? Math.round(totalRevenue / totalOrders)
        : 0;

    const topProducts = await Product.find()
      .sort({ soldCount: -1 })
      .limit(5)
      .select("name soldCount images");

    const revenueChart = await Order.aggregate([
  {
    $group: {
      _id: {
        $dateToString: {
          format: "%d-%m",
          date: "$createdAt",
        },
      },
      revenue: {
        $sum: "$grandTotal",
      },
    },
  },
  {
    $sort: {
      "_id": 1,
    },
  },
]);

const formattedRevenueChart = revenueChart.map(item => ({
  label: item._id,
  revenue: item.revenue,
}));

    const salesChart = [
      {
        label: "Orders",
        sales: totalOrders,
      },
    ];

    res.json({
      success: true,

      totalRevenue,
      totalOrders,
      avgOrderValue,

      userAnalytics: {
        totalUsers,
        activeUsers: totalUsers,
        newUsers: totalUsers,
        returningCustomers: 0,
      },

      revenueChart,
      salesChart,

      topProducts: topProducts.map((p) => ({
        _id: p._id,
        name: p.name,
        totalSold: p.soldCount || 0,
        image: p.images?.[0]?.url || "",
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
/* =========================
   DELETE ALL ORDERS
========================= */

module.exports = router;