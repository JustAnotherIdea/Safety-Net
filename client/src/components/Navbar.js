import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token') !== null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the JWT to get user info
    return decoded.role; // Extract role from token
  };

  const userRole = getUserRole(); // Get the current user's role

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
            {userRole === 'admin' && <li><Link to="/admin-users">Manage Users</Link></li>}  {/* Visible only to admins */}
            {userRole === 'moderator' && <li><Link to="/admin-moderation">Moderate Resources</Link></li>}  {/* Visible only to moderators */}
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
