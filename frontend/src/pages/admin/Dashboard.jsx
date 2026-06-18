import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  ShoppingBag,
  IndianRupee,
  Package,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  ArrowLeft,
  Home,
  LogOut,
  Settings,
  PackageSearch,
  Bell,
  User,
  ChevronDown,
} from "lucide-react";
import api from "../../api/api";

const StatCard = ({ icon: Icon, label, value, change, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-stone-700" />
      </div>
      {change != null && (
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            change >= 0 ? "text-emerald-600" : "text-red-500"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          {change >= 0 ? "+" : ""}
          {change}%
        </span>
      )}
    </div>
    <p className="text-2xl font-semibold text-stone-900">{value}</p>
    <p className="text-sm text-stone-500 mt-1">{label}</p>
  </motion.div>
);

const statusStyles = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  processing: "bg-blue-50 text-blue-600 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-600 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-red-50 text-red-500 border-red-200",
};

const Dashboard = () => {
  const navigate = useNavigate();
const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/admin/dashboard");
        setStats(data?.stats || data);
        setRecentOrders(data?.recentOrders || []);
        setChartData(data?.salesChart || data?.revenueChart || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate("/admin");
  };



const handleLogout = async () => {
  const confirmLogout = window.confirm(
    "Are you sure you want to logout?"
  );

  if (!confirmLogout) return;

  try {
    await api.post("/auth/logout");
  } catch (err) {
    // Ignore API logout errors
  } finally {
    logout(); // clears AuthContext + localStorage

    navigate("/login", { replace: true });

    window.location.reload();
  }
};

  const handleSettings = () => {
    navigate("/admin/settings");
  };

  const handleTrackOrders = () => {
    navigate("/admin/orders");
  };

  const maxValue = Math.max(...(chartData.map((c) => c.revenue || c.value || 0)), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50/40">
      {/* Modern Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/60 shadow-sm">
        <div className="px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          {/* Left Section - Back, Home & Brand */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleHome}
              className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
              aria-label="Home"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-stone-200 mx-1" />
            <Link
              to="/admin"
              className="flex items-center gap-2 font-serif font-semibold text-xl tracking-tight bg-gradient-to-r from-stone-800 to-stone-600 bg-clip-text text-transparent"
            >
              <Package className="w-5 h-5 text-stone-700" />
              <span className="hidden sm:inline">Admin Studio</span>
            </Link>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleTrackOrders}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-all duration-200"
            >
              <PackageSearch className="w-4 h-4" />
              Track Orders
            </button>
            <button
  onClick={() => navigate("/admin/products")}
  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white bg-black hover:bg-stone-800 transition-all duration-200"
>
  <Package className="w-4 h-4" />
  Products
</button>
            
              <button
  onClick={() => navigate('/')}
  className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
  aria-label="Home"
>
  <Home className="w-5 h-5" />
</button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-stone-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* User Profile Dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-stone-100 hover:bg-stone-200 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-stone-700 to-stone-500 flex items-center justify-center text-white shadow-sm font-semibold text-sm">
  {user?.name?.charAt(0)?.toUpperCase() || "A"}
</div>
                <ChevronDown className="w-4 h-4 text-stone-500" />
              </button>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-stone-100">
  <p className="text-sm font-medium text-stone-900">
    {user?.name || "Admin User"}
  </p>

  <p className="text-xs text-stone-500 truncate">
    {user?.email || "admin@example.com"}
  </p>
</div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleTrackOrders();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <PackageSearch className="w-4 h-4" />
                      Track Orders
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleSettings();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      Home
                    </button>
                    <hr className="my-1 border-stone-100" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions Bar */}
        <div className="sm:hidden flex items-center justify-around gap-2 px-4 py-2 bg-white/60 border-t border-stone-100">
          <button
            onClick={handleTrackOrders}
            className="flex flex-col items-center gap-0.5 text-xs text-stone-600"
          >
            <PackageSearch className="w-4 h-4" />
            <span>Orders</span>
          </button>
          <button
            onClick={handleSettings}
            className="flex flex-col items-center gap-0.5 text-xs text-stone-600"
          >
            <Settings className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 text-xs text-red-500"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-stone-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                Overview of your store's performance
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                icon={Users}
                label="Total Users"
                value={(stats?.totalUsers ?? 0).toLocaleString()}
                change={stats?.userGrowth}
                delay={0}
              />
              <StatCard
                icon={ShoppingBag}
                label="Total Orders"
                value={(stats?.totalOrders ?? 0).toLocaleString()}
                change={stats?.orderGrowth}
                delay={0.05}
              />
              <StatCard
                icon={IndianRupee}
                label="Total Revenue"
                value={`₹${Number(stats?.totalRevenue ?? 0).toLocaleString()}`}
                change={stats?.revenueGrowth}
                delay={0.1}
              />
              <StatCard
                icon={Package}
                label="Total Products"
                value={(stats?.totalProducts ?? 0).toLocaleString()}
                change={stats?.productGrowth}
                delay={0.15}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-stone-900">
                    Revenue Overview
                  </h2>
                  <span className="text-xs text-stone-400">
                    Last {chartData.length || 7} days
                  </span>
                </div>
                {chartData.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-16">
                    No revenue data available
                  </p>
                ) : (
                  <div className="flex items-end gap-2 h-56">
                    {chartData.map((d, i) => {
                      const value = d.revenue ?? d.value ?? 0;
                      const height = (value / maxValue) * 100;
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-2 group"
                        >
                          <div className="relative w-full flex justify-center h-full">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(height, 4)}%` }}
                              transition={{
                                delay: 0.3 + i * 0.05,
                                duration: 0.6,
                                ease: "easeOut",
                              }}
                              className="w-full max-w-[28px] bg-stone-900 rounded-t-md group-hover:bg-amber-400 transition-colors absolute bottom-0"
                            />
                          </div>
                          <span className="text-[10px] text-stone-400 mt-auto">
                            {d.label || d.date || `D${i + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-stone-900 mb-6">
                  Order Status
                </h2>
                <div className="space-y-4">
                  {Object.entries(stats?.orderStatusCounts || {}).length ===
                  0 ? (
                    <p className="text-sm text-stone-400">
                      No order data available
                    </p>
                  ) : (
                    Object.entries(stats?.orderStatusCounts || {}).map(
                      ([status, count]) => {
                        const total = Object.values(
                          stats?.orderStatusCounts || {}
                        ).reduce((a, b) => a + b, 0) || 1;
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={status}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm capitalize text-stone-600">
                                {status}
                              </span>
                              <span className="text-sm font-medium text-stone-900">
                                {count}
                              </span>
                            </div>
                            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6 }}
                                className="h-full bg-stone-900 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-stone-900">
                  Recent Orders
                </h2>
                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-12">
                  No recent orders
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100">
                        <th className="py-3 pr-4">Order</th>
                        <th className="py-3 pr-4">Customer</th>
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 pr-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order._id || order.id}
                          className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors"
                        >
                          <td className="py-3 pr-4 font-medium text-stone-900">
                            #{order.orderNumber || order._id?.slice(-8)}
                          </td>
                          <td className="py-3 pr-4 text-stone-600">
                            {order.user?.name || order.customerName || "—"}
                          </td>
                          <td className="py-3 pr-4 text-stone-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                                statusStyles[order.status] ||
                                "bg-stone-50 text-stone-600 border-stone-200"
                              }`}
                            >
                              {order.status || "pending"}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right font-semibold text-stone-900">
                            ₹{Number(order.total || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;