import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentHome.css';

const StudentHome = () => {
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const userName = localStorage.getItem('user_name') || 'Étudiant';
    const token = localStorage.getItem('admin_token');

    useEffect(() => {
        // Fetch the user's application to see if they already applied
        axios.get('http://127.0.0.1:8000/api/user-application', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setApplication(res.data))
        .catch(() => setApplication(null));
    }, [token]);

    return (
        <div className="student-home">
            <nav className="student-nav">
                <span className="logo">Charif Idrissi</span>
                <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn-logout-small">Déconnexion</button>
            </nav>

            <header className="hero-section">
                <h1>Bienvenue, {userName} !</h1>
                
                {application ? (
                    <div className="status-container">
                        <p>Statut de votre candidature :</p>
                        <span className={`status-badge-large status-${application.status}`}>
                            {application.status === 'pending' ? '🕒 En cours de traitement' : 
                             application.status === 'accepted' ? '✅ Félicitations ! Accepté' : 
                             '❌ Candidature Refusée'}
                        </span>
                    </div>
                ) : (
                    <>
                        <p>Votre avenir commence ici au Lycée Charif Idrissi.</p>
                        <button className="cta-button" onClick={() => navigate('/apply')}>
                            Commencer ma Candidature
                        </button>
                    </>
                )}
            </header>
            
            {/* ... rest of your about-section */}
        </div>
    );
};
export default StudentHome;