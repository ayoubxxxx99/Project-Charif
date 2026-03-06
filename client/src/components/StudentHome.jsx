import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './StudentHome.css';


const ProfileDrawer = ({ open, onClose, token }) => {
    const [profile, setProfile] = useState({
        address: '', date_of_birth: '', guardian_name: '', guardian_phone: ''
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileRef = useRef();

    useEffect(() => {
        if (!open || !token) return;
        axios.get('http://127.0.0.1:8000/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const d = res.data;
            setProfile({
                address:        d.address        || '',
                date_of_birth:  d.date_of_birth  || '',
                guardian_name:  d.guardian_name  || '',
                guardian_phone: d.guardian_phone || '',
            });
            if (d.avatar_path) {
                setAvatarPreview(`http://127.0.0.1:8000/storage/${d.avatar_path}`);
            }
        }).catch(() => {});
    }, [open, token]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const form = new FormData();
            Object.entries(profile).forEach(([k, v]) => v && form.append(k, v));
            if (avatarFile) form.append('avatar', avatarFile);
            form.append('_method', 'POST');
            await axios.post('http://127.0.0.1:8000/api/profile', form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('Profile save error:', err);
        } finally {
            setSaving(false);
        }
    };

    const update = (field) => (e) => setProfile(p => ({ ...p, [field]: e.target.value }));

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="drawer-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.aside
                        className="profile-drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                    >
                        {/* Header */}
                        <div className="drawer-header">
                            <div>
                                <div className="drawer-eyebrow">Mon Compte</div>
                                <h2 className="drawer-title">Profil</h2>
                            </div>
                            <button className="drawer-close" onClick={onClose}>✕</button>
                        </div>

                        <div className="drawer-body">
                            {/* Avatar */}
                            <div className="drawer-avatar-section">
                                <div className="drawer-avatar-wrap" onClick={() => fileRef.current.click()}>
                                    {avatarPreview
                                        ? <img src={avatarPreview} alt="avatar" className="drawer-avatar-img" />
                                        : <div className="drawer-avatar-placeholder"><span>📷</span></div>
                                    }
                                    <div className="drawer-avatar-overlay">Modifier</div>
                                </div>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleAvatarChange}
                                />
                                <p className="drawer-avatar-hint">JPG, PNG — max 2 Mo</p>
                            </div>

                            <div className="drawer-divider" />

                            <div className="drawer-section-label">Informations Personnelles</div>

                            <div className="drawer-field">
                                <label className="drawer-label">Adresse</label>
                                <input
                                    type="text"
                                    className="drawer-input"
                                    placeholder="Ex: 12 Rue Ibn Batouta, Tétouan"
                                    value={profile.address}
                                    onChange={update('address')}
                                />
                            </div>

                            <div className="drawer-field">
                                <label className="drawer-label">Date de Naissance</label>
                                <input
                                    type="date"
                                    className="drawer-input"
                                    value={profile.date_of_birth}
                                    onChange={update('date_of_birth')}
                                />
                            </div>

                            <div className="drawer-divider" />

                            <div className="drawer-section-label">Tuteur Légal</div>

                            <div className="drawer-field">
                                <label className="drawer-label">Nom du Tuteur</label>
                                <input
                                    type="text"
                                    className="drawer-input"
                                    placeholder="Ex: Ahmed Alami"
                                    value={profile.guardian_name}
                                    onChange={update('guardian_name')}
                                />
                            </div>

                            <div className="drawer-field">
                                <label className="drawer-label">Téléphone du Tuteur</label>
                                <input
                                    type="tel"
                                    className="drawer-input"
                                    placeholder="Ex: 0661234567"
                                    value={profile.guardian_phone}
                                    onChange={update('guardian_phone')}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="drawer-footer">
                            <AnimatePresence>
                                {saved && (
                                    <motion.span
                                        className="drawer-saved-msg"
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        ✓ Enregistré
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            <button className="drawer-btn-cancel" onClick={onClose}>Annuler</button>
                            <button
                                className={`drawer-btn-save ${saving ? 'saving' : ''}`}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? <span className="sh-spinner small" /> : 'Enregistrer'}
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

const StudentHome = () => {
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { setLoading(false); return; }
        axios.get('http://127.0.0.1:8000/api/user-application', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setApplication(res.data?.massar_code ? res.data : null))
        .catch(err => { console.error("API Error:", err); setApplication(null); })
        .finally(() => setLoading(false));
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const calculateMean = (app) => {
        if (!app) return '0.00';
        const grades = [
            app.maths, app.physique, app.langue_etrangere,
            app.langue_secondaire, app.histoire_geo,
            app.education_islamique, app.sport
        ];
        const total = grades.reduce((sum, g) => sum + parseFloat(g || 0), 0);
        return (total / grades.length).toFixed(2);
    };

    const subjects = [
        { key: 'maths', label: 'Maths' },
        { key: 'physique', label: 'Physique' },
        { key: 'langue_etrangere', label: 'Langue Étrangère' },
        { key: 'langue_secondaire', label: 'Langue Secondaire' },
        { key: 'histoire_geo', label: 'Histoire-Géo' },
        { key: 'education_islamique', label: 'Éd. Islamique' },
        { key: 'sport', label: 'Sport' },
    ];

    const statusConfig = {
        accepted: {
            label: 'Acceptée', color: 'green', icon: '✓',
            title: 'Félicitations !',
            message: "Votre dossier a été validé par la commission. Nous sommes ravis de vous compter parmi nos futurs élèves.",
        },
        rejected: {
            label: 'Refusée', color: 'red', icon: '✕',
            title: 'Décision Finale',
            message: "Nous regrettons de vous informer que votre candidature n'a pas été retenue pour cette session.",
        },
        pending: {
            label: 'En attente', color: 'amber', icon: '◑',
            title: 'Dossier en Cours',
            message: "Votre candidature est en cours de traitement. L'administration examine vos résultats académiques.",
        },
    };

    if (loading) return (
        <div className="sh-loader">
            <div className="sh-spinner" />
        </div>
    );

    const userName = application?.full_name || localStorage.getItem('user_name') || 'Étudiant';
    const cfg = application ? (statusConfig[application.status] ?? statusConfig['pending']) : null;

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sh-page">

                {/* ── NAV ── */}
                <nav className="sh-nav">
                    <motion.div
                        className="sh-nav-brand"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        <span className="sh-brand-acronym">LCI</span>
                        <div className="sh-brand-divider" />
                        <div className="sh-brand-text">
                            <span className="sh-brand-name">Lycée Charif Idrissi</span>
                            <span className="sh-brand-sub">Portail de Candidature</span>
                        </div>
                    </motion.div>

                    <div className="sh-nav-right">
                        <button
                            className="sh-user-chip sh-user-chip-btn"
                            onClick={() => setDrawerOpen(true)}
                            title="Modifier mon profil"
                        >
                            <div className="sh-avatar">{userName.charAt(0).toUpperCase()}</div>
                            <span className="sh-user-name">{userName}</span>
                            <span className="sh-chip-edit">✎</span>
                        </button>
                        <button className="sh-btn-logout" onClick={handleLogout}>
                            Quitter <span>→</span>
                        </button>
                    </div>
                </nav>

                {/* ── MAIN ── */}
                <main className="sh-main">
                    <AnimatePresence mode="wait">
                        {application ? (
                            <motion.div
                                key="status"
                                className="sh-status-layout"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="sh-status-main">
                                    <div className={`sh-status-card sh-status-${cfg.color}`}>
                                        <div className="sh-status-top">
                                            <div className={`sh-status-icon-wrap sh-icon-${cfg.color}`}>
                                                <span className="sh-status-icon">{cfg.icon}</span>
                                            </div>
                                            <span className={`sh-status-pill sh-pill-${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <div className="sh-status-body">
                                            <h2 className="sh-status-title">{cfg.title}</h2>
                                            <p className="sh-status-msg">{cfg.message}</p>
                                        </div>
                                        <div className="sh-meta-grid">
                                            <div className="sh-meta-item">
                                                <span className="sh-meta-label">Code Massar</span>
                                                <strong className="sh-meta-value sh-mono">{application.massar_code}</strong>
                                            </div>
                                            <div className="sh-meta-item">
                                                <span className="sh-meta-label">Soumis le</span>
                                                <strong className="sh-meta-value">
                                                    {new Date(application.created_at).toLocaleDateString('fr-FR')}
                                                </strong>
                                            </div>
                                            <div className="sh-meta-item">
                                                <span className="sh-meta-label">Moyenne Générale</span>
                                                <strong className="sh-meta-value sh-accent">{calculateMean(application)} / 20</strong>
                                            </div>
                                        </div>
                                        <div className="sh-status-footer">
                                            {application.status === 'accepted' ? (
                                                <button className="sh-btn-primary">📥 Télécharger la Convocation</button>
                                            ) : (
                                                <button className="sh-btn-secondary">Contacter le support →</button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="sh-grades-panel">
                                    <div className="sh-grades-header">
                                        <span className="sh-grades-title">Relevé de Notes</span>
                                        <span className="sh-grades-mean">{calculateMean(application)}<small>/20</small></span>
                                    </div>
                                    <div className="sh-grades-list">
                                        {subjects.map((sub, i) => {
                                            const grade = parseFloat(application[sub.key] || 0);
                                            const pct = (grade / 20) * 100;
                                            return (
                                                <motion.div
                                                    key={sub.key}
                                                    className="sh-grade-row"
                                                    initial={{ opacity: 0, x: 16 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 + i * 0.06 }}
                                                >
                                                    <div className="sh-grade-info">
                                                        <span className="sh-grade-label">{sub.label}</span>
                                                        <span className="sh-grade-score">{grade}<small>/20</small></span>
                                                    </div>
                                                    <div className="sh-grade-bar-bg">
                                                        <motion.div
                                                            className="sh-grade-bar-fill"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ delay: 0.2 + i * 0.06, duration: 0.6, ease: 'easeOut' }}
                                                            style={{
                                                                background: grade >= 14
                                                                    ? 'linear-gradient(90deg, #34d399, #6ee7b7)'
                                                                    : grade >= 10
                                                                    ? 'linear-gradient(90deg, #4f8ef7, #82b4ff)'
                                                                    : 'linear-gradient(90deg, #f87171, #fca5a5)'
                                                            }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                className="sh-empty-view"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="sh-empty-card">
                                    <div className="sh-empty-icon">🎓</div>
                                    <h2 className="sh-empty-title">Prêt à postuler ?</h2>
                                    <p className="sh-empty-desc">
                                        Vous n'avez pas encore soumis de candidature pour l'année scolaire en cours.
                                    </p>
                                    <motion.button
                                        className="sh-btn-primary"
                                        onClick={() => navigate('/apply')}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Remplir le formulaire →
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </motion.div>

            <ProfileDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                token={token}
            />
        </>
    );
};

export default StudentHome;