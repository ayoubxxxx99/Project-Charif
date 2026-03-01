import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        console.log("Tentative de connexion...");

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login', { 
                email, 
                password 
            });
            
            console.log("Succès ! Token reçu.");
            localStorage.setItem('admin_token', response.data.token);
            navigate('/admin');
        } catch (err) {
            console.error("Erreur de connexion", err.response);
            setError('Email ou mot de passe incorrect');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Administration</h2>
                <p>Lycée Charif Idrissi</p>
                
                {error && <div className="error-message">{error}</div>}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            placeholder="admin@charif.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Mot de passe</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-login">S'identifier</button>
                </form>
            </div>
        </div>
    );
};

export default Login;