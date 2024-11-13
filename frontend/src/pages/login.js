import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';

const Login = ({ setIsAuthenticated, setUserRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, role } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', role);
            setIsAuthenticated(true);
            setUserRole(role);
            if (role === 'player') {
                navigate('/player-page');
            } else if (role === 'field_owner') {
                navigate('/field-owner-dashboard');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const user = await signInWithGoogle();
            const idToken = await user.getIdToken();
            const response = await axios.post('http://localhost:5000/api/auth/login/google', { idToken });
            const { token, role } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', role);
            setIsAuthenticated(true);
            setUserRole(role);
            if (role === 'player') {
                navigate('/player-page');
            } else if (role === 'field_owner') {
                navigate('/field-owner-dashboard');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error logging in with Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <a href="/" className="btn">Back</a>
            <div className="vh-100 d-flex align-items-center">
                <div className="vw-100 h-50 d-flex justify-content-center">
                    <div className="d-flex flex-column border border-dark w-25 rounded p-4">
                        <h1 className="border-bottom border-dark pb-2">OFFB</h1>
                        <h2>Login</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                        <button onClick={handleGoogleLogin} className="btn btn-danger mt-3" disabled={loading}>
                            {loading ? 'Logging in with Google...' : 'Login with Google'}
                        </button>
                        {error && <p className="text-danger mt-3">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;