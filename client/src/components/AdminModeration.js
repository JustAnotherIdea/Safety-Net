import React, { useEffect, useState } from 'react';
import ResourceCard from './ResourceCard';
import axios from 'axios';
import baseUrl from '../getBaseUrl';

function AdminModeration() {
  const [moderatedResources, setModeratedResources] = useState([]);

  // Fetch moderated resources from API
  const fetchModeratedResources = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://${baseUrl}:3000/api/moderated-resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModeratedResources(response.data);
    } catch (error) {
      console.error('Error fetching moderated resources:', error);
    }
  };

  // Approve a resource
  const approveResource = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://${baseUrl}:3000/api/moderated-resources/${id}/approve`, {}, {
        headers: { Authorization: token }
      });
      fetchModeratedResources(); // Refresh the list after approval
    } catch (error) {
      console.error('Error approving resource:', error);
    }
  };

  // Reject a resource
  const rejectResource = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://${baseUrl}:3000/api/moderated-resources/${id}`, {
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
    <div className="max-w-6xl mx-auto p-8">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-center mb-8">Moderate Resources</h1>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {moderatedResources.map(resource => (
          <div key={resource.id} className="bg-white shadow-md rounded-lg p-4">
            {/* Resource Card */}
            <ResourceCard id={resource.id} />

            {/* Action Buttons */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => approveResource(resource.id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Approve
              </button>
              <button
                onClick={() => rejectResource(resource.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Resources Message */}
      {moderatedResources.length === 0 && (
        <p className="text-center text-gray-600 mt-8">No resources awaiting moderation.</p>
      )}
    </div>
  );
}

export default AdminModeration;
