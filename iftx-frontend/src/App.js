import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.js";
import Home from "./pages/Home.js";
import Login from "./pages/Login.js";
import Signup from "./pages/Signup.js";
import Dashboard from "./pages/Dashboard.js";
import ProductDetail from "./pages/ProductDetail.js";
import Checkout from "./pages/Checkout.js";
import OrderConfirmation from "./pages/OrderConfirmation.js";
import AdminLogin from "./pages/AdminLogin.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page without Navbar/Footer */}
        <Route path="/landing" element={<Landing />} />

        {/* Dashboard page without Navbar/Footer (full-screen dashboard) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Product Detail page without Navbar/Footer */}
        <Route path="/product/:id" element={<ProductDetail />} />
        
        {/* Checkout page without Navbar/Footer */}
        <Route path="/checkout" element={<Checkout />} />
        
        {/* Order Confirmation page without Navbar/Footer */}
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        
        {/* Admin pages without Navbar/Footer */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* All other pages with Navbar/Footer */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
