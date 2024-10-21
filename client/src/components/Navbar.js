import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import baseUrl from '../getBaseUrl';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  const clearCategorySelection = () => {
    if (location.pathname === '/') {
      // Only clear if we're on the home page
      navigate('/', { state: { clearCategory: true } });
    } else {
      // If not on home page, just navigate to home
      navigate('/');
    }
    closeMenu();
  };

  const handleLogout = async () => {
    try {
      await axios.post(`http://${baseUrl}:3000/api/logout`, {}, { withCredentials: true });
      localStorage.removeItem('token');
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setToken(null);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getUserRole = () => {
    if (!token) return null;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the JWT to get user info
      console.log("user role", decoded.role);
      return decoded.role; // Extract role from token
    } catch (e) {
      console.error('Invalid token:', e);
      return null;
    }
  };

  const userRole = getUserRole(); // Get the current user's role

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Listen for custom 'tokenRefreshed' and 'login' events
  useEffect(() => {
    const handleTokenUpdate = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('tokenRefreshed', handleTokenUpdate);
    window.addEventListener('login', handleTokenUpdate);
    
    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenUpdate);
      window.removeEventListener('login', handleTokenUpdate);
    };
  }, []);

  return (
    <>
      <nav className="bg-slate-600 shadow-lg fixed top-0 left-0 right-0 z-50 w-full">
        <div className="w-full flex flex-col md:flex-row md:justify-between md:items-stretch">
          {/* Branding or Logo */}
          <div to="/" onClick={clearCategorySelection} className="text-white text-2xl font-bold p-4 w-min md:w-auto cursor-pointer">
            <div>Safety.net</div>
          </div>
          
          {/* Navigation Links */}
          <ul
            className={`md:flex md:items-stretch md:justify-end text-white w-full
              transition-all duration-300 ease-in-out
              ${isMenuOpen ? 'max-h-screen' : 'max-h-0 md:max-h-screen'}
              overflow-hidden md:overflow-visible
              bg-slate-600 md:bg-transparent md:shadow-none`}
          >
            <li className="w-full md:w-auto md:h-full"><Link to="/contribute" onClick={closeMenu} className="block px-4 pb-2 md:pt-2 md:h-full md:flex md:items-center hover:bg-slate-700 w-full">Contribute</Link></li>
            <li className="w-full md:w-auto md:h-full"><Link to="/contact" onClick={closeMenu} className="block px-4 py-2 md:h-full md:flex md:items-center hover:bg-slate-700 w-full">Contact</Link></li>
            {token ? (
              <>
                <li className="w-full md:w-auto md:h-full"><Link to="/account" onClick={closeMenu} className="block px-4 py-2 md:h-full md:flex md:items-center hover:bg-slate-700 w-full">Account</Link></li>
                {userRole === 'admin' && <li className="w-full md:w-auto md:h-full"><Link to="/admin-users" onClick={closeMenu} className="block px-4 py-2 md:h-full md:flex md:items-center hover:bg-slate-700 w-full">Manage Users</Link></li>}
                {(userRole === 'admin' || userRole === 'moderator') && (
                  <li className="w-full md:w-auto md:h-full"><Link to="/admin-moderation" onClick={closeMenu} className="block px-4 py-2 md:h-full md:flex md:items-center hover:bg-slate-700 w-full">Moderate Resources</Link></li>
                )}
                {userRole === 'admin' && <li className="w-full md:w-auto md:h-full"><Link to="/resource-scraper" onClick={closeMenu} className="block px-4 py-2 md:h-full md:flex md:items-center hover:bg-slate-700 w-full">Scrape Resources</Link></li>}
                <li className="w-full md:w-auto md:h-full">
                  <div 
                    tabIndex="0"
                    onClick={() => {
                      closeMenu();
                      handleLogout();
                    }} 
                    className="block px-4 pt-2 pb-4 md:pb-2 md:h-full md:flex md:items-center text-red-500 cursor-pointer hover:bg-slate-700 w-full"
                  >
                    Logout
                  </div>
                </li>
              </>
            ) : (
              <>
                <li className="w-full md:w-auto md:h-full"><Link to="/login" onClick={closeMenu} className="block px-4 py-2 md:h-full md:flex md:items-center hover:bg-slate-700 w-full">Login</Link></li>
                <li className="w-full md:w-auto md:h-full"><Link to="/register" onClick={closeMenu} className="block px-4 py-2 md:h-full md:flex md:items-center hover:bg-slate-700 w-full">Register</Link></li>
              </>
            )}
          </ul>

          {/* Hamburger Button for Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white block md:hidden focus:outline-none absolute top-4 right-4"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>
      <div className="h-16"></div> {/* Spacer div */}
    </>
  );
}

export default Navbar;
