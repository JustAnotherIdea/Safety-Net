import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import axios from 'axios';
import baseUrl from '../getBaseUrl';

function ResourceCard({ id }) {
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching resource:', error);
        setError('Failed to fetch resource');
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  if (loading) return <p>Loading resource details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="rounded-lg shadow-lg hover:shadow-xl shadow-slate-300 bg-slate-100 p-2 w-full border-b-2 border-slate-300 md:border-b-0 overflow-hidden">
      {resource ? (
        <div className="flex flex-row md:flex-col items-start gap-4">
          {/* Image */}
          <img className="w-32 h-32 aspect-square md:w-full md:h-32 md:aspect-auto object-cover rounded-lg md:w-32 md:h-32 md:rounded-lg md:border-2 md:border-slate-300" src={resource.image_url} alt={resource.name} />

          {/* Resource details */}
          <div className="flex-1 w-full overflow-hidden">
            <Link to={`/resource/${resource.id}`}>
              <h2 className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors truncate">{resource.name}</h2>
            </Link>
            {resource.category && <p className="text-gray-700 mt-2 line-clamp-1 truncate md:hidden">Category: {resource.category}</p>}
            {resource.url && (
              <p className="hidden md:block mt-2 line-clamp-1 truncate">
                Website:{' '}
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  {resource.url}
                </a>
              </p>
            )}
            <p className="hidden md:block text-gray-700 line-clamp-1 truncate">Location: {resource.location}</p>
            {resource.phone_number && <p className="hidden md:block text-gray-700 mt-2 line-clamp-1 truncate">Phone Number: {resource.phone_number}</p>}
            <p className="text-gray-600 mt-2 line-clamp-2 text-ellipsis" dangerouslySetInnerHTML={{ __html: resource.description }}></p>
            {resource.email && <p className="hidden md:block text-gray-700 mt-2 line-clamp-1 truncate">Email: {resource.email}</p>}
          </div>
        </div>
      ) : (
        <p>No resource details available.</p>
      )}
    </div>
  );
}

export default ResourceCard;
