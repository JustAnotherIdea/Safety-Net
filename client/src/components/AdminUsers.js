import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminUsers() {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://localhost:3000/api/users', {
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
        await axios.put(`http://localhost:3000/api/users/${userId}/role`, { newRole }, {
        headers: { Authorization: token }
        });
        fetchUsers(); // Refresh the user list after changing role
    } catch (error) {
        console.error('Error changing user role:', error);
    }
    };

    return (
    <div>
        <h1>User Management</h1>
        <ul>
        {users.map(user => (
            <li key={user.id}>
            {user.name} - {user.email} - {user.role}
            <select onChange={(e) => handleRoleChange(user.id, e.target.value)} value={user.role}>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
            </select>
            </li>
        ))}
        </ul>
    </div>
    );
}

export default AdminUsers;