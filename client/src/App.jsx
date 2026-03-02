import { Routes, Route } from 'react-router-dom'
import ApplicationForm from './components/ApplicationForm'
import AdminDashboard from './components/AdminDashboard'
import Login from './components/Login' // <--- 1. Import the Login component
import Register from './components/Register';
function App() {
  return (
    <div className="App">
      <Routes>
        {/* The "Home" page for students */}
        <Route path="/" element={<ApplicationForm />} />

        {/* The "Login" page for the admin */}
        <Route path="/login" element={<Login />} /> {/* <--- 2. Add the route here */}
        <Route path="/register" element={<Register />} />
        {/* The "Admin" page for the school */}
        <Route path="/admin" element={<AdminDashboard />} />
        
      </Routes>
    </div>
  )
}

export default App