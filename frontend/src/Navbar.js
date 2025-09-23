import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [activeNav, setActiveNav] = useState('tracker');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (page) => {
    setActiveNav(page);
    setIsMobileMenuOpen(false);
    // Here you can add logic to navigate to different sections/pages
    console.log(`Navigating to: ${page}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => handleNavigation('home')}>
          <span className="logo-icon">🚑</span>
          <span className="logo-text">Ambulance Tracker</span>
        </div>
        
        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div 
            className={`navbar-item ${activeNav === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigation('home')}
          >
            Home
          </div>
          <div 
            className={`navbar-item ${activeNav === 'tracker' ? 'active' : ''}`}
            onClick={() => handleNavigation('tracker')}
          >
            Live Tracker
          </div>
          <div 
            className={`navbar-item ${activeNav === 'services' ? 'active' : ''}`}
            onClick={() => handleNavigation('services')}
          >
            Services
          </div>
          <div 
            className={`navbar-item ${activeNav === 'about' ? 'active' : ''}`}
            onClick={() => handleNavigation('about')}
          >
            About Us
          </div>
          <div 
            className={`navbar-item ${activeNav === 'contact' ? 'active' : ''}`}
            onClick={() => handleNavigation('contact')}
          >
            Contact
          </div>
          <div 
            className={`navbar-item emergency ${activeNav === 'emergency' ? 'active' : ''}`}
            onClick={() => handleNavigation('emergency')}
          >
            🚨 Emergency
          </div>
        </div>

        <div 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;