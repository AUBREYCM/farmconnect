import FarmerPublicProfile from "../pages/FarmerPublicProfile";
import Profile from "../pages/Profile";
import AdminDashboard from "../pages/AdminDashboard";
import BuyerDashboard from "../pages/BuyerDashboard";
import FarmerDashboard from "../pages/FarmerDashboard";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import Register from "../pages/Register";

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F8F4EE" }}
      >
        <div className="text-center">
          <svg
            className="animate-spin mx-auto mb-4"
            width="32"
            height="32"
            viewBox="0 0 28 28"
            fill="none"
          >
            <circle cx="14" cy="14" r="14" fill="#1B4332" />
            <path
              d="M8 20 C8 20 10 12 14 10 C18 8 20 14 20 14"
              stroke="#D8F3DC"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <p style={{ color: "#1B4332", fontWeight: 500 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user, token } = useAuth();

  return (
    <Routes>
      {/* Public routes (Guests can browse freely) */}
      <Route path="/" element={<BuyerDashboard />} />
      <Route path="/marketplace" element={<BuyerDashboard />} />
      <Route path="/farmer/:id" element={<FarmerPublicProfile />} />

      <Route
        path="/login"
        element={
          token && user ? (
            <Navigate
              to={user.role === "farmer" ? "/dashboard/farmer" : "/"}
              replace
            />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          token && user ? (
            <Navigate
              to={user.role === "farmer" ? "/dashboard/farmer" : "/"}
              replace
            />
          ) : (
            <Register />
          )
        }
      />

      {/* Protected routes (Requires login) */}
      <Route
        path="/dashboard/farmer"
        element={
          <ProtectedRoute allowedRoles={["farmer"]}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard/buyer" element={<Navigate to="/" replace />} />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["farmer", "buyer", "admin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Default fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
