import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem('token');
    // Normalize the role to lowercase to avoid "Admin" vs "admin" bugs
    const userRole = localStorage.getItem('user_role')?.toLowerCase();

    // 1. No token? You aren't logged in.
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. If this is an Admin-only route
    if (requiredRole === 'admin') {
        if (userRole !== 'admin') {
            // User is logged in but NOT an admin -> send to student home
            return <Navigate to="/" replace />;
        }
    }

    // 3. If everything is fine, show the page
    return children;
};

export default ProtectedRoute;