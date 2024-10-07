import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../getBaseUrl';

function AdminUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://${baseUrl}:3000/api/users`, {
        headers: { Authorization: token }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://${baseUrl}:3000/api/users/${userId}/role`, { newRole }, {
        headers: { Authorization: token }
      });
      fetchUsers(); // Refresh the user list after changing role
    } catch (error) {
      console.error('Error changing user role:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      {/* Page Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">User Management</h1>

      {/* Users List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {users.length === 0 ? (
          <p className="text-center py-4">No users found.</p>
        ) : (
          users.map(user => (
            <div key={user.id} className="bg-white shadow-md rounded-lg p-4">
              <p className="text-sm sm:text-base font-semibold">Name: {user.name}</p>
              {/* Truncated email */}
              <p
                className="text-sm sm:text-base text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis"
                style={{ maxWidth: '200px' }}
                title={user.email}
              >
                Email: {user.email}
              </p>
              <p className="text-sm sm:text-base">Role: {user.role}</p>
              <div className="mt-2">
                <label htmlFor={`role-select-${user.id}`} className="block text-sm font-medium text-gray-700">
                  Change Role
                </label>
                <select
                  id={`role-select-${user.id}`}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  value={user.role}
                  className="mt-1 block w-full p-2 border rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
