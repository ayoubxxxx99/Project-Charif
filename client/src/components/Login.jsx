import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { Link } from 'react-router-dom';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/login', { email, password });
        
        // 1. Save Token and Role and name :3
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('user_role', response.data.user.role);
        localStorage.setItem('user_name', response.data.user.name);
        
        
        // 2. Redirect based on role
        if (response.data.user.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/'); // Students go to the application form
        }
    } catch (err) {
        setError('Identifiants incorrects');
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
                <p style={{ marginTop: '20px', fontSize: '14px' }}>
    Vous n'avez pas de compte ? <Link to="/register" style={{ color: '#2563eb', fontWeight: 'bold' }}>S'inscrire</Link>
</p>
            </div>
        </div>
    );
};

export default Login;