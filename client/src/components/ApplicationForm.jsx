import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ApplicationForm.css';

const ApplicationForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '', massar_code: '',
        maths: '', physique: '', langue_etrangere: '',
        langue_secondaire: '', histoire_geo: '',
        education_islamique: '', sport: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [massarError, setMassarError] = useState('');

    const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

    const validateMassar = (value) => {
        if (!value) { setMassarError(''); return; }
        const valid = /^[A-Za-z]\d{9}$/.test(value);
        setMassarError(valid ? '' : 'Format invalide — ex: J123456789 (1 lettre + 9 chiffres)');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!/^[A-Za-z]\d{9}$/.test(formData.massar_code)) {
            setMassarError('Format invalide — ex: J123456789 (1 lettre + 9 chiffres)');
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
            setError(err.response?.data?.message || "Vérifiez vos informations et réessayez.");
            setLoading(false);
        }
    };

    const subjects = [
        { key: 'maths',               label: 'Mathématiques' },
        { key: 'physique',            label: 'Physique-Chimie' },
        { key: 'langue_etrangere',    label: 'Français — 1ère Langue' },
        { key: 'langue_secondaire',   label: 'Anglais — 2ème Langue' },
        { key: 'histoire_geo',        label: 'Histoire-Géographie' },
        { key: 'education_islamique', label: 'Éducation Islamique' },
        { key: 'sport',               label: 'Sport' },
    ];

    return (
        <motion.div className="af-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* ── HEADER ── */}
            <header className="af-header">
                <motion.div className="af-header-brand" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    <span className="af-brand-acronym">LCI</span>
                    <div className="af-brand-divider" />
                    <div className="af-brand-text">
                        <span className="af-brand-name">Lycée Charif Idrissi</span>
                        <span className="af-brand-sub">Candidature 2026 / 2027</span>
                    </div>
                </motion.div>
                <button className="af-btn-back" onClick={() => navigate('/')}>← Retour</button>
            </header>

            <main className="af-main">
                <motion.div
                    className="af-card"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Warning */}
                    <div className="af-warning">
                        <span className="af-warning-icon">⚠</span>
                        <p><strong>Attention</strong> — Veuillez vérifier scrupuleusement vos notes. Toute fausse déclaration entraînera le rejet automatique de votre dossier.</p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* ── SECTION 01 ── */}
                        <section className="af-section">
                            <div className="af-section-header">
                                <span className="af-section-num">01</span>
                                <h3 className="af-section-title">Informations Personnelles</h3>
                            </div>
                            <div className="af-personal-grid">
                                <div className="af-field-group">
                                    <label className="af-label">Nom Complet</label>
                                    <input type="text" className="af-input" placeholder="Ex: Mohammed Alami" onChange={update('full_name')} required />
                                </div>
                                <div className="af-field-group">
                                    <label className="af-label">Code Massar</label>
                                    <input
                                        type="text"
                                        className={`af-input af-mono ${massarError ? 'af-input-error' : ''}`}
                                        placeholder="Ex: J123456789"
                                        maxLength={10}
                                        onChange={e => {
                                            update('massar_code')(e);
                                            validateMassar(e.target.value);
                                        }}
                                        required
                                    />
                                    <AnimatePresence>
                                        {massarError && (
                                            <motion.span
                                                className="af-field-error"
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                            >
                                                {massarError}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </section>

                        <div className="af-divider" />

                        {/* ── SECTION 02 ── */}
                        <section className="af-section">
                            <div className="af-section-header">
                                <span className="af-section-num">02</span>
                                <h3 className="af-section-title">Notes des Matières</h3>
                                <span className="af-section-hint">Saisir sur 20 points</span>
                            </div>
                            <div className="af-grades-grid">
                                {subjects.map(({ key, label }, i) => (
                                    <motion.div
                                        key={key}
                                        className="af-grade-card"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + i * 0.06 }}
                                    >
                                        <label className="af-grade-label">{label}</label>
                                        <div className="af-grade-input-wrap">
                                            <input
                                                type="number"
                                                className="af-grade-input"
                                                step="0.01" min="0" max="20"
                                                placeholder="—"
                                                onChange={update(key)}
                                                required
                                            />
                                            <span className="af-grade-unit">/20</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* ── ERROR ── */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="af-error"
                                    initial={{ opacity: 0, y: -8, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <span>⚠</span> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── FOOTER ── */}
                        <div className="af-form-footer">
                            <button type="button" className="af-btn-cancel" onClick={() => navigate('/')}>Annuler</button>
                            <motion.button
                                type="submit"
                                className={`af-btn-submit ${loading ? 'af-loading' : ''}`}
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.01 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                            >
                                {loading
                                    ? <span className="af-spinner" />
                                    : <>Soumettre mon Dossier <span className="af-btn-arrow">→</span></>
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