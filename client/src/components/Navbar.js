import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseUrl from '../getBaseUrl';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

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
    <nav className="bg-blue-600 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Branding or Logo */}
        <div className="text-white text-2xl font-bold">
          <Link to="/">Safety.net</Link>
        </div>
        
        {/* Hamburger Button for Mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white block md:hidden focus:outline-none"
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

        {/* Navigation Links */}
        <ul
          className={`md:flex md:items-center md:space-x-4 text-white ${
            isMenuOpen ? 'block' : 'hidden'
          }`}
        >
          <li><Link to="/contribute" className="block px-2 py-1 hover:text-gray-300">Contribute</Link></li>
          <li><Link to="/contact" className="block px-2 py-1 hover:text-gray-300">Contact</Link></li>
          {token ? (
            <>
              <li><Link to="/account" className="block px-2 py-1 hover:text-gray-300">Account</Link></li>
              {userRole === 'admin' && <li><Link to="/admin-users" className="block px-2 py-1 hover:text-gray-300">Manage Users</Link></li>}
              {(userRole === 'admin' || userRole === 'moderator') && (
                <li><Link to="/admin-moderation" className="block px-2 py-1 hover:text-gray-300">Moderate Resources</Link></li>
              )}
              <li>
                <button 
                  onClick={handleLogout} 
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-700 transition block"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="block px-2 py-1 hover:text-gray-300">Login</Link></li>
              <li><Link to="/register" className="block px-2 py-1 hover:text-gray-300">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
