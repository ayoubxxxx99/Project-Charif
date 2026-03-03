import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AcceptedStudents = () => {
    const [acceptedList, setAcceptedList] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const navigate = useNavigate();
    const timeSlots = [];
         for (let h = 8; h <= 17; h++) {
    timeSlots.push(`${h < 10 ? '0' + h : h}:00`);
    timeSlots.push(`${h < 10 ? '0' + h : h}:30`);
}
    // --- SELECTION LOGIC ---
    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === acceptedList.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(acceptedList.map(s => s.id));
        }
    };

    const fetchAccepted = () => {
        const token = localStorage.getItem('admin_token');
        axios.get('http://127.0.0.1:8000/api/applications', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const onlyAccepted = res.data.filter(app => app.status === 'accepted');
            setAcceptedList(onlyAccepted);
        })
        .catch(() => navigate('/login'));
    };

    useEffect(() => {
        fetchAccepted();
    }, []);

    const handleSendConvocations = async () => {
        const token = localStorage.getItem('admin_token');
        if (!appointmentDate || !appointmentTime) return alert("Choisissez une date et heure !");
        
        try {
            await axios.post('http://127.0.0.1:8000/api/applications/send-convocations', {
                ids: selectedIds,
                date: appointmentDate,
                time: appointmentTime
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Convocations envoyées par email !");
            setShowScheduleModal(false);
            setSelectedIds([]);
        } catch (err) {
            console.error("Emailing failed", err);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Candidats Acceptés (À Traiter)</h2>
                <button className="btn-advanced" onClick={() => navigate('/admin')}>
                    ⬅ Retour au Dashboard
                </button>
            </div>

            {/* ACTION BAR */}
            <div className="admin-actions">
                {selectedIds.length > 0 ? (
                    <button className="btn-primary" onClick={() => setShowScheduleModal(true)}>
                        📅 Programmer RDV pour {selectedIds.length} candidats
                    </button>
                ) : (
                    <p style={{color: '#666'}}>Sélectionnez des candidats pour envoyer les convocations.</p>
                )}
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}>
                            <input 
                                type="checkbox" 
                                checked={selectedIds.length === acceptedList.length && acceptedList.length > 0}
                                onChange={toggleSelectAll} 
                            />
                        </th>
                        <th>Candidat</th>
                        <th>Massar</th>
                        <th>Moyenne</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {acceptedList.map(student => (
                        <tr key={student.id} className={selectedIds.includes(student.id) ? 'row-selected' : ''}>
                            <td>
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.includes(student.id)} 
                                    onChange={() => toggleSelect(student.id)} 
                                />
                            </td>
                            <td><strong>{student.full_name}</strong></td>
                            <td>{student.massar_code}</td>
                            <td>{student.moyenne}/20</td>
                            <td>
                                <button className="btn-bulk-cancel">Inscrire</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {acceptedList.length === 0 && <p style={{textAlign: 'center', marginTop: '20px'}}>Aucun candidat accepté.</p>}

            {/* MODAL */}
{showScheduleModal && (
    <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
        <div className="calendar-modal" onClick={e => e.stopPropagation()}>
            <div className="calendar-sidebar">
                <h4>Heures disponibles</h4>
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

            <div className="calendar-main">
                <div className="calendar-header">
                    <h3>Choisir la Date</h3>
                    <p>Candidat(s) sélectionné(s) : <strong>{selectedIds.length}</strong></p>
                </div>
                
                <div className="date-picker-container">
                    <input 
                        type="date" 
                        value={appointmentDate} 
                        onChange={(e) => setAppointmentDate(e.target.value)} 
                        className="large-date-input"
                    />
                </div>

                <div className="calendar-summary">
                    {appointmentDate && appointmentTime ? (
                        <div className="selection-badge">
                            Rendez-vous le 📅 {appointmentDate} à 🕒 {appointmentTime}
                        </div>
                    ) : (
                        <p className="hint">Veuillez choisir une date et une heure dans la liste.</p>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={() => setShowScheduleModal(false)}>Annuler</button>
                    <button className="btn-primary" onClick={handleSendConvocations} disabled={!appointmentDate || !appointmentTime}>
                        Confirmer et Envoyer
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

        </div>
    );
};

export default AcceptedStudents;