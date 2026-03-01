
import { Routes, Route } from 'react-router-dom'
import ApplicationForm from './components/ApplicationForm'
import AdminDashboard from './components/AdminDashboard'

function App() {
  return (
    <div className="App">
      <Routes>
        {/* The "Home" page for students */}
        <Route path="/" element={<ApplicationForm />} />

        {/* The "Admin" page for the school */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}

export default App