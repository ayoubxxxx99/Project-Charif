import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.password_confirmation) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/register', formData, {
                headers: { 'Accept': 'application/json' }
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'inscription");
            setLoading(false);
        }
    };

    const fields = [
        { key: 'name',                  label: 'Nom Complet',             type: 'text',     placeholder: 'Ayoub Chaddad',             icon: '✦' },
        { key: 'email',                 label: 'Adresse email',           type: 'email',    placeholder: 'ayoub@charif-idrissi.ma',   icon: '@' },
        { key: 'password',              label: 'Mot de passe',            type: 'password', placeholder: '••••••••••',                icon: '⬡' },
        { key: 'password_confirmation', label: 'Confirmer le mot de passe', type: 'password', placeholder: '••••••••••',              icon: '⬡' },
    ];

    return (
        <div className="reg-page">
            <div className="reg-bg-lines">
                {[...Array(6)].map((_, i) => <div key={i} className={`reg-bg-line reg-bg-line-${i + 1}`} />)}
            </div>

            <div className="reg-split">
                {/* ── Left panel ── */}
                <motion.div
                    className="reg-left"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="reg-brand-mark">
                        <span className="reg-brand-acronym">LCI</span>
                        <div className="reg-brand-divider" />
                        <span className="reg-brand-year">EST. 1987</span>
                    </div>

                    <div className="reg-left-content">
                        <h1 className="reg-left-title">
                            Rejoignez<br />
                            Notre École
                        </h1>
                        <p className="reg-left-subtitle">
                            Créez votre compte pour soumettre votre candidature au Lycée Charif Idrissi.
                        </p>

                        <div className="reg-steps">
                            {[
                                { n: '01', label: 'Créer un compte' },
                                { n: '02', label: 'Soumettre vos notes' },
                                { n: '03', label: 'Suivre votre dossier' },
                            ].map((step, i) => (
                                <div key={i} className={`reg-step ${i === 0 ? 'reg-step-active' : ''}`}>
                                    <span className="reg-step-num">{step.n}</span>
                                    <span className="reg-step-label">{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="reg-left-footer">
                        <span>Tétouan, Maroc</span>
                        <span className="reg-footer-dot">·</span>
                        <span>Année 2024–2025</span>
                    </div>
                </motion.div>

                {/* ── Right panel ── */}
                <motion.div
                    className="reg-right"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="reg-form-wrapper">
                        <div className="reg-form-header">
                            <div className="reg-eyebrow">Nouveau compte</div>
                            <h2 className="reg-form-title">Inscription</h2>
                            <p className="reg-form-desc">Remplissez les informations ci-dessous</p>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="reg-error-banner"
                                    initial={{ opacity: 0, y: -8, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -8, height: 0 }}
                                >
                                    <span>⚠</span> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form className="reg-form" onSubmit={handleRegister}>
                            {fields.map(({ key, label, type, placeholder, icon }) => (
                                <div key={key} className="reg-field-group">
                                    <label className="reg-field-label">{label}</label>
                                    <div className="reg-field-wrap">
                                        <span className="reg-field-icon">{icon}</span>
                                        <input
                                            type={type === 'password' && showPassword ? 'text' : type}
                                            className="reg-field-input"
                                            placeholder={placeholder}
                                            value={formData[key]}
                                            onChange={update(key)}
                                            required
                                        />
                                        {type === 'password' && key === 'password' && (
                                            <button
                                                type="button"
                                                className="reg-toggle-pw"
                                                onClick={() => setShowPassword(p => !p)}
                                            >
                                                {showPassword ? '🙈' : '👁'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <motion.button
                                type="submit"
                                className={`reg-btn-submit ${loading ? 'loading' : ''}`}
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.01 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                            >
                                {loading
                                    ? <span className="reg-spinner" />
                                    : <>S'inscrire <span className="reg-btn-arrow">→</span></>
                                }
                            </motion.button>
                        </form>

                        <div className="reg-form-footer">
                            <span>Déjà un compte ?</span>
                            <Link to="/login" className="reg-login-link">Se connecter</Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register; 