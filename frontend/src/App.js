import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CustomerShop from './components/CustomerShop';
import VendorDashboard from './components/VendorDashboard';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              Vendex
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Customer Shop</Link>
              <Link to="/vendor" className="nav-link">Vendor Dashboard</Link>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<CustomerShop />} />
          <Route path="/vendor" element={<VendorDashboard />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
