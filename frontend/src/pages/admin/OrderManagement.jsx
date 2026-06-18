import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";

const PAGE_SIZE = 8;
const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];
const statusStyles = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  processing: "bg-blue-50 text-blue-600 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-600 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-red-50 text-red-500 border-red-200",
};

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
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/orders", {
        params: { page, limit: PAGE_SIZE, search, status: statusFilter === "all" ? undefined : statusFilter },
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => ((o._id || o.id) === orderId ? { ...o, status } : o)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status");
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
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/60 shadow-sm">
        <div className="px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          {/* Left Section */}
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
              aria-label="Settings"
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
            <Home className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 text-xs text-red-500">
            <LogOut className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Page Title */}
          <div>
            <h1 className="text-2xl font-serif font-semibold text-stone-900 tracking-tight">Order Management</h1>
            <p className="text-stone-500 text-sm mt-1">Track and update customer orders</p>
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
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all duration-200 ${
                    statusFilter === status
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table Card */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
              </div>
            ) : error ? (
              <p className="text-center text-red-500 py-24 text-sm">{error}</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-24">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500 text-sm">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100">
                      <th className="py-3 pl-6 pr-4">Order</th>
                      <th className="py-3 pr-4">Customer</th>
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Items</th>
                      <th className="py-3 pr-4">Total</th>
                      <th className="py-3 pr-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const id = order._id || order.id;
                      return (
                        <tr key={id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors">
                          <td className="py-3 pl-6 pr-4 font-medium text-stone-900">#{order.orderNumber || id?.slice(-8)}</td>
                          <td className="py-3 pr-4 text-stone-600">{order.user?.name || order.customerName || "—"}</td>
                          <td className="py-3 pr-4 text-stone-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                          <td className="py-3 pr-4 text-stone-600">{(order.items || []).length}</td>
                          <td className="py-3 pr-4 font-semibold text-stone-900">₹{Number(order.total || 0).toLocaleString()}</td>
                          <td className="py-3 pr-6 text-right">
                            <div className="relative inline-block">
                              <select
                                value={order.status || "pending"}
                                onChange={(e) => updateStatus(id, e.target.value)}
                                disabled={updatingId === id}
                                className={`appearance-none px-3 py-1.5 pr-8 rounded-full text-xs font-medium border capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all ${
                                  statusStyles[order.status] || "bg-stone-50 text-stone-600 border-stone-200"
                                } disabled:opacity-60`}
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s} className="text-stone-900">{s}</option>
                                ))}
                              </select>
                              {updatingId === id && <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-stone-400" />}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && orders.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-stone-600">Page {page} of {totalPages}</span>
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
    </div>
  );
};

export default OrderManagement;