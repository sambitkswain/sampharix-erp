import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import HomePage from "../pages/HomePage";
import AdminDashboard from "../features/admin/AdminDashboard";
import RetailerDashboard from "../features/retailer/RetailerDashboard";
import DistributorDashboard from "../features/distributor/DistributorDashboard";

import ProtectedRoute from "../features/auth/ProtectedRoute";
import RetailerOrders from "@/features/orders/RetailerOrders";

const AppRoutes = () => {

  return (

    <BrowserRouter>

      <Routes>

        {/* PUBLIC ROUTES */}

      <Route path="/" 
      element={<HomePage />} />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ADMIN ROUTE */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* RETAILER ROUTE */}

        <Route
          path="/retailer"
          element={
            <ProtectedRoute allowedRole="RETAILER">
              <RetailerDashboard />
            </ProtectedRoute>
          }
        />

        {/* DISTRIBUTOR ROUTE */}

        <Route
          path="/distributor"
          element={
            <ProtectedRoute allowedRole="DISTRIBUTOR">
              <DistributorDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/distributor/orders" element={<RetailerOrders />} />

      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;