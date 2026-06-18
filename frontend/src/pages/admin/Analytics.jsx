import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, Users, ShoppingBag, IndianRupee } from "lucide-react";
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
        const { data: res } = await api.get("/admin/analytics", { params: { range } });
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
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
      </div>
    );
  }

  const revenueData = data?.revenueChart || [];
  const salesData = data?.salesChart || [];
  const topProducts = data?.topProducts || [];
  const userAnalytics = data?.userAnalytics || {};

  const maxRevenue = Math.max(...(revenueData.map((d) => d.revenue || d.value || 0)), 1);
  const maxSales = Math.max(...(salesData.map((d) => d.sales || d.value || 0)), 1);
  const maxProductSales = Math.max(...(topProducts.map((p) => p.totalSold || p.sales || 0)), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-stone-900 tracking-tight">Analytics</h1>
          <p className="text-stone-500 text-sm mt-1">Insights into your store's performance</p>
        </div>
        <div className="flex items-center gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${range === opt.value ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center mb-3">
            <IndianRupee className="w-5 h-5 text-stone-700" />
          </div>
          <p className="text-2xl font-semibold text-stone-900">₹{Number(data?.totalRevenue ?? 0).toLocaleString()}</p>
          <p className="text-sm text-stone-500 mt-1">Total Revenue</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5 text-stone-700" />
          </div>
          <p className="text-2xl font-semibold text-stone-900">{Number(data?.totalOrders ?? 0).toLocaleString()}</p>
          <p className="text-sm text-stone-500 mt-1">Total Orders</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-stone-700" />
          </div>
          <p className="text-2xl font-semibold text-stone-900">{Number(userAnalytics.newUsers ?? 0).toLocaleString()}</p>
          <p className="text-sm text-stone-500 mt-1">New Users</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-stone-700" />
          </div>
          <p className="text-2xl font-semibold text-stone-900">₹{Number(data?.avgOrderValue ?? 0).toLocaleString()}</p>
          <p className="text-sm text-stone-500 mt-1">Avg. Order Value</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-6">Revenue Trend</h2>
          {revenueData.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-16">No data available</p>
          ) : (
            <div className="flex items-end gap-2 h-52">
              {revenueData.map((d, i) => {
                const value = d.revenue ?? d.value ?? 0;
                const height = (value / maxRevenue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex justify-center h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 4)}%` }}
                        transition={{ delay: i * 0.04, duration: 0.5 }}
                        className="w-full max-w-[24px] bg-stone-900 rounded-t-md absolute bottom-0"
                      />
                    </div>
                    <span className="text-[10px] text-stone-400">{d.label || d.date || `D${i + 1}`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-6">Sales Volume</h2>
          {salesData.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-16">No data available</p>
          ) : (
            <div className="flex items-end gap-2 h-52">
              {salesData.map((d, i) => {
                const value = d.sales ?? d.value ?? 0;
                const height = (value / maxSales) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex justify-center h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 4)}%` }}
                        transition={{ delay: i * 0.04, duration: 0.5 }}
                        className="w-full max-w-[24px] bg-amber-400 rounded-t-md absolute bottom-0"
                      />
                    </div>
                    <span className="text-[10px] text-stone-400">{d.label || d.date || `D${i + 1}`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">Top Selling Products</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-12">No data available</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, i) => {
              const sold = product.totalSold || product.sales || 0;
              const pct = (sold / maxProductSales) * 100;
              return (
                <div key={product._id || product.id || i} className="flex items-center gap-4">
                  <img src={product.image || product.images?.[0] || "https://via.placeholder.com/48"} alt={product.name} className="w-11 h-11 rounded-lg object-cover border border-stone-100 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-stone-900 line-clamp-1">{product.name}</span>
                      <span className="text-sm text-stone-500">{sold} sold</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.05, duration: 0.5 }} className="h-full bg-stone-900 rounded-full" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">User Analytics</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="bg-stone-50 rounded-xl p-5 text-center">
            <p className="text-2xl font-semibold text-stone-900">{Number(userAnalytics.totalUsers ?? 0).toLocaleString()}</p>
            <p className="text-sm text-stone-500 mt-1">Total Users</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-5 text-center">
            <p className="text-2xl font-semibold text-stone-900">{Number(userAnalytics.activeUsers ?? 0).toLocaleString()}</p>
            <p className="text-sm text-stone-500 mt-1">Active Users</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-5 text-center">
            <p className="text-2xl font-semibold text-stone-900">{Number(userAnalytics.returningCustomers ?? 0).toLocaleString()}</p>
            <p className="text-sm text-stone-500 mt-1">Returning Customers</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;