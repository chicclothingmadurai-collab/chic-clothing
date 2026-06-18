import React, { useState } from "react";

import { Outlet, NavLink, useNavigate, Navigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import {

LayoutDashboard, Package, Users, ShoppingCart, Tag, BarChart3,

Menu, X, LogOut, ShieldCheck,

} from "lucide-react";

import { useAuth } from "../context/AuthContext";
const navItems = [

{ label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },

{ label: "Products", to: "/admin/products", icon: Package },

{ label: "Users", to: "/admin/users", icon: Users },

{ label: "Orders", to: "/admin/orders", icon: ShoppingCart },

{ label: "Coupons", to: "/admin/coupons", icon: Tag },

{ label: "Analytics", to: "/admin/analytics", icon: BarChart3 },

];
const AdminLayout = () => {

const [sidebarOpen, setSidebarOpen] = useState(false);

const { user, logout } = useAuth();

const navigate = useNavigate();
const isAdmin = user?.role === "admin" || localStorage.getItem("adminToken");
if (!isAdmin) {

return <Navigate to="/admin/login" replace />;

}
const handleLogout = () => {

localStorage.removeItem("adminToken");

logout?.();

navigate("/admin/login");

};
return (

<div className="min-h-screen bg-stone-50 flex">

<aside className="hidden lg:flex flex-col w-64 bg-stone-950 text-stone-300 fixed inset-y-0 left-0 z-30">

<div className="flex items-center gap-3 px-6 h-20 border-b border-stone-800">

<div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center">

<ShieldCheck className="w-5 h-5 text-amber-400" />

</div>

<span className="text-xl font-serif font-semibold text-white tracking-tight">CHIC Admin</span>

</div>
    <nav className="flex-1 px-4 py-6 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-amber-400 text-stone-900" : "text-stone-400 hover:bg-stone-800 hover:text-white"}`
          }
        >
          <item.icon className="w-4.5 h-4.5" />
          {item.label}
        </NavLink>
      ))}
    </nav>

    <div className="p-4 border-t border-stone-800">
      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-400 hover:bg-stone-800 hover:text-white transition-colors w-full">
        <LogOut className="w-4.5 h-4.5" />
        Sign Out
      </button>
    </div>
  </aside>

  <AnimatePresence>
    {sidebarOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
        <motion.aside
          initial={{ x: -260 }}
          animate={{ x: 0 }}
          exit={{ x: -260 }}
          transition={{ type: "tween", duration: 0.25 }}
          className="fixed inset-y-0 left-0 w-64 bg-stone-950 text-stone-300 z-50 lg:hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-6 h-20 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xl font-serif font-semibold text-white tracking-tight">CHIC Admin</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-full hover:bg-stone-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-amber-400 text-stone-900" : "text-stone-400 hover:bg-stone-800 hover:text-white"}`
                }
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-stone-800">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-400 hover:bg-stone-800 hover:text-white transition-colors w-full">
              <LogOut className="w-4.5 h-4.5" />
              Sign Out
            </button>
          </div>
        </motion.aside>
      </>
    )}
  </AnimatePresence>

  <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
    <header className="sticky top-0 z-20 bg-white border-b border-stone-100 h-16 sm:h-20 flex items-center px-4 sm:px-8 justify-between">
      <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full hover:bg-stone-100 lg:hidden">
        <Menu className="w-5 h-5 text-stone-700" />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-stone-900">{user?.name || "Admin"}</p>
          <p className="text-xs text-stone-500">{user?.email || "admin@chicclothing.com"}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm font-semibold uppercase">
          {(user?.name || "A").charAt(0)}
        </div>
      </div>
    </header>

    <main className="flex-1 p-4 sm:p-8">
      <Outlet />
    </main>
  </div>
</div>
);

};
export default AdminLayout;