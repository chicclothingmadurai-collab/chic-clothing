import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("API_URL =", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chic_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chic_token');
      localStorage.removeItem('chic_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  addAddress: (data) => api.post('/auth/address', data),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`)
};

// ─── Products ───
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getRelated: (id) => api.get(`/products/${id}/related`),
  getSuggestions: (q) => api.get('/products/search/suggestions', { params: { q } }),
  create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`)
};

// ─── Cart ───
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  updateItem: (itemId, data) => api.put(`/cart/item/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/item/${itemId}`),
  clear: () => api.delete('/cart/clear')
};

// ─── Wishlist ───
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (productId) => api.post('/wishlist/toggle', { productId })
};

// ─── Orders ───
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`)
};

// ─── Reviews ───
export const reviewAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  add: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`)
};

// ─── Coupons ───
export const couponAPI = {
  apply: (data) => api.post('/coupons/apply', data),
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`)
};

// ─── Admin ───
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleBlock: (id) => api.put(`/admin/users/${id}/toggle-block`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data)
};

// ─── Users ───
export const userAPI = {
  addRecentlyViewed: (productId) => api.post(`/users/recently-viewed/${productId}`),
  getRecentlyViewed: () => api.get('/users/recently-viewed')
};

// ─── Payments ───
export const paymentAPI = {
  confirm: (data) => api.post('/payments/confirm', data)
};

// ─── Notifications ───
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all')
};

export default api;
