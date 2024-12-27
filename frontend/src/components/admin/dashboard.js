import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './dashboard.css'; // Import the CSS file for styling
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAdd = () => {
        // Add user logic
    };

    const handleDelete = (uid) => {
        // Delete user logic
    };

    const handleUpdate = (uid) => {
        // Update user logic
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <section>
                <Container>
                    <div className="admin-actions">
                        <Button variant="success" onClick={handleAdd} className="add-user-button">Add User</Button>
                        <Link to="/">
                            <Button variant="secondary" className="back-home-button">Back to Home</Button>
                        </Link>
                    </div>
                    <table className="user-table">
                        <caption>Users</caption>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.uid}>
                                    <td>{user.uid}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <Button variant="primary" onClick={() => handleUpdate(user.uid)}>Update</Button>
                                        <Button variant="danger" onClick={() => handleDelete(user.uid)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Container>
            </section>
        </div>
    );
};

export default AdminDashboard;
