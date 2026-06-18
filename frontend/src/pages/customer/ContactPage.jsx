import React, { useState } from "react";

import { motion } from "framer-motion";

import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Loader2
} from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaTwitter
} from "react-icons/fa";

import api from "../../api/api";
const ContactPage = () => {

const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

const [errors, setErrors] = useState({});

const [loading, setLoading] = useState(false);

const [success, setSuccess] = useState(false);

const [error, setError] = useState("");
const validate = () => {

const errs = {};

if (!form.name.trim()) errs.name = "Name is required";

if (!form.email.trim()) errs.email = "Email is required";

else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";

if (!form.subject.trim()) errs.subject = "Subject is required";

if (!form.message.trim()) errs.message = "Message is required";

else if (form.message.trim().length < 10) errs.message = "Message must be at least 10 characters";

setErrors(errs);

return Object.keys(errs).length === 0;

};
const handleSubmit = async (e) => {

e.preventDefault();

if (!validate()) return;

setLoading(true);

setError("");

try {

await api.post("/contact", form);

setSuccess(true);

setForm({ name: "", email: "", subject: "", message: "" });

} catch (err) {

setError(err.response?.data?.message || "Failed to send your message. Please try again.");

} finally {

setLoading(false);

}

};
return (

<div className="min-h-screen bg-stone-50">

<div className="bg-stone-900 text-white py-16 px-4 text-center">

<motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-serif font-semibold tracking-tight mb-3">

Get in Touch

</motion.h1>

<motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-stone-300 max-w-xl mx-auto">

We'd love to hear from you. Reach out for orders, collaborations, or just to say hello.

</motion.p>

</div>
  <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-3 gap-10">
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">
      <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-stone-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Our Studio</p>
            <p className="text-sm text-stone-500 mt-1">Theekkathir,<br />Madurai, Tamil Nadu 625018</p>
          </div>
        </div>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-stone-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Phone</p>
            <p className="text-sm text-stone-500 mt-1">86104 85163</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-stone-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Email</p>
            <p className="text-sm text-stone-500 mt-1">chicclothingmadurai@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
        <p className="text-sm font-semibold text-stone-900 mb-4">Follow Us</p>
        <div className="flex gap-3">
          <a href="https://www.instagram.com/chic_clothingg_?igsh=MWNoY2pwbWIwY3U1MQ==" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-900 hover:text-white text-stone-700 transition-colors">
            <FaInstagram className="w-5 h-5" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-900 hover:text-white text-stone-700 transition-colors">
            <FaFacebookF className="w-5 h-5" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-900 hover:text-white text-stone-700 transition-colors">
            <FaTwitter className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden border border-stone-100 shadow-sm h-56">
        <iframe
          title="map"
          src="https://www.google.com/maps?q=Theekkathir,Madurai,Tamil+Nadu&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </motion.div>

    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-3xl border border-stone-100 p-6 sm:p-10 shadow-sm">
      {success ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-stone-900 mb-2">Message Sent</h3>
          <p className="text-stone-500 mb-6">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
          <button onClick={() => setSuccess(false)} className="px-6 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800">
            Send Another Message
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-2xl font-serif font-semibold text-stone-900 mb-2">Send us a message</h2>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Your Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                placeholder="Jane Doe"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
                placeholder="jane@example.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Subject</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
              placeholder="Order inquiry, partnership, feedback..."
            />
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm resize-none"
              placeholder="Tell us how we can help..."
            />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Message
          </button>
        </form>
      )}
    </motion.div>
  </div>
</div>
);

};
export default ContactPage;