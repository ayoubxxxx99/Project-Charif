import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './SecretaryDashboard.css';

const SecretaryDashboard = () => {
    const [acceptedList, setAcceptedList] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [mainListCount, setMainListCount] = useState(0);
    const [quota, setQuota] = useState(0);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [sent, setSent] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const [hasNewData, setHasNewData] = useState(false);
    const navigate = useNavigate();

    // 🔥 REF pour éviter le problème de closure stale
    const mainListCountRef = useRef(0);
    const acceptedListRef = useRef([]);

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

    // 🔥 CHARGER mainListCount depuis le backend
    const fetchMainListCount = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/settings/main-list-count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newCount = res.data.main_list_count;
            const prevCount = mainListCountRef.current;

            // 🔥 Détecter si la valeur a changé (comparer avec la ref, pas le state)
            if (newCount !== prevCount && prevCount !== 0) {
                setHasNewData(true);
                setTimeout(() => setHasNewData(false), 3000);
            }

            mainListCountRef.current = newCount;
            setMainListCount(newCount);
        } catch (err) {
            console.error('Erreur chargement settings:', err);
        }
    };

    // 🔥 CHARGER la liste des acceptés
    const fetchAccepted = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/applications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const accepted = res.data.filter(app => app.status === 'accepted');
            const sorted = accepted.sort((a, b) => calculateMean(b) - calculateMean(a));
            
            // 🔥 Détecter si la liste a changé
            const prevList = acceptedListRef.current;
            if (prevList.length > 0 && JSON.stringify(prevList.map(s => s.id)) !== JSON.stringify(sorted.map(s => s.id))) {
                setHasNewData(true);
                setTimeout(() => setHasNewData(false), 3000);
            }

            acceptedListRef.current = sorted;
            setAcceptedList(sorted);
            setLastUpdate(Date.now());
        } catch (err) {
            navigate('/login');
        }
    };

    // Chargement initial
    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (!token || role !== 'secretary') {
            navigate('/login');
            return;
        }
        fetchMainListCount();
        fetchAccepted();
    }, []);

    // 🔥 POLLING : Vérifier les changements toutes les 5 secondes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMainListCount();
            fetchAccepted();
        }, 5000);

        return () => clearInterval(interval);
    }, []); // ← PAS de dépendances ! L'interval reste stable

    const handleQuotaChange = (value) => {
        const nb = parseInt(value) || 0;
        setQuota(nb);
        const mainListStudents = filteredList.filter((s) => {
            const rankIndex = acceptedList.findIndex(st => st.id === s.id);
            return rankIndex < mainListCount;
        });
        const toSelect = mainListStudents.slice(0, nb).map(s => s.id);
        setSelectedIds(toSelect);
    };

    const filteredList = acceptedList.filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.massar_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        setSelectedIds(selectedIds.length === filteredList.length ? [] : filteredList.map(s => s.id));
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
                setQuota(0);
                setSent(false);
                setAppointmentDate('');
                setAppointmentTime('');
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

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.96, y: 24 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
        exit: { opacity: 0, scale: 0.96, y: 24, transition: { duration: 0.2 } }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="secretary-page-wrapper">
            <div className="secretary-container">

                <header className="secretary-header">
                    <div className="secretary-brand">
                        <button className="btn-back" onClick={handleLogout}>
                            Déconnexion
                        </button>
                        <div className="v-divider" />
                        <div className="header-title-block">
                            <h1>Convocation des Admis</h1>
                            <span className="count-badge">{acceptedList.length} au total</span>
                        </div>
                    </div>

                    <AnimatePresence>
                        {hasNewData && (
                            <motion.div
                                className="update-notification"
                                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            >
                                🔄 Liste mise à jour !
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.button
                                className="btn-convocation"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => setShowScheduleModal(true)}
                            >
                                Programmer une convocation
                                <span className="btn-badge">{selectedIds.length}</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </header>

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
                    </div>

                    <div className="toolbar-right">
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
                                        if (value.length > 1) {
                                            value = value.replace(/^0+/, '');
                                        }
                                        handleQuotaChange(value);
                                    }}
                                />
                                <div className="stepper-arrows">
                                    <button
                                        onClick={() => handleQuotaChange(quota + 1)}
                                        className="arrow-up"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => handleQuotaChange(Math.max(0, quota - 1))}
                                        className="arrow-down"
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="v-divider" />

                        <div className="stat-chip">
                            <span className="stat-label">Sélectionnés :</span>
                            <strong className="stat-value text-blue">{selectedIds.length}</strong>
                        </div>
                        <div className="stat-chip">
                            <span className="stat-label">Liste P :</span>
                            <strong className="stat-value text-green">{mainListCount}</strong>
                        </div>
                        <div className="stat-chip">
                            <span className="stat-label">Liste A :</span>
                            <strong className="stat-value text-amber">{Math.max(0, acceptedList.length - mainListCount)}</strong>
                        </div>

                        <div className="stat-chip last-update">
                            <span className="stat-label">Maj :</span>
                            <strong className="stat-value">{formatTime(lastUpdate)}</strong>
                        </div>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="secretary-table">
                        <thead>
                            <tr>
                                <th width="48">
                                    <input
                                        type="checkbox"
                                        className="modern-checkbox"
                                        checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th>Candidat</th>
                                <th>Massar</th>
                                <th>Moyenne</th>
                                <th>Type Liste</th>
                                <th className="text-right">État Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredList.map((student) => {
                                    const rankIndex = acceptedList.findIndex(s => s.id === student.id);
                                    const isMainList = rankIndex < mainListCount;

                                    return (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className={`secretary-row ${selectedIds.includes(student.id) ? 'row-selected' : ''} ${isMainList ? 'row-priority' : 'row-waiting'}`}
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    className="modern-checkbox"
                                                    checked={selectedIds.includes(student.id)}
                                                    onChange={() => toggleSelect(student.id)}
                                                />
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
                                            <td>
                                                <span className={`status-tag ${isMainList ? 'tag-accepted' : 'tag-rejected'}`}>
                                                    {isMainList ? 'PRINCIPALE' : 'ATTENTE'}
                                                </span>
                                            </td>
                                            <td className="text-right email-status">
                                                {student.convocation_sent ? '✅ Envoyé' : '⏳ En attente'}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                <AnimatePresence>
                    {showScheduleModal && (
                        <motion.div className="modal-overlay" initial="hidden" animate="visible" exit="exit" onClick={() => setShowScheduleModal(false)}>
                            <motion.div variants={modalVariants} className="schedule-modal" onClick={e => e.stopPropagation()}>
                                {sent ? (
                                    <div className="sent-success">
                                        <div className="success-icon">✓</div>
                                        <h3>Convocations envoyées !</h3>
                                    </div>
                                ) : (
                                    <>
                                        <div className="modal-sidebar">
                                            <p className="sidebar-title">Heure du RDV</p>
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
                                                    étudiants à convoquer
                                                </p>
                                            </div>

                                            <div className="date-section">
                                                <label className="field-label">Choisir la Date</label>
                                                <input
                                                    type="date"
                                                    className="date-input"
                                                    value={appointmentDate}
                                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                                />
                                            </div>

                                            <div className="modal-footer">
                                                <button className="btn-cancel" onClick={() => setShowScheduleModal(false)}>Annuler</button>
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
            </div>
        </motion.div>
    );
};

export default SecretaryDashboard;