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
    const [selectedIds, setSelectedIds] = useState([]);
    const [topCount, setTopCount] = useState(0);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const API_URL = 'http://127.0.0.1:8000/api';

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
            setMainListCount(count);
            setOriginalMainListCount(count);
        } catch (err) {
            console.error('Erreur chargement settings:', err);
            setMainListCount(0);
            setOriginalMainListCount(0);
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
        // 🔥 PRÉ-SÉLECTIONNE les N premiers candidats selon mainListCount actuel
        const currentMainIds = acceptedList.slice(0, mainListCount).map(s => s.id);
        setSelectedIds(currentMainIds);
        setTopCount(mainListCount.toString());
    };

    const handleCancel = () => {
        setMainListCount(originalMainListCount);
        setIsEditing(false);
        setSelectedIds([]);
        setTopCount(0);
        setSaveMessage('');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.put(`${API_URL}/settings/main-list-count`,
                { main_list_count: mainListCount },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOriginalMainListCount(mainListCount);
            setSaveMessage('Enregistré');
            setTimeout(() => {
                setSaveMessage('');
                setIsEditing(false);
                setSelectedIds([]);
                setTopCount(0);
            }, 1500);
        } catch (err) {
            setSaveMessage('Erreur');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const exportToExcel = () => {
        const data = acceptedList.map((s, i) => ({
            Rang: i + 1,
            Liste: i < mainListCount ? 'Principale' : 'Attente',
            Nom: s.full_name,
            Massar: s.massar_code,
            Moyenne: calculateMean(s)
        }));
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

    // ── Sélection manuelle par checkbox ──
    const toggleSelect = (id) => {
        if (!isEditing) return;
        setSelectedIds(prev => {
            const newSelection = prev.includes(id) 
                ? prev.filter(item => item !== id) 
                : [...prev, id];
            setMainListCount(newSelection.length);
            return newSelection;
        });
    };

    // ── Sélection par stepper (Top X) ──
    const selectTopX = (count) => {
        if (!isEditing) return;
        if (!count || count <= 0) {
            setSelectedIds([]);
            setMainListCount(0);
            return;
        }
        const topSelection = filteredList.slice(0, count).map(s => s.id);
        setSelectedIds(topSelection);
        setMainListCount(topSelection.length);
    };

    // Détermine si un candidat est en liste principale
    const isInMainList = (studentId) => {
        if (isEditing) {
            return selectedIds.includes(studentId);
        }
        const rankIndex = acceptedList.findIndex(s => s.id === studentId);
        return rankIndex < mainListCount;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="accepted-page-wrapper">
            <div className="accepted-container">

                {/* ── HEADER ── */}
                <header className="accepted-header">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="accepted-brand">
                        <button className="btn-back" onClick={() => navigate('/admin')}>
                            <span>←</span> Dashboard
                        </button>
                        <div className="v-divider" />
                        <div className="header-title-block">
                            <h1>Candidats Acceptés</h1>
                            <span className="accepted-count-badge">{acceptedList.length} admis</span>
                        </div>
                    </motion.div>

                    <div className="header-actions">
                        <button className="btn-convocation-header" onClick={exportToExcel}>
                            <span className="btn-icon">📥</span>
                            Exporter Excel
                        </button>
                        <button className="btn-logout-minimal" onClick={handleLogout}>
                            Quitter <span>→</span>
                        </button>
                    </div>
                </header>

                {/* ── TOOLBAR ── */}
                <div className="accepted-toolbar">

                    {/* GAUCHE : Recherche + Stats Total / P / A */}
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
                                {isEditing ? selectedIds.length : Math.min(mainListCount, acceptedList.length)}
                            </strong>
                        </div>
                        <div className="stat-chip">
                            <span className="stat-dot dot-amber" />
                            <span className="stat-label">A</span>
                            <strong className="stat-value text-amber">
                                {isEditing ? acceptedList.length - selectedIds.length : Math.max(0, acceptedList.length - mainListCount)}
                            </strong>
                        </div>
                    </div>

                    {/* DROITE : Modifier → (Sélection stepper + manuelle + Annuler + Enregistrer) */}
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
                                    {/* Sélection par stepper (Top X) */}
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

                                        {/* Compteur de sélectionnés */}
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

                {/* ── TABLE ── */}
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
                                                setMainListCount(0);
                                                setTopCount('');
                                            } else {
                                                const allIds = filteredList.map(s => s.id);
                                                setSelectedIds(allIds);
                                                setMainListCount(allIds.length);
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
                                <th className="text-right">Verdict</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredList.map((student, index) => {
                                    const isMainList = isInMainList(student.id);

                                    return (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className={`modern-row ${selectedIds.includes(student.id) ? 'row-selected' : ''} ${!isEditing ? 'row-readonly' : ''}`}
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
                                            <td className="rank-col">#{index + 1}</td>
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
            </div>
        </motion.div>
    );
};

export default AcceptedStudents;