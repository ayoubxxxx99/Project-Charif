import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [list, setList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [minMean, setMinMean] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [showAdvancedModal, setShowAdvancedModal] = useState(false);
    const [activeSubjects, setActiveSubjects] = useState([]);
    const [subjectValues, setSubjectValues] = useState({
        maths: '', physique: '', langue_etrangere: '', 
        langue_secondaire: '', histoire_geo: '', 
        education_islamique: '', sport: ''
    });
    const [topCount, setTopCount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [draftChanges, setDraftChanges] = useState({});
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchApplications = () => {
        if (!token) return;
        axios.get('http://127.0.0.1:8000/api/applications', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setList(res.data))
        .catch(err => {
            if (err.response?.status === 401) handleLogout();
        });
    };

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (!token || role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchApplications();
    }, []);

    const getDisplayStatus = (student) => {
        if (draftChanges[student.id] !== undefined) {
            return draftChanges[student.id];
        }
        return student.status;
    };

    const handleStatusUpdate = (id, newStatus) => {
        if (!isEditing) return;
        setDraftChanges(prev => ({ ...prev, [id]: newStatus }));
        setSelectedStudent(null);
    };

    const handleBulkStatusUpdate = (newStatus) => {
        if (!isEditing) return;
        const updates = {};
        selectedIds.forEach(id => {
            updates[id] = newStatus;
        });
        setDraftChanges(prev => ({ ...prev, ...updates }));
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const calculateMean = (student) => {
        if (!student) return "0.00";
        const grades = [
            student.maths, student.physique, student.langue_etrangere,
            student.langue_secondaire, student.histoire_geo, 
            student.education_islamique, student.sport
        ];
        const total = grades.reduce((sum, grade) => sum + parseFloat(grade || 0), 0);
        return (total / grades.length).toFixed(2);
    };

    const toggleSelect = (id) => {
        if (!isEditing) return;
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const selectTopX = (count) => {
        if (!isEditing) return;
        if (!count || count <= 0) {
            setSelectedIds([]);
            return;
        }
        const topSelection = filteredStudents.slice(0, count).map(s => s.id);
        setSelectedIds(topSelection);
    };

    const filteredStudents = list.filter(student => {
        const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              student.massar_code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || getDisplayStatus(student) === filterStatus;
        const studentMean = parseFloat(calculateMean(student));
        const matchesMean = minMean === '' || studentMean >= parseFloat(minMean);

        const matchesSubjects = activeSubjects.every(sub => {
            const threshold = parseFloat(subjectValues[sub]);
            if (isNaN(threshold)) return true;
            return parseFloat(student[sub]) >= threshold;
        });

        return matchesSearch && matchesStatus && matchesMean && matchesSubjects;
    }).sort((a, b) => {
        return parseFloat(calculateMean(b)) - parseFloat(calculateMean(a));
    });

    const handleEdit = () => {
        setIsEditing(true);
        setSaveMessage('');
        setDraftChanges({});
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedIds([]);
        setTopCount(0);
        setSaveMessage('');
        setDraftChanges({});
        fetchApplications();
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const changes = Object.entries(draftChanges);
            if (changes.length > 0) {
                await Promise.all(
                    changes.map(([id, status]) =>
                        axios.put(`http://127.0.0.1:8000/api/applications/${id}/status`,
                            { status },
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                    )
                );
            }
            setSaveMessage('Enregistré');
            setDraftChanges({});
            setSelectedIds([]);
            setTopCount(0);
            setTimeout(() => {
                setSaveMessage('');
                setIsEditing(false);
                fetchApplications();
            }, 1500);
        } catch (err) {
            setSaveMessage('Erreur');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Label lisible pour le statut ──
    const getStatusLabel = (status) => {
        switch (status) {
            case 'accepted': return 'Accepté';
            case 'rejected': return 'Refusé';
            case 'pending':  return 'En attente';
            default:         return status;
        }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-page-wrapper">
            <div className="admin-container full-width">

                <header className="admin-main-header">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="brand">
                        <div className="brand-logo">
                            <span className="logo-accent">LCI</span>
                            <div className="v-divider"></div>
                            <h2>Dashboard Admission</h2>
                        </div>
                        <span className="live-badge">{filteredStudents.length} Dossiers au total</span>
                    </motion.div>

                    <div className="header-actions">
                        <button className="btn-accepted-header" onClick={() => navigate('/admin/accepted')}>
                            <span>✅</span> Candidats Acceptés
                        </button>
                        <button className="btn-logout-minimal" onClick={handleLogout}>
                            Quitter <span>→</span>
                        </button>
                    </div>
                </header>

                {/* ── TOOLBAR ── */}
                <div className="admin-toolbar-v2">
                    <div className="toolbar-left">
                        <div className="search-container">
                            <span className="search-icon">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Rechercher par nom ou Massar..." 
                                className="modern-search-input"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="select-wrapper">
                            <select className="modern-select" onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">Tous les statuts</option>
                                <option value="pending">🟡 En attente</option>
                                <option value="accepted">🟢 Acceptés</option>
                                <option value="rejected">🔴 Refusés</option>
                            </select>
                        </div>
                        <button className="btn-secondary-icon" onClick={() => setShowAdvancedModal(true)}>
                            <span className="icon">⚙️</span> Filtres
                        </button>
                    </div>

                    <div className="toolbar-right">
                        <AnimatePresence mode="wait">
                            {!isEditing ? (
                                <motion.button
                                    key="edit"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="btn-edit"
                                    onClick={handleEdit}
                                >
                                    ✏️ Modifier
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="edit-mode-group"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="edit-mode-toolbar"
                                >
                                    <div className="selection-group-inline">
                                        <span className="selection-label-inline">📋 Sélection</span>
                                        <div className="stepper-frame mini-stepper">
                                            <input 
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                className="stepper-field"
                                                value={topCount}
                                                onChange={(e) => {
                                                    let value = e.target.value;
                                                    if (value.length > 1) value = value.replace(/^0+/, '');
                                                    setTopCount(value);
                                                    selectTopX(parseInt(value) || 0);
                                                }}
                                            />
                                            <div className="stepper-arrows">
                                                <button 
                                                    onClick={() => {
                                                        const current = parseInt(topCount) || 0;
                                                        const newValue = current + 1;
                                                        setTopCount(newValue.toString());
                                                        selectTopX(newValue);
                                                    }} 
                                                    className="arrow-up"
                                                >▲</button>
                                                <button 
                                                    onClick={() => {
                                                        const current = parseInt(topCount) || 0;
                                                        const newValue = Math.max(0, current - 1);
                                                        if (newValue === 0) {
                                                            setTopCount('');
                                                            selectTopX(0);
                                                        } else {
                                                            setTopCount(newValue.toString());
                                                            selectTopX(newValue);
                                                        }
                                                    }} 
                                                    className="arrow-down"
                                                >▼</button>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {selectedIds.length > 0 && (
                                                <motion.div
                                                    className="bulk-btns-inline"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                >
                                                    <span className="bulk-count-inline">{selectedIds.length}</span>
                                                    <button className="btn-bulk-accept mini" onClick={() => handleBulkStatusUpdate('accepted')} title="Accepter">✓</button>
                                                    <button className="btn-bulk-reject mini" onClick={() => handleBulkStatusUpdate('rejected')} title="Refuser">✕</button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="v-divider" />

                                    {saveMessage && (
                                        <span className={`save-msg-inline ${saveMessage === 'Enregistré' ? 'success' : 'error'}`}>
                                            {saveMessage}
                                        </span>
                                    )}
                                    <button className="btn-cancel-edit" onClick={handleCancel} disabled={isSaving}>
                                        Annuler
                                    </button>
                                    <button 
                                        className={`btn-save ${isSaving ? 'saving' : ''}`}
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? '💾 ...' : '💾 Enregistrer'}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── TABLE ── */}
                <div className="table-wrapper-modern">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th width="40">
                                    <input 
                                        type="checkbox" 
                                        className="modern-checkbox"
                                        checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                                        onChange={() => isEditing && setSelectedIds(selectedIds.length === filteredStudents.length ? [] : filteredStudents.map(s => s.id))}
                                        disabled={!isEditing}
                                    />
                                </th>
                                <th>Nom Complet</th>
                                <th>Code Massar</th>
                                <th>Moyenne</th>
                                <th>Statut</th>
                                {/* ── NOUVELLE COLONNE EMAIL ── */}
                                <th>État Email</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredStudents.map((student, index) => {
                                    const displayStatus = getDisplayStatus(student);
                                    const isDraftChanged = draftChanges[student.id] !== undefined;

                                    return (
                                        <motion.tr key={student.id} 
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.03 }}
                                            className={`modern-row ${selectedIds.includes(student.id) ? 'row-selected' : ''} ${!isEditing ? 'row-readonly' : ''} ${isDraftChanged ? 'row-draft' : ''}`}
                                            onClick={() => isEditing && setSelectedStudent(student)}
                                        >
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox" 
                                                    className="modern-checkbox" 
                                                    checked={selectedIds.includes(student.id)} 
                                                    onChange={() => toggleSelect(student.id)} 
                                                    disabled={!isEditing}
                                                />
                                            </td>
                                            <td className="student-name-cell">
                                                <div className="student-cell">
                                                    <div className="student-avatar">{student.full_name.charAt(0)}</div>
                                                    <span>{student.full_name}</span>
                                                </div>
                                            </td>
                                            <td><span className="massar-badge">{student.massar_code}</span></td>
                                            <td>
                                                <span className="mean-text">{calculateMean(student)}</span>{' '}
                                                <small className="text-muted">/ 20</small>
                                            </td>
                                            <td>
                                                <span className={`status-tag tag-${displayStatus} ${isDraftChanged ? 'tag-draft' : ''}`}>
                                                    {getStatusLabel(displayStatus)}
                                                    {isDraftChanged && <span className="draft-indicator">*</span>}
                                                </span>
                                            </td>
                                            {/* ── ÉTAT EMAIL ── */}
                                            <td>
                                                {student.convocation_sent
                                                    ? <span className="email-sent-badge">✅ Envoyé</span>
                                                    : <span className="email-pending-badge">⏳ En attente</span>
                                                }
                                            </td>
                                            <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="action-btns-group">
                                                    <button 
                                                        className={`action-btn accept ${!isEditing ? 'disabled' : ''}`} 
                                                        title={isEditing ? "Accepter" : "Activez le mode édition"}
                                                        onClick={() => handleStatusUpdate(student.id, 'accepted')}
                                                        disabled={!isEditing}
                                                    >✓</button>
                                                    <button 
                                                        className={`action-btn reject ${!isEditing ? 'disabled' : ''}`} 
                                                        title={isEditing ? "Refuser" : "Activez le mode édition"}
                                                        onClick={() => handleStatusUpdate(student.id, 'rejected')}
                                                        disabled={!isEditing}
                                                    >✕</button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* ── MODAL FILTRES AVANCÉS ── */}
                <AnimatePresence>
                    {showAdvancedModal && (
                        <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="modal-overlay" onClick={() => setShowAdvancedModal(false)}>
                            <motion.div variants={modalVariants} className="modal-content filter-modal" onClick={e => e.stopPropagation()}>
                                <div className="modal-header-flex">
                                    <h3>🔍 Paramètres de Filtrage</h3>
                                    <p className="subtitle">Affinez la liste des candidats par critères précis</p>
                                </div>
                                <div className="filter-grid">
                                    <div className="filter-card">
                                        <label className="section-label">Moyenne Générale Minimale</label>
                                        <div className="input-with-icon">
                                            <input type="number" value={minMean} onChange={(e) => setMinMean(e.target.value)} placeholder="0.00" step="0.25" />
                                            <span className="unit-label">/ 20</span>
                                        </div>
                                    </div>
                                    <div className="divider-text">Notes par Matière</div>
                                    <div className="subjects-container">
                                        {Object.keys(subjectValues).map(sub => (
                                            <div key={sub} className={`subject-filter-row ${activeSubjects.includes(sub) ? 'active-row' : ''}`}>
                                                <div className="subject-info">
                                                    <input type="checkbox" className="modern-checkbox" id={sub} checked={activeSubjects.includes(sub)} onChange={() => setActiveSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub])} />
                                                    <label htmlFor={sub} className="subject-label">{sub.replace('_', ' ')}</label>
                                                </div>
                                                {activeSubjects.includes(sub) && (
                                                    <input type="number" value={subjectValues[sub]} className="mini-grade-input" onChange={(e) => setSubjectValues({...subjectValues, [sub]: e.target.value})} placeholder="Min" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer-modern">
                                    <button className="btn-secondary-flat" onClick={() => { setActiveSubjects([]); setMinMean(''); }}>Réinitialiser</button>
                                    <button className="btn-primary-glow" onClick={() => setShowAdvancedModal(false)}>Appliquer</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── MODAL PROFIL ÉTUDIANT ── */}
                <AnimatePresence>
                    {selectedStudent && (
                        <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="modal-overlay" onClick={() => setSelectedStudent(null)}>
                            <motion.div variants={modalVariants} className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
                                <div className="profile-header-new">
                                    <div className="header-info">
                                        <h3>{selectedStudent.full_name}</h3>
                                        <span className="massar-badge">{selectedStudent.massar_code}</span>
                                    </div>
                                    {/* Statut lisible dans le modal */}
                                    <span className={`status-tag tag-${getDisplayStatus(selectedStudent)}`}>
                                        {getStatusLabel(getDisplayStatus(selectedStudent))}
                                    </span>
                                </div>

                                {/* ── ÉTAT EMAIL dans le modal ── */}
                                <div className="profile-email-status">
                                    <span className="profile-email-label">État de la convocation :</span>
                                    {selectedStudent.convocation_sent
                                        ? <span className="email-sent-badge">✅ Email envoyé</span>
                                        : <span className="email-pending-badge">⏳ En attente d'envoi</span>
                                    }
                                </div>

                                <div className="profile-body">
                                    <h4 className="section-title">Relevé de notes</h4>
                                    <div className="grades-grid">
                                        {Object.keys(subjectValues).map(sub => (
                                            <div className="grade-card" key={sub}>
                                                <span className="grade-label">{sub.replace('_', ' ')}</span>
                                                <strong className="grade-value">
                                                    {selectedStudent[sub]} <span className="text-muted">/20</span>
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-footer-modern profile-footer">
                                    <div className="final-score">
                                        <span>Moyenne Générale</span>
                                        <strong className="primary-text">
                                            {calculateMean(selectedStudent)} <small>/ 20</small>
                                        </strong>
                                    </div>
                                    {/* Boutons d'action dans le modal aussi */}
                                    {isEditing && (
                                        <div className="modal-action-btns">
                                            <button
                                                className="btn-modal-accept"
                                                onClick={() => handleStatusUpdate(selectedStudent.id, 'accepted')}
                                            >✓ Accepter</button>
                                            <button
                                                className="btn-modal-reject"
                                                onClick={() => handleStatusUpdate(selectedStudent.id, 'rejected')}
                                            >✕ Refuser</button>
                                            <button
                                                className="btn-modal-pending"
                                                onClick={() => handleStatusUpdate(selectedStudent.id, 'pending')}
                                            >◑ En attente</button>
                                        </div>
                                    )}
                                    <button className="btn-close-modern" onClick={() => setSelectedStudent(null)}>Fermer</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;