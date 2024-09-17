import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditResource() {
  const { id } = useParams(); // Get resource ID from route
  const navigate = useNavigate();
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
  });

  // Fetch existing resource data
  useEffect(() => {
    const fetchResource = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/api/resources/${id}`, {
          headers: {
            Authorization: token
          }
        });
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching resource data:', error);
      }
    };
    fetchResource();
  }, [id]);

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
      await axios.put(`http://localhost:3000/api/resources/${id}`, formData, {
        headers: {
          'Authorization': token
        }
      });
      console.log('Resource updated successfully!');
      navigate('/my-resources'); // Redirect to My Resources after editing
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
         <h2>Edit Resource</h2>
         <input type="text" name="name" value={formData.name} onChange={handleChange} required />
         <input type="text" name="category" value={formData.category} onChange={handleChange} required />
         <input type="text" name="url" value={formData.url} onChange={handleChange} placeholder="Resource URL" />
         <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="Image URL" />
         <input type="text" name="location" value={formData.location} onChange={handleChange} required />
         <textarea name="description" value={formData.description} onChange={handleChange} required />
         <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" />
         <input type="number" name="vacancies" value={formData.vacancies} onChange={handleChange} placeholder="Vacancies" />
         <input type="text" name="hours" value={formData.hours} onChange={handleChange} placeholder="Hours" />
         <button type="submit">Update Resource</button>
       </form>
  );
}

export default EditResource;
