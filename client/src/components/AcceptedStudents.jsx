import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import './AcceptedStudents.css';

const AcceptedStudents = () => {
    const [acceptedList, setAcceptedList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [mainListCount, setMainListCount] = useState(0);
    const [originalMainListCount, setOriginalMainListCount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailStudent, setEmailStudent] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [topCount, setTopCount] = useState('');
    const [savedMainListIds, setSavedMainListIds] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const API_URL = 'http://127.0.0.1:8000/api';
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

    const calculateMean = (student) => {
        const grades = [
            student.maths, student.physique, student.langue_etrangere,
            student.langue_secondaire, student.histoire_geo,
            student.education_islamique, student.sport
        ];
        const total = grades.reduce((sum, g) => sum + parseFloat(g || 0), 0);
        return (total / grades.length).toFixed(2);
    };

    const fetchMainListCount = async () => {
        try {
            const res = await axios.get(`${API_URL}/settings/main-list-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const count = res.data.main_list_count ?? 0;
            const ids = res.data.main_list_ids ?? [];
            
            setMainListCount(count);
            setOriginalMainListCount(count);
            setSavedMainListIds(ids);
        } catch (err) {
            console.error('Erreur chargement settings:', err);
            setMainListCount(0);
            setOriginalMainListCount(0);
            setSavedMainListIds([]);
        }
    };

    const fetchAccepted = () => {
        axios.get(`${API_URL}/applications`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const accepted = res.data.filter(app => app.status === 'accepted');
            const sorted = accepted.sort((a, b) => calculateMean(b) - calculateMean(a));
            setAcceptedList(sorted);
        })
        .catch(() => navigate('/login'));
    };

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (!token || role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchMainListCount();
        fetchAccepted();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setSaveMessage('');
        setSelectedIds([...savedMainListIds]);
        setTopCount(savedMainListIds.length > 0 ? savedMainListIds.length.toString() : '');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedIds([]);
        setTopCount('');
        setSaveMessage('');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.put(`${API_URL}/settings/main-list-count`,
                { 
                    main_list_count: selectedIds.length,
                    main_list_ids: selectedIds
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOriginalMainListCount(selectedIds.length);
            setMainListCount(selectedIds.length);
            setSavedMainListIds([...selectedIds]);
            setSaveMessage('Enregistré');
            setTimeout(() => {
                setSaveMessage('');
                setIsEditing(false);
                setSelectedIds([]);
                setTopCount('');
            }, 1500);
        } catch (err) {
            setSaveMessage('Erreur');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const exportToExcel = () => {
        const displayList = getDisplayList();
        
        const data = displayList.map((s, i) => {
            const isMain = isInMainList(s.id);
            return {
                Rang: i + 1,
                Liste: isMain ? 'Principale' : 'Attente',
                Nom: s.full_name,
                Massar: s.massar_code,
                Moyenne: calculateMean(s)
            };
        });
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Admissions");
        XLSX.writeFile(wb, "Rapport_Direction.xlsx");
    };

    const filteredList = acceptedList.filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.massar_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const toggleSelect = (id) => {
        if (!isEditing) return;
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const selectTopX = (count) => {
        if (!isEditing) return;
        if (!count || count <= 0) {
            setSelectedIds([]);
            setTopCount('');
            return;
        }
        const topSelection = filteredList.slice(0, count).map(s => s.id);
        setSelectedIds(topSelection);
        setTopCount(count.toString());
    };

    // Détermine si un candidat est en liste principale
    const isInMainList = (studentId) => {
        if (isEditing) {
            return selectedIds.includes(studentId);
        }
        return savedMainListIds.includes(studentId);
    };

    // 🔥 TRI FINAL : Liste principale d'abord (par moyenne), puis attente (par moyenne)
    const getDisplayList = () => {
        const mainList = [];
        const waitList = [];
        
        // Utilise filteredList ou acceptedList selon s'il y a une recherche
        const sourceList = searchTerm ? filteredList : acceptedList;
        
        sourceList.forEach(student => {
            if (isInMainList(student.id)) {
                mainList.push(student);
            } else {
                waitList.push(student);
            }
        });
        
        // Trie chaque groupe par moyenne décroissante
        const sortByMean = (a, b) => parseFloat(calculateMean(b)) - parseFloat(calculateMean(a));
        mainList.sort(sortByMean);
        waitList.sort(sortByMean);
        
        // Liste principale d'abord, puis attente
        return [...mainList, ...waitList];
    };

    // Récupère le rang dans la liste principale
    const getMainListRank = (studentId) => {
        if (!isInMainList(studentId)) return null;
        const displayList = getDisplayList();
        const mainList = displayList.filter(s => isInMainList(s.id));
        const index = mainList.findIndex(s => s.id === studentId);
        return index !== -1 ? index + 1 : null;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="accepted-page-wrapper">
            <div className="accepted-container">

                <header className="accepted-header">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="accepted-brand">
                        <button className="btn-back" onClick={() => navigate('/admin')}>
                            <span>←</span> Tableau de bord
                        </button>
                        <div className="v-divider" />
                        <div className="header-title-block">
                            <h1>Candidats acceptés</h1>
                            <span className="accepted-count-badge">{acceptedList.length} admis</span>
                        </div>
                    </motion.div>

                    <div className="header-actions">
                        <button className="btn-convocation-header" onClick={exportToExcel}>
                            <span className="btn-icon">📥</span>
                            Exporter vers Excel
                        </button>
                        <button className="btn-logout-minimal" onClick={handleLogout}>
                            Quitter <span>→</span>
                        </button>
                    </div>
                </header>

                <div className="accepted-toolbar">

                    <div className="toolbar-left-group">
                        <div className="search-container">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Rechercher par nom ou Massar..."
                                className="modern-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="v-divider" />

                        <div className="stat-chip">
                            <span className="stat-label">Total</span>
                            <strong className="stat-value">{acceptedList.length}</strong>
                        </div>
                       
                        <div className="stat-chip">
                          <span className="stat-dot dot-green" />
                          <span className="stat-label">P</span>
                          <strong className="stat-value text-green">
                                {isEditing
                                 ? Math.min(selectedIds.length, acceptedList.length)
                                 : Math.min(savedMainListIds.length, acceptedList.length)
                                }
                            </strong>
                         </div>
                         <div className="stat-chip">
                           <span className="stat-dot dot-amber" />
                           <span className="stat-label">A</span>
                           <strong className="stat-value text-amber">
                             {isEditing
                                 ? Math.max(0, acceptedList.length - selectedIds.length)
                                 : Math.max(0, acceptedList.length - savedMainListIds.length)}
                           </strong>
                       </div>
                    </div>

                    <div className="toolbar-right-group">

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
                                                >
                                                    ▲
                                                </button>
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
                                                >
                                                    ▼
                                                </button>
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
                                                    <span className="bulk-count-inline">{selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}</span>
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

                <div className="table-wrapper-modern">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th width="40">
                                    <input 
                                        type="checkbox" 
                                        className="modern-checkbox"
                                        checked={isEditing && selectedIds.length === filteredList.length && filteredList.length > 0}
                                        onChange={() => {
                                            if (!isEditing) return;
                                            if (selectedIds.length === filteredList.length) {
                                                setSelectedIds([]);
                                                setTopCount('');
                                            } else {
                                                const allIds = filteredList.map(s => s.id);
                                                setSelectedIds(allIds);
                                                setTopCount(allIds.length.toString());
                                            }
                                        }}
                                        disabled={!isEditing}
                                    />
                                </th>
                                <th width="60">Rang</th>
                                <th>Candidat</th>
                                <th>Code Massar</th>
                                <th>Moyenne</th>
                                <th>État Email</th>
                                <th className="text-right">Décision</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {getDisplayList().map((student, index) => {
                                    const isMainList = isInMainList(student.id);
                                    const mainRank = getMainListRank(student.id);

                                    return (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className={`modern-row ${selectedIds.includes(student.id) ? 'row-selected' : ''} ${!isEditing ? 'row-readonly' : ''} ${isMainList ? 'row-main-list' : 'row-wait-list'}`}
                                            onClick={() => isEditing && toggleSelect(student.id)}
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
                                            <td className="rank-col">
                                                {isMainList ? (
                                                    <span className="main-rank-badge">#{mainRank}</span>
                                                ) : (
                                                    <span className="wait-rank">#{index + 1}</span>
                                                )}
                                            </td>
                                            <td className="student-name-cell">
                                                <div className="student-cell">
                                                    <div className="student-avatar">{student.full_name.charAt(0)}</div>
                                                    <span>{student.full_name}</span>
                                                </div>
                                            </td>
                                            <td><span className="massar-badge">{student.massar_code}</span></td>
                                            <td>
                                              <span className="mean-text">{calculateMean(student)}</span>
                                              <small className="text-muted">/ 20</small>
                                            </td>
                                              {/* ── ÉTAT EMAIL ── */}
                                            <td onClick={(e) => { e.stopPropagation(); setEmailStudent(student); setShowEmailModal(true); }} style={{ cursor: 'pointer' }}>
                                              {
                                              student.convocation_sent
                                              ? <span className="email-sent-badge">✅ Envoyé</span>
                                              : <span className="email-pending-badge">⏳ En attente</span>
                                              }
                                            </td>
                                            <td className="text-right">
                                                <span className={`status-tag ${isMainList ? 'tag-accepted' : 'tag-rejected'}`}>
                                                    {isMainList ? 'PRINCIPALE' : 'ATTENTE'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
             {/* ── MODAL ÉTAT EMAIL ── */}
<AnimatePresence>
    {showEmailModal && emailStudent && (
        <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="modal-overlay" onClick={() => setShowEmailModal(false)}>
            <motion.div variants={modalVariants} className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
                <div className="profile-header-new">
                    <div className="header-info">
                        <h3>{emailStudent.full_name}</h3>
                        <span className="massar-badge">{emailStudent.massar_code}</span>
                    </div>
                    <span className={`status-tag ${isInMainList(emailStudent.id) ? 'tag-accepted' : 'tag-rejected'}`}>
                        {isInMainList(emailStudent.id) ? 'PRINCIPALE' : 'ATTENTE'}
                    </span>
                </div>
                <div className="profile-email-status">
                    <span className="profile-email-label">État de la convocation :</span>
                    {emailStudent.convocation_sent
                        ? <span className="email-sent-badge">✅ Email envoyé</span>
                        : <span className="email-pending-badge">⏳ En attente d'envoi</span>
                    }
                </div>
                <div className="profile-body">
                    <h4 className="section-title">Relevé de notes</h4>
                    <div className="grades-grid">
                        {['maths', 'physique', 'langue_etrangere', 'langue_secondaire', 'histoire_geo', 'education_islamique', 'sport'].map(sub => (
                            <div className="grade-card" key={sub}>
                                <span className="grade-label">{sub.replace('_', ' ')}</span>
                                <strong className="grade-value">
                                    {emailStudent[sub]} <span className="text-muted">/20</span>
                                </strong>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer-modern profile-footer">
                    <div className="final-score">
                        <span>Moyenne Générale</span>
                        <strong className="primary-text">
                            {calculateMean(emailStudent)} <small>/ 20</small>
                        </strong>
                    </div>
                    <button className="btn-close-modern" onClick={() => setShowEmailModal(false)}>Fermer</button>
                </div>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>   
            </div>
        </motion.div>
    );
};

export default AcceptedStudents;