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
    const [minMean, setMinMean] = useState('');
const [showAdvancedModal, setShowAdvancedModal] = useState(false);
const [activeSubjects, setActiveSubjects] = useState([]); // Stores names of subjects being filtered
const [subjectValues, setSubjectValues] = useState({
    maths: '', physique: '', langue_etrangere: '', 
    langue_secondaire: '', histoire_geo: '', 
    education_islamique: '', sport: ''
});
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
    if (!student) return "0.00"; // Safety check
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
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    // Mean Filter
    const studentMean = parseFloat(calculateMean(student));
    const matchesMean = minMean === '' || studentMean >= parseFloat(minMean);

    // Dynamic Subject Filters: Check only subjects in the activeSubjects array
    const matchesSubjects = activeSubjects.every(sub => {
        const threshold = parseFloat(subjectValues[sub]);
        if (isNaN(threshold)) return true; // If no value set, don't filter out
        return parseFloat(student[sub]) >= threshold;
    });

    return matchesSearch && matchesStatus && matchesMean && matchesSubjects;
});
    
console.log("Current Selected Student Data:", selectedStudent);
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
                <button className="btn-advanced" onClick={() => setShowAdvancedModal(true)}>
    🔍 Filtres Académiques Avancés
</button>
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
            {/* --- ADVANCED FILTER MODAL --- */}
{showAdvancedModal && (
    <div className="modal-overlay" onClick={() => setShowAdvancedModal(false)}>
        <div className="modal-content filter-modal" onClick={e => e.stopPropagation()}>
            <h3>Filtres Académiques Avancés</h3>
            <p className="modal-subtitle">Ciblez les profils spécifiques</p>
            
            <div className="filter-section-main">
                <label>Moyenne Générale Minimale:</label>
                <input 
                    type="number" 
                    placeholder="ex: 15.5" 
                    value={minMean} 
                    onChange={(e) => setMinMean(e.target.value)}
                    className="full-width-input"
                />
            </div>

            <div className="filter-grid-layout">
                {Object.keys(subjectValues).map(sub => (
                    <div key={sub} className={`filter-card ${activeSubjects.includes(sub) ? 'active' : ''}`}>
                        <label className="checkbox-container">
                            <input 
                                type="checkbox" 
                                checked={activeSubjects.includes(sub)}
                                onChange={() => {
                                    activeSubjects.includes(sub) 
                                    ? setActiveSubjects(activeSubjects.filter(s => s !== sub))
                                    : setActiveSubjects([...activeSubjects, sub])
                                }}
                            />
                            <span className="capitalize">{sub.replace('_', ' ')}</span>
                        </label>
                        {activeSubjects.includes(sub) && (
                            <input 
                                type="number" 
                                placeholder="Min" 
                                value={subjectValues[sub]}
                                onChange={(e) => setSubjectValues({...subjectValues, [sub]: e.target.value})}
                                className="inline-input"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="modal-footer">
                <button className="btn-reset" onClick={() => {setActiveSubjects([]); setMinMean(''); setSubjectValues({maths:'', physique:'', langue_etrangere:'', langue_secondaire:'', histoire_geo:'', education_islamique:'', sport:''})}}>
                    Réinitialiser
                </button>
                <button className="btn-primary" onClick={() => setShowAdvancedModal(false)}>
                    Voir les {filteredStudents.length} résultats
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default AdminDashboard;