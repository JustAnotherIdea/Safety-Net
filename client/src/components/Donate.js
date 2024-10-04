import React from 'react';
import { Link } from 'react-router-dom';

function Donate() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-center mb-6">Support Our Cause</h1>

      {/* Under Construction Notice */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-6">
        <p className="font-semibold">This page is under construction.</p>
        <p className="text-sm">We're working to provide more ways to support our cause. In the meantime, please reach out to us for donation options.</p>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <p className="text-gray-600 mb-4">If you’d like to donate or learn more about supporting us, please contact us directly.</p>
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

export default Donate;
