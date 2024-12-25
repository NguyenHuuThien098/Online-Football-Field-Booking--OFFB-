import React, { useState } from 'react';
import { signInWithGoogle, database } from '../../firebase';
import { ref, set, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const Register = ({ setIsAuthenticated, setUserRole }) => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [role, setRole] = useState('player');
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            const user = await signInWithGoogle();
            const userId = user.uid;
            const token = await user.getIdToken();
            const userRef = ref(database, 'users/' + userId);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                setIsAuthenticated(true);
                setUserRole(userData.role);
                localStorage.setItem('token', token);

                navigate(userData.role === 'field_owner' ? '/field-owner-dashboard' : '/player-page');
                return;
            }

            await set(ref(database, 'users/' + userId), {
                email: user.email,
                role: role,
                token: token,
            });

            setSuccess('Đăng ký thành công với vai trò: ' + role);
            setIsAuthenticated(true);
            setUserRole(role);
            localStorage.setItem('token', token);

            navigate(role === 'field_owner' ? '/field-owner-dashboard' : '/player-page');
        } catch (error) {
            console.error("Lỗi khi đăng nhập bằng Google:", error);
            setError(error.message);
        }
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f0f4f8',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        },
        heading: {
            marginBottom: '30px',
            color: '#333',
            fontSize: '2rem',
            fontWeight: 'bold',
        },
        errorMessage: {
            color: 'red',
            marginBottom: '10px',
            fontSize: '1rem',
        },
        successMessage: {
            color: 'green',
            marginBottom: '10px',
            fontSize: '1rem',
        },
        radioGroup: {
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
        },
        button: {
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
        },
        buttonHover: {
            backgroundColor: '#357AE8',
        },
        label: {
            marginRight: '15px',
            fontSize: '1.2rem',
            color: '#333',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Sign up</h2>
            {error && <p style={styles.errorMessage}>{error}</p>}
            {success && <p style={styles.successMessage}>{success}</p>}
            <div style={styles.radioGroup}>
                <label style={styles.label}>
                    <input
                        type="radio"
                        value="player"
                        checked={role === 'player'}
                        onChange={() => setRole('player')}
                    />
                    Player
                </label>
                <label style={styles.label}>
                    <input
                        type="radio"
                        value="field_owner"
                        checked={role === 'field_owner'}
                        onChange={() => setRole('field_owner')}
                    />
                    Field Owner
                </label>
            </div>
            <button
                style={styles.button}
                onMouseOver={e => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
                onMouseOut={e => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
                onClick={handleGoogleLogin}
            >
                Sign Up with Google
            </button>
        </div>
    );
};

export default Register;