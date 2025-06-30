import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { useTranslation } from 'react-i18next';
import './Layout.css';

const Layout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get('/api/core/verify-session/');
        setIsAuthenticated(response.data.isValid);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    verifyAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/core/logout/', {});
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            Ticket System
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">{t('home')}</Link>
            <Link to="/events" className="nav-link">{t('events')}</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="nav-link">{t('profile')}</Link>
                <button onClick={handleLogout} className="nav-button">{t('logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">{t('login')}</Link>
                <Link to="/register" className="nav-button">{t('register')}</Link>
              </>
            )}
            <div className="language-switcher">
              <button
                className={i18n.language === 'ru' ? 'active' : ''}
                onClick={() => i18n.changeLanguage('ru')}
                aria-label="Switch to Russian"
              >
                RU
              </button>
              <button
                className={i18n.language === 'en' ? 'active' : ''}
                onClick={() => i18n.changeLanguage('en')}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                className={i18n.language === 'uz' ? 'active' : ''}
                onClick={() => i18n.changeLanguage('uz')}
                aria-label="Switch to Uzbek"
              >
                UZ
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{t('about')}</h3>
            <p>{t('aboutDescription')}</p>
          </div>
          <div className="footer-section">
            <h3>{t('quickLinks')}</h3>
            <Link to="/events">{t('events')}</Link>
            <Link to="/about">{t('about')}</Link>
            <Link to="/contact">{t('contact')}</Link>
          </div>
          <div className="footer-section">
            <h3>{t('contact')}</h3>
            <p>Email: support@ticketsystem.com</p>
            <p>{t('phone')}: +998 90 123 45 67</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Ticket System. {t('allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;