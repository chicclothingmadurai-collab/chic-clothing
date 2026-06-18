import React, { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { Plus, Search, Edit2, Trash2, X, Loader2, ChevronLeft, ChevronRight, Package } from "lucide-react";

import api from "../../api/api";
const emptyProduct = {
  name: "",
  brand: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  sizes: "",
  colors: "",
  images: ""
};
const PAGE_SIZE = 8;
const ProductManagement = () => {

const [products, setProducts] = useState([]);

const [selectedImages, setSelectedImages] = useState([]);

const [loading, setLoading] = useState(true);

const [error, setError] = useState("");

const [search, setSearch] = useState("");

const [page, setPage] = useState(1);

const [totalPages, setTotalPages] = useState(1);
const [modalOpen, setModalOpen] = useState(false);

const [editingId, setEditingId] = useState(null);

const [form, setForm] = useState(emptyProduct);

const [formErrors, setFormErrors] = useState({});

const [saving, setSaving] = useState(false);
const [deleteId, setDeleteId] = useState(null);

const [deleting, setDeleting] = useState(false);
const fetchProducts = async () => {

setLoading(true);

setError("");

try {

const { data } = await api.get("/admin/products", { params: { page, limit: PAGE_SIZE, search } });

setProducts(data?.products || data || []);

setTotalPages(data?.totalPages || 1);

} catch (err) {

setError(err.response?.data?.message || "Failed to load products");

} finally {

setLoading(false);

}

};
useEffect(() => {

fetchProducts();

// eslint-disable-next-line react-hooks/exhaustive-deps

}, [page]);
useEffect(() => {

const timer = setTimeout(() => {

setPage(1);

fetchProducts();

}, 400);

return () => clearTimeout(timer);

// eslint-disable-next-line react-hooks/exhaustive-deps

}, [search]);
const validate = () => {

const errs = {};

if (!form.name.trim()) errs.name = "Product name is required";

if (!form.description.trim()) errs.description = "Description is required";

if (!form.price || Number(form.price) <= 0) errs.price = "Enter a valid price";

if (!form.category.trim()) errs.category = "Category is required";

if (form.stock === "" || Number(form.stock) < 0) errs.stock = "Enter a valid stock quantity";

setFormErrors(errs);

return Object.keys(errs).length === 0;

};
const openAdd = () => {

setForm(emptyProduct);

setEditingId(null);

setFormErrors({});

setModalOpen(true);

};
const openEdit = (product) => {

setForm({

name: product.name || "",

description: product.description || "",

price: product.price ?? "",

category: product.category || "",

stock: product.stock ?? "",

sizes: (product.sizes || []).join(", "),

colors: (product.colors || []).join(", "),

images: (product.images || []).join(", "),

});

setEditingId(product._id || product.id);

setFormErrors({});

setModalOpen(true);

};
const handleSave = async () => {
  if (!validate()) return;

  setSaving(true);

  try {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("brand", form.brand);
    formData.append("description", form.description);
    formData.append("price", Number(form.price));
    formData.append("category", form.category);
    formData.append("stock", Number(form.stock));

    // Arrays
    formData.append(
      "sizes",
      JSON.stringify(
        form.sizes.split(",").map((s) => s.trim()).filter(Boolean)
      )
    );

    formData.append(
      "colors",
      JSON.stringify(
        form.colors.split(",").map((c) => ({
          name: c.trim(),
          hex: "#000000"
        }))
      )
    );

    formData.append("tags", JSON.stringify([]));

    // Upload selected files
    selectedImages.forEach((image) => {
      formData.append("images", image);
    });

    if (editingId) {
      await api.put(`/products/${editingId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    setModalOpen(false);
    fetchProducts();
  } catch (err) {
    setFormErrors({
      submit:
        err.response?.data?.message ||
        "Failed to save product",
    });
  } finally {
    setSaving(false);
  }
};
return (

<div className="space-y-6">

<div className="flex flex-wrap items-center justify-between gap-4">

<div>

<h1 className="text-2xl font-serif font-semibold text-stone-900 tracking-tight">Product Management</h1>

<p className="text-stone-500 text-sm mt-1">Manage your store's product catalog</p>

</div>

<button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800">

<Plus className="w-4 h-4" /> Add Product

</button>

</div>
  <div className="relative max-w-sm">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search products..."
      className="w-full pl-11 pr-4 py-2.5 rounded-full border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
    />
  </div>

  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
    {loading ? (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
      </div>
    ) : error ? (
      <p className="text-center text-red-500 py-24 text-sm">{error}</p>
    ) : products.length === 0 ? (
      <div className="text-center py-24">
        <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-500 text-sm">No products found</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100">
              <th className="py-3 pl-6 pr-4">Product</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Stock</th>
              <th className="py-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id || product.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                <td className="py-3 pl-6 pr-4">
                  <div className="flex items-center gap-3">
                    <img src={
  product.images?.[0]?.url ||
  "https://via.placeholder.com/48"
} alt={product.name} className="w-11 h-11 rounded-lg object-cover border border-stone-100" />
                    <span className="font-medium text-stone-900 line-clamp-1 max-w-xs">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-stone-600 capitalize">{product.category}</td>
                <td className="py-3 pr-4 font-medium text-stone-900">₹{Number(product.price).toLocaleString()}</td>
                <td className="py-3 pr-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? "bg-emerald-50 text-emerald-600" : product.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"}`}>
                    {product.stock} in stock
                  </span>
                </td>
                <td className="py-3 pr-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(product)} className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200">
                      <Edit2 className="w-4 h-4 text-stone-600" />
                    </button>
                    <button onClick={() => setDeleteId(product._id || product.id)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>

  {!loading && !error && products.length > 0 && totalPages > 1 && (
    <div className="flex items-center justify-center gap-3">
      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-white">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm text-stone-600">Page {page} of {totalPages}</span>
      <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-white">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )}

  <AnimatePresence>
    {modalOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-stone-900">{editingId ? "Edit Product" : "Add Product"}</h3>
            <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-full hover:bg-stone-100">
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          {formErrors.submit && <p className="text-sm text-red-500 mb-3">{formErrors.submit}</p>}

          <div className="space-y-4">
            <div>
  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
    Product Name
  </label>

  <input
    value={form.name}
    onChange={(e) => setForm({ ...form, name: e.target.value })}
    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
  />

  {formErrors.name && (
    <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
  )}
</div>

{/* BRAND FIELD */}
<div>
  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
    Brand
  </label>

  <input
    value={form.brand || ""}
    onChange={(e) => setForm({ ...form, brand: e.target.value })}
    placeholder="Nike"
    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
  />
</div>

<div>
  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
    Description
  </label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm resize-none" />
              {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm" />
                {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm" />
                {formErrors.stock && <p className="text-xs text-red-500 mt-1">{formErrors.stock}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Category</label>
               <select
  value={form.category}
  onChange={(e) =>
    setForm({ ...form, category: e.target.value })
  }
  className="w-full px-4 py-2.5 rounded-xl border border-stone-200"
>
  <option value="">Select Category</option>
  <option value="Oversized">Oversized</option>
  <option value="Polo">Polo</option>
  <option value="Round Neck">Round Neck</option>
  <option value="Printed">Printed</option>
  <option value="Plain">Plain</option>
  <option value="Sports">Sports</option>
  <option value="Casual">Casual</option>
  <option value="Premium Cotton">Premium Cotton</option>
</select>
                {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Sizes (comma separated)</label>
              <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Colors (comma separated)</label>
              <input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Black, White, Beige" className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Image URLs (comma separated)</label>
              <input
  type="file"
  multiple
  accept="image/*"
  onChange={(e) => setSelectedImages(Array.from(e.target.files))}
  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
/>

{selectedImages.length > 0 && (
  <p className="text-sm text-green-600 mt-2">
    {selectedImages.length} image(s) selected
  </p>
)}
</div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setModalOpen(false)} className="flex-1 px-6 py-3 rounded-full border border-stone-300 text-stone-700 font-medium hover:bg-stone-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "Update Product" : "Add Product"}
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
          <h3 className="text-lg font-semibold text-stone-900 mb-2">Delete Product?</h3>
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
export default ProductManagement;