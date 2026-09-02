import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import Home from "./pages/Home.jsx";
import Classes from "./pages/Classes.jsx";
import Studios from "./pages/Studios.jsx";
import Pricing from "./pages/Pricing.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Register from "./pages/Register.jsx";

// Import your custom security wrapper
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
      <Routes>
        <Route element={<MainLayout />}>
          
          {/* --- PUBLIC SECTOR ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/studios" element={<Studios />} />
          <Route path="/classes" element={<Classes />} />

          {/* --- ANY AUTHENTICATED USER (Client, Trainer, Admin) --- */}
          <Route element={<ProtectedRoute allowedRoles={["client", "trainer", "admin"]} />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* --- ADMIN COMMAND LAYER ONLY --- */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
            <Route path="/trainer-dashboard" element={<AdminDashboard trainerMode />} />
          </Route>

          {/* --- EXCLUSIVE ADMIN SECURITY ROOT NODE (Optional Placeholder) --- */}
          {/* 
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-control" element={<AdminControl />} />
          </Route> 
          */}

          {/* --- CATCH ALL UNMAPPED URL CRASHES --- */}
          <Route path="*" element={<NotFound />} />
          
        </Route>
      </Routes>
  );
}
