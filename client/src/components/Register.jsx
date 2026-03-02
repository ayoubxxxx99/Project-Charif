import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reuse the login styles for consistency

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

   const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
        await axios.post('http://127.0.0.1:8000/api/register', formData, {
            headers: {
                'Accept': 'application/json', 
            }
        });
        navigate('/login');
    } catch (err) {
        
        setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
};

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Créer un Compte</h2>
                <p>Inscrivez-vous pour soumettre votre candidature</p>
                {error && <div className="error-message">{error}</div>}
                <form className="login-form" onSubmit={handleRegister}>
                    <div className="input-group">
                        <label>Nom Complet</label>
                        <input type="text" onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div className="input-group">
                        <label>Mot de passe</label>
                        <input type="password" onChange={e => setFormData({...formData, password: e.target.value})} required />
                    </div>
                    <div className="input-group">
                        <label>Confirmer le mot de passe</label>
                        <input type="password" onChange={e => setFormData({...formData, password_confirmation: e.target.value})} required />
                    </div>
                    <button type="submit" className="btn-login">S'inscrire</button>
                </form>
            </div>
        </div>
    );
};

export default Register;