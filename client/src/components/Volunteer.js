import React from 'react';
import { Link } from 'react-router-dom';

function Volunteer() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-center mb-6">Volunteer with Us</h1>

      {/* Under Construction Notice */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-6">
        <p className="font-semibold">This page is under construction.</p>
        <p className="text-sm">We're working hard to provide more volunteer opportunities. In the meantime, please reach out to us directly.</p>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <p className="text-gray-600 mb-4">If you’re interested in volunteering, please contact us for more information.</p>
        <Link 
          to="/contact"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}

export default Volunteer;
