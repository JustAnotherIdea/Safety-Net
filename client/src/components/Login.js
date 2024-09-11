import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false); // State for remember me checkbox

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
      const response = await axios.post('http://localhost:3000/api/login', formData, { withCredentials: true });
      console.log('User logged in:', response.data);
      localStorage.setItem('token', response.data.token); // Store the token in local storage
      if (rememberMe) {
        // Logic for handling persistent session can be added here
      }
    } catch (err) {
      console.error('Error logging in:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
      <div>
        <input type="checkbox" checked={rememberMe} onChange={handleRememberMeChange} />
        <label>Keep Me Logged In</label>
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
