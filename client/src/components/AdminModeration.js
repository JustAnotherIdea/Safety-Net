import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminModeration() {
  const [moderatedResources, setModeratedResources] = useState([]);
  const fetchModeratedResources = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:3000/api/moderated-resources', {
        headers: { Authorization: token }
      });
      setModeratedResources(response.data);
    } catch (error) {
      console.error('Error fetching moderated resources:', error);
    }
  };

  const approveResource = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:3000/api/moderated-resources/${id}/approve`, {}, {
        headers: { Authorization: token }
      });
      fetchModeratedResources(); // Refresh the list after approval
    } catch (error) {
      console.error('Error approving resource:', error);
    }
  };

  const rejectResource = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:3000/api/moderated-resources/${id}`, {
        headers: { Authorization: token }
      });
      fetchModeratedResources(); // Refresh the list after rejection
    } catch (error) {
      console.error('Error rejecting resource:', error);
    }
  };

  useEffect(() => {
    fetchModeratedResources();
  }, []);

  return (
    <div>
      <h1>Moderate Resources</h1>
      <ul>
        {moderatedResources.map(resource => (
          <li key={resource.id}>
            <strong>{resource.name}</strong>
            <p>Category: {resource.category}</p>
            <p>Description: {resource.description}</p>
            <button onClick={() => approveResource(resource.id)}>Approve</button>
            <button onClick={() => rejectResource(resource.id)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminModeration;