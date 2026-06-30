import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ApplicationForm.css';
import { useTranslation } from 'react-i18next';

const ApplicationForm = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name:            localStorage.getItem('user_name') || '',
        massar_code:          '',
        maths:                '',
        physique:             '',
        langue_etrangere:     '',
        langue_secondaire:    '',
        histoire_geo:         '',
        education_islamique:  '',
        sport:                ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [massarError, setMassarError] = useState('');
    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [gradeErrors, setGradeErrors] = useState({});

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const gradeKeys = ['maths','physique','langue_etrangere','langue_secondaire','histoire_geo','education_islamique','sport'];

    const update = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
        setTouched(prev => ({ ...prev, [field]: true }));
    };

     const updateGrade = (field) => (e) => {
        const raw = e.target.value;

        if (raw === '') {
            setFormData(prev => ({ ...prev, [field]: '' }));
            setGradeErrors(prev => ({ ...prev, [field]: '' }));
            setTouched(prev => ({ ...prev, [field]: true }));
            return;
        }

       
        const parts = raw.split('.');
        if (parts.length > 1 && parts[1].length > 2) {
            return; 
        }

        const val = parseFloat(raw);

        if (isNaN(val)) return;

        if (val < 0) {
            setGradeErrors(prev => ({ ...prev, [field]: t('errors.grade_min') }));
            setFormData(prev => ({ ...prev, [field]: raw }));
            return;
        }

        if (val > 20) {
            setGradeErrors(prev => ({ ...prev, [field]: t('errors.grade_max') }));
            setFormData(prev => ({ ...prev, [field]: raw }));
            return;
        }

        setGradeErrors(prev => ({ ...prev, [field]: '' }));
        setFormData(prev => ({ ...prev, [field]: raw }));
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field) => (e) => {
    const raw = formData[field];
    if (raw === '' || raw === null) return;
    const val = Math.round(parseFloat(raw) * 100) / 100;
    if (!isNaN(val)) {
        setFormData(prev => ({ 
            ...prev, 
            [field]: val.toFixed(2) 
        }));
    }
};

    const validateMassar = (value) => {
        if (!value) { setMassarError(''); return; }
        setMassarError(/^[A-Za-z]\d{9}$/.test(value) ? '' : t('errors.massar_format'));
    };

    const fieldError = (key) => {
        if ((touched[key] || submitted) && !formData[key]) return t('errors.field_required');
        if (gradeErrors[key]) return gradeErrors[key];
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setError('');

        if (gradeKeys.some(k => !formData[k]) || !formData.massar_code) return;

        const hasGradeError = gradeKeys.some(k => {
            const val = parseFloat(formData[k]);
            return isNaN(val) || val < 0 || val > 20;
        });
        if (hasGradeError) {
            setError(t('errors.grade_range'));
            return;
        }

        if (!/^[A-Za-z]\d{9}$/.test(formData.massar_code)) {
            setMassarError(t('errors.massar_format'));
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/applications', formData, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            navigate('/');
        } catch (err) {
            if (err.response?.status === 401) { navigate('/login'); return; }
            setError(err.response?.data?.message || t('errors.generic'));
            setLoading(false);
        }
    };

    const subjects = [
        { key: 'maths',               label: t('subjects.maths') },
        { key: 'physique',            label: t('subjects.physics') },
        { key: 'langue_etrangere',    label: t('subjects.first_lang') },
        { key: 'langue_secondaire',   label: t('subjects.second_lang') },
        { key: 'histoire_geo',        label: t('subjects.history_geo') },
        { key: 'education_islamique', label: t('subjects.islamic_edu') },
        { key: 'sport',               label: t('subjects.sport') },
    ];

    return (
        <motion.div className="af-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            <header className="af-header">
                <div className="af-header-brand">
                    <span className="af-brand-acronym">LCI</span>
                    <div className="af-brand-divider" />
                    <div className="af-brand-text">
                        <span className="af-brand-name">{t('brand.name')}</span>
                        <span className="af-brand-sub">{t('brand.subtitle')}</span>
                    </div>
                </div>
                <div className="af-header-right">
                    <button className="af-btn-back" onClick={() => navigate('/')}>
                        ← {t('common.back')}
                    </button>
                </div>
            </header>

            <div className="lang-toggle-floating">
                <button type="button" className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`} onClick={() => i18n.changeLanguage('fr')}>FR</button>
                <button type="button" className={`lang-btn ${i18n.language === 'ar' ? 'active' : ''}`} onClick={() => i18n.changeLanguage('ar')}>AR</button>
            </div>

            <main className="af-main">
                <motion.div className="af-card"
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                <div className="af-warning">
                    <span className="af-warning-icon">⚠</span>
                    <div className="af-warning-text">
                        <p className="af-warning-title">{t('common.warning')}</p>
                        <p>{t('warning_line_1')}</p>
                        <p>{t('warning_line_2')}</p>
                        <p>{t('warning_line_3')}</p>
                    </div>
                </div>

                    <form onSubmit={handleSubmit} noValidate>

                        <section className="af-section">
                            <div className="af-section-header">
                                <span className="af-section-num">01</span>
                                <h3 className="af-section-title">{t('profile.personal_info')}</h3>
                            </div>
                            <div className="af-personal-grid">

                                <div className="af-field-group">
                                    <label className="af-label">
                                        {t('profile.full_name')}
                                       
                                    </label>
                                    <div className="af-input-readonly-wrap">
                                        <span className="af-readonly-icon">👤</span>
                                        <input
                                            type="text"
                                            className="af-input af-input-readonly"
                                            value={formData.full_name}
                                            tabIndex={-1}
                                        />
                                    </div>
                                </div>

                                <div className="af-field-group">
                                    <label className="af-label">{t('dashboard.massar_code')}</label>
                                    <input
                                        type="text"
                                        className={`af-input af-mono ${
                                            massarError || ((submitted || touched.massar_code) && !formData.massar_code)
                                                ? 'af-input-error' : ''
                                        }`}
                                        placeholder="Ex: J123456789"
                                        maxLength={10}
                                        value={formData.massar_code}
                                        onChange={e => { update('massar_code')(e); validateMassar(e.target.value); }}
                                        onBlur={() => setTouched(prev => ({ ...prev, massar_code: true }))}
                                    />
                                    <AnimatePresence>
                                        {(submitted || touched.massar_code) && !formData.massar_code && (
                                            <motion.span className="af-field-error"
                                                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                                                {t('errors.field_required')}
                                            </motion.span>
                                        )}
                                        {massarError && formData.massar_code && (
                                            <motion.span className="af-field-error"
                                                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                                                {massarError}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </section>

                        <div className="af-divider" />

                        <section className="af-section">
                            <div className="af-section-header">
                                <span className="af-section-num">02</span>
                                <h3 className="af-section-title">{t('dashboard.grades_title')}</h3>
                                <span className="af-section-hint">{t('common.out_of_20')}</span>
                            </div>
                            <div className="af-grades-grid">
                                {subjects.map(({ key, label }, i) => {
                                    const err = fieldError(key);
                                    return (
                                        <motion.div key={key}
                                            className={`af-grade-card ${err ? 'af-grade-card-error' : ''}`}
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + i * 0.06 }}
                                        >
                                            <label className="af-grade-label">{label}</label>
                                            <div className="af-grade-input-wrap">
                                                <input
                                                    type="number"
                                                    className={`af-grade-input ${err ? 'af-input-error' : ''}`}
                                                    step="0.01"
                                                    min="0"
                                                    max="20"
                                                    placeholder="0.00"
                                                    value={formData[key]}
                                                    onChange={updateGrade(key)}
                                                    onBlur={handleBlur(key)}
                                                />
                                                <span className="af-grade-unit">/20</span>
                                            </div>
                                            <AnimatePresence>
                                                {err && (
                                                    <motion.span className="af-field-error"
                                                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                                                        {err}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>

                        <AnimatePresence>
                            {error && (
                                <motion.div className="af-error"
                                    initial={{ opacity: 0, y: -8, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}>
                                    <span>⚠</span> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="af-form-footer">
                            <button type="button" className="af-btn-cancel" onClick={() => navigate('/')}>
                                {t('profile.cancel_btn')}
                            </button>
                            <motion.button type="submit"
                                className={`af-btn-submit ${loading ? 'af-loading' : ''}`}
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.01 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                            >
                                {loading
                                    ? <span className="af-spinner" />
                                    : <>{t('profile.save_btn')}<span className="af-btn-arrow">→</span></>
                                }
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </motion.div>
    );
};

export default ApplicationForm;