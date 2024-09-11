import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddResource() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    description: '',
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
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/resources', formData, {
        headers: {'Authorization': token}
      });
      alert('Resource added successfully!');  // User feedback
      navigate('/my-resources'); // Redirect to My Resources
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource, please try again.'); // User feedback on error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Resource</h2>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Resource Name"
        required
      />
      <input
        type="text"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="Category"
        required
      />
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        required
      />
      <button type="submit">Add Resource</button>
    </form>
  );
}

export default AddResource;
