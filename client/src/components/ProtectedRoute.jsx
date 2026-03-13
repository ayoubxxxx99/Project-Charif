import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem('token');
    
    const userRole = localStorage.getItem('user_role')?.toLowerCase();

   
    if (!token) {
        return <Navigate to="/login" replace />;
    }

   
    if (requiredRole === 'admin') {
        if (userRole !== 'admin') {
           
            return <Navigate to="/" replace />;
        }
    }

    //  If everything is fine, show the page
    return children;
};

export default ProtectedRoute;