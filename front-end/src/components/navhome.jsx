import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./navhome.css";  // Ensure the file name matches exactly, including case

export default function NavHome() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleToggle = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        {/* Brand / Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={() => setIsNavCollapsed(true)}>
          <img src="/img/pa_pak_jai-removebg.png" alt="logo" height="40" className="me-2" />
          <span>
            PaPak<span className="text-info">Jai</span>
          </span>
        </Link>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={handleToggle}
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation links */}
        <div
          className={
            "collapse navbar-collapse" + (isNavCollapsed ? '' : ' show')
          }
          id="navbarNav"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" to="/" onClick={() => setIsNavCollapsed(true)}>
                HOME
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/visainfo" onClick={() => setIsNavCollapsed(true)}>
                VISA
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={() => setIsNavCollapsed(true)}>
                ACCOMMODATION &amp; RESTAURANT
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={() => setIsNavCollapsed(true)}>
                CULTURE
              </a>
            </li>
          </ul>

          {/* Auth buttons */}
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-info" onClick={() => setIsNavCollapsed(true)}>
              Sign in
            </Link>
            <Link to="/register" className="btn btn-info " onClick={() => setIsNavCollapsed(true)}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}