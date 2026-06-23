import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
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
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Zap,
  BarChart3,
  Tag,
  ShoppingCart,
  PlusCircle,
} from "lucide-react";
import api from "../../api/api";

// -------- Helper Components --------

// Animated Stat Card
const StatCard = ({ icon: Icon, label, value, change, delay, color }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) || 0 : value || 0;

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const increment = targetValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        current = targetValue;
        clearInterval(timer);
      }
      setDisplayValue(current);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [targetValue]);

  const formatValue = (num) => {
    if (typeof value === "string" && value.startsWith("₹")) {
      return `₹${Math.round(num).toLocaleString()}`;
    }
    return Math.round(num).toLocaleString();
  };

  const gradient =
    color === "blue"
      ? "from-blue-50 to-blue-100/50 border-blue-200/30"
      : color === "emerald"
      ? "from-emerald-50 to-emerald-100/50 border-emerald-200/30"
      : color === "amber"
      ? "from-amber-50 to-amber-100/50 border-amber-200/30"
      : "from-stone-50 to-stone-100/50 border-stone-200/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`bg-gradient-to-br ${gradient} rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-stone-700" />
        </div>
        {change != null && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              change >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <motion.p
        key={displayValue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-semibold text-stone-900"
      >
        {formatValue(displayValue)}
      </motion.p>
      <p className="text-sm text-stone-500 mt-1">{label}</p>
    </motion.div>
  );
};

