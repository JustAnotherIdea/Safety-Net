import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import DOMPurify from 'dompurify';
import axios from 'axios';
import baseUrl from '../getBaseUrl';
import { FaEdit } from "react-icons/fa";

function EditResource({ id }) {
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!id) {
      console.error('No resource ID provided to fetch.');
      setError('Invalid resource ID');
      setLoading(false);
      return;
    }

    const fetchResource = async () => {
      try {
        const response = await axios.get(`http://${baseUrl}:3000/api/resources/${id}`);
        setResource(response.data);
        setFormData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching resource:', error);
        setError('Failed to fetch resource');
        setLoading(false);
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
      await axios.put(`http://${baseUrl}:3000/api/resources/${id}`, formData, {
        headers: { Authorization: token }
      });
      setResource(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating resource:', error);
      setError('Failed to update resource');
    }
  };

  if (loading) return <p>Loading resource details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="rounded-lg shadow-lg hover:shadow-xl shadow-slate-300 bg-slate-100 p-2 w-full border-b-2 border-slate-300 md:border-b-0">
      {resource ? (
        <div className="flex flex-col items-start gap-4">
          {/* Image */}
          <img className="w-full h-32 object-cover rounded-lg border-2 border-slate-300" src={resource.image_url} alt={resource.name} />

          {/* Resource details */}
          <div className="flex-1 w-full">
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  Save
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition">
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <Link to={`/resource/${resource.id}`}>
                  <h2 className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors truncate">{resource.name}</h2>
                </Link>
                {resource.category && <p className="text-gray-700 mt-2 line-clamp-1 truncate">Category: {resource.category}</p>}
                {resource.url && (
                  <p className="block mt-2 line-clamp-1 truncate">
                    Website:{' '}
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      {resource.url}
                    </a>
                  </p>
                )}
                <p className="block text-gray-700 line-clamp-1 truncate">Location: {resource.location}</p>
                {resource.phone_number && <p className="block text-gray-700 mt-2 line-clamp-1 truncate">Phone Number: {resource.phone_number}</p>}
                <p className="text-gray-600 mt-2 line-clamp-2 text-ellipsis" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resource.description) }}></p>
                {resource.email && <p className="block text-gray-700 mt-2 line-clamp-1 truncate">Email: {resource.email}</p>}
                <button onClick={() => setIsEditing(true)} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition">
                  <FaEdit />
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <p>No resource details available.</p>
      )}
    </div>
  );
}

export default EditResource;
