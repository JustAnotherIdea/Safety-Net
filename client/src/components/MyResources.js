import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MyResources() {
  const [resources, setResources] = useState([]);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/user/resources', {
        headers: {
          Authorization: token
        }
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
    <div>
      <h1>My Resources</h1>
      {resources.length === 0 ? (
        <p>No resources found.</p>
      ) : (
        <ul>
          {resources.map(resource => (
            <li key={resource.id}>{resource.name} - {resource.description}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyResources;
