import React from 'react';
import './Footer.css';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-logo">Vendex</h3>
          <p className="footer-description">
            Your trusted e-commerce platform for quality products and exceptional service.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Facebook" className="social-link">
              <FiFacebook />
            </a>
            <a href="#" aria-label="Twitter" className="social-link">
              <FiTwitter />
            </a>
            <a href="#" aria-label="Instagram" className="social-link">
              <FiInstagram />
            </a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/">Products</a></li>
            <li><a href="/vendor">Vendor Dashboard</a></li>
            <li><a href="#">About Us</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-title">Customer Service</h4>
          <ul className="footer-links">
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-title">Contact Info</h4>
          <ul className="footer-contact">
            <li>
              <FiMail className="contact-icon" />
              <span>support@vendex.com</span>
            </li>
            <li>
              <FiPhone className="contact-icon" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li>
              <FiMapPin className="contact-icon" />
              <span>123 Commerce St, Business City, BC 12345</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Vendex. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
