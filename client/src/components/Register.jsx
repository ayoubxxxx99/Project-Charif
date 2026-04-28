import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Register.css';

const Register = () => {
    const { t, i18n } = useTranslation();
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

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.password_confirmation) {
            setError(t('error_password_match'));
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/register', formData, {
                headers: { 'Accept': 'application/json' }
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || t('error_registration'));
            setLoading(false);
        }
    };

    const fields = [
        { key: 'name',                  label: t('name_label'),             type: 'text',     placeholder: 'Nom & Prénom',           icon: '✦' },
        { key: 'email',                 label: t('email_label'),            type: 'email',    placeholder: 'test@charif-idrissi.ma', icon: '@' },
        { key: 'password',              label: t('password_label'),         type: 'password', placeholder: '••••••••••',             icon: '⬡' },
        { key: 'password_confirmation', label: t('confirm_password_label'), type: 'password', placeholder: '••••••••••',             icon: '⬡' },
    ];

    return (
        <div className="reg-page">
            <div className="reg-bg-lines">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`reg-bg-line reg-bg-line-${i + 1}`} />
                ))}
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
                        <h1 className="reg-left-title">{t('reg_left_title')}</h1>
                        <p className="reg-left-subtitle">{t('reg_left_subtitle')}</p>

                        <div className="reg-steps">
                            {[
                                { n: '01', label: t('reg_step_1') },
                                { n: '02', label: t('reg_step_2') },
                                { n: '03', label: t('reg_step_3') },
                            ].map((step, i) => (
                                <div key={i} className={`reg-step ${i === 0 ? 'reg-step-active' : ''}`}>
                                    <span className="reg-step-num">{step.n}</span>
                                    <span className="reg-step-label">{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="reg-left-footer">
                        <span>{t('stat_location')}</span>
                        <span className="reg-footer-dot">·</span>
                        <span>{t('stat_year')} 2025–2026</span>
                    </div>
                </motion.div>

                {/* ── Right panel ── */}
                <motion.div
                    className="reg-right"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="reg-lang-toggle">
                        <button
                            type="button"
                            className={`reg-lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
                            onClick={() => i18n.changeLanguage('fr')}
                        >FR</button>
                        <button
                            type="button"
                            className={`reg-lang-btn ${i18n.language === 'ar' ? 'active' : ''}`}
                            onClick={() => i18n.changeLanguage('ar')}
                        >AR</button>
                    </div>

                    <div className="reg-form-wrapper">
                        <div className="reg-form-header">
                            <div className="reg-eyebrow">{t('form_eyebrow')}</div>
                            <h2 className="reg-form-title">{t('reg_form_title')}</h2>
                            <p className="reg-form-desc">{t('reg_form_desc')}</p>
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
                                    : <>{t('btn_register')}<span className="reg-btn-arrow">→</span></>
                                }
                            </motion.button>
                        </form>

                        <div className="reg-form-footer">
                            <span>{t('already_have_account')}</span>
                            <Link to="/login" className="reg-login-link">{t('login_link')}</Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;