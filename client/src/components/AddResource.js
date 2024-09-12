import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddResource() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    url: '',
    image_url: '',
    location: '',
    description: '',
    phone_number: '',
    vacancies: 0,
    hours: '',
    rating: 0.0,
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
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      await axios.post('http://localhost:3000/api/resources', {
        ...formData,
        user_id: userId, // Include user ID when submitting
      }, {
        headers: {
          'Authorization': token
        }
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
         <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Resource Name" required />
         <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
         <input type="text" name="url" value={formData.url} onChange={handleChange} placeholder="Resource URL" />
         <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Image URL" />
         <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" required />
         <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
         <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" />
         <input type="number" name="vacancies" value={formData.vacancies} onChange={handleChange} placeholder="Vacancies" />
         <input type="text" name="hours" value={formData.hours} onChange={handleChange} placeholder="Hours" />
         <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} placeholder="Rating" />
         <button type="submit">Add Resource</button>
       </form>
  );
}

export default AddResource;
