import React, { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/api";
import { useCart } from "../../context/CartContext";
import { PageContainer, Button } from "../../components/ui";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { clearCart, grandTotal } = useCart();

  const addressId = location.state?.addressId;
  const address = location.state?.address;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if no address is selected
  if (!addressId) {
    return <Navigate to="/checkout" replace />;
  }

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      setError("");

      // Ensure Razorpay SDK is loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please check your internet connection.");
      }

      // 1. Create Razorpay Order on your backend
      const { data } = await api.post("/payments/create-order", {
        amount: grandTotal, // Backend should convert to paisa (multiply by 100)
      });

      if (!data.order || !data.order.id) {
        throw new Error("Invalid order data received from server.");
      }

      // 2. Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount, // Already in paisa from backend
        currency: data.order.currency || "INR",
        order_id: data.order.id,
        name: "CHIC CLOTHING",
        description: "Fashion Order Payment",
        // Avoid using relative favicon to prevent mixed‑content warnings
        // image: "https://yourdomain.com/favicon.ico", // optional
        prefill: {
          name: address?.fullName || "",
          contact: address?.phone || "",
        },
        notes: {
          address: `
${address?.line1 || ""}
${address?.line2 || ""}
${address?.city || ""}
${address?.state || ""}
${address?.zip || ""}
          `.trim(),
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          // Called when user closes the Razorpay popup
          ondismiss: function () {
            setError("Payment was cancelled by you.");
            setSubmitting(false);
          },
        },
        handler: async function (response) {
  try {
    const verifyRes = await api.post("/payments/verify", {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    });
    console.log("VERIFY RESPONSE:", verifyRes.data);

    if (!verifyRes.data.success) {
      throw new Error("Payment verification failed");
    }

    const orderRes = await api.post("/orders", {
      addressId,
      paymentMethod: "UPI",
      razorpayPaymentId: response.razorpay_payment_id,
      razorpayOrderId: response.razorpay_order_id,
    });

    await clearCart();

    navigate(`/order-success/${orderRes.data.order._id}`, {
      state: {
        paymentId: response.razorpay_payment_id,
      },
    });

  } catch (err) {
    console.error(err);

    setError(
      err.response?.data?.message ||
      err.message ||
      "Order creation failed"
    );

    setSubmitting(false);
  }
},
        // Handle payment failures (optional)
        // handler is already defined below
      };

     
const razorpay = new window.Razorpay(options);

      // 4. Open the Razorpay checkout
      razorpay.open();

      // Reset submitting state only if modal opens successfully
      // The modal will set it false on dismiss or success
    } catch (err) {
      console.error("Payment initiation error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to initiate payment. Please try again."
      );
      setSubmitting(false);
    }
    // Do NOT set submitting false here – let the modal events handle it
  };

  return (
    <PageContainer className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Address Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Delivery Address</h2>
        <div className="space-y-1 mb-6">
          <p className="font-semibold">{address?.fullName}</p>
          <p>{address?.line1}</p>
          {address?.line2 && <p>{address?.line2}</p>}
          <p>
            {address?.city}, {address?.state} {address?.zip}
          </p>
          <p>{address?.phone}</p>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-4">Order Total</h2>
        <p className="text-3xl font-bold text-indigo-600">₹{grandTotal}</p>
      </div>

      {/* Payment Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Method</h2>
        <div className="mb-6">
          <div className="inline-flex px-4 py-2 rounded-lg border border-green-600 bg-green-50 text-green-700 font-medium">
            UPI / Google Pay / PhonePe / Paytm / Net Banking
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-gray-500 mb-6">
            Click the button below to pay securely using Razorpay.
          </p>
        </motion.div>

        <Button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="w-full"
        >
          {submitting ? "Opening Payment Gateway..." : `Pay ₹${grandTotal}`}
        </Button>
      </div>
    </PageContainer>
  );
};

export default PaymentPage;