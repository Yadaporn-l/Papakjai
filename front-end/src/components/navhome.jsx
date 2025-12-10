import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import logo from '/public/pa_pak_jai-removebg.png'

export default function NavHome() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const { user, logOut } = useUserAuth();
  const navigate = useNavigate();

  const handleToggle = () => setIsNavCollapsed(!isNavCollapsed);
  const closeNav = () => setIsNavCollapsed(true);

  const handleLogout = async () => {
    try {
      await logOut();
      closeNav();
      navigate('/');
      console.log("You are logged out");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center" to='/' onClick={closeNav}>
          {/* <img src="/pa_pak_jai-removebg.png" alt="logo" height="40" className="me-2" /> */}
          <img src={logo} alt="logo" height="40" className="me-2" />
          <span className="Papak">PaPak<span className="text-info">Jai</span></span>
        </NavLink>

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

        <div className={`collapse navbar-collapse ${isNavCollapsed ? '' : 'show'}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeNav}
              >
                HOME
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/visainfo"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeNav}
              >
                VISA
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/Travelguide"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeNav}
              >
                TRAVEL Guide
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="navbar-text text-white me-2">
                  Welcome, {user.displayName || user.email}
                </span>
                <button className="btn btn-outline-warning" onClick={handleLogout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn ghost" onClick={closeNav}>
                  Sign in
                </NavLink>
                <NavLink to="/register" className="btn primary" onClick={closeNav}>
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}