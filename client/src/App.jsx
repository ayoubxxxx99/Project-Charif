import { Routes, Route } from 'react-router-dom'
import ApplicationForm from './components/ApplicationForm'
import AdminDashboard from './components/AdminDashboard'
import Login from './components/Login' 
import Register from './components/Register';
import StudentHome from './components/StudentHome';
import ProtectedRoute from './components/ProtectedRoute';
function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Protected Routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <StudentHome />
                </ProtectedRoute>
            } />
            
            <Route path="/apply" element={
                <ProtectedRoute>
                    <ApplicationForm />
                </ProtectedRoute>
            } />

            {/* Admin Protected Routes (Only 'admin' can enter) */}
            <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default App