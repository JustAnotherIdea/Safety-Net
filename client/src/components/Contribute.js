import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Contribute() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Contribute to Our Community</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {isLoggedIn && (
          <Link to="/add-resource" className="block p-6 border rounded-lg shadow-lg hover:bg-blue-50 transition transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4">Add Resource</h2>
            <p className="text-gray-600 mb-4">Help expand our resource database by adding new resources to help those in need.</p>
            <span className="text-blue-600 hover:underline">Add a resource</span>
          </Link>
        )}
        
        <Link to="/volunteer" className="block p-6 border rounded-lg shadow-lg hover:bg-blue-50 transition transform hover:scale-105">
          <h2 className="text-xl font-semibold mb-4">Volunteer</h2>
          <p className="text-gray-600 mb-4">Make a difference in the lives of others by contributing your time and skills as a volunteer.</p>
          <span className="text-blue-600 hover:underline">Learn more</span>
        </Link>
        
        <Link to="/donate" className="block p-6 border rounded-lg shadow-lg hover:bg-blue-50 transition transform hover:scale-105">
          <h2 className="text-xl font-semibold mb-4">Donate</h2>
          <p className="text-gray-600 mb-4">Support our mission by donating funds, resources, or materials to help those in need.</p>
          <span className="text-blue-600 hover:underline">Donate now</span>
        </Link>
      </div>
    </div>
  );
}

export default Contribute;
