import React, { useState, useEffect } from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

interface User {
  username: string;
  isAuthenticated: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User>({ username: '', isAuthenticated: false });
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  useEffect(() => {
    // Check if user is authenticated (you can implement your auth logic here)
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const username = localStorage.getItem('username');
      if (token && username) {
        setUser({ username, isAuthenticated: true });
      }
    };
    checkAuth();
  }, []);

  const handleLanguageChange = (lang: string, langName: string) => {
    setCurrentLanguage(langName);
    setShowLanguageDropdown(false);
    // Store language preference
    localStorage.setItem('language', lang);
    // You can implement i18n logic here
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setUser({ username: '', isAuthenticated: false });
    // Redirect to login or home
    window.location.href = '/';
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' }
  ];

  return (
    <div className="layout">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light sticky-top">
        <div className="container">
          <a className="navbar-brand" href="/">
            <img src="/images/logo.png" alt="Accident Fighter Logo" className="logo-img" />
            Accident Fighter
          </a>
          <div className="d-flex align-items-center">
            <a href="/" className="nav-link me-3">Home</a>
            <a href="/dashboard" className="nav-link me-3">Dashboard</a>
            
            {/* Language Selector */}
            <div className="language-selector me-3">
              <button 
                className="language-btn" 
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <i className="bi bi-translate me-1"></i> {currentLanguage}
              </button>
              <div 
                className="language-dropdown" 
                style={{ display: showLanguageDropdown ? 'block' : 'none' }}
              >
                {languages.map((lang) => (
                  <a 
                    key={lang.code}
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleLanguageChange(lang.code, lang.name);
                    }}
                  >
                    {lang.name}
                  </a>
                ))}
              </div>
            </div>
            
            {user.isAuthenticated ? (
              <>
                <span className="nav-item me-3 text-muted">Welcome, {user.username}</span>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <a className="btn btn-outline-primary btn-sm me-2" href="/login">Login</a>
                <a className="btn btn-primary btn-sm" href="/signup">Sign Up</a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
              <div className="footer-section">
                <h5>Quick Links</h5>
                <ul className="footer-links">
                  <li><a href="/">Home</a></li>
                  <li><a href="/about">About Us</a></li>
                  <li><a href="/services">Services</a></li>
                  <li><a href="/emergency-contacts">Emergency Contacts</a></li>
                  <li><a href="/privacy-policy">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
              <div className="footer-section">
                <h5>Popular Cities</h5>
                <ul className="footer-links">
                  <li><a href="/city/mumbai">Mumbai</a></li>
                  <li><a href="/city/delhi">Delhi</a></li>
                  <li><a href="/city/bangalore">Bangalore</a></li>
                  <li><a href="/city/hyderabad">Hyderabad</a></li>
                  <li><a href="/city/chennai">Chennai</a></li>
                </ul>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
              <div className="footer-section">
                <h5>Emergency Services</h5>
                <ul className="footer-links">
                  <li><a href="tel:108">Ambulance: 108</a></li>
                  <li><a href="tel:100">Police: 100</a></li>
                  <li><a href="tel:101">Fire: 101</a></li>
                  <li><a href="tel:1091">Women Helpline: 1091</a></li>
                  <li><a href="tel:1078">Disaster Management: 1078</a></li>
                </ul>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
              <div className="footer-section">
                <h5>Connect With Us</h5>
                <div className="social-icons mb-3">
                  <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                  <a href="#" aria-label="Twitter"><i className="bi bi-twitter"></i></a>
                  <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                  <a href="#" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
                </div>
                <h5>Download App</h5>
                <div className="app-download">
                  <a href="#" className="d-inline-block mb-2">
                    <img src="/images/google-play.jpeg" alt="Google Play" style={{ height: '40px' }} />
                  </a>
                  <a href="#" className="d-inline-block mb-2">
                    <img src="/images/app-store.png" alt="App Store" style={{ height: '40px' }} />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row copyright">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0">&copy; 2025 Accident Fighter. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <p className="mb-0">Made with <i className="bi bi-heart-fill text-danger"></i> for a safer world</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
