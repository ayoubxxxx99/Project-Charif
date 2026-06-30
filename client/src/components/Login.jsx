import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Eye, EyeOff, AlertTriangle, Lock } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_role', response.data.user.role);
            localStorage.setItem('user_name', response.data.user.name);

            const role = response.data.user.role;
            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'secretary') {
                navigate('/secretary');
            } else {
                navigate('/');
            }
        } 
        catch (err) {
        setError(t('error_login'));
        }
         finally {
        setLoading(false); 
    }
    };

    return (
        <div className="login-page">
            <div className="bg-lines">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`bg-line bg-line-${i + 1}`} />
                ))}
            </div>

            <div className="login-split">
                {/* Left panel — branding */}
                <motion.div
                    className="login-left"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="brand-mark">
                        <span className="brand-acronym">LCI</span>
                        <div className="brand-divider" />
                        <span className="brand-year">EST. 1987</span>
                    </div>

                    <div className="left-content">
                        <h1 className="left-title">
                            {t('left_title_1')} <br /> {t('left_title_2')}
                        </h1>
                        <p className="left-subtitle">{t('left_subtitle')}</p>
                        <div className="logo-corner">
                            <img src="/images/logo-lycee.png" alt="Logo Lycée Charif Idrissi" />
                        </div>
                    </div>

                    <div className="left-footer">
                        <div className="stat-row">
                            <div className="contact-grid">
                              <a href="tel:+212539717023" className="contact-cell">
                                  <Phone size={14} className="contact-icon" />
                                  <span dir="ltr">+212 539-717023</span>
                              </a>
                              <a href="mailto:L.charifidrissitetouan@gmail.com" className="contact-cell">
                                  <Mail size={14} className="contact-icon" />
                                  <span dir="ltr">Email</span>
                              </a>
                            <a  href="https://www.facebook.com/Lycee.Charif.Idrissi/"  target="_blank"  rel="noopener noreferrer"  className="contact-cell" >
                                  <FaFacebook size={14} className="contact-icon" />
                                  <span>Facebook</span>
                            </a>

                            <a href="https://www.google.com/maps/search/?api=1&query=35.5692388,-5.361656" target="_blank"  rel="noopener noreferrer" className="contact-cell" >
                                  <MapPin size={14} className="contact-icon" />
                                  <span>Localisation</span>
                            </a>
                          </div>
                            <div className="stat-item">
                                <strong>{new Date().getFullYear()}</strong>
                                <span>{t('stat_year')}</span>
                            </div>
                            <div className="stat-sep" />
                            <div className="stat-item">
                                <strong>{t('stat_ville')}</strong>
                                <span>{t('stat_location')}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right panel — form */}
                <motion.div
                    className="login-right"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="lang-toggle-container">
                        <button
                            type="button"
                            className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
                            onClick={() => i18n.changeLanguage('fr')}
                        >FR</button>
                        <button
                            type="button"
                            className={`lang-btn ${i18n.language === 'ar' ? 'active' : ''}`}
                            onClick={() => i18n.changeLanguage('ar')}
                        >AR</button>
                    </div>

                    <div className="login-form-wrapper">
                        <div className="form-header">
                            <div className="form-eyebrow">{t('form_eyebrow')}</div>
                            <h2 className="form-title">{t('form_title')}</h2>
                            <p className="form-desc">{t('form_desc')}</p>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="error-banner"
                                    initial={{ opacity: 0, y: -8, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -8, height: 0 }}
                                >
                                    <AlertTriangle size={14} className="error-icon" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form className="login-form" onSubmit={handleLogin}>
                            <div className="field-group">
                                <label className="field-label">{t('email_label')}</label>
                                <div className="field-input-wrap">
                                    <span className="field-icon">@</span>
                                    <input
                                        type="email"
                                        className="field-input"
                                        placeholder="exemple@gmail.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <label className="field-label">{t('password_label')}</label>
                                <div className="field-input-wrap">
                                    <Lock size={13} className="field-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="field-input"
                                        placeholder="••••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(p => !p)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                className={`btn-login ${loading ? 'loading' : ''}`}
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.01 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                            >
                                {loading ? (
                                    <span className="spinner" />
                                ) : (
                                    <>{t('btn_login')}<span className="btn-arrow">→</span></>
                                )}
                            </motion.button>
                        </form>

                        <div className="form-footer-stack">
                            <div className="form-footer">
                                <span>{t('no_account')}</span>
                                <Link to="/register" className="register-link">{t('register_link')}</Link>
                            </div>
                            <Link to="/forgot-password" className="forgot-link">
                                {t('forgot_password_link')}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;