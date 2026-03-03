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
    const [selectedIds, setSelectedIds] = useState([]);
const [showAdvancedModal, setShowAdvancedModal] = useState(false);
const [activeSubjects, setActiveSubjects] = useState([]); // Stores names of subjects being filtered
const [subjectValues, setSubjectValues] = useState({
    maths: '', physique: '', langue_etrangere: '', 
    langue_secondaire: '', histoire_geo: '', 
    education_islamique: '', sport: ''
});

// Toggle individual student
const toggleSelect = (id) => {
    setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
};

// Select or Deselect all visible students
const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
        setSelectedIds([]);
    } else {
        setSelectedIds(filteredStudents.map(s => s.id));
    }
};
const handleBulkUpdate = async (newStatus) => {
    const token = localStorage.getItem('admin_token');
    if (selectedIds.length === 0) return;

    try {
        // We'll update our backend route to handle multiple IDs
        await axios.put(`http://127.0.0.1:8000/api/applications/bulk-status`, 
            { ids: selectedIds, status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        alert(`${selectedIds.length} candidatures mises à jour !`);
        setSelectedIds([]); // Clear selection
        fetchApplications(); // Refresh list
    } catch (err) {
        console.error("Bulk update failed", err);
    }
};
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
   // ... (rest of your component above)

    return (
    <div className="admin-page-wrapper">
        <div className="admin-container full-width">
            {/* TOP HEADER */}
            <header className="admin-main-header">
                <div className="brand">
                    <h2>Lycée Charif Idrissi</h2>
                    <span className="badge-count">{filteredStudents.length} Candidatures</span>
                </div>
                <div className="header-actions">
                    <button className="btn-logout" onClick={handleLogout}>Déconnexion</button>
                </div>
            </header>

            {/* SEARCH & ACTION BAR */}
            <div className="admin-toolbar">
                <div className="search-group">
                    <input 
                        type="text" 
                        placeholder="Rechercher un nom ou code Massar..." 
                        className="search-input-large"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select className="filter-select-styled" onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Tous les statuts</option>
                        <option value="pending">🟡 En attente</option>
                        <option value="accepted">🟢 Acceptés</option>
                        <option value="rejected">🔴 Refusés</option>
                    </select>
                </div>

                <div className="action-group">
                    <button className="btn-outline" onClick={() => setShowAdvancedModal(true)}>
                        <span className="icon">🔍</span> Filtres Avancés
                    </button>
                    <button className="btn-primary-glow" onClick={() => navigate('/admin/accepted')}>
                        <span className="icon">📅</span> Gérer les Convocations
                    </button>
                </div>
            </div>

            {/* BULK TOOLBAR */}
            {selectedIds.length > 0 && (
                <div className="bulk-floating-bar">
                    <p><strong>{selectedIds.length}</strong> sélectionnés</p>
                    <div className="bulk-btn-set">
                        <button className="btn-bulk-accept" onClick={() => handleBulkUpdate('accepted')}>Accepter</button>
                        <button className="btn-bulk-reject" onClick={() => handleBulkUpdate('rejected')}>Refuser</button>
                        <button className="btn-link" onClick={() => setSelectedIds([])}>Annuler</button>
                    </div>
                </div>
            )}

            {/* MAIN TABLE */}
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th className="checkbox-col">
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0} 
                                    onChange={toggleSelectAll} 
                                />
                            </th>
                            <th>Candidat</th>
                            <th>Code Massar</th>
                            <th>Moyenne</th>
                            <th>Statut</th>
                            <th className="actions-col">Décision Rapide</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => (
                            <tr 
                                key={student.id} 
                                onClick={() => setSelectedStudent(student)} 
                                className={`clickable-row ${selectedIds.includes(student.id) ? 'row-selected' : ''}`}
                            >
                                <td onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(student.id)} 
                                        onChange={() => toggleSelect(student.id)} 
                                    />
                                </td>
                                <td>
                                    <div className="student-info">
                                        <span className="student-name">{student.full_name}</span>
                                    </div>
                                </td>
                                <td><code>{student.massar_code}</code></td>
                                <td><span className="mean-pill">{calculateMean(student)}</span></td>
                                <td><span className={`status-pill pill-${student.status}`}>{student.status}</span></td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <div className="row-actions">
                                        <button className="mini-btn accept" onClick={() => handleStatusUpdate(student.id, 'accepted')}>✓</button>
                                        <button className="mini-btn reject" onClick={() => handleStatusUpdate(student.id, 'rejected')}>✕</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL 1: STUDENT DETAILS --- */}
            {selectedStudent && (
                <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-section">
                            <h3>Détails : {selectedStudent.full_name}</h3>
                            <span className="massar-tag">{selectedStudent.massar_code}</span>
                        </div>
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
                            <p className="mean-total">Moyenne: <strong>{calculateMean(selectedStudent)}/20</strong></p>
                            <button className="btn-close" onClick={() => setSelectedStudent(null)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: ADVANCED FILTERS --- */}
            {showAdvancedModal && (
                <div className="modal-overlay" onClick={() => setShowAdvancedModal(false)}>
                    <div className="modal-content filter-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-section">
                            <h3>Filtres Académiques</h3>
                            <button className="btn-close-icon" onClick={() => setShowAdvancedModal(false)}>✕</button>
                        </div>
                        
                        <div className="filter-body">
                            <div className="filter-section-main">
                                <label>Moyenne Générale Minimale</label>
                                <input type="number" value={minMean} onChange={(e) => setMinMean(e.target.value)} placeholder="Ex: 14.5" className="modal-input-styled" />
                            </div>
                            
                            <div className="filter-grid-layout">
                                {Object.keys(subjectValues).map(sub => (
                                    <div key={sub} className={`filter-card ${activeSubjects.includes(sub) ? 'active' : ''}`}>
                                        <label className="checkbox-container">
                                            <input 
                                                type="checkbox" 
                                                checked={activeSubjects.includes(sub)}
                                                onChange={() => activeSubjects.includes(sub) ? setActiveSubjects(activeSubjects.filter(s => s !== sub)) : setActiveSubjects([...activeSubjects, sub])}
                                            />
                                            <span className="capitalize">{sub.replace('_', ' ')}</span>
                                        </label>
                                        {activeSubjects.includes(sub) && (
                                            <input type="number" placeholder="Min" value={subjectValues[sub]} onChange={(e) => setSubjectValues({...subjectValues, [sub]: e.target.value})} className="inline-input-styled" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer-actions">
                            <button className="btn-reset" onClick={() => {setActiveSubjects([]); setMinMean('');}}>Tout Réinitialiser</button>
                            <button className="btn-primary-apply" onClick={() => setShowAdvancedModal(false)}>Appliquer les Filtres</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};

export default AdminDashboard;