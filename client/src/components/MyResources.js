import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ResourceCard from './ResourceCard';
import baseUrl from '../getBaseUrl';

function MyResources() {
  const [resources, setResources] = useState([]);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://${baseUrl}:3000/api/user/resources`, {
        headers: { Authorization: token }
      });
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching user resources:', error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-center mb-8">My Resources</h1>

      {/* Display Message if No Resources */}
      {resources.length === 0 ? (
        <p className="text-center text-gray-600">No resources found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map(resource => (
            <ResourceCard key={resource.id} id={resource.id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyResources;
