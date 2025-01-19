import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h2>CaloriScan</h2>
        <p>Your go-to app for tracking calories and staying healthy.</p>
        <div className="footer-links">
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 CaloriScan. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;