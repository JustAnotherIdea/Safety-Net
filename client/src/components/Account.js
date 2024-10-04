import React from "react";
import { Link } from 'react-router-dom';

const Account = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-center mb-8">My Account</h1>
      
      {/* Under Construction Notice */}
      <div className="mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
        <p className="font-semibold">This page is under construction.</p>
        <p className="text-sm">We are working to improve your account experience. Stay tuned for updates!</p>
      </div>
      
      {/* My Resources Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/my-resources"
          className="block p-6 border rounded-lg shadow-lg bg-white hover:bg-blue-50 transition transform hover:scale-105"
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-600">My Resources</h2>
          <p className="text-gray-600">View and manage the resources you have added to the community.</p>
        </Link>
      </div>
    </div>
  );
}

export default Account;
