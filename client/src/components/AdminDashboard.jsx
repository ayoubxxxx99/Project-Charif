import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [list, setList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null); // State for Modal
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate();

   const fetchApplications = () => {
    const token = localStorage.getItem('admin_token');
    
    axios.get('http://127.0.0.1:8000/api/applications', {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setList(res.data))
    .catch(err => {
        // If the backend returns 401 (Unauthorized) or 500 (because user doesn't exist)
        // We MUST clear the local storage and kick them out
        console.error("Session invalid, logging out...");
        localStorage.clear(); 
        navigate('/login');
    });
};

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const role = localStorage.getItem('user_role');
        if (!token || role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchApplications();
    }, [navigate]);

    const handleStatusUpdate = async (id, newStatus) => {
        const token = localStorage.getItem('admin_token');
        try {
            await axios.put(`http://127.0.0.1:8000/api/applications/${id}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchApplications();
            setSelectedStudent(null); // Close modal on update
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const calculateMean = (student) => {
        const grades = [
            student.maths, student.physique, student.langue_etrangere,
            student.langue_secondaire, student.histoire_geo, 
            student.education_islamique, student.sport
        ];
        const total = grades.reduce((sum, grade) => sum + parseFloat(grade || 0), 0);
        return (total / grades.length).toFixed(2);
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user_role');
        navigate('/login');
    };

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
                    <span>{filteredStudents.length} Candidatures</span>
                    <button className="btn-logout" onClick={handleLogout}>Déconnexion</button>
                </div>
            </div>

            <div className="admin-actions">
                <input 
                    type="text" 
                    placeholder="Rechercher par nom ou Massar..." 
                    className="search-input"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select className="filter-select" onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="accepted">Acceptés</option>
                    <option value="rejected">Refusés</option>
                </select>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Candidat</th>
                        <th>Massar</th>
                        <th>Moyenne</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.map(student => (
                        <tr key={student.id} onClick={() => setSelectedStudent(student)} className="clickable-row">
                            <td><strong>{student.full_name}</strong></td>
                            <td>{student.massar_code}</td>
                            <td className="mean-highlight">{calculateMean(student)}/20</td>
                            <td><span className={`status-badge status-${student.status}`}>{student.status}</span></td>
                            <td>
                                <div className="btn-group" onClick={(e) => e.stopPropagation()}>
                                    <button className="btn btn-accept" onClick={() => handleStatusUpdate(student.id, 'accepted')}>Accepter</button>
                                    <button className="btn btn-reject" onClick={() => handleStatusUpdate(student.id, 'rejected')}>Refuser</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* --- MODAL FOR DETAILS --- */}
            {selectedStudent && (
                <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Détails des Notes</h3>
                        <div className="modal-grid">
                            <div className="modal-item"><span>Maths:</span> <strong>{selectedStudent.maths}</strong></div>
                            <div className="modal-item"><span>Physique:</span> <strong>{selectedStudent.physique}</strong></div>
                            <div className="modal-item"><span>Français:</span> <strong>{selectedStudent.langue_etrangere}</strong></div>
                            <div className="modal-item"><span>Anglais:</span> <strong>{selectedStudent.langue_secondaire}</strong></div>
                            <div className="modal-item"><span>Hist-Géo:</span> <strong>{selectedStudent.histoire_geo}</strong></div>
                            <div className="modal-item"><span>Islamique:</span> <strong>{selectedStudent.education_islamique}</strong></div>
                            <div className="modal-item"><span>Sport:</span> <strong>{selectedStudent.sport}</strong></div>
                        </div>
                        <div className="modal-footer">
                            <p>Moyenne Générale: <strong>{calculateMean(selectedStudent)}/20</strong></p>
                            <button className="btn-close" onClick={() => setSelectedStudent(null)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;