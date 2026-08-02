import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import Home from "./pages/Home.jsx";
import Classes from "./pages/Classes.jsx";
import Studios from "./pages/Studios.jsx";
import Pricing from "./pages/Pricing.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

// Import your custom security wrapper
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<MainLayout />}>
          
          {/* --- PUBLIC SECTOR ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- ANY AUTHENTICATED USER (Athlete, Trainer, Admin) --- */}
          <Route element={<ProtectedRoute allowedRoles={["user", "trainer", "admin"]} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/studios" element={<Studios />} />
          </Route>

          {/* --- STAFF COMMAND LAYER ONLY (Trainer & Admin) --- */}
          <Route element={<ProtectedRoute allowedRoles={["trainer", "admin"]} />}>
            <Route path="/classes" element={<Classes />} />
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
    </AppProvider>
  );
}
