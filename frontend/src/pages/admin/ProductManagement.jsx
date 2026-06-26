import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
  Sparkles,
} from "lucide-react";
import api from "../../api/api";

// -------- Global style to hide spinners --------
const style = `
  input[type="number"].no-spinner::-webkit-outer-spin-button,
  input[type="number"].no-spinner::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"].no-spinner {
    -moz-appearance: textfield;
  }
`;

// -------- Empty Product Template --------
const emptyProduct = {
  name: "",
  brand: "",
  description: "",
  price: "",
  discount: "",
  category: "",
  stock: "",
  sizes: [],
  colors: [],
  images: "",
  tags: [],
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
};

const PAGE_SIZE = 8;

const BRANDS = [
  "Nike",
  "Adidas",
  "Puma",
  "US Polo Assn.",
  "Louis Philippe",
  "Levis",
  "Allen Solly",
  "Wildcraft",
];

const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "5XL",
];

const COLORS = [
  "Black",
  "White",
  "Grey",
  "Navy Blue",
  "Sky Blue",
  "Royal Blue",
  "Red",
  "Maroon",
  "Green",
  "Olive",
  "Yellow",
  "Orange",
  "Brown",
  "Beige",
  "Purple",
];

// -------- Main Component --------
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [customColor, setCustomColor] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // -------- API Calls --------
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/products", {
        params: { page, limit: PAGE_SIZE, search },
      });
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

  // -------- Form Helpers --------
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
    setSelectedImages([]);
    setPreviewImages([]);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      description: product.description || "",
      price: product.price || "",
      discount: product.discount || 0,
      category: product.category || "",
      stock: product.stock ?? "",
      sizes: product.sizes || [],
      colors: (product.colors || []).map(c => c.name),
      images: (product.images || []).join(", "),
      tags: product.tags || [],
      isFeatured: product.isFeatured || false,
      isNewArrival: product.isNewArrival || false,
      isBestSeller: product.isBestSeller || false,
    });
    setEditingId(product._id || product.id);
    setSelectedImages([]);
    setPreviewImages([]);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }
    setSelectedImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
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
      formData.append("discount", Number(form.discount || 0));
      formData.append("category", form.category);
      formData.append("stock", Number(form.stock));
      formData.append("sizes", JSON.stringify(form.sizes));
      formData.append(
        "colors",
        JSON.stringify(
          form.colors.map((c) => ({
            name: c.trim(),
            hex: "#000000",
          }))
        )
      );
      formData.append("tags", JSON.stringify(form.tags || []));
      formData.append("isFeatured", form.isFeatured ? "true" : "false");
      formData.append("isNewArrival", form.isNewArrival ? "true" : "false");
      formData.append("isBestSeller", form.isBestSeller ? "true" : "false");

      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // -------- Clear form after successful save --------
      setForm(emptyProduct);
      setSelectedImages([]);
      setPreviewImages([]);
      setEditingId(null);
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormErrors({
        submit: err.response?.data?.message || "Failed to save product",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteId}`);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  // -------- Render Helpers --------
  const renderSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl">
          <div className="w-12 h-12 bg-stone-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-stone-200 rounded w-3/4" />
            <div className="h-3 bg-stone-200 rounded w-1/2" />
          </div>
          <div className="w-16 h-6 bg-stone-200 rounded-full" />
        </div>
      ))}
    </div>
  );

  // -------- JSX --------
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50/40 font-sans">
      {/* Inject the style to hide number spinners */}
      <style>{style}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
              Product Collection
            </h1>
            <p className="text-stone-500 text-sm mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Curate your luxury catalog
            </p>
          </div>
          <button
            onClick={openAdd}
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A1A1A] text-white text-sm font-medium overflow-hidden transition-all hover:shadow-lg hover:shadow-amber-400/20"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-amber-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Plus className="w-4 h-4 text-amber-400" />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-stone-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all"
          />
        </div>

        {/* Product Grid */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-stone-100/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">{renderSkeleton()}</div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-6 py-2 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 text-sm">No products in your collection</p>
              <button
                onClick={openAdd}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium hover:bg-stone-800"
              >
                <Plus className="w-4 h-4" />
                Add your first product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100">
                    <th className="py-4 pl-6 pr-4 font-medium">Product</th>
                    <th className="py-4 pr-4 font-medium">Category</th>
                    <th className="py-4 pr-4 font-medium">Price</th>
                    <th className="py-4 pr-4 font-medium">Stock</th>
                    <th className="py-4 pr-6 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => {
                    const id = product._id || product.id;
                    return (
                      <motion.tr
                        key={id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="border-b border-stone-50 last:border-0 hover:bg-stone-50/60 transition-colors group"
                      >
                        <td className="py-3 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg overflow-hidden border border-stone-100 flex-shrink-0">
                              <img
                                src={
                                  product.images?.[0]?.url ||
                                  "https://via.placeholder.com/48?text= "
                                }
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium text-stone-900 line-clamp-1 max-w-xs">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-stone-600 capitalize">
                          {product.category}
                        </td>
                        <td className="py-3 pr-4 font-medium text-stone-900">
                          ₹{Number(product.price).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              product.stock > 10
                                ? "bg-emerald-50 text-emerald-600"
                                : product.stock > 0
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-500"
                            }`}
                          >
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="py-3 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-2 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(id)}
                              className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && products.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-stone-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* -------- Add/Edit Modal -------- */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl font-semibold text-stone-900">
                  {editingId ? "Edit Product" : "New Product"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 transition"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {formErrors.submit && (
                <p className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-xl">
                  {formErrors.submit}
                </p>
              )}

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Product Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Brand */}
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      brand: e.target.value,
                    })
                  }
                  placeholder="Enter Brand Name"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition resize-none"
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Price, Discount, Stock, Category */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || Number(val) >= 0) {
                          setForm({ ...form, price: val });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") e.preventDefault();
                      }}
                      className="no-spinner w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition"
                    />
                    {formErrors.price && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={form.discount || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val) && Number(val || 0) <= 100) {
                          setForm({ ...form, discount: val });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") e.preventDefault();
                      }}
                      className="no-spinner w-full px-4 py-3 rounded-2xl border-2 border-stone-200 bg-stone-50 text-stone-900 font-semibold text-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || Number(val) >= 0) {
                          setForm({ ...form, stock: val });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") e.preventDefault();
                      }}
                      className="no-spinner w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition"
                    />
                    {formErrors.stock && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.stock}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition"
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
                    {formErrors.category && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>
                    )}
                  </div>
                </div>

                {/* Sizes & Colors */}
                <div>
                  <label className="block text-xs font-medium mb-3">Sizes</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZES.map((size) => (
                      <label key={size} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.sizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                sizes: [...form.sizes, size],
                              });
                            } else {
                              setForm({
                                ...form,
                                sizes: form.sizes.filter(
                                  (s) => s !== size
                                ),
                              });
                            }
                          }}
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-3">Colors</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {COLORS.map((color) => (
                      <label key={color} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.colors.includes(color)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                colors: [...form.colors, color],
                              });
                            } else {
                              setForm({
                                ...form,
                                colors: form.colors.filter(
                                  (c) => c !== color
                                ),
                              });
                            }
                          }}
                        />
                        {color}
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="Add custom color"
                      className="flex-1 px-4 py-2 rounded-xl border border-stone-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          customColor.trim() &&
                          !form.colors.includes(customColor.trim())
                        ) {
                          setForm({
                            ...form,
                            colors: [
                              ...form.colors,
                              customColor.trim(),
                            ],
                          });
                          setCustomColor("");
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-black text-white"
                    >
                      Add
                    </button>
                  </div>

                  {form.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {form.colors.map((color) => (
                        <span
                          key={color}
                          className="px-3 py-1 rounded-full bg-stone-100 text-sm"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* -------- UPDATED IMAGE UPLOAD SECTION -------- */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Product Images (Max 10)
                  </label>

                  {/* Drag & Drop / Click to Upload */}
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-stone-300 rounded-2xl cursor-pointer hover:border-amber-500 transition">
                    <div className="text-center">
                      <p className="font-semibold text-stone-700">
                        Click to Upload Images
                      </p>
                      <p className="text-sm text-stone-500">
                        Maximum 10 images
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        {selectedImages.length > 0
                          ? `${selectedImages.length} selected`
                          : "No images selected"}
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  {/* Image Preview Grid */}
                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 mt-4">
                      {previewImages.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`preview ${index}`}
                          className="w-full h-24 object-cover rounded-xl border border-stone-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-full border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1A1A1A] text-white font-medium hover:bg-stone-800 transition disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------- Delete Confirmation -------- */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl border border-stone-100"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 mx-auto flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Delete Product?
              </h3>
              <p className="text-sm text-stone-500 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition disabled:opacity-60"
                >
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