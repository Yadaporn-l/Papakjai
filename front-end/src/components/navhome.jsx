import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NavHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when resizing to larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav">
          <Link to="/" className="brand" onClick={closeMenu}>
            <img src="./img/pa_pak_jai-removebg.png" alt="logo" />
            <span>PaPak<span className="accent">Jai</span></span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className={`menu ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/" className="active" onClick={closeMenu}>HOME</Link>
            <a href="#" onClick={closeMenu}>VISA</a>
            <a href="#" onClick={closeMenu}>ACCOMMODATION &amp; RESTAURANT</a>
            <a href="#" onClick={closeMenu}>CULTURE</a>
          </nav>
          
          <div className="auth-actions">
            <Link to="/login" className="btn ghost" onClick={closeMenu}>Sign in</Link>
            <Link to="/register" className="btn primary" onClick={closeMenu}>Sign Up</Link>
          </div>
          
          {/* Hamburger Menu Button */}
          <button 
            className={`hamburger ${isMenuOpen ? 'open' : ''}`} 
            aria-label={isMenuOpen ? "Close Navigation" : "Open Navigation"}
            onClick={toggleMenu}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}></div>
      )}
    </>
  );
}