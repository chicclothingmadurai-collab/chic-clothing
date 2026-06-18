import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/ui";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";
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
      await register({ name: form.name, email: form.email, password: form.password });
      navigate("/", { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
        <p className="text-gray-500 mb-6">Join us and start shopping today</p>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{apiError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="John Doe" />
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
          <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
          <Input label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="••••••••" />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;