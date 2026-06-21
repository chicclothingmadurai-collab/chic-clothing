import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  TrendingUp,
  Users,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";
import api from "../../api/api";

const RANGE_OPTIONS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "1 Year", value: "1y" },
];

const Analytics = () => {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: res } = await api.get("/admin/analytics", {
          params: { range },
        });
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
        <p className="text-luxury-400 text-sm tracking-[0.2em] uppercase">
          Gathering insights...
        </p>
      </div>
    );
  }

  const revenueData = data?.revenueChart || [];
  const salesData = data?.salesChart || [];
  const topProducts = data?.topProducts || [];
  const userAnalytics = data?.userAnalytics || {};

  const maxRevenue = Math.max(
    ...(revenueData.map((d) => d.revenue || d.value || 0)),
    1
  );
  const maxSales = Math.max(
    ...(salesData.map((d) => d.sales || d.value || 0)),
    1
  );
  const maxProductSales = Math.max(
    ...(topProducts.map((p) => p.totalSold || p.sales || 0)),
    1
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
    }),
  };

  const barVariants = {
    initial: { height: 0 },
    animate: (height) => ({
      height: `${height}%`,
      transition: { duration: 0.8, ease: "easeOut" },
    }),
  };

  return (
    <div className="space-y-12">
      {/* Centered Header (smaller, no icon) */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="text-center space-y-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl md:text-4xl font-display font-bold tracking-tight text-luxury-900"
        >
          Analytics
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-luxury-500 text-sm max-w-md mx-auto"
        >
          Insights into your store’s performance, at a glance.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 p-1.5 bg-white border border-luxury-200 rounded-full shadow-sm"
        >
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                range === opt.value
                  ? "bg-gold-500 text-white shadow-md"
                  : "text-luxury-500 hover:text-luxury-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </motion.div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl text-center">
            {error}
          </p>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: IndianRupee,
            label: "Total Revenue",
            value: `₹${Number(data?.totalRevenue ?? 0).toLocaleString()}`,
            accent: "gold",
          },
          {
            icon: ShoppingBag,
            label: "Total Orders",
            value: Number(data?.totalOrders ?? 0).toLocaleString(),
            accent: "luxury",
          },
          {
            icon: Users,
            label: "New Users",
            value: Number(userAnalytics.newUsers ?? 0).toLocaleString(),
            accent: "luxury",
          },
          {
            icon: TrendingUp,
            label: "Avg. Order Value",
            value: `₹${Number(data?.avgOrderValue ?? 0).toLocaleString()}`,
            accent: "gold",
          },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative bg-white rounded-2xl border border-luxury-100 p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                card.accent === "gold"
                  ? "bg-gold-50 text-gold-600"
                  : "bg-luxury-100 text-luxury-800"
              }`}
            >
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-luxury-900 tracking-tight">
              {card.value}
            </p>
            <p className="text-sm text-luxury-500 mt-1">{card.label}</p>
            <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gold-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl border border-luxury-100 p-6 shadow-sm"
        >
          <h2 className="text-xl font-display font-semibold text-luxury-900 mb-8">
            Revenue Trend
          </h2>
          {revenueData.length === 0 ? (
            <p className="text-sm text-luxury-400 text-center py-20">
              No data available
            </p>
          ) : (
            <div className="flex items-end gap-2 h-56 px-2">
              {revenueData.map((d, i) => {
                const value = d.revenue ?? d.value ?? 0;
                const height = (value / maxRevenue) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="relative w-full flex justify-center h-full">
                      <motion.div
                        custom={height}
                        variants={barVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: i * 0.05 }}
                        className="w-full max-w-[24px] bg-gradient-to-t from-gold-300 to-gold-500 rounded-t-md absolute bottom-0"
                      />
                    </div>
                    <span className="text-[10px] text-luxury-400 font-medium">
                      {d.label || d.date || `D${i + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-luxury-100 p-6 shadow-sm"
        >
          <h2 className="text-xl font-display font-semibold text-luxury-900 mb-8">
            Sales Volume
          </h2>
          {salesData.length === 0 ? (
            <p className="text-sm text-luxury-400 text-center py-20">
              No data available
            </p>
          ) : (
            <div className="flex items-end gap-2 h-56 px-2">
              {salesData.map((d, i) => {
                const value = d.sales ?? d.value ?? 0;
                const height = (value / maxSales) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="relative w-full flex justify-center h-full">
                      <motion.div
                        custom={height}
                        variants={barVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: i * 0.05 }}
                        className="w-full max-w-[24px] bg-gradient-to-t from-luxury-300 to-luxury-900 rounded-t-md absolute bottom-0"
                      />
                    </div>
                    <span className="text-[10px] text-luxury-400 font-medium">
                      {d.label || d.date || `D${i + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl border border-luxury-100 p-6 shadow-sm"
      >
        <h2 className="text-xl font-display font-semibold text-luxury-900 mb-8">
          Top Selling Products
        </h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-luxury-400 text-center py-16">
            No data available
          </p>
        ) : (
          <div className="space-y-6">
            {topProducts.map((product, i) => {
              const sold = product.totalSold || product.sales || 0;
              const pct = (sold / maxProductSales) * 100;
              return (
                <div
                  key={product._id || product.id || i}
                  className="flex items-center gap-4 group"
                >
                  <img
                    src={
                      product.image ||
                      product.images?.[0] ||
                      "https://via.placeholder.com/48"
                    }
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover border border-luxury-100 flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-luxury-900 line-clamp-1">
                        {product.name}
                      </span>
                      <span className="text-sm text-luxury-500 font-medium">
                        {sold} sold
                      </span>
                    </div>
                    <div className="h-2 bg-luxury-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-gold-300 to-gold-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* User Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl border border-luxury-100 p-6 shadow-sm"
      >
        <h2 className="text-xl font-display font-semibold text-luxury-900 mb-8">
          User Analytics
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              label: "Total Users",
              value: Number(userAnalytics.totalUsers ?? 0).toLocaleString(),
            },
            {
              label: "Active Users",
              value: Number(userAnalytics.activeUsers ?? 0).toLocaleString(),
            },
            {
              label: "Returning Customers",
              value: Number(
                userAnalytics.returningCustomers ?? 0
              ).toLocaleString(),
            },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-luxury-50 rounded-xl p-6 text-center hover:bg-luxury-100 transition-colors"
            >
              <p className="text-3xl font-bold text-luxury-900">
                {item.value}
              </p>
              <p className="text-sm text-luxury-500 mt-2">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;