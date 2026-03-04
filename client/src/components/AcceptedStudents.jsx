import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './AcceptedStudents.css';

const AcceptedStudents = () => {
    const [acceptedList, setAcceptedList] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    const calculateMean = (student) => {
        const grades = [
            student.maths, student.physique, student.langue_etrangere,
            student.langue_secondaire, student.histoire_geo,
            student.education_islamique, student.sport
        ];
        const total = grades.reduce((sum, g) => sum + parseFloat(g || 0), 0);
        return (total / grades.length).toFixed(2);
    };

    const timeSlots = [];
    for (let h = 8; h <= 17; h++) {
        timeSlots.push(`${h < 10 ? '0' + h : h}:00`);
        timeSlots.push(`${h < 10 ? '0' + h : h}:30`);
    }

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        setSelectedIds(selectedIds.length === acceptedList.length ? [] : acceptedList.map(s => s.id));
    };

    const fetchAccepted = () => {
        const token = localStorage.getItem('token');
        axios.get('http://127.0.0.1:8000/api/applications', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setAcceptedList(res.data.filter(app => app.status === 'accepted')))
        .catch(() => navigate('/login'));
    };

    useEffect(() => { fetchAccepted(); }, []);

    const handleSendConvocations = async () => {
        const token = localStorage.getItem('token');
        if (!appointmentDate || !appointmentTime) return;
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
                setSent(false);
                setAppointmentDate('');
                setAppointmentTime('');
            }, 1800);
        } catch (err) {
            console.error("Emailing failed", err);
        }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.96, y: 24 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
        exit: { opacity: 0, scale: 0.96, y: 24, transition: { duration: 0.2 } }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
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
                            <span className="accepted-count-badge">{acceptedList.length} dossiers</span>
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.button
                                className="btn-convocation"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => setShowScheduleModal(true)}
                            >
                                <span className="btn-icon">📅</span>
                                Programmer RDV
                                <span className="btn-badge">{selectedIds.length}</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </header>

                {/* ── STATS BAR ── */}
                <motion.div
                    className="stats-bar"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-chip">
                        <span className="stat-dot dot-green" />
                        <span className="stat-label">Total acceptés</span>
                        <strong className="stat-value">{acceptedList.length}</strong>
                    </div>
                    <div className="stat-chip">
                        <span className="stat-dot dot-blue" />
                        <span className="stat-label">Sélectionnés</span>
                        <strong className="stat-value">{selectedIds.length}</strong>
                    </div>
                    <div className="stat-chip">
                        <span className="stat-dot dot-amber" />
                        <span className="stat-label">En attente de convocation</span>
                        <strong className="stat-value">{acceptedList.length - selectedIds.length}</strong>
                    </div>
                </motion.div>

                {/* ── TABLE ── */}
                <motion.div
                    className="accepted-table-wrapper"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    {acceptedList.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🎓</div>
                            <p>Aucun candidat accepté pour le moment.</p>
                        </div>
                    ) : (
                        <table className="accepted-table">
                            <thead>
                                <tr>
                                    <th width="48">
                                        <input
                                            type="checkbox"
                                            className="modern-checkbox"
                                            checked={selectedIds.length === acceptedList.length && acceptedList.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>Candidat</th>
                                    <th>Code Massar</th>
                                    <th>Moyenne</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {acceptedList.map((student, index) => (
                                        <motion.tr
                                            key={student.id}
                                            className={`accepted-row ${selectedIds.includes(student.id) ? 'row-selected' : ''}`}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: index * 0.04 }}
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    className="modern-checkbox"
                                                    checked={selectedIds.includes(student.id)}
                                                    onChange={() => toggleSelect(student.id)}
                                                />
                                            </td>
                                            <td>
                                                <div className="student-cell">
                                                    <div className="student-avatar">
                                                        {student.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="student-name">{student.full_name}</span>
                                                </div>
                                            </td>
                                            <td><span className="massar-badge">{student.massar_code}</span></td>
                                            <td>
                                                <div className="moyenne-cell">
                                                    <span className="moyenne-value">{calculateMean(student)}</span>
                                                    <span className="moyenne-denom">/20</span>
                                                    <div className="moyenne-bar">
                                                        <div
                                                            className="moyenne-fill"
                                                            style={{ width: `${(calculateMean(student) / 20) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <button className="btn-inscrire">
                                                    Inscrire →
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    )}
                </motion.div>

                {/* ── SCHEDULE MODAL ── */}
                <AnimatePresence>
                    {showScheduleModal && (
                        <motion.div
                            variants={overlayVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="modal-overlay"
                            onClick={() => setShowScheduleModal(false)}
                        >
                            <motion.div
                                variants={modalVariants}
                                className="schedule-modal"
                                onClick={e => e.stopPropagation()}
                            >
                                {sent ? (
                                    <motion.div
                                        className="sent-success"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <div className="success-icon">✓</div>
                                        <h3>Convocations envoyées !</h3>
                                        <p>{selectedIds.length} email{selectedIds.length > 1 ? 's' : ''} envoyé{selectedIds.length > 1 ? 's' : ''} avec succès.</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Left — time slots */}
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

                                        {/* Right — date + confirm */}
                                        <div className="modal-main">
                                            <div className="modal-main-header">
                                                <h3>Programmer les Convocations</h3>
                                                <p className="modal-subtitle">
                                                    <span className="pill-count">{selectedIds.length}</span>
                                                    candidat{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
                                                </p>
                                            </div>

                                            <div className="date-section">
                                                <label className="field-label">Date du rendez-vous</label>
                                                <input
                                                    type="date"
                                                    value={appointmentDate}
                                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                                    className="date-input"
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {appointmentDate && appointmentTime && (
                                                    <motion.div
                                                        className="summary-card"
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                    >
                                                        <div className="summary-row">
                                                            <span>📅 Date</span>
                                                            <strong>{appointmentDate}</strong>
                                                        </div>
                                                        <div className="summary-row">
                                                            <span>🕒 Heure</span>
                                                            <strong>{appointmentTime}</strong>
                                                        </div>
                                                        <div className="summary-row">
                                                            <span>👥 Candidats</span>
                                                            <strong>{selectedIds.length}</strong>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="modal-footer">
                                                <button className="btn-cancel" onClick={() => setShowScheduleModal(false)}>
                                                    Annuler
                                                </button>
                                                <button
                                                    className="btn-confirm"
                                                    onClick={handleSendConvocations}
                                                    disabled={!appointmentDate || !appointmentTime}
                                                >
                                                    Confirmer & Envoyer
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

export default AcceptedStudents;