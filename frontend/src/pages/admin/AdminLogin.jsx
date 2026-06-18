import React, { useState } from "react";

import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

import api from "../../api/api";

import { useAuth } from "../../context/AuthContext";
const AdminLogin = () => {

const navigate = useNavigate();

const { adminLogin } = useAuth();

const [form, setForm] = useState({ email: "", password: "" });

const [errors, setErrors] = useState({});

const [showPassword, setShowPassword] = useState(false);

const [loading, setLoading] = useState(false);

const [apiError, setApiError] = useState("");
const validate = () => {

const errs = {};

if (!form.email.trim()) errs.email = "Email is required";

else if (!/^\S+@\S+.\S+$/.test(form.email)) errs.email = "Enter a valid email";

if (!form.password) errs.password = "Password is required";

else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";

setErrors(errs);

return Object.keys(errs).length === 0;

};
const handleSubmit = async (e) => {

e.preventDefault();

if (!validate()) return;

setLoading(true);

setApiError("");

try {

const { data } = await api.post("/auth/admin/login", form);

console.log("LOGIN RESPONSE:", data);

const adminUser = data.user;
const token = data.token;

localStorage.setItem("chic_token", token);
localStorage.setItem("chic_user", JSON.stringify(adminUser));

navigate("/admin/dashboard", { replace: true });

window.location.reload();
} catch (err) {
  setApiError(err.response?.data?.message || "Invalid email or password");
} finally {
  setLoading(false);
}
};
return (

<div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">

<motion.div

initial={{ opacity: 0, y: 20 }}

animate={{ opacity: 1, y: 0 }}

transition={{ duration: 0.5 }}

className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-10 shadow-2xl"

>

<div className="flex flex-col items-center mb-8">

<div className="w-14 h-14 rounded-2xl bg-amber-400/10 flex items-center justify-center mb-4">

<ShieldCheck className="w-7 h-7 text-amber-400" />

</div>

<h1 className="text-2xl font-serif font-semibold text-white tracking-tight">CHIC Admin</h1>

<p className="text-stone-400 text-sm mt-1">Sign in to manage your store</p>

</div>
    {apiError && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3">
        {apiError}
      </motion.div>
    )}

    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-stone-400 uppercase tracking-wider mb-1.5">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm"
            placeholder="admin@chicclothing.com"
          />
        </div>
        {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-400 uppercase tracking-wider mb-1.5">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full pl-11 pr-11 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm"
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 text-stone-900 font-semibold hover:bg-amber-300 transition-colors disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Sign In
      </button>
    </form>

    <p className="text-center text-stone-500 text-xs mt-8">Restricted access. Authorized personnel only.</p>
  </motion.div>
</div>
);

};
export default AdminLogin;