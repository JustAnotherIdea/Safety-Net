import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OpeningHoursDisplay from './OpeningHoursDisplay';

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
        console.log(`Fetching resource with ID: ${id}`);
        const response = await axios.get(`http://localhost:3000/api/resources/${id}`);
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

  if (loading) {
    return <p>Loading resource details...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div key={resource.id} className="bg-white shadow-md rounded-lg p-4 w-full">
      {resource ? (
        <>
          <img className="w-full h-48 object-cover rounded-t-lg" src={resource.image_url} alt={resource.name} />
          <div className="p-4">
            <h2 className="text-xl font-bold">{resource.name}</h2>
            <p className="text-gray-700">Category: {resource.category}</p>
            <p className="text-gray-700">Location: {resource.location}</p>
            <p className="text-gray-600 mt-2">{resource.description}</p>

            {resource.phone_number && (
              <p className="text-gray-700 mt-2">Phone Number: {resource.phone_number}</p>
            )}
            {resource.vacancies && (
              <p className="text-gray-700 mt-2">Vacancies: {resource.vacancies}</p>
            )}
            {resource.hours && <OpeningHoursDisplay periods={resource.hours} />}
            {resource.url && (
              <p className="mt-2">
                URL:{' '}
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  {resource.url}
                </a>
              </p>
            )}
            {resource.email && <p className="text-gray-700 mt-2">Email: {resource.email}</p>}
            {resource.rating && <p className="text-gray-700 mt-2">Rating: {resource.rating}</p>}
          </div>
        </>
      ) : (
        <p>No resource details available.</p>
      )}
    </div>
  );
}

export default ResourceCard;
