import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Camera, Plus, Trash2, Edit2, Save, X, Loader2,
} from "lucide-react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const emptyAddress = {
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  phone: "",
};

// Helper to normalise backend address fields to frontend names
const normalizeAddress = (addr) => ({
  label: addr.label || "Home",
  line1: addr.addressLine || addr.line1 || "",
  line2: addr.addressLine2 || addr.line2 || "",
  city: addr.city || "",
  state: addr.state || "",
  postalCode: addr.pincode || addr.postalCode || "",
  country: addr.country || "India",
  phone: addr.mobile || addr.phone || "",
  // keep original fields for sending back
  _original: addr,
});

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [addressModal, setAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressErrors, setAddressErrors] = useState({});

  // Load user profile
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/auth/me");
        const profile = data?.user || data;
        setForm({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          avatar: profile.avatar || "",
        });
        setAvatarPreview(profile.avatar || "");
        // Normalise addresses
        const normalizedAddresses = (profile.addresses || []).map(normalizeAddress);
        setAddresses(normalizedAddresses);
      } catch (err) {
        if (user) {
          setForm({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            avatar: user.avatar || "",
          });
          setAvatarPreview(user.avatar || "");
          const normalizedAddresses = (user.addresses || []).map(normalizeAddress);
          setAddresses(normalizedAddresses);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Validation for profile form
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) errs.phone = "Enter a valid phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setForm((prev) => ({ ...prev, avatarFile: file, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Save profile
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSuccess("");
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("phone", form.phone);
      if (form.avatarFile) payload.append("avatar", form.avatarFile);

      const { data } = await api.put("/auth/profile", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = data?.user || data;
      if (setUser) setUser((prev) => ({ ...prev, ...updated }));
      setSuccess("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  // Validation for address form
  const validateAddress = () => {
    const errs = {};
    if (!addressForm.label.trim()) errs.label = "Label is required";
    if (!addressForm.line1.trim()) errs.line1 = "Address line is required";
    if (!addressForm.city.trim()) errs.city = "City is required";
    if (!addressForm.state.trim()) errs.state = "State is required";
    if (!addressForm.postalCode.trim()) errs.postalCode = "Postal code is required";
    else if (!/^[0-9]{4,10}$/.test(addressForm.postalCode)) errs.postalCode = "Enter a valid postal code";
    if (!addressForm.phone.trim()) errs.phone = "Phone is required";
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Open add address modal
  const openAddAddress = () => {
    setAddressForm(emptyAddress);
    setEditingAddressId(null);
    setAddressErrors({});
    setAddressModal(true);
  };

  // Open edit address modal – pre‑fill with normalized fields
  const openEditAddress = (addr) => {
    setAddressForm(normalizeAddress(addr));
    setEditingAddressId(addr._id || addr.id);
    setAddressErrors({});
    setAddressModal(true);
  };

  // Save address (create or update)
  const saveAddress = async () => {
    if (!validateAddress()) return;

    try {
      // Build payload with backend field names
      const payload = {
        label: addressForm.label,
        fullName: form.name,
        mobile: addressForm.phone,
        addressLine: addressForm.line1,
        city: addressForm.city,
        state: addressForm.state,
        pincode: addressForm.postalCode,
        country: addressForm.country,
        isDefault: false,
      };

      let response;
      if (editingAddressId) {
        response = await api.put(`/auth/address/${editingAddressId}`, payload);
      } else {
        response = await api.post("/auth/address", payload);
      }

      // Update addresses from server response
      if (response.data?.addresses) {
        setAddresses(response.data.addresses.map(normalizeAddress));
      } else {
        // Fallback: refetch profile
        const { data } = await api.get("/auth/me");
        const profile = data?.user || data;
        setAddresses((profile.addresses || []).map(normalizeAddress));
      }

      setAddressModal(false);
      setAddressErrors({});
      setEditingAddressId(null);
      setAddressForm(emptyAddress);
    } catch (err) {
      setAddressErrors({
        submit: err.response?.data?.message || "Failed to save address",
      });
    }
  };

  // Delete address
  const deleteAddress = async (id) => {
    try {
      const { data } = await api.delete(`/auth/profile/addresses/${id}`);
      if (data?.addresses) {
        setAddresses(data.addresses.map(normalizeAddress));
      } else {
        // Remove locally
        setAddresses(addresses.filter((a) => (a._id || a.id) !== id));
      }
    } catch (err) {
      setAddresses(addresses.filter((a) => (a._id || a.id) !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-semibold text-stone-900 mb-8 tracking-tight">
          My Profile
        </h1>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm"
          >
            {success}
          </motion.div>
        )}

        {/* Personal Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-stone-900">Personal Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-900"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-700"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1 text-sm font-medium bg-stone-900 text-white px-4 py-2 rounded-full hover:bg-stone-800 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
              </div>
            )}
          </div>

          {errors.submit && <p className="text-sm text-red-500 mb-4">{errors.submit}</p>}

          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-28 h-28 rounded-full overflow-hidden bg-stone-100 ring-1 ring-stone-200 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-stone-400" />
                )}
                {editing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 inset-x-0 bg-stone-900/70 text-white text-xs py-1.5 flex items-center justify-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" /> Change
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex-1 grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                {editing ? (
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                  />
                ) : (
                  <p className="flex items-center gap-2 text-stone-900 font-medium">
                    <User className="w-4 h-4 text-stone-400" />
                    {form.name || "—"}
                  </p>
                )}
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                {editing ? (
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                  />
                ) : (
                  <p className="flex items-center gap-2 text-stone-900 font-medium">
                    <Mail className="w-4 h-4 text-stone-400" />
                    {form.email || "—"}
                  </p>
                )}
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                  Phone
                </label>
                {editing ? (
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                  />
                ) : (
                  <p className="flex items-center gap-2 text-stone-900 font-medium">
                    <Phone className="w-4 h-4 text-stone-400" />
                    {form.phone || "—"}
                  </p>
                )}
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Addresses Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-stone-900">Saved Addresses</h2>
            <button
              onClick={openAddAddress}
              className="inline-flex items-center gap-2 text-sm font-medium bg-stone-900 text-white px-4 py-2 rounded-full hover:bg-stone-800"
            >
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-stone-500 text-sm">You have no saved addresses yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id || addr.id}
                  className="border border-stone-200 rounded-2xl p-5 relative group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-stone-400" />
                    <span className="text-sm font-semibold text-stone-900">{addr.label}</span>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}
                    <br />
                    {addr.city}, {addr.state} {addr.postalCode}
                    <br />
                    {addr.country} • {addr.phone}
                  </p>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditAddress(addr)}
                      className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                    </button>
                    <button
                      onClick={() => deleteAddress(addr._id || addr.id)}
                      className="p-1.5 rounded-full bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {addressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-stone-900">
                  {editingAddressId ? "Edit Address" : "Add Address"}
                </h3>
                <button
                  onClick={() => setAddressModal(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {addressErrors.submit && (
                <p className="text-sm text-red-500 mb-3">{addressErrors.submit}</p>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Label
                  </label>
                  <input
                    value={addressForm.label}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, label: e.target.value })
                    }
                    placeholder="Home, Office..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                  />
                  {addressErrors.label && (
                    <p className="text-xs text-red-500 mt-1">{addressErrors.label}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Address Line 1
                  </label>
                  <input
                    value={addressForm.line1}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, line1: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                  />
                  {addressErrors.line1 && (
                    <p className="text-xs text-red-500 mt-1">{addressErrors.line1}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    value={addressForm.line2}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, line2: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                  />
                  {addressErrors.city && (
                    <p className="text-xs text-red-500 mt-1">{addressErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <input
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                  />
                  {addressErrors.state && (
                    <p className="text-xs text-red-500 mt-1">{addressErrors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Postal Code
                  </label>
                  <input
                    value={addressForm.postalCode}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, postalCode: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                  />
                  {addressErrors.postalCode && (
                    <p className="text-xs text-red-500 mt-1">{addressErrors.postalCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <input
                    value={addressForm.country}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, country: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Phone
                  </label>
                  <input
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                  />
                  {addressErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">{addressErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setAddressModal(false)}
                  className="flex-1 px-6 py-3 rounded-full border border-stone-300 text-stone-700 font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAddress}
                  className="flex-1 px-6 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800"
                >
                  Save Address
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;