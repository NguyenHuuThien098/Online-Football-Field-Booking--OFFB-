const handleLogout = () => {
    localStorage.setItem('isAuthenticated', 'false');
    localStorage.setItem('token', '');
    localStorage.setItem('userRole', '');
    localStorage.setItem('userId', '');
    window.location.reload();
};

export default handleLogout;