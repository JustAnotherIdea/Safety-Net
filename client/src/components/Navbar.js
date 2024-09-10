import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/contribute">Contribute</Link></li>
        <li><Link to="/donate">Donate</Link></li>
        <li><Link to="/volunteer">Volunteer</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/add-resource">Add Resource</Link></li>  {/* Add resource link */}
      </ul>
    </nav>
  );
}

export default Navbar;
