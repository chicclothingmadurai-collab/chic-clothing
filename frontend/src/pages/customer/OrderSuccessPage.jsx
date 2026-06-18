import React, { useEffect, useState } from "react";

import { useLocation, useNavigate, Link } from "react-router-dom";

import { motion } from "framer-motion";

import { CheckCircle2, Package, Truck, ShoppingBag, ClipboardList } from "lucide-react";
const OrderSuccessPage = () => {

const location = useLocation();

const navigate = useNavigate();

const [order, setOrder] = useState(null);
useEffect(() => {

const stateOrder = location.state?.order;

if (stateOrder) {

setOrder(stateOrder);

} else {

const saved = sessionStorage.getItem("lastOrder");

if (saved) {

setOrder(JSON.parse(saved));

} else {

navigate("/", { replace: true });

}

}

}, [location.state, navigate]);
useEffect(() => {

if (order) {

sessionStorage.setItem("lastOrder", JSON.stringify(order));

}

}, [order]);
if (!order) return null;
const orderNumber = order.orderNumber || order._id || order.id || "—";

const deliveryDate = new Date();

deliveryDate.setDate(deliveryDate.getDate() + (order.estimatedDays || 5));
return (

<div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex items-center justify-center px-4 py-16">

<motion.div

initial={{ opacity: 0, y: 30 }}

animate={{ opacity: 1, y: 0 }}

transition={{ duration: 0.6, ease: "easeOut" }}

className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-stone-100 p-8 sm:p-12 text-center"

>

<motion.div

initial={{ scale: 0 }}

animate={{ scale: 1 }}

transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}

className="mx-auto w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6"

>

<motion.div

initial={{ rotate: -90, opacity: 0 }}

animate={{ rotate: 0, opacity: 1 }}

transition={{ delay: 0.4, duration: 0.5 }}

>

<CheckCircle2 className="w-12 h-12 text-emerald-500" strokeWidth={1.5} />

</motion.div>

</motion.div>
    <motion.h1
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-3xl font-serif font-semibold text-stone-900 mb-2 tracking-tight"
    >
      Order Confirmed
    </motion.h1>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="text-stone-500 mb-8"
    >
      Thank you for shopping with CHIC. Your order has been placed successfully.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-stone-50 rounded-2xl p-6 mb-8 space-y-4 text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Package className="w-5 h-5 text-stone-700" />
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider">Order Number</p>
            <p className="font-semibold text-stone-900">{orderNumber}</p>
          </div>
        </div>
        {order.total != null && (
          <div className="text-right">
            <p className="text-xs text-stone-500 uppercase tracking-wider">Total</p>
            <p className="font-semibold text-stone-900">₹{Number(order.total).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="h-px bg-stone-200" />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
          <Truck className="w-5 h-5 text-stone-700" />
        </div>
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wider">Estimated Delivery</p>
          <p className="font-semibold text-stone-900">
            {deliveryDate.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="flex flex-col sm:flex-row gap-3"
    >
      <Link
        to="/products"
        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-stone-300 text-stone-800 font-medium hover:bg-stone-50 transition-colors"
      >
        <ShoppingBag className="w-4 h-4" />
        Continue Shopping
      </Link>
      <Link
        to="/orders"
        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
      >
        <ClipboardList className="w-4 h-4" />
        View Orders
      </Link>
    </motion.div>
  </motion.div>
</div>
);

};
export default OrderSuccessPage;