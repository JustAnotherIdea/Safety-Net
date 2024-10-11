import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Use navigate for redirecting
import baseUrl from '../getBaseUrl';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://${baseUrl}:3000/api/register`, formData);
      const token = response.data.token;
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      console.error('Error registering user:', err);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-semibold mb-1">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email"
            required
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-semibold mb-1">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            required
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
