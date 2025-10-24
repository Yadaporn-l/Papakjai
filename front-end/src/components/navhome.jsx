import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
// import "./navhome.css";

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
      navigate('/'); // กลับไปหน้าแรก (homepage ปกติ)
      console.log("You are logged out");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // กำหนด home path ตามสถานะ login
  const homePath = user ? '/homelogin' : '/';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        {/* Brand / Logo - เปลี่ยน path ตามสถานะ login */}
        <Link className="navbar-brand d-flex align-items-center" to={homePath} onClick={closeNav}>
          <img src="/img/pa_pak_jai-removebg.png" alt="logo" height="40" className="me-2" />
          <span className="Papak">
            PaPak<span className="text-info">Jai</span>
          </span>
        </Link>
                
        {/* Toggler */}
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
        <div className={`collapse navbar-collapse ${isNavCollapsed ? '' : 'show'}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              {/* HOME link - เปลี่ยน path ตามสถานะ login */}
              <Link className="nav-link active" to={homePath} onClick={closeNav}>
                HOME
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/visainfo" onClick={closeNav}>
                VISA
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/accomodation" onClick={closeNav}>
                ACCOMODATION
              </Link>
            </li>
          </ul>

          {/* ส่วนที่เปลี่ยนแปลงตามสถานะ Login */}
          <div className="d-flex align-items-center gap-2">
            {user ? (
              // ---- เมื่อผู้ใช้ Login แล้ว ----
              <>
                <span className="navbar-text text-white me-2">
                  สวัสดี, {user.displayName || user.email}
                </span>
                <button
                  className="btn btn-outline-warning"
                  onClick={handleLogout}
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              // ---- เมื่อยังไม่ได้ Login ----
              <>
                <Link to="/login" className="btn ghost" onClick={closeNav}>
                  Sign in
                </Link>
                <Link to="/register" className="btn primary" onClick={closeNav}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}