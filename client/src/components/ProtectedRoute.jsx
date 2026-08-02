import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useApp(); // Accesses user state instantly

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
