import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import OpeningHours from './OpeningHours';

function ResourceDetail() {
  const { id } = useParams(); // Get resource ID from URL
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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

  // Fetch resource details
  useEffect(() => {
    const fetchResource = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:3000/api/resources/${id}`, {
          headers: { Authorization: token }
        });
        console.log(response);
        setResource(response.data);
        setFormData(response.data); // Initialize form with resource data
      } catch (error) {
        console.error('Error fetching resource:', error);
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:3000/api/resources/${id}`, formData, {
        headers: { Authorization: token }
      });
      console.log('Resource updated successfully!');
      navigate('/my-resources'); // Redirect to My Resources after editing
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await axios.delete(`http://localhost:3000/api/resources/${id}`, {
          headers: { Authorization: token }
        });
        console.log('Resource deleted successfully!');
        navigate('/my-resources'); // Redirect after deletion
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <div>
      {resource ? (
        <div>
          <img src={resource.image_url} alt={resource.name} />
          <h2>{resource.name}</h2>
          <p>Category: {resource.category}</p>
          <p>Location: {resource.location}</p>
          <p>Description: {resource.description}</p>
          {resource.phone_number && <p>Phone Number: {resource.phone_number}</p>}
          {resource.vacancies && <p>Vacancies: {resource.vacancies}</p>}
          {resource.hours && <OpeningHours periods={resource.hours} />}
          {resource.url && <p>URL: <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a></p>}
          {resource.email && <p>Email: {resource.email}</p>}
          {resource.rating && <p>Rating: {resource.rating}</p>}
          {localStorage.getItem('token') && // Only show if logged in
            <>
              <button onClick={handleEditClick}>Edit</button>
              <button onClick={handleDelete}>Delete</button> {/* Delete button */}
            </>
          }

          {isEditing && (
            <form onSubmit={handleEditSubmit}>
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
              <button type="submit">Submit</button>
            </form>
          )}
        </div>
      ) : (
        <p>Loading resource details...</p>
      )}
    </div>
  );
}

export default ResourceDetail;
