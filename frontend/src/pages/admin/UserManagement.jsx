import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users as UsersIcon,
  ShieldOff,
  ShieldCheck,
  Eye,
  UserX,
  UserCheck,
} from "lucide-react";
import api from "../../api/api";

const PAGE_SIZE = 8;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionId, setActionId] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/users", {
        params: { page, limit: PAGE_SIZE, search },
      });
      setUsers(data?.users || data || []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleBlock = async () => {
    if (!confirmUser) return;
    const id = confirmUser._id || confirmUser.id;
    setActionId(id);
    try {
      const endpoint = confirmUser.isBlocked
        ? `/admin/users/${id}/unblock`
        : `/admin/users/${id}/block`;
      await api.put(endpoint);
      setUsers((prev) =>
        prev.map((u) =>
          (u._id || u.id) === id ? { ...u, isBlocked: !u.isBlocked } : u
        )
      );
      setConfirmUser(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status");
    } finally {
      setActionId(null);
    }
  };

  // Statistics calculations
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.isBlocked).length;
  const blockedUsers = users.filter((u) => u.isBlocked).length;

  return (
    <div className="space-y-6">
      {/* Centered Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="text-center space-y-3"
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl md:text-4xl font-display font-bold tracking-tight text-stone-900"
        >
          User Management
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-stone-500 text-sm max-w-md mx-auto"
        >
          Manage registered customers
        </motion.p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm"
        >
          <p className="text-stone-500 text-sm">Total Users</p>
          <h2 className="text-3xl font-bold mt-1">{totalUsers}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm"
        >
          <p className="text-stone-500 text-sm">Active Users</p>
          <h2 className="text-3xl font-bold text-emerald-600 mt-1">
            {activeUsers}
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm"
        >
          <p className="text-stone-500 text-sm">Blocked Users</p>
          <h2 className="text-3xl font-bold text-red-500 mt-1">
            {blockedUsers}
          </h2>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-11 pr-4 py-2.5 rounded-full border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-24 text-sm">{error}</p>
        ) : users.length === 0 ? (
          <div className="text-center py-24">
            <UsersIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100">
                  <th className="py-3 pl-6 pr-4">User</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">User ID</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Joined</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const id = user._id || user.id;
                  return (
                    <tr
                      key={id}
                      className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors"
                    >
                      {/* User Avatar + Name */}
                      <td className="py-3 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xs font-semibold text-stone-600 uppercase">
                              {(user.name || "U").charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-stone-900">
                            {user.name || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 pr-4 text-stone-600">{user.email}</td>

                      {/* User ID (last 8 chars) */}
                      <td className="py-3 pr-4 text-xs text-stone-500 font-mono">
                        {(user._id || user.id).slice(-8)}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 pr-4">
                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                          {user.role || "Customer"}
                        </span>
                      </td>

                      {/* Joined Date with Time */}
                      <td className="py-3 pr-4 text-stone-500 text-xs">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleString("en-IN")
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="py-3 pr-4">
                        {user.role === "admin" ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-500">
                            Protected
                          </span>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isBlocked
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Button */}
                          <button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Block/Unblock Button (only if not admin) */}
                          {user.role !== "admin" && (
                            <button
                              onClick={() => setConfirmUser(user)}
                              disabled={actionId === id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                user.isBlocked
                                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  : "bg-red-50 text-red-500 hover:bg-red-100"
                              } disabled:opacity-50`}
                            >
                              {user.isBlocked ? (
                                <UserCheck className="w-3.5 h-3.5" />
                              ) : (
                                <UserX className="w-3.5 h-3.5" />
                              )}
                              {user.isBlocked ? "Unblock" : "Block"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && users.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-stone-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-full border border-stone-200 disabled:opacity-40 hover:bg-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 text-center"
            >
              {confirmUser.isBlocked ? (
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
              ) : (
                <ShieldOff className="w-10 h-10 text-red-500 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                {confirmUser.isBlocked ? "Unblock User?" : "Block User?"}
              </h3>
              <p className="text-sm text-stone-500 mb-6">
                {confirmUser.isBlocked
                  ? `${confirmUser.name || "This user"} will regain access to their account.`
                  : `${confirmUser.name || "This user"} will be restricted from accessing their account.`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmUser(null)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-stone-300 text-stone-700 font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  onClick={toggleBlock}
                  disabled={actionId !== null}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-medium disabled:opacity-60 ${
                    confirmUser.isBlocked
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {actionId !== null && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;