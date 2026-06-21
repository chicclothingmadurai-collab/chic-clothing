import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Home,
  LogOut,
  Settings,
  PackageSearch,
  User,
  ChevronDown,
  MapPin,
  Calendar,
  IndianRupee,
  X,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";

const PAGE_SIZE = 6; // cards per page
const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusStyles = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  processing: "bg-blue-50 text-blue-600 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-600 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-red-50 text-red-500 border-red-200",
};

const statusIcons = {
  pending: Clock,
  processing: Loader2,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

// Helper to format currency
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

// Helper to format date
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Order card component (reused inside the list)
const OrderCard = ({ order, onStatusUpdate, updatingId, onViewDetails }) => {
  const id = order._id || order.id;
  const status = order.status || "pending";
  const total = order.grandTotal || order.total || 0;
  const items = order.items || [];
  const firstImage = items[0]?.image || items[0]?.product?.images?.[0] || null;
  const StatusIcon = statusIcons[status] || Package;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      {/* Card Header */}
      <div className="p-4 flex items-start justify-between border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
            {firstImage ? (
              <img src={firstImage} alt="order" className="w-full h-full object-cover rounded-full" />
            ) : (
              <Package className="w-5 h-5 text-stone-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">
              #{order.orderNumber || id?.slice(-8)}
            </p>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status}
          </span>
          <button
            onClick={() => onViewDetails(order)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate">
              {order.user?.name || order.customerName || "Guest"}
            </p>
            <p className="text-xs text-stone-500 truncate">{order.user?.email || order.email || ""}</p>
          </div>
          <div className="text-sm font-semibold text-stone-900 flex items-center gap-1">
            <IndianRupee className="w-4 h-4" />
            {Number(total).toLocaleString()}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>{items.length} item{items.length !== 1 ? "s" : ""}</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {order.shippingAddress?.city || "N/A"}
          </span>
        </div>

        {/* Status dropdown */}
        <div className="pt-2 border-t border-stone-100">
          <select
            value={status}
            onChange={(e) => onStatusUpdate(id, e.target.value)}
            disabled={updatingId === id}
            className={`w-full px-3 py-2 rounded-lg text-xs font-medium border capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all ${
              statusStyles[status] || "bg-stone-50 text-stone-600 border-stone-200"
            } disabled:opacity-60`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="text-stone-900">
                {s}
              </option>
            ))}
          </select>
          {updatingId === id && (
            <div className="flex items-center justify-center mt-1">
              <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Order Details Modal
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;
  const items = order.items || [];
  const addr = order.shippingAddress || {};
  const total = order.grandTotal || order.total || 0;
  const subtotal = order.subtotal || total;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">
              Order #{order.orderNumber || order._id?.slice(-8)}
            </h3>
            <p className="text-xs text-stone-500">{formatDate(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 transition">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer & status */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-stone-900">{order.user?.name || order.customerName || "Guest"}</p>
              <p className="text-xs text-stone-500">{order.user?.email || order.email || ""}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${statusStyles[order.status]}`}>
              {order.status}
            </span>
          </div>

          {/* Items */}
          <div>
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Order Items</h4>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl">
                  <img
                    src={item.image || item.product?.images?.[0] || "https://via.placeholder.com/64"}
                    alt={item.name || item.productName}
                    className="w-14 h-14 rounded-lg object-cover border border-stone-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {item.name || item.productName}
                    </p>
                    <p className="text-xs text-stone-500">
                      {item.size ? `Size: ${item.size} • ` : ""}
                      {item.color ? `Color: ${item.color} • ` : ""}
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-stone-50 rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {order.deliveryCharge && (
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Delivery</span>
                <span className="font-medium">{formatCurrency(order.deliveryCharge)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-1 border-t border-stone-200">
              <span>Grand Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {addr && Object.keys(addr).length > 0 && (
            <div className="bg-stone-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Shipping Address
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed">
                {addr.fullName && <span className="font-medium block">{addr.fullName}</span>}
                {addr.addressLine}
                <br />
                {addr.city}, {addr.state} {addr.pincode}
                <br />
                {addr.email && <span className="text-xs text-stone-500">Email: {addr.email}</span>}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Admin Component
const OrderManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Compute stats
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === "pending").length;
    const processing = orders.filter(o => o.status === "processing").length;
    const shipped = orders.filter(o => o.status === "shipped").length;
    const delivered = orders.filter(o => o.status === "delivered").length;
    const cancelled = orders.filter(o => o.status === "cancelled").length;
    return { total, pending, processing, shipped, delivered, cancelled };
  }, [orders]);

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        search,
        status: statusFilter === "all" ? undefined : statusFilter,
      };
      const { data } = await api.get("/admin/orders", { params });
      setOrders(data?.orders || data || []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [page, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [search]);

  // Update status
  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => {
          const id = o._id || o.id;
          if (id === orderId) return { ...o, status: newStatus };
          return o;
        })
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Navigation handlers
  const handleBack = () => navigate(-1);
  const handleHome = () => navigate("/admin");
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    try {
      await api.post("/auth/logout");
    } catch (err) {}
    localStorage.removeItem("chic_token");
    localStorage.removeItem("chic_user");
    sessionStorage.clear();
    navigate("/admin/login");
  };
  const handleSettings = () => navigate("/admin/settings");
  const handleTrackOrders = () => navigate("/admin/orders");

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50/40">
      {/* Header – unchanged */}
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
              onClick={handleSettings}
              className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
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
                      <Settings className="w-4 h-4" />
                      Settings
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
            <span>Settings</span>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 text-xs text-red-500">
            <LogOut className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-stone-900 tracking-tight">
                Order Management
              </h1>
              <p className="text-stone-500 text-sm mt-1">Track and update customer orders</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setStatusFilter("all"); setSearch(""); setPage(1); }}
                className="px-4 py-2 rounded-full text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total", value: stats.total, color: "bg-stone-100 text-stone-700" },
              { label: "Pending", value: stats.pending, color: "bg-amber-100 text-amber-700" },
              { label: "Processing", value: stats.processing, color: "bg-blue-100 text-blue-700" },
              { label: "Shipped", value: stats.shipped, color: "bg-indigo-100 text-indigo-700" },
              { label: "Delivered", value: stats.delivered, color: "bg-emerald-100 text-emerald-700" },
              { label: "Cancelled", value: stats.cancelled, color: "bg-red-100 text-red-700" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl p-4 text-center ${stat.color} shadow-sm border border-white/20`}
              >
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs uppercase tracking-wider font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative max-w-sm flex-1 min-w-[220px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order number or customer..."
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {["all", ...STATUS_OPTIONS].map((status) => (
                <motion.button
                  key={status}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className={`px-4 py-2 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all duration-200 ${
                    statusFilter === status
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {status === "all" ? "All" : status}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Order Cards Grid */}
          <div className="relative">
            {loading ? (
              // Skeleton loading
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(PAGE_SIZE)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-stone-200" />
                      <div className="flex-1">
                        <div className="h-4 bg-stone-200 rounded w-3/4" />
                        <div className="h-3 bg-stone-200 rounded w-1/2 mt-1" />
                      </div>
                    </div>
                    <div className="h-4 bg-stone-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-stone-200 rounded w-1/2" />
                    <div className="mt-4 h-10 bg-stone-200 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-24">
                <p className="text-red-500 text-sm">{error}</p>
                <button
                  onClick={fetchOrders}
                  className="mt-4 px-6 py-2 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition"
                >
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-24">
                <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500 text-sm">No orders found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {orders.map((order) => (
                    <OrderCard
                      key={order._id || order.id}
                      order={order}
                      onStatusUpdate={updateStatus}
                      updatingId={updatingId}
                      onViewDetails={setSelectedOrder}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && orders.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-stone-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-white transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;