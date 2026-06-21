import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, KeyRound, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import './Login.css';



const ForgotPassword = () => {
    const { t, i18n} = useTranslation();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    
    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('http://127.0.0.1:8000/api/forgot-password', { email });
            setSuccess(t('fp_success_sent'));
            setStep(2);
        } catch (err) {
           setError(err.response?.data?.message || t('fp_error_generic'));
        } finally {
            setLoading(false);
        }
    };

    
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirm) {
             setError(t('fp_error_mismatch'))
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/reset-password', {
                email,
                code,
                password,
                password_confirmation: passwordConfirm,
            });
           setSuccess(t('fp_success_reset'));
            setTimeout(() => navigate('/login'), 1800);
        } catch (err) {
            setError(err.response?.data?.message || t('fp_error_invalid_code'));
        } finally {
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
                {/* Left panel — same branding as Login */}
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
                            {t('fp_left_title_1')} <br /> {t('fp_left_title_2')}
                        </h1>
                        <p className="left-subtitle">{t('fp_left_subtitle')}</p>
                        <div className="logo-corner">
                            <img src="/images/logo-lycee.png.jpeg" alt="Logo Lycée" />
                        </div>
                    </div>

                    <div className="left-footer">
                        <div className="stat-row">
                            <div className="stat-item">
                                <strong>2026</strong>
                                <span>Année scolaire</span>
                            </div>
                            <div className="stat-sep" />
                            <div className="stat-item">
                                <strong>Tétouan</strong>
                                <span>Tétouan, Maroc</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                
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
                            <div className="form-eyebrow">{t('fp_eyebrow')}</div>
                            <h2 className="form-title">
                                {step === 1 ? t('fp_title_step1') : t('fp_title_step2')}
                            </h2>
                            <p className="form-desc">
                                {step === 1 ? t('fp_desc_step1') : t('fp_desc_step2', { email })}
                            </p>
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
                            {success && (
                                <motion.div
                                    className="success-banner"
                                    initial={{ opacity: 0, y: -8, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -8, height: 0 }}
                                >
                                    <CheckCircle2 size={14} className="error-icon" />
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        
                        {step === 1 && (
                            <form className="login-form" onSubmit={handleSendCode}>
                                <div className="field-group">
                                    <label className="field-label">{t('email_label')}</label>
                                    <div className="field-input-wrap">
                                        <Mail size={14} className="field-icon" />
                                        <input
                                            type="email"
                                            className="field-input"
                                            placeholder="admin@charif-idrissi.ma"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
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
                                     <>{t('fp_btn_send')}<span className="btn-arrow">→</span></>   
                                    )}
                                </motion.button>
                            </form>
                        )}

                        
                        {step === 2 && (
                            <form className="login-form" onSubmit={handleResetPassword}>
                                <div className="field-group">
                                    <label className="field-label">{t('fp_code_label')}</label>
                                    <div className="field-input-wrap">
                                        <KeyRound size={14} className="field-icon" />
                                        <input
                                            type="text"
                                            className="field-input"
                                            placeholder="123456"
                                            maxLength={6}
                                            value={code}
                                            onChange={e => setCode(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="field-group">
                                    <label className="field-label">{t('fp_new_password_label')}</label>
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

                                <div className="field-group">
                                    <label className="field-label">{t('fp_confirm_password_label')}</label>
                                    <div className="field-input-wrap">
                                        <Lock size={13} className="field-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="field-input"
                                            placeholder="••••••••••"
                                            value={passwordConfirm}
                                            onChange={e => setPasswordConfirm(e.target.value)}
                                            required
                                        />
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
                                        <>{t('fp_btn_reset')}<span className="btn-arrow">→</span></>
                                    )}
                                </motion.button>
                            </form>
                        )}

                        <div className="form-footer">
                            <span>{t('fp_remember_password')}</span>
                            <Link to="/login" className="register-link">{t('fp_back_to_login')}</Link>
                            </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;