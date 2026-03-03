import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ApplicationForm.css';

const ApplicationForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        massar_code: '',
        maths: '',                
        physique: '',             
        langue_etrangere: '',     
        langue_secondaire: '',    
        histoire_geo: '',  
        education_islamique: '',  
        sport: ''                 
    });
const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Get the correct key from your Local Storage
    const token = localStorage.getItem('admin_token'); 
    
    if (!token) {
        alert("Session introuvable. Veuillez vous reconnecter.");
        return navigate('/login');
    }

    setLoading(true);

    try {
        // 2. The axios call must stay INSIDE the try block
        await axios.post('http://127.0.0.1:8000/api/applications', formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                Accept: 'application/json' 
            }
        });
        
        alert("Candidature envoyée avec succès !");
        navigate('/');
    } catch (err) {
        console.error("Submission Error:", err.response?.data);
        
        // Handle 401 specifically if the token is old/expired
        if (err.response?.status === 401) {
            alert("Session expirée. Reconnectez-vous.");
            navigate('/login');
        } else {
            alert("Erreur: " + (err.response?.data?.message || "Vérifiez vos informations"));
        }
    } finally {
        // 3. This ensures the spinner stops whether it succeeds OR fails
        setLoading(false);
    }
};

    return (
        <div className="form-container">
            <div className="form-card">
                <div className="form-header">
                    <h2>Formulaire de Candidature</h2>
                    <p>Lycée Charif Idrissi - Année Scolaire 2026/2027</p>
                </div>

                <div className="warning-box">
                    <strong>⚠️ Attention:</strong> Veuillez vérifier scrupuleusement vos notes. Toute fausse déclaration entraînera le rejet automatique de votre dossier.
                </div>

                <form onSubmit={handleSubmit}>
                    <section className="form-section">
                        <h3>Informations Personnelles</h3>
                        <div className="input-grid">
                            <input type="text" placeholder="Nom Complet" onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                            <input type="text" placeholder="Code Massar" onChange={e => setFormData({...formData, massar_code: e.target.value})} required />
                        </div>
                    </section>

                    <section className="form-section">
                        <h3>Notes des Matières (Sur 20)</h3>
                        <div className="marks-grid">
                            <div className="mark-input">
                                <label>Mathématiques</label>
                                <input type="number" step="0.01" min="0" max="20" onChange={e => setFormData({...formData, maths: e.target.value})} required />
                            </div>
                            <div className="mark-input">
                                <label>Physique-Chimie</label>
                                <input type="number" step="0.01" min="0" max="20" onChange={e => setFormData({...formData, physique: e.target.value})} required />
                            </div>
                            <div className="mark-input">
                                <label>Français (1ère Étrangère)</label>
                                <input type="number" step="0.01" min="0" max="20" onChange={e => setFormData({...formData, langue_etrangere: e.target.value})} required />
                            </div>
                            <div className="mark-input">
                                <label>Anglais (2ème Étrangère)</label>
                                <input type="number" step="0.01" min="0" max="20" onChange={e => setFormData({...formData, langue_secondaire: e.target.value})} required />
                            </div>
                            <div className="mark-input">
                                <label>Histoire-Géo</label>
                                <input type="number" step="0.01" min="0" max="20" onChange={e => setFormData({...formData, histoire_geo: e.target.value})} required />
                            </div>
                            <div className="mark-input">
                                <label>Education Islamique</label>
                                <input type="number" step="0.01" min="0" max="20" onChange={e => setFormData({...formData, education_islamique: e.target.value})} required />
                            </div>
                            <div className="mark-input">
                                <label>Sport</label>
                                <input type="number" step="0.01" min="0" max="20" onChange={e => setFormData({...formData, sport: e.target.value})} required />
                            </div>
                        </div>
                    </section>

                    <div className="form-footer">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Annuler</button>
                        
                        <button type="submit" className="btn-primary" disabled={loading}>
    {loading ? "Chargement..." : "Soumettre mon Dossier"}
</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationForm;