import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/ui";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setApiError("");
    try {
      await login(form);
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h1>
        <p className="text-gray-500 mb-6">Sign in to continue shopping</p>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{apiError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;