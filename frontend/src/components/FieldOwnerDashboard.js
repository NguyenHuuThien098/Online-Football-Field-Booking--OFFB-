// src/components/FieldOwnerDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FieldOwnerDashboard = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/fields');
                setFields(response.data);
            } catch (error) {
                console.error("Error fetching fields:", error);
                setError('Có lỗi xảy ra khi tải danh sách sân.');
            } finally {
                setLoading(false);
            }
        };

        fetchFields();
    }, []);

    if (loading) {
        return <p>Đang tải danh sách sân...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div>
            <h1>Field Owner Dashboard</h1>
            <p>Welcome to the Field Owner Dashboard!</p>
            <h2>Danh sách sân của bạn:</h2>
            <ul>
                {fields.map((field) => (
                    <li key={field.id}>{field.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default FieldOwnerDashboard;