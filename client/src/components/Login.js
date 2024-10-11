import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseUrl from '../getBaseUrl';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://${baseUrl}:3000/api/login`,
        { ...formData, rememberMe } // Include rememberMe in the request body
      );
      console.log('User logged in:', response.data);
      localStorage.setItem('token', response.data.token);

      // optionally store rememberMe in localStorage
      // if (rememberMe) {
      //   localStorage.setItem('rememberMe', 'true'); // Remember user in localStorage
      // } else {
      //   localStorage.removeItem('rememberMe');
      // }

      // Use a small timeout to ensure `localStorage` is properly updated
      setTimeout(() => {
        // Emit custom event to notify login
        window.dispatchEvent(new Event('login'));

        navigate('/');
      }, 100);

      navigate('/');
    } catch (err) {
      console.error('Error logging in:', err);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email"
            required
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block font-semibold mb-1">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            required
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={handleRememberMeChange}
            id="rememberMe"
            className="mr-2"
          />
          <label htmlFor="rememberMe" className="text-gray-600">Keep Me Logged In</label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
