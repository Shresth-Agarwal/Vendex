import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import CustomerShop from './components/CustomerShop';
import VendorDashboard from './components/VendorDashboard';
import ChatSystem from './components/ChatSystem';
import ReceiptGenerator from './components/ReceiptGenerator';
import './App.css';

const Navigation = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/customer" className="nav-logo">
          Vendex
        </Link>
        <div className="nav-links">
          <Link to="/customer" className="nav-link">Customer Shop</Link>
          <Link to="/vendor" className="nav-link">Vendor Dashboard</Link>
          <Link to="/chat" className="nav-link">Chat</Link>
          <Link to="/receipt" className="nav-link">Receipt Generator</Link>
          <div className="user-menu">
            <span className="user-email">{user?.email || 'User'}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/customer"
              element={
                <ProtectedRoute>
                  <CustomerShop />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor"
              element={
                <ProtectedRoute>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatSystem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receipt"
              element={
                <ProtectedRoute>
                  <ReceiptGenerator />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/customer" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
