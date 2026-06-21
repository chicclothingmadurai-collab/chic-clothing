import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import {
  CheckCircle2,
  Truck,
  ShoppingBag,
  ClipboardList,
  MapPin,
  Download,
} from "lucide-react";
import html2pdf from "html2pdf.js";

// If your logo is inside src/assets, uncomment and use this import:
// import logo from "../assets/logo.png"; // adjust path accordingly

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const receiptRef = useRef(null);
  const [pdfLoading, setPdfLoading] = useState(false);

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

  const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const address = order.shippingAddress || {};
  const fullAddress = `${address.addressLine || ""}, ${address.city || ""}, ${address.state || ""} - ${address.pincode || ""}`;

  const paymentStatus = order.paymentStatus || "Paid";
  const paymentMethod = order.paymentMethod || "UPI";
  const items = order.items || [];

  const handleDownloadPDF = () => {
    if (!receiptRef.current) return;
    setPdfLoading(true);
    const element = receiptRef.current;
    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: `Order_${orderNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save()
      .then(() => setPdfLoading(false))
      .catch(() => setPdfLoading(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-stone-100 p-8 sm:p-12"
      >
        {/* Receipt content – captured for PDF */}
        <div ref={receiptRef} className="bg-white p-4 rounded-2xl">
          {/* --- LOGO (image) --- */}
          <div className="text-center mb-4">
            <img
  src={logo}
  alt="CHIC Clothing"
  className="h-40 w-auto mx-auto mb-4"
/>
          </div>

          {/* Checkmark icon */}
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
            className="text-3xl font-serif font-semibold text-stone-900 mb-2 tracking-tight text-center"
          >
            ✅ ORDER CONFIRMED
          </motion.h1>
          

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-stone-50 rounded-2xl p-6 mt-6 space-y-4 text-left"
          >
            {/* Order # and Payment */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-stone-500">Order #{orderNumber}</span>
              <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                {paymentStatus}
              </span>
            </div>
            <div className="text-sm text-stone-600">
              <span className="font-medium">Payment Method:</span> {paymentMethod}
            </div>
            <div className="text-sm text-stone-600">
  <span className="font-medium">Payment ID:</span>{" "}
  {order.razorpayPaymentId || "N/A"}
</div>


            <div className="h-px bg-stone-200" />

            {/* Estimated Delivery */}
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-stone-600" />
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider">Estimated Delivery</p>
                <p className="font-semibold text-stone-900">{formattedDeliveryDate}</p>
              </div>
            </div>

            <div className="h-px bg-stone-200" />
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm mt-3">
  Expected delivery within 5–7 business days
</div>

            {/* Delivery Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-stone-600 mt-0.5" />
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider">Delivery Address</p>
                <p className="font-semibold text-stone-900 text-lg">
  {address.fullName}
</p>

<p className="text-stone-700">
  {address.addressLine}
</p>

<p className="text-stone-700">
  {address.city}, {address.state}
</p>

<p className="text-stone-700">
  PIN: {address.pincode}
</p>

<p className="text-stone-700">
  Email: {address.email}
</p>
              </div>
            </div>

            <div className="h-px bg-stone-200" />

            {/* Order Summary */}
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Order Summary</p>
              {items.length === 0 ? (
                <p className="text-stone-500 text-sm">No items</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.productName || item.name || "Item"} – Size: {item.size || "M"} × {item.quantity || 1}
                      </span>
                      <span className="font-medium">
                        ₹{(item.price || 0) * (item.quantity || 1)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-t border-stone-200 mt-3 pt-2 flex justify-between font-semibold text-base">
                <span>Total Paid</span>
                <span>₹{Number(order.grandTotal || 0).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 flex-wrap"
        >
          <Link
            to="/products"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-stone-300 text-stone-800 font-medium hover:bg-stone-50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
          <Link
            to="/my-orders"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            View Orders
          </Link>
          
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {pdfLoading ? "Generating..." : "Download Invoice"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;