// Status Badge
const statusStyles = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  processing: "bg-blue-50 text-blue-600 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-600 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-red-50 text-red-500 border-red-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
      statusStyles[status] || "bg-stone-50 text-stone-600 border-stone-200"
    }`}
  >
    {status}
  </span>
);

// -------- Main Dashboard --------

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

        // 1. Extract order status counts from the API
        const orderStatusCounts = data.stats?.orderStatusCounts || {};

        // 2. If the API didn't provide status counts but we have recent orders, compute them ourselves
        let computedCounts = { ...orderStatusCounts };
        if (Object.keys(computedCounts).length === 0 && data.recentOrders?.length) {
          computedCounts = data.recentOrders.reduce((acc, order) => {
            const status = order.orderStatus?.toLowerCase() || "pending";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
        }

        // 3. Set stats with all fields
        setStats({
          totalUsers: data.stats?.totalUsers || 0,
          totalProducts: data.stats?.totalProducts || 0,
          totalOrders: data.stats?.totalOrders || 0,
          totalRevenue: data.stats?.totalRevenue || 0,
          orderStatusCounts: computedCounts, // <-- now correctly populated
          userGrowth: data.stats?.userGrowth,
          orderGrowth: data.stats?.orderGrowth,
          revenueGrowth: data.stats?.revenueGrowth,
          productGrowth: data.stats?.productGrowth,
        });
        console.log("Recent Orders:", recentOrders);
        setRecentOrders(data.recentOrders || []);
        setChartData(data.revenueChart || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBack = () => navigate(-1);
  const handleHome = () => navigate("/admin");
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    try {
      await api.post("/auth/logout");
    } catch (err) {}
    logout();
    navigate("/login", { replace: true });
    window.location.reload();
  };
  const handleSettings = () => navigate("/admin/settings");
  const handleTrackOrders = () => navigate("/admin/orders");

  const maxValue = Math.max(...(chartData.map((c) => c.revenue || c.value || 0)), 1);
  console.log("Chart Data:", chartData);

  // Quick actions
  const quickActions = [
    {
      label: "Order Management",
      icon: PackageSearch,
      path: "/admin/orders",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Products",
      icon: Package,
      path: "/admin/products",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Manage Users",
      icon: Users,
      path: "/admin/users",
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50/40">
      {/* Header – identical to OrderManagement for consistency */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/60 shadow-sm">
        <div className="px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          {/* Left Section */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleHome}
              className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
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

          {/* Right Section */}
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
              onClick={() => navigate("/")}
              className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-stone-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* User Dropdown */}
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
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
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
                      onClick={() => { setShowUserMenu(false); handleTrackOrders(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <PackageSearch className="w-4 h-4" />
                      Track Orders
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); handleSettings(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      Home
                    </button>
                    <hr className="my-1 border-stone-100" />
                    <button
                      onClick={() => { setShowUserMenu(false); handleLogout(); }}
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

        {/* Mobile Quick Actions */}
        <div className="sm:hidden flex items-center justify-around gap-2 px-4 py-2 bg-white/60 border-t border-stone-100">
          <button onClick={handleTrackOrders} className="flex flex-col items-center gap-0.5 text-xs text-stone-600">
            <PackageSearch className="w-4 h-4" />
            <span>Orders</span>
          </button>
          <button onClick={handleSettings} className="flex flex-col items-center gap-0.5 text-xs text-stone-600">
            <Settings className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 text-xs text-red-500">
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
            {/* Page Title */}
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

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats?.totalUsers ?? 0}
                change={stats?.userGrowth}
                delay={0}
                color="blue"
              />
              <StatCard
                icon={ShoppingBag}
                label="Total Orders"
                value={stats?.totalOrders ?? 0}
                change={stats?.orderGrowth}
                delay={0.05}
                color="emerald"
              />
              <StatCard
                icon={IndianRupee}
                label="Total Revenue"
                value={`₹${Number(stats?.totalRevenue ?? 0).toLocaleString()}`}
                change={stats?.revenueGrowth}
                delay={0.1}
                color="amber"
              />
              <StatCard
                icon={Package}
                label="Total Products"
                value={stats?.totalProducts ?? 0}
                change={stats?.productGrowth}
                delay={0.15}
                color="stone"
              />
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  to={action.path}
                  className={`group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${action.color} shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <action.icon className="w-6 h-6 text-white mb-2 relative z-10" />
                  <p className="text-sm font-medium text-white relative z-10">{action.label}</p>
                </Link>
              ))}
            </motion.div>

            {/* Charts Row - FIXED COLLISION HERE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="h-full flex flex-col justify-center items-center">
                <div className="text-4xl sm:text-5xl font-bold text-emerald-600">
                  ₹{stats.totalRevenue?.toLocaleString()}
                </div>

                <p className="mt-3 text-stone-500 text-lg">
                  Total Revenue Generated
                </p>

                <div className="mt-6 flex gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {stats.totalOrders}
                    </p>
                    <p className="text-stone-500 text-sm">
                      Orders
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      ₹{Math.round(stats.totalRevenue / Math.max(stats.totalOrders,1))}
                    </p>
                    <p className="text-stone-500 text-sm">
                      Avg Order
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-lg font-semibold text-stone-900 mb-6">
                  Order Status
                </h2>
                <div className="space-y-4">
                  {Object.entries(stats?.orderStatusCounts || {}).length === 0 ? (
                    <p className="text-sm text-stone-400">No order data available</p>
                  ) : (
                    Object.entries(stats?.orderStatusCounts || {}).map(([status, count]) => {
                      const total = Object.values(stats?.orderStatusCounts || {}).reduce(
                        (a, b) => a + b,
                        0
                      ) || 1;
                      const pct = Math.round((count / total) * 100);
                      const colorMap = {
                        pending: "bg-amber-500",
                        processing: "bg-blue-500",
                        shipped: "bg-indigo-500",
                        delivered: "bg-emerald-500",
                        cancelled: "bg-red-500",
                      };
                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm capitalize text-stone-600 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${colorMap[status] || "bg-stone-400"}`} />
                              {status}
                            </span>
                            <span className="text-sm font-medium text-stone-900">{count}</span>
                          </div>
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6 }}
                              className={`h-full rounded-full ${colorMap[status] || "bg-stone-400"}`}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>

            {/* Recent Orders Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-md transition-shadow"
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
                        <th className="py-3 pr-4 font-medium">Order</th>
                        <th className="py-3 pr-4 font-medium">Customer</th>
                        <th className="py-3 pr-4 font-medium">Date</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                        <th className="py-3 pr-4 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order._id || order.id}
                          className="border-b border-stone-50 last:border-0 hover:bg-stone-50/60 transition-colors group"
                        >
                          <td className="py-3 pr-4 font-medium text-stone-900">
                            #{order.orderNumber || order._id?.slice(-8)}
                          </td>
                          <td className="py-3 pr-4 text-stone-600">
                            {order.user?.name || order.customerName || "—"}
                          </td>
                          <td className="py-3 pr-4 text-stone-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("en-IN")
                              : "—"}
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge
                              status={
                                order.orderStatus?.toLowerCase() ||
                                "processing"
                              }
                            />
                          </td>
                          <td className="py-3 pr-4 text-right font-semibold text-stone-900">
                            ₹{Number(order.grandTotal || 0).toLocaleString()}
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