import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SellerDashboard from './pages/SellerDashboard';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ProductDetail from './pages/ProductDetail';
import { AuthProvider, useAuth } from './context/AuthContext';
import UserMessagePage from './pages/UserMessagePage';
import UserProductPage from './pages/UserProductPage';
import UserProfilePage from './pages/UserProfilePage';
import ProductListPage from './pages/ProductListPage';
import CartPage from './pages/CartPage';
import DiseaseDetection from './pages/DiseaseDetection';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import MockEsewaPayment from './pages/MockEsewaPayment';
import AdminPanel from './pages/AdminPanel';
import { SocketProvider } from './context/SocketContext';
import NotificationPage from './pages/NotificationPage';
import UserOrdersPage from './pages/UserOrdersPage';
import UserOrderDetailPage from './pages/UserOrderDetailPage';
const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && (!user || user.role !== role)) return <Navigate to="/" />;
  
  return children;
};

import { ToastProvider } from './components/Toast';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
            <Route path="/user-message" element={<UserMessagePage />} />
            <Route path="/user-product" element={<UserProductPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute role="user">
                  <HomePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <ProtectedRoute role="user">
                  <ProductListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute role="user">
                  <CartPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute role="user">
                  <PaymentPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failure" element={<PaymentFailurePage />} />
            <Route path="/mock-esewa-payment" element={<MockEsewaPayment />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute role="user">
                  <UserProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller-dashboard" 
              element={
                <ProtectedRoute role="seller">
                  <SellerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/disease-detection" 
              element={
                <ProtectedRoute role="user">
                  <DiseaseDetection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute role="admin">
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-orders" 
              element={
                <ProtectedRoute role="user">
                  <UserOrdersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order/:id" 
              element={
                <ProtectedRoute role="user">
                  <UserOrderDetailPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App
