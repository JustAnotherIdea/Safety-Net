import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import OpeningHoursDisplay from './OpeningHoursDisplay';
import baseUrl from '../getBaseUrl';

function ResourceDetail() {
  const { id } = useParams(); // Get resource ID from URL
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState(null); // To store user's role
  const [userId, setUserId] = useState(null); // To store user's ID
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

  // Fetch resource details and user role
  useEffect(() => {
    const fetchResource = async () => {
      const token = localStorage.getItem('token');
      
      try {
        // Decode token to extract user role and ID
        if (token) {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          setUserRole(decoded.role);
          setUserId(decoded.id);
        }

        // Fetch resource data
        const response = await axios.get(`http://${baseUrl}:3000/api/resources/${id}`, {
          headers: { Authorization: token ? token : '' },
        });
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
      await axios.put(`http://${baseUrl}:3000/api/resources/${id}`, formData, {
        headers: { Authorization: token }
      });
      console.log('Resource updated successfully!');
      setIsEditing(false); // Close the edit form on successful update
      navigate('/my-resources'); // Redirect to My Resources after editing
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await axios.delete(`http://${baseUrl}:3000/api/resources/${id}`, {
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

  // Check if the current user is authorized to edit/delete
  const isAuthorized = userId === resource?.user_id || userRole === 'admin';

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      {resource ? (
        <div>
          <img 
            src={resource.image_url} 
            alt={resource.name} 
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
          <h2 className="text-3xl font-bold mb-4">{resource.name}</h2>
          <p className="text-lg text-gray-700 mb-2">Category: {resource.category}</p>
          <p className="text-lg text-gray-700 mb-2">Location: {resource.location}</p>
          <p className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resource.description) }}></p>

          {resource.phone_number && <p className="text-gray-700 mb-2">Phone Number: {resource.phone_number}</p>}
          {resource.hours && resource.hours.length > 0 ? (
            <OpeningHoursDisplay periods={resource.hours} />
          ) : (
            <p className="text-gray-600">Hours: {resource.hours_text}</p>
          )}
          {resource.url && (
            <p className="mb-2">
              URL: <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">{resource.url}</a>
            </p>
          )}
          {resource.email && <p className="text-gray-700 mb-2">Email: {resource.email}</p>}
          {resource.rating && <p className="text-gray-700 mb-4">Rating: {resource.rating}</p>}

          {/* Only show edit and delete buttons if user is authorized */}
          {isAuthorized && (
            <div className="flex space-x-4 mt-4">
              <button onClick={handleEditClick} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Edit
              </button>
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                Delete
              </button>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
              <h2 className="text-2xl font-bold mb-4">Edit Resource</h2>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
              <input 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required 
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
              <input 
                type="text" 
                name="url" 
                value={formData.url} 
                onChange={handleChange} 
                placeholder="Resource URL" 
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
              <input 
                type="text" 
                name="image_url" 
                value={formData.image_url} 
                onChange={handleChange} 
                placeholder="Image URL" 
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                required 
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
              <input 
                type="text" 
                name="phone_number" 
                value={formData.phone_number} 
                onChange={handleChange} 
                placeholder="Phone Number" 
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
              <input 
                type="number" 
                name="vacancies" 
                value={formData.vacancies} 
                onChange={handleChange} 
                placeholder="Vacancies" 
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
              <input 
                type="text" 
                name="hours" 
                value={formData.hours} 
                onChange={handleChange} 
                placeholder="Hours" 
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                Submit
              </button>
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
