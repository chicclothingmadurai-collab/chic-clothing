import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Loader2, Tag, Calendar } from "lucide-react";
import api from "../../api/api";

const emptyCoupon = { code: "", description: "", discountType: "percentage", discountValue: "", minOrderValue: "", expiryDate: "", isActive: true };

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCoupon);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/coupons");
      setCoupons(data?.coupons || data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const isExpired = (date) => date && new Date(date) < new Date();

  const validate = () => {
    const errs = {};
    if (!form.code.trim()) errs.code = "Coupon code is required";
    if (!form.discountValue || Number(form.discountValue) <= 0) errs.discountValue = "Enter a valid discount value";
    if (form.discountType === "percentage" && Number(form.discountValue) > 100) errs.discountValue = "Percentage cannot exceed 100";
    if (!form.expiryDate) errs.expiryDate = "Expiry date is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAdd = () => {
    setForm(emptyCoupon);
    setEditingId(null);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue ?? "",
      minOrderValue: coupon.minOrderValue ?? "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : "",
      isActive: coupon.isActive ?? true,
    });
    setEditingId(coupon._id || coupon.id);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
      };

      if (editingId) {
        await api.put(`/admin/coupons/${editingId}`, payload);
      } else {
        await api.post("/admin/coupons", payload);
      }

      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.message || "Failed to save coupon" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/coupons/${deleteId}`);
      setDeleteId(null);
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete coupon");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-stone-900 tracking-tight">Coupon Management</h1>
          <p className="text-stone-500 text-sm mt-1">Create and manage discount coupons</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-center text-red-500 py-24 text-sm">{error}</p>
      ) : coupons.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-stone-100">
          <Tag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 text-sm">No coupons created yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((coupon, idx) => {
            const expired = isExpired(coupon.expiryDate);
            return (
              <motion.div
                key={coupon._id || coupon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-stone-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 tracking-wide">{coupon.code}</p>
                      <p className="text-xs text-stone-500">{coupon.description || "No description"}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${expired ? "bg-red-50 text-red-500" : coupon.isActive ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-500"}`}>
                    {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3 pt-3 border-t border-stone-100">
                  <p className="text-2xl font-semibold text-stone-900">
                    {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    <span className="text-xs font-normal text-stone-400 ml-1">off</span>
                  </p>
                  {coupon.minOrderValue > 0 && <p className="text-xs text-stone-500">Min order ₹{coupon.minOrderValue}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Calendar className="w-3.5 h-3.5" />
                    Expires {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString("en-IN") : "—"}
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(coupon)} className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200">
                      <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                    </button>
                    <button onClick={() => setDeleteId(coupon._id || coupon.id)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-stone-900">{editingId ? "Edit Coupon" : "Create Coupon"}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-full hover:bg-stone-100">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {formErrors.submit && <p className="text-sm text-red-500 mb-3">{formErrors.submit}</p>}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Coupon Code</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER25" className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm uppercase" />
                  {formErrors.code && <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Description</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Summer sale discount" className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Discount Type</label>
                    <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Discount Value</label>
                    <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm" />
                    {formErrors.discountValue && <p className="text-xs text-red-500 mt-1">{formErrors.discountValue}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Min Order Value (₹)</label>
                    <input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
                    <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm" />
                    {formErrors.expiryDate && <p className="text-xs text-red-500 mt-1">{formErrors.expiryDate}</p>}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-300" />
                  <span className="text-sm text-stone-700">Active</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setModalOpen(false)} className="flex-1 px-6 py-3 rounded-full border border-stone-300 text-stone-700 font-medium hover:bg-stone-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-sm p-6 text-center">
              <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Delete Coupon?</h3>
              <p className="text-sm text-stone-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-full border border-stone-300 text-stone-700 font-medium hover:bg-stone-50">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-60">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponManagement;