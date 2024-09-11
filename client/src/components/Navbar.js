import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token') !== null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/contribute">Contribute</Link></li>
        <li><Link to="/donate">Donate</Link></li>
        <li><Link to="/volunteer">Volunteer</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        {isAuthenticated ? (
          <>
            <li><Link to="/my-resources">My Resources</Link></li>
            <li><Link to="/add-resource">Add Resource</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
