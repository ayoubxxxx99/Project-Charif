import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Added this for redirection
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [list, setList] = useState([]);
    const navigate = useNavigate(); // 2. Initialize navigate

    // 3. This function fetches the data
    const fetchApplications = () => {
        const token = localStorage.getItem('admin_token');
        
        axios.get('http://127.0.0.1:8000/api/applications', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setList(res.data))
        .catch(err => {
            // If session expired or unauthorized, go to login
            if(err.response?.status === 401) {
                navigate('/login');
            }
        });
    };

    // 4. Added useEffect so data loads when the page opens
    useEffect(() => { const role = localStorage.getItem('user_role');
    
    if (role !== 'admin') {
        // If not admin, send them away!
        navigate('/'); 
        return;
    }
        fetchApplications();
    }, []);

    // 5. Added the update function for the buttons
    const handleStatusUpdate = async (id, newStatus) => {
        const token = localStorage.getItem('admin_token');
        try {
            await axios.put(`http://127.0.0.1:8000/api/applications/${id}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchApplications(); // Refresh the table
        } catch (err) {
            console.error("Update failed", err);
        }
    };
const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_role'); // Clean up the role too
    navigate('/login');
};
const [searchTerm, setSearchTerm] = useState('');
const [filterStatus, setFilterStatus] = useState('all');

// This logic filters the list in real-time
const filteredStudents = list.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.massar_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;

    return matchesSearch && matchesFilter;
});
    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Lycée Charif Idrissi - Administration</h2>
                <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                    <span style={{color: '#64748b'}}>{filteredStudents.length} Candidatures</span>
                   <button className="btn-logout" onClick={handleLogout}>
    Déconnexion
</button>
                </div>
            </div>

            {/* --- NEW SEARCH & FILTER SECTION --- */}
            <div className="admin-actions">
                <input 
                    type="text" 
                    placeholder="Rechercher par nom ou Massar..." 
                    className="search-input"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                    className="filter-select"
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente (Pending)</option>
                    <option value="accepted">Acceptés</option>
                    <option value="rejected">Refusés</option>
                </select>
            </div>
            {/* ------------------------------------ */}

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Candidat</th>
                        <th>Massar</th>
                        <th>Note</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {/* We map the FILTERED list now */}
                    {filteredStudents.map(student => (
                        <tr key={student.id}>
                            <td><strong>{student.full_name}</strong></td>
                            <td>{student.massar_code}</td>
                            <td>{student.last_year_grade}/20</td>
                            <td>
                                <span className={`status-badge status-${student.status}`}>
                                    {student.status}
                                </span>
                            </td>
                            <td>
                                <div className="btn-group">
                                    <button className="btn btn-accept" onClick={() => handleStatusUpdate(student.id, 'accepted')}>Accepter</button>
                                    <button className="btn btn-reject" onClick={() => handleStatusUpdate(student.id, 'rejected')}>Refuser</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;