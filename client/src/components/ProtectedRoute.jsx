import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem('admin_token');
    const role = localStorage.getItem('user_role');

    // 1. If not logged in at all, go to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. If a specific role is required (like 'admin') but user is a 'student'
    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    // 3. Otherwise, show the page
    return children;
};

export default ProtectedRoute;