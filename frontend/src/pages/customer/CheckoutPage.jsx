import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/api";
import { useCart } from "../../context/CartContext";
import { PageContainer, Spinner, EmptyState, Button, Input } from "../../components/ui";

// Helper to normalise backend address to frontend format
const normalizeAddress = (addr) => ({
  _id: addr._id || addr.id,
  fullName: addr.fullName || addr.name || "",
  line1: addr.addressLine || addr.line1 || "",
  line2: addr.addressLine2 || addr.line2 || "",
  city: addr.city || "",
  state: addr.state || "",
  zip: addr.pincode || addr.postalCode || addr.zip || "",
  phone: addr.mobile || addr.phone || "",
});

const CheckoutPage = () => {
  const { cart, grandTotal, itemsTotal, loading: cartLoading, fetchCart } = useCart();
  const cartItems = Array.isArray(cart) ? cart : cart?.items || [];
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch addresses from backend
  const fetchAddresses = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/auth/me");
      const user = data?.user || data;
      const rawAddresses = user.addresses || [];
      const normalized = rawAddresses.map(normalizeAddress);
      setAddresses(normalized);
      // Auto-select first address if any
      if (normalized.length > 0) {
        setSelectedAddressId(normalized[0]._id);
      }
    } catch (err) {
      setError("Failed to load addresses. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const validateNewAddress = () => {
    const errs = {};
    ["fullName", "line1", "city", "state", "zip", "phone"].forEach((field) => {
      if (!newAddress[field]?.trim()) errs[field] = "Required";
    });
    return errs;
  };

  // Save address to backend
  const handleSaveAddress = async () => {
    const errs = validateNewAddress();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setError("");
    try {
      // Build payload with backend field names
      const payload = {
        fullName: newAddress.fullName,
        mobile: newAddress.phone,
        addressLine: newAddress.line1,
        addressLine2: newAddress.line2,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.zip,
        isDefault: false,
      };

      await api.post("/auth/address", payload);

      // Refetch addresses to get updated list with server-generated IDs
      await fetchAddresses();

      // Close the form
      setShowNewAddress(false);
      setNewAddress({
        fullName: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save address");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      setError("Please select or add a shipping address");
      return;
    }
    const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddress) {
      setError("Selected address not found");
      return;
    }
    navigate("/payment", {
      state: {
        addressId: selectedAddressId,
        address: selectedAddress,
      },
    });
  };

  if (cartLoading || loading) return <Spinner />;

  if (cartItems.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          title="Your cart is empty"
          subtitle="Add items to your cart before checking out."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Address Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Shipping Address</h2>

            {addresses.length === 0 && !showNewAddress && (
              <p className="text-gray-500 mb-4">No saved addresses. Please add one.</p>
            )}

            <div className="space-y-3 mb-4">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer ${
                    selectedAddressId === addr._id
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{addr.fullName}</p>
                    <p className="text-sm text-gray-500">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ""}
                      <br />
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                    <p className="text-sm text-gray-500">{addr.phone}</p>
                  </div>
                </label>
              ))}
            </div>

            {!showNewAddress ? (
              <Button variant="outline" onClick={() => setShowNewAddress(true)}>
                + Add New Address
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={newAddress.fullName}
                    onChange={handleAddressChange}
                    error={errors.fullName}
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    value={newAddress.phone}
                    onChange={handleAddressChange}
                    error={errors.phone}
                  />
                </div>
                <Input
                  label="Address Line 1"
                  name="line1"
                  value={newAddress.line1}
                  onChange={handleAddressChange}
                  error={errors.line1}
                />
                <Input
                  label="Address Line 2 (optional)"
                  name="line2"
                  value={newAddress.line2}
                  onChange={handleAddressChange}
                />
                <div className="grid sm:grid-cols-3 gap-3">
                  <Input
                    label="City"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                    error={errors.city}
                  />
                  <Input
                    label="State"
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressChange}
                    error={errors.state}
                  />
                  <Input
                    label="ZIP"
                    name="zip"
                    value={newAddress.zip}
                    onChange={handleAddressChange}
                    error={errors.zip}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveAddress} disabled={submitting}>
                    {submitting ? "Saving..." : "Save Address"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowNewAddress(false);
                      setNewAddress({
                        fullName: "",
                        line1: "",
                        line2: "",
                        city: "",
                        state: "",
                        zip: "",
                        phone: "",
                      });
                      setErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.product?.images?.[0]?.url ||
                        "https://via.placeholder.com/60"
                      }
                      alt={item.product?.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.product?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-xs text-gray-400">
                        Size: {item.size}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">
                    ₹{(item.finalPrice || item.product?.finalPrice || 0) * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2 text-gray-600">
            <span>Subtotal</span>
            <span>₹{itemsTotal}</span>
          </div>
          <div className="flex justify-between mb-4 font-bold text-gray-800 text-lg border-t pt-4">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>
          <Button onClick={handleContinue} className="w-full">
            Continue to Payment
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default CheckoutPage;