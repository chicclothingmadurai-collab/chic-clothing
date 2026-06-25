import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ShoppingBag,
  Eye,
  MapPin,
  Calendar,
  IndianRupee,
} from "lucide-react";
import api from "../../api/api";

// Status badge styles (same as before)
const statusStyles = {
  Processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Shipped: "bg-blue-100 text-blue-700 border-blue-200",
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border capitalize ${
      statusStyles[status] || "bg-stone-50 text-stone-600 border-stone-200"
    }`}
  >
    {status}
  </span>
);

const PAGE_SIZE = 5;

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/orders/my-orders", {
        params: { page, limit: PAGE_SIZE },
      });
      // Ensure response structure matches
      setOrders(data?.orders || data || []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-semibold text-stone-900 mb-8 tracking-tight flex items-center gap-3">
          <Package className="w-7 h-7 text-stone-600" />
          My Orders
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-red-500 mb-2">{error}</p>
            <button
              onClick={fetchOrders}
              className="text-sm text-stone-600 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-stone-100">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 mb-6">You haven't placed any orders yet.</p>
            <Link
              to="/products"
              className="inline-flex px-6 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order, idx) => {
                const orderId = order._id || order.id;
                const orderNumber = order.orderNumber || orderId?.slice(-8) || "---";
                const status = order.orderStatus || "Processing";
                const items = order.items || [];
                const total = order.grandTotal || order.total || 0;
                const createdAt = order.createdAt;
                const isProcessing = status === "Processing";

                // Get first 4 item images
                const itemImages = items.slice(0, 4).map((item) => item.image || item.product?.images?.[0] || null);
                const moreCount = items.length - 4;

                return (
                  <motion.div
                    key={orderId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Order header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-stone-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">
                            Order #{orderNumber}
                          </p>
                          <p className="text-xs text-stone-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(createdAt)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    {/* Product images + summary */}
                    <div className="p-5 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 overflow-x-auto flex-1">
                        {itemImages.map((img, i) => (
                          <img
                            key={i}
                            src={img || "https://via.placeholder.com/64?text=No+Img"}
                            alt="product"
                            className="w-16 h-16 rounded-lg object-cover border border-stone-100 flex-shrink-0"
                          />
                        ))}
                        {moreCount > 0 && (
                          <div className="w-16 h-16 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-500 flex-shrink-0">
                            +{moreCount}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-stone-500 whitespace-nowrap">
                        {items.length} item{items.length > 1 ? "s" : ""}
                      </div>
                    </div>

                    {/* Footer: total + actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-5 pt-0 border-t border-stone-100 mt-0">
                      <div className="flex items-center gap-1 text-sm font-semibold text-stone-900">
                        <IndianRupee className="w-4 h-4" />
                        {Number(total).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-3">
                        
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-stone-700 bg-stone-100 border border-stone-200 hover:bg-stone-200 transition"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {!loading && !error && orders.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-stone-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-stone-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-stone-50 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedOrder(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">
                    Order #{selectedOrder.orderNumber || selectedOrder._id?.slice(-8) || "---"}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-full hover:bg-stone-100 transition"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {/* Status & total */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <StatusBadge status={selectedOrder.orderStatus || "Processing"} />
                <p className="text-sm font-semibold text-stone-900 flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {Number(selectedOrder.grandTotal || selectedOrder.total || 0).toLocaleString()}
                </p>
              </div>
              <div className="mb-6 space-y-1">
  <p className="text-sm text-stone-600">
    Payment Method: {selectedOrder.paymentMethod || "UPI"}
  </p>

  <p className="text-sm text-stone-600">
    Payment Status: {selectedOrder.paymentStatus || "Paid"}
  </p>

  <p className="text-sm text-stone-600">
    Payment ID: {selectedOrder.razorpayPaymentId || "N/A"}
  </p>
</div>

              {/* Items list */}
              <div className="space-y-3 mb-6">
                {(selectedOrder.items || []).map((item, i) => {
                  const img = item.image || item.product?.images?.[0] || "https://via.placeholder.com/64?text=No+Img";
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 border border-stone-100 rounded-xl p-3 hover:shadow-sm transition"
                    >
                      <img
                        src={img}
                        alt={item.name || item.productName || "Product"}
                        className="w-16 h-16 rounded-lg object-cover border border-stone-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {item.name || item.productName || "Item"}
                        </p>
                        <p className="text-xs text-stone-500">
                          {item.size ? `Size: ${item.size} • ` : ""}
                          {item.color ? `Color: ${item.color} • ` : ""}
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-stone-900 whitespace-nowrap">
                        ₹{Number(item.price || 0).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Shipping address */}
              {selectedOrder.shippingAddress && (
                <div className="bg-stone-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Shipping Address
                  </p>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {selectedOrder.shippingAddress.fullName && (
                      <span className="font-medium block">
                        {selectedOrder.shippingAddress.fullName}
                      </span>
                    )}
                    {selectedOrder.shippingAddress.addressLine}
                    <br />
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state}{" "}
                    {selectedOrder.shippingAddress.pincode}
                    <br />
                    {selectedOrder.shippingAddress.mobile && (
  <span className="block text-xs text-stone-500">
    Mobile: {selectedOrder.shippingAddress.mobile}
  </span>
)}
                    {selectedOrder.shippingAddress.email && (
                      <span className="text-xs text-stone-500">
                        Email: {selectedOrder.shippingAddress.email}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Cancel button inside modal (if Processing) */}
              
                
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrdersPage;