import React, { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { Link } from "react-router-dom";

import { Package, ChevronLeft, ChevronRight, X, Loader2, ShoppingBag } from "lucide-react";

import api from "../../api/api";
const statusStyles = {

pending: "bg-amber-50 text-amber-600 border-amber-200",

processing: "bg-blue-50 text-blue-600 border-blue-200",

shipped: "bg-indigo-50 text-indigo-600 border-indigo-200",

delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",

cancelled: "bg-red-50 text-red-500 border-red-200",

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

const fetchOrders = async () => {

setLoading(true);

setError("");

try {

const { data } = await api.get("/orders/my-orders", { params: { page, limit: PAGE_SIZE } });

setOrders(data?.orders || data || []);

setTotalPages(data?.totalPages || 1);

} catch (err) {

setError(err.response?.data?.message || "Failed to load orders");

} finally {

setLoading(false);

}

};

fetchOrders();

}, [page]);
return (

<div className="min-h-screen bg-stone-50 py-12 px-4">

<div className="max-w-4xl mx-auto">

<h1 className="text-3xl font-serif font-semibold text-stone-900 mb-8 tracking-tight">My Orders</h1>
    {loading ? (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
      </div>
    ) : error ? (
      <div className="text-center py-24">
        <p className="text-red-500 mb-2">{error}</p>
      </div>
    ) : orders.length === 0 ? (
      <div className="text-center py-24 bg-white rounded-3xl border border-stone-100">
        <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-500 mb-6">You haven't placed any orders yet.</p>
        <Link to="/products" className="inline-flex px-6 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800">
          Start Shopping
        </Link>
      </div>
    ) : (
      <div className="space-y-4">
        {orders.map((order, idx) => (
          <motion.div
            key={order._id || order.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">Order #{order.orderNumber || order._id?.slice(-8) || order.id}</p>
                  <p className="text-xs text-stone-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </p>
                </div>
              </div>
              <StatusBadge status={order.status || "pending"} />
            </div>

            <div className="flex items-center gap-3 overflow-hidden">
              {(order.items || []).slice(0, 4).map((item, i) => (
                <img
                  key={i}
                  src={item.image || item.product?.images?.[0] || "https://via.placeholder.com/64"}
                  alt={item.name || item.product?.name}
                  className="w-14 h-14 rounded-lg object-cover border border-stone-100 flex-shrink-0"
                />
              ))}
              {(order.items || []).length > 4 && (
                <div className="w-14 h-14 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-500 flex-shrink-0">
                  +{order.items.length - 4}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
              <p className="text-sm text-stone-500">{(order.items || []).length} item(s)</p>
              <p className="text-sm font-semibold text-stone-900">₹{Number(order.total || 0).toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    )}

    {!loading && !error && orders.length > 0 && totalPages > 1 && (
      <div className="flex items-center justify-center gap-3 mt-10">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-stone-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-stone-600">Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-stone-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )}
  </div>

  <AnimatePresence>
    {selectedOrder && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-stone-900">Order #{selectedOrder.orderNumber || selectedOrder._id?.slice(-8) || selectedOrder.id}</h3>
              <p className="text-xs text-stone-500 mt-1">
                {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("en-IN") : ""}
              </p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-full hover:bg-stone-100">
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <StatusBadge status={selectedOrder.status || "pending"} />
            <p className="text-sm font-semibold text-stone-900">Total: ₹{Number(selectedOrder.total || 0).toLocaleString()}</p>
          </div>

          <div className="space-y-3 mb-6">
            {(selectedOrder.items || []).map((item, i) => (
              <div key={i} className="flex items-center gap-4 border border-stone-100 rounded-xl p-3">
                <img
                  src={item.image || item.product?.images?.[0] || "https://via.placeholder.com/64"}
                  alt={item.name || item.product?.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-900">{item.name || item.product?.name}</p>
                  <p className="text-xs text-stone-500">
                    {item.size ? `Size: ${item.size} • ` : ""}{item.color ? `Color: ${item.color} • ` : ""}Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-stone-900">₹{Number(item.price || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {selectedOrder.shippingAddress && (
            <div className="bg-stone-50 rounded-xl p-4 mb-2">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Shipping Address</p>
              <p className="text-sm text-stone-700 leading-relaxed">
                {selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
);

};
export default MyOrdersPage;