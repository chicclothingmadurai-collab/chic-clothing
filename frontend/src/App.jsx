import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { WishlistProvider } from "./context/WishlistContext";
import LoadingSpinner from "./components/LoadingSpinner";
import ScrollToTop from "./components/ScrollToTop";


const HomePage = lazy(() => import('./pages/customer/HomePage'));
const LoginPage = lazy(() => import('./pages/customer/LoginPage'));
const RegisterPage = lazy(() => import('./pages/customer/RegisterPage'));
const ProductsPage = lazy(() => import('./pages/customer/ProductsPage'));
const ProductDetailsPage = lazy(() => import("./pages/customer/ProductDetailsPage"));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const WishlistPage = lazy(() => import('./pages/customer/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const PaymentPage = lazy(() => import('./pages/customer/PaymentPage'));
const OrderSuccessPage = lazy(() => import('./pages/customer/OrderSuccessPage'));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const MyOrdersPage = lazy(() => import('./pages/customer/MyOrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/customer/OrderDetailPage'));
const ContactPage = lazy(() => import('./pages/customer/ContactPage'));

// Admin pages (lazy loaded)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/ProductManagement'));
const AdminUsers = lazy(() => import('./pages/admin/UserManagement'));
const AdminOrders = lazy(() => import('./pages/admin/OrderManagement'));
const AdminCoupons = lazy(() => import('./pages/admin/CouponManagement'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));


// Route guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin/dashboard' : '/'} replace />;
  return children;
};

// Layout for customer pages
const CustomerLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Layout for admin pages
const AdminLayout = ({ children }) => children;

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
        <Route path="/products" element={<CustomerLayout><ProductsPage /></CustomerLayout>} />
        <Route path="/products/:id" element={<CustomerLayout><ProductDetailsPage /></CustomerLayout>} />
        <Route path="/contact" element={<CustomerLayout><ContactPage /></CustomerLayout>} />
        
        <Route path="/login" element={<PublicOnlyRoute><CustomerLayout><LoginPage /></CustomerLayout></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><CustomerLayout><RegisterPage /></CustomerLayout></PublicOnlyRoute>} />
        
        <Route path="/cart" element={<ProtectedRoute><CustomerLayout><CartPage /></CustomerLayout></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><CustomerLayout><WishlistPage /></CustomerLayout></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CustomerLayout><CheckoutPage /></CustomerLayout></ProtectedRoute>} />
        <Route
  path="/payment"
  element={
    <ProtectedRoute>
      <CustomerLayout>
        <PaymentPage />
      </CustomerLayout>
    </ProtectedRoute>
  }
/>
        <Route path="/order-success/:orderId" element={<ProtectedRoute><CustomerLayout><OrderSuccessPage /></CustomerLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><CustomerLayout><ProfilePage /></CustomerLayout></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><CustomerLayout><MyOrdersPage /></CustomerLayout></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><CustomerLayout><OrderDetailPage /></CustomerLayout></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<PublicOnlyRoute><AdminLoginPage /></PublicOnlyRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
        <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><AdminCoupons /></AdminLayout></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AdminLayout><AdminAnalytics /></AdminLayout></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#000000',
                  color: '#fff',
                  borderRadius: '0',
                  border: '1px solid #D4AF37',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '14px'
                },
                success: { iconTheme: { primary: '#D4AF37', secondary: '#fff' } },
                error: { iconTheme: { primary: '#E02424', secondary: '#fff' } }
              }}
            />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
