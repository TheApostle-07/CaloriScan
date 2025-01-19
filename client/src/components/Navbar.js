import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Navbar.css"; // Import CSS for Navbar styling
import { FaBars, FaTimes, FaHome, FaInfoCircle, FaEnvelope } from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>CaloriScan</h1>
        <button className="hamburger" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "inactive")}
          onClick={() => setMenuOpen(false)}
        >
          <FaHome /> Home
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active" : "inactive")}
          onClick={() => setMenuOpen(false)}
        >
          <FaInfoCircle /> About
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? "active" : "inactive")}
          onClick={() => setMenuOpen(false)}
        >
          <FaEnvelope /> Contact
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;