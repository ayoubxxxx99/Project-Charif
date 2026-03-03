import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentHome.css';

const StudentHome = () => {
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const userName = localStorage.getItem('user_name') || 'Étudiant';
    const token = localStorage.getItem('admin_token');
    const [loading, setLoading] = useState(true);
   useEffect(() => {
    if (!token) {
        setLoading(false);
        return;
    }

    axios.get('http://127.0.0.1:8000/api/user-application', {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        setApplication(res.data);
    })
    .catch(err => {
        console.error("API Error:", err);
        setApplication(null); // Show form on error
    })
    .finally(() => {
        setLoading(false); // Stop loading regardless of outcome
    });
}, [token]);

if (loading) return <div>Chargement...</div>;
const handleLogout = () => {
    // 1. Remove the token from local storage
    localStorage.removeItem('student_token'); // Ensure this matches your token key name
    
    // 2. Redirect the user to the login page
    // If you are using react-router-dom:
    window.location.href = '/login'; 
};

   return (
    <div className="student-dashboard">
        {/* --- TOP NAVIGATION BAR --- */}
        <nav className="dashboard-nav">
            <div className="nav-left">
                <span className="school-badge">🏫</span>
                <div className="school-info">
                    <h1>Lycée Charif Idrissi</h1>
                    <p>Portail de Candidature</p>
                </div>
            </div>
            
            <div className="nav-right">
                <div className="user-profile">
                    <span className="user-name">{application?.full_name || "Étudiant"}</span>
                    <div className="user-avatar">
                        {application?.full_name?.charAt(0) || "S"}
                    </div>
                </div>
                <button className="logout-mini-btn" onClick={handleLogout}>Quitter</button>
            </div>
        </nav>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="dashboard-main">
            <div className="status-container">
                <div className={`status-card ${application.status}`}>
                    <div className="status-header">
                        <div className="status-badge">
                            {application.status === 'rejected' ? '🔴 Refusée' : 
                             application.status === 'accepted' ? '🟢 Acceptée' : '🟡 En attente'}
                        </div>
                    </div>

                    <div className="status-body">
                        <h2>Mise à jour de votre dossier</h2>
                        <p className="main-message">
                            {application.status === 'rejected' ? (
                                "Nous regrettons de vous informer que votre candidature n'a pas été retenue pour cette session."
                            ) : (
                                "Félicitations ! Votre dossier a été validé par la commission."
                            )}
                        </p>
                        
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Code Massar</label>
                                <span>{application.massar_code}</span>
                            </div>
                            <div className="info-item">
                                <label>Date de soumission</label>
                                <span>{new Date(application.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="status-footer">
                        <button className="btn-support">Contacter le support</button>
                    </div>
                </div>
            </div>
        </main>
    </div>
);
};
export default StudentHome;