import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './SecretaryDashboard.css';

const SecretaryDashboard = () => {
    const [acceptedList, setAcceptedList] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [mainListCount, setMainListCount] = useState(0);
    const [savedMainListIds, setSavedMainListIds] = useState([]);
    const [quota, setQuota] = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [sent, setSent] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // ── Notification system ──
    const [showChangesPanel, setShowChangesPanel] = useState(false);
    const [changeLog, setChangeLog] = useState([]);
    const [unseenCount, setUnseenCount] = useState(0);
    const [searchNotif, setSearchNotif] = useState('');

    const navigate = useNavigate();

    const mainListCountRef = useRef(0);
    const acceptedListRef = useRef([]);
    const savedMainListIdsRef = useRef([]);
    const token = localStorage.getItem('token');

    const timeSlots = [];
    for (let h = 8; h <= 17; h++) {
        timeSlots.push(`${h < 10 ? '0' + h : h}:00`);
        timeSlots.push(`${h < 10 ? '0' + h : h}:30`);
    }

    const calculateMean = (student) => {
        const grades = [
            student.maths, student.physique, student.langue_etrangere,
            student.langue_secondaire, student.histoire_geo,
            student.education_islamique, student.sport
        ];
        const total = grades.reduce((sum, g) => sum + parseFloat(g || 0), 0);
        return (total / grades.length).toFixed(2);
    };

    
    const fetchMainListCount = useCallback(async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/settings/main-list-count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newCount = res.data.main_list_count ?? 0;
            const newIds = res.data.main_list_ids ?? [];

            mainListCountRef.current = newCount;
            savedMainListIdsRef.current = newIds;
            setMainListCount(newCount);
            setSavedMainListIds(newIds);
        } catch (err) {
            console.error('Erreur chargement settings:', err);
        }
    }, [token]);

    
    const fetchAccepted = useCallback(async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/applications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const accepted = res.data.filter(app => app.status === 'accepted');
            const sorted = accepted.sort((a, b) => calculateMean(b) - calculateMean(a));

            acceptedListRef.current = sorted;
            setAcceptedList(sorted);
        } catch (err) {
            navigate('/login');
        }
    }, [token, navigate]);

    
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/notification-logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const logs = res.data;
            setChangeLog(logs);
            setUnseenCount(logs.filter(l => !l.checked).length);
        } catch (err) {
            console.error('Erreur chargement notifications:', err);
        }
    }, [token]);

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (!token || role !== 'secretary') {
            navigate('/login');
            return;
        }
        fetchMainListCount();
        fetchAccepted();
        fetchNotifications();
    }, []);

    
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMainListCount();
            fetchAccepted();
            fetchNotifications();
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchMainListCount, fetchAccepted, fetchNotifications]);

    const getDisplayList = () => {
        const sourceList = searchTerm 
            ? acceptedList.filter(s =>
                s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.massar_code.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : acceptedList;

        const mainList = [];
        const waitList = [];

        sourceList.forEach(student => {
            if (savedMainListIds.includes(student.id)) {
                mainList.push(student);
            } else {
                waitList.push(student);
            }
        });

        const sortByMean = (a, b) => parseFloat(calculateMean(b)) - parseFloat(calculateMean(a));
        mainList.sort(sortByMean);
        waitList.sort(sortByMean);

        return [...mainList, ...waitList];
    };

    const isInMainList = (studentId) => savedMainListIds.includes(studentId);

    const getMainListRank = (studentId) => {
        if (!isInMainList(studentId)) return null;
        const displayList = getDisplayList();
        const mainList = displayList.filter(s => isInMainList(s.id));
        const index = mainList.findIndex(s => s.id === studentId);
        return index !== -1 ? index + 1 : null;
    };

    const handleEdit = () => {
        setIsEditing(true);
        setSelectedIds([]);
        setQuota('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedIds([]);
        setQuota('');
    };

    const handleQuotaChange = (value) => {
        const nb = parseInt(value) || 0;
        setQuota(nb === 0 ? '' : nb);
        const displayList = getDisplayList();
        const pending = displayList.filter(s => !s.convocation_sent);
        const toSelect = pending.slice(0, nb).map(s => s.id);
        setSelectedIds(toSelect);
    };

    const toggleSelect = (id) => {
        if (!isEditing) return;
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (!isEditing) return;
        const displayList = getDisplayList();
        const pendingIds = displayList.filter(s => !s.convocation_sent).map(s => s.id);
        setSelectedIds(selectedIds.length === pendingIds.length ? [] : pendingIds);
    };

    const handleSave = () => {
        if (selectedIds.length === 0) return;
        setShowScheduleModal(true);
    };

    const handleSendConvocations = async () => {
        if (!appointmentDate || !appointmentTime) return;
        setIsSending(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/applications/send-convocations', {
                ids: selectedIds,
                date: appointmentDate,
                time: appointmentTime
            }, { headers: { Authorization: `Bearer ${token}` } });

            setSent(true);
            setTimeout(() => {
                setShowScheduleModal(false);
                setSelectedIds([]);
                setQuota('');
                setSent(false);
                setAppointmentDate('');
                setAppointmentTime('');
                setIsEditing(false);
                fetchAccepted();
            }, 1800);
        } catch (err) {
            alert("Erreur lors de l'envoi");
        } finally {
            setIsSending(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    
    const handleOpenChanges = () => {
        setShowChangesPanel(true);
    };

    const toggleCheckChange = async (changeId) => {
        try {
            const res = await axios.put(`http://127.0.0.1:8000/api/notification-logs/${changeId}/check`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setChangeLog(prev => prev.map(entry => 
                entry.id == changeId ? { ...entry, checked: res.data.checked } : entry
            ));
            
            setUnseenCount(prev => {
                const entry = changeLog.find(e => e.id == changeId);
                if (!entry) return prev;
                if (entry.checked && !res.data.checked) return prev + 1;
                if (!entry.checked && res.data.checked) return Math.max(0, prev - 1);
                return prev;
            });
        } catch (err) {
            console.error('Erreur toggle check:', err);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm('Vider tout l\'historique ? Cette action est irréversible.')) return;
        try {
            await axios.delete('http://127.0.0.1:8000/api/notification-logs/clear', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChangeLog([]);
            setUnseenCount(0);
        } catch (err) {
            console.error('Erreur clear history:', err);
        }
    };

    const filteredNotifications = changeLog.filter(entry => 
        !searchNotif || 
        (entry.student_name && entry.student_name.toLowerCase().includes(searchNotif.toLowerCase()))
    );

    const getChangeIcon = (type) => {
        switch (type) {
            case 'added': return '✅';
            case 'removed': return '❌';
            case 'to_main': return '🟢';
            case 'to_wait': return '🟡';
            case 'convocation': return '📧';
            case 'quota': return '⚙️';
            default: return '🔔';
        }
    };

    const getChangeColor = (type) => {
        switch (type) {
            case 'added': return '#10b981';
            case 'removed': return '#ef4444';
            case 'to_main': return '#10b981';
            case 'to_wait': return '#f59e0b';
            case 'convocation': return '#3b82f6';
            case 'quota': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const formatTimestamp = (ts) => {
        const d = new Date(ts);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.96, y: 24 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
        exit: { opacity: 0, scale: 0.96, y: 24, transition: { duration: 0.2 } }
    };

    const displayList = getDisplayList();
    const pendingIds = displayList.filter(s => !s.convocation_sent).map(s => s.id);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="secretary-page-wrapper">
            <div className="secretary-container">

                {/* ── HEADER ── */}
                <header className="secretary-header">
                    <div className="secretary-brand">
                        <button className="btn-back" onClick={handleLogout}>Déconnexion</button>
                        <div className="v-divider" />
                        <div className="header-title-block">
                            <h1>Convocation des admis</h1>
                            <span className="count-badge">{acceptedList.length} au total</span>
                        </div>
                    </div>

                    <div className="header-right-group">
                        <motion.button
                            className="btn-notif"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={handleOpenChanges}
                        >
                            🔔 Modifications
                            {unseenCount > 0 && (
                                <motion.span className="notif-badge" key={unseenCount} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>
                                    {unseenCount}
                                </motion.span>
                            )}
                            {changeLog.length > 0 && (
                                <span className="notif-count">{changeLog.length}</span>
                            )}
                        </motion.button>
                    </div>
                </header>

                {/* ── TOOLBAR ── */}
                <div className="secretary-toolbar">
                    <div className="toolbar-left">
                        <div className="search-container">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Rechercher par nom ou Massar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="v-divider" />

                        <div className="stat-chip">
                            <span className="stat-dot dot-green" />
                            <span className="stat-label">P</span>
                            <strong className="stat-value text-green">{savedMainListIds.length}</strong>
                        </div>
                        <div className="stat-chip">
                            <span className="stat-dot dot-amber" />
                            <span className="stat-label">A</span>
                            <strong className="stat-value text-amber">{Math.max(0, acceptedList.length - savedMainListIds.length)}</strong>
                        </div>
                    </div>

                    <div className="toolbar-right">
                        <AnimatePresence mode="wait">
                            {!isEditing ? (
                                <motion.button
                                    key="edit-btn"
                                    className="btn-edit"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={handleEdit}
                                >
                                    ✏️ Modifier
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="edit-mode-bar"
                                    className="edit-mode-toolbar"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <div className="selection-group">
                                        <span className="group-label">Sélectionner :</span>
                                        <div className="stepper-frame">
                                            <input 
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                className="stepper-field"
                                                value={quota}
                                                onChange={(e) => {
                                                    let value = e.target.value;
                                                    if (value.length > 1) value = value.replace(/^0+/, '');
                                                    handleQuotaChange(value);
                                                }}
                                            />
                                            <div className="stepper-arrows">
                                                <button onClick={() => handleQuotaChange((parseInt(quota) || 0) + 1)} className="arrow-up">▲</button>
                                                <button onClick={() => handleQuotaChange(Math.max(0, (parseInt(quota) || 0) - 1))} className="arrow-down">▼</button>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedIds.length > 0 && (
                                        <span className="selected-count-inline">
                                            <strong>{selectedIds.length}</strong> sélectionné{selectedIds.length > 1 ? 's' : ''}
                                        </span>
                                    )}

                                    <div className="v-divider" />

                                    <button 
                                        className="btn-save"
                                        onClick={handleSave}
                                        disabled={selectedIds.length === 0}
                                    >
                                        Programmer l'envoi
                                    </button>

                                    <button className="btn-cancel-edit" onClick={handleCancel}>
                                        Annuler
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── TABLE ── */}
                <div className="table-wrapper">
                    <table className="secretary-table">
                        <thead>
                            <tr>
                                <th width="48">
                                    <input 
                                        type="checkbox"
                                        className="modern-checkbox"
                                        checked={isEditing && selectedIds.length === pendingIds.length && pendingIds.length > 0}
                                        onChange={toggleSelectAll}
                                        disabled={!isEditing}
                                    />
                                </th>
                                <th width="60">Rang</th>
                                <th>Candidat</th>
                                <th>Massar</th>
                                <th>Moyenne</th>
                                <th className="text-right">Type Liste</th>
                                <th className="text-right">État Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {displayList.map((student, index) => {
                                    const isMainList = isInMainList(student.id);
                                    const mainRank = getMainListRank(student.id);
                                    const isSelected = selectedIds.includes(student.id);
                                    const canSelect = isEditing && !student.convocation_sent;

                                    return (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className={`secretary-row 
                                                ${isSelected ? 'row-selected' : ''} 
                                                ${isMainList ? 'row-priority' : 'row-waiting'}
                                                ${!isEditing ? 'row-readonly' : ''}
                                                ${student.convocation_sent ? 'row-sent' : ''}
                                            `}
                                            onClick={() => canSelect && toggleSelect(student.id)}
                                        >
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox" 
                                                    className="modern-checkbox" 
                                                    checked={isSelected} 
                                                    onChange={() => toggleSelect(student.id)} 
                                                    disabled={!canSelect}
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
                                                    <span className="student-name">{student.full_name}</span>
                                                </div>
                                            </td>
                                            <td><span className="massar-badge">{student.massar_code}</span></td>
                                            <td>
                                                <span className="mean-text">{calculateMean(student)}</span>
                                                <span className="text-muted">/ 20</span>
                                            </td>
                                            <td className="text-right">
                                                <span className={`status-tag ${isMainList ? 'tag-accepted' : 'tag-rejected'}`}>
                                                    {isMainList ? 'PRINCIPALE' : 'ATTENTE'}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                {student.convocation_sent
                                                    ? <span className="email-sent">✅ Envoyé</span>
                                                    : <span className="email-pending">⏳ En attente</span>
                                                }
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* ── SCHEDULE MODAL ── */}
                <AnimatePresence>
                    {showScheduleModal && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSending && setShowScheduleModal(false)}
                        >
                            <motion.div
                                variants={modalVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="schedule-modal"
                                onClick={e => e.stopPropagation()}
                            >
                                {sent ? (
                                    <div className="sent-success">
                                        <div className="success-icon">✓</div>
                                        <h3>Convocations envoyées !</h3>
                                    </div>
                                ) : (
                                    <>
                                        <div className="modal-sidebar">
                                            <p className="sidebar-title">Heure du rendez-vous</p>
                                            <div className="time-grid">
                                                {timeSlots.map(slot => (
                                                    <button
                                                        key={slot}
                                                        className={`time-slot-btn ${appointmentTime === slot ? 'active' : ''}`}
                                                        onClick={() => setAppointmentTime(slot)}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="modal-main">
                                            <div className="modal-main-header">
                                                <h3>Envoi des Emails</h3>
                                                <p className="modal-subtitle">
                                                    <span className="pill-count">{selectedIds.length}</span>
                                                    candidats à convoquer
                                                </p>
                                            </div>

                                            <div className="date-section">
                                                <label className="field-label">Choisir la date</label>
                                                <input
                                                    type="date"
                                                    className="date-input"
                                                    value={appointmentDate}
                                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                                />
                                            </div>

                                            {appointmentTime && (
                                                <div className="selected-time-preview">
                                                    🕐 Heure sélectionnée : <strong>{appointmentTime}</strong>
                                                </div>
                                            )}

                                            <div className="modal-footer">
                                                <button
                                                    className="btn-cancel"
                                                    onClick={() => setShowScheduleModal(false)}
                                                    disabled={isSending}
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    className="btn-confirm"
                                                    onClick={handleSendConvocations}
                                                    disabled={!appointmentDate || !appointmentTime || isSending}
                                                >
                                                    {isSending ? "Envoi..." : "Confirmer l'envoi"}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── CHANGES PANEL ── */}
                <AnimatePresence>
                    {showChangesPanel && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowChangesPanel(false)}
                        >
                            <motion.div
                                className="changes-panel"
                                initial={{ opacity: 0, x: 80, scale: 0.97 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 80, scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                onClick={e => e.stopPropagation()}
                            >
                                {/*  Bouton 🗑️ ajouté dans le header */}
                                <div className="changes-panel-header">
                                    <div>
                                        <h3>📋 Historique des modifications</h3>
                                        <p className="changes-subtitle">
                                            {changeLog.filter(c => !c.checked).length} non lus{changeLog.filter(c => !c.checked).length > 1 ? 's' : ''} / {changeLog.length} total
                                        </p>
                                    </div>
                                    <div className="header-actions">
                                        <button 
                                            className="btn-clear-history" 
                                            onClick={handleClearHistory}
                                            title="Vider l'historique"
                                        >
                                            🗑️
                                        </button>
                                        <button className="btn-close-panel" onClick={() => setShowChangesPanel(false)}>✕</button>
                                    </div>
                                </div>

                                <div className="changes-search">
                                    <span className="changes-search-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="changes-search-input"
                                        placeholder="Rechercher par nom du candidat..."
                                        value={searchNotif}
                                        onChange={(e) => setSearchNotif(e.target.value)}
                                    />
                                </div>

                                <div className="changes-list">
                                    {filteredNotifications.length === 0 ? (
                                        <div className="changes-empty">
                                            {searchNotif ? 'Aucun résultat trouvé' : 'Aucune modification détectée'}
                                        </div>
                                    ) : (
                                        filteredNotifications.map((entry, i) => (
                                            <motion.div
                                                key={entry.id}
                                                className={`change-entry ${entry.checked ? 'change-checked' : ''}`}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                style={{ borderLeftColor: getChangeColor(entry.type) }}
                                            >
                                                <label className="change-check-label">
                                                    <input
                                                        type="checkbox"
                                                        className="change-checkbox"
                                                        checked={entry.checked}
                                                        onChange={() => toggleCheckChange(entry.id)}
                                                    />
                                                    <span className="check-custom"></span>
                                                </label>

                                                <div className="change-icon" style={{ backgroundColor: getChangeColor(entry.type) + '20', color: getChangeColor(entry.type) }}>
                                                    {getChangeIcon(entry.type)}
                                                </div>
                                                <div className="change-body">
                                                    {entry.student_name && (
                                                        <strong className="change-name">{entry.student_name}</strong>
                                                    )}
                                                    <p className="change-detail">{entry.detail}</p>
                                                    <span className="change-time">
                                                        {formatTimestamp(entry.created_at || entry.timestamp)}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default SecretaryDashboard;