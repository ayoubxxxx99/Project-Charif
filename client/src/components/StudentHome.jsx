import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './StudentHome.css';
import { useTranslation } from 'react-i18next';

const ProfileDrawer = ({ open, onClose, token }) => {
    const [profile, setProfile] = useState({
        name: localStorage.getItem('user_name') || '',
        address: '', date_of_birth: '', guardian_name: '', guardian_phone: ''
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const fileRef = useRef();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    useEffect(() => {
        if (!open || !token) return;
        axios.get('http://127.0.0.1:8000/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const d = res.data;
            setProfile({
                name:           d.name           || localStorage.getItem('user_name') || '',
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
            setIsEditing(false);
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
                        <div className="drawer-header">
                            <div>
                                <div className="drawer-eyebrow">{t('profile.my_account')}</div>
                                <h2 className="drawer-title">{t('profile.title')}</h2>
                            </div>
                            <button className="drawer-close" onClick={onClose}>✕</button>
                        </div>

                        <div className="drawer-body">
                            <div className="drawer-avatar-section">
                                <div className="drawer-avatar-wrap" onClick={() => fileRef.current.click()}>
                                    {avatarPreview
                                        ? <img src={avatarPreview} alt="avatar" className="drawer-avatar-img" />
                                        : <div className="drawer-avatar-placeholder"><span>📷</span></div>
                                    }
                                    <div className="drawer-avatar-overlay">{t('profile.edit_avatar')}</div>
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

                            <div className="drawer-section-label">{t('profile.personal_info')}</div>

                            <div className="drawer-field">
                                <label className="drawer-label">{t('name_label')}</label>
                                <input
                                    type="text"
                                    className="drawer-input"
                                    value={profile.name}
                                    onChange={update('name')}
                                    readOnly={!isEditing}
                                />
                            </div>

                            <div className="drawer-field">
                                <label className="drawer-label">{t('profile.address')}</label>
                                <input
                                    className="drawer-input"
                                    value={profile.address}
                                    onChange={update('address')}
                                    readOnly={!isEditing}
                                />
                            </div>

                            <div className="drawer-field">
                                <label className="drawer-label">{t('profile.dob')}</label>
                                <input
                                    type="date"
                                    className="drawer-input"
                                    value={profile.date_of_birth}
                                    onChange={update('date_of_birth')}
                                    readOnly={!isEditing}
                                />
                            </div>

                            <div className="drawer-divider" />

                            <div className="drawer-section-label">{t('profile.guardian_section')}</div>

                            <div className="drawer-field">
                                <label className="drawer-label">{t('profile.guardian_name')}</label>
                                <input
                                    type="text"
                                    className="drawer-input"
                                    placeholder="Ex: Ahmed Alami"
                                    value={profile.guardian_name}
                                    onChange={update('guardian_name')}
                                    readOnly={!isEditing}
                                />
                            </div>

                            <div className="drawer-field">
                                <label className="drawer-label">{t('profile.guardian_phone')}</label>
                                <input
                                    type="tel"
                                    className="drawer-input"
                                    placeholder="Ex: 0661234567"
                                    value={profile.guardian_phone}
                                    onChange={update('guardian_phone')}
                                    readOnly={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="drawer-footer">
                            <AnimatePresence>
                                {saved && !isEditing && (
                                    <motion.span
                                        className="drawer-saved-msg"
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        ✓ {t('profile.saved_msg')}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {isEditing && (
                                <button
                                    className="drawer-btn-cancel"
                                    onClick={() => setIsEditing(false)}
                                    disabled={saving}
                                >
                                    {t('profile.cancel_btn')}
                                </button>
                            )}

                            <button
                                className={`drawer-btn-save ${isEditing ? 'mode-edit-save' : 'mode-edit-view'}`}
                                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                disabled={saving}
                            >
                                {saving ? (
                                    <span className="sh-spinner small" />
                                ) : (
                                    isEditing ? t('profile.save_btn') : t('profile.edit')
                                )}
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
    const { t, i18n } = useTranslation();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // 🔥 NOUVEAUX STATES pour rang et liste principale
    const [studentRank, setStudentRank] = useState(null);
    const [mainListInfo, setMainListInfo] = useState({ isMain: false, mainListIds: [] });
    
    const token = localStorage.getItem('token');

    // 🔥 REMPLACÉ : Récupère aussi le classement et la liste principale
    useEffect(() => {
        if (!token) { setLoading(false); return; }
        
        const fetchData = async () => {
            try {
                const appRes = await axios.get('http://127.0.0.1:8000/api/user-application', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const appData = appRes.data?.massar_code ? appRes.data : null;
                setApplication(appData);

                if (appData && appData.status === 'accepted') {
                    const [settingsRes, allAppsRes] = await Promise.all([
                        axios.get('http://127.0.0.1:8000/api/settings/main-list-count', {
                            headers: { Authorization: `Bearer ${token}` }
                        }),
                        axios.get('http://127.0.0.1:8000/api/applications', {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                    ]);

                    const mainListIds = settingsRes.data.main_list_ids || [];
                    setMainListInfo({ isMain: mainListIds.includes(appData.id), mainListIds });

                    const acceptedApps = allAppsRes.data
                        .filter(a => a.status === 'accepted')
                        .sort((a, b) => calculateMean(b) - calculateMean(a));
                    
                    const rank = acceptedApps.findIndex(a => a.id === appData.id) + 1;
                    setStudentRank(rank ? { rank, total: acceptedApps.length } : null);
                }
            } catch (err) {
                console.error("API Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const calculateMean = (app) => {
        if (!app) return 0;
        const grades = [
            app.maths, app.physique, app.langue_etrangere,
            app.langue_secondaire, app.histoire_geo,
            app.education_islamique, app.sport
        ];
        const total = grades.reduce((sum, g) => sum + parseFloat(g || 0), 0);
        return (total / grades.length);
    };

    const subjects = [
        { key: 'maths',              label: t('subjects.maths') },
        { key: 'physique',           label: t('subjects.physics') },
        { key: 'langue_etrangere',   label: t('subjects.first_lang') },
        { key: 'langue_secondaire',  label: t('subjects.second_lang') },
        { key: 'histoire_geo',       label: t('subjects.history_geo') },
        { key: 'education_islamique',label: t('subjects.islamic_edu') },
        { key: 'sport',              label: t('subjects.sport') },
    ];

    // 🔥 REMPLACÉ : Configuration des statuts avec sous-catégories pour accepted
    const getStatusConfig = (app) => {
        if (!app) return null;

        if (app.status === 'pending') {
            return {
                label: t('status.pending.label'),
                color: 'amber',
                icon: '◑',
                title: t('status.pending.title'),
                message: t('status.pending.message'),
                showDownload: false,
            };
        }

        if (app.status === 'rejected') {
            return {
                label: t('status.rejected.label'),
                color: 'red',
                icon: '✕',
                title: t('status.rejected.title'),
                message: t('status.rejected.message'),
                showDownload: false,
            };
        }

        if (app.status === 'accepted') {
            const isMain = mainListInfo.isMain;
            const convocationSent = app.convocation_sent;

            if (convocationSent) {
                return {
                    label: t('status.convocation.label'),
                    color: 'blue',
                    icon: '📧',
                    title: t('status.convocation.title'),
                    message: t('status.convocation.message'),
                    showDownload: true,
                };
            }

            if (isMain) {
                return {
                    label:t('status.main_list.label'),
                    color: 'green',
                    icon: '✓',
                    title: t('status.main_list.title'),
                    message: t('status.main_list.message'),
                    showDownload: false,
                };
            }

            return {
                label: t('status.waiting_list.label'),
                color: 'orange',
                icon: '⏳',
                title: t('status.waiting_list.title'),
                message: t('status.waiting_list.message'),
                showDownload: false,
            };
        }

        return {
            label: t('status.pending.label'),
            color: 'amber',
            icon: '◑',
            title: t('status.pending.title'),
            message: t('status.pending.message'),
            showDownload: false,
        };
    };

    if (loading) return (
        <div className="sh-loader">
            <div className="sh-spinner" />
        </div>
    );

    const userName = application?.full_name || localStorage.getItem('user_name') || t('common.student_fallback');
    const cfg = getStatusConfig(application);

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
                            <span className="sh-brand-name">{t('brand.name')}</span>
                            <span className="sh-brand-sub">{t('brand.subtitle')}</span>
                        </div>
                    </motion.div>

                    <div className="sh-nav-right">
                        <button
                            className="sh-user-chip sh-user-chip-btn"
                            onClick={() => setDrawerOpen(true)}
                            title={t('nav.edit_profile_tooltip')}
                        >
                            <div className="sh-avatar">{userName.charAt(0).toUpperCase()}</div>
                            <span className="sh-user-name">{userName}</span>
                        </button>

                        <button className="sh-btn-logout" onClick={handleLogout}>
                            {t('nav.logout')} <span>→</span>
                        </button>

                        <div className="sh-nav-divider" />

                        <div className="lang-toggle-container-sh">
                            <button
                                type="button"
                                className={`lang-btn-sh ${i18n.language === 'fr' ? 'active' : ''}`}
                                onClick={() => i18n.changeLanguage('fr')}
                            >FR</button>
                            <button
                                type="button"
                                className={`lang-btn-sh ${i18n.language === 'ar' ? 'active' : ''}`}
                                onClick={() => i18n.changeLanguage('ar')}
                            >AR</button>
                        </div>
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
                                            {application.status === 'accepted' && studentRank && (
                                                // Rang
                                               <p className="sh-rank-text">
                                                   {t('rank', { rank: studentRank.rank, total: studentRank.total })}
                                                </p>
                                            )}
                                            <h2 className="sh-status-title">{cfg.title}</h2>
                                            <p className="sh-status-msg">{cfg.message}</p>
                                        </div>
                                        
                                        <div className="sh-meta-grid">
                                            <div className="sh-meta-item">
                                                <span className="sh-meta-label">{t('dashboard.massar_code')}</span>
                                                <strong className="sh-meta-value sh-mono">{application.massar_code}</strong>
                                            </div>
                                            <div className="sh-meta-item">
                                                <span className="sh-meta-label">{t('dashboard.submitted_on')}</span>
                                                <strong className="sh-meta-value">
                                                    {new Date(application.created_at).toLocaleDateString(
                                                        i18n.language === 'ar' ? 'ar-MA' : 'fr-FR'
                                                    )}
                                                </strong>
                                            </div>
                                            <div className="sh-meta-item">
                                                <span className="sh-meta-label">{t('dashboard.gpa')}</span>
                                                <strong className="sh-meta-value sh-accent">{calculateMean(application).toFixed(2)} / 20</strong>
                                            </div>
                                        </div>
                                        
                                        {/* 🔥 MODIFIÉ : Bouton conditionnel */}
                                        <div className="sh-status-footer">
                                            {cfg.showDownload ? (
                                                <button className="sh-btn-primary">📥 Télécharger la convocation</button>
                                            ) : application?.status === 'rejected' ? (
                                                <button className="sh-btn-secondary" disabled>{t('dashboard.support')}</button>
                                            ) : (
                                                <button className="sh-btn-secondary" onClick={() => window.open('mailto:support@lci.ma')}>
                                                    {t('dashboard.contact_support')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="sh-grades-panel">
                                    <div className="sh-grades-header">
                                        <span className="sh-grades-title">{t('dashboard.grades_title')}</span>
                                        <span className="sh-grades-mean">{calculateMean(application).toFixed(2)}<small>/20</small></span>
                                    </div>
                                    <div className="sh-grades-list">
                                        {subjects.map((sub, i) => {
                                            const grade = parseFloat(application[sub.key] || 0);
                                            const pct = (grade / 20) * 100;
                                            const barColor = grade >= 14
                                                ? 'linear-gradient(90deg, #34d399, #6ee7b7)'
                                                : grade >= 10
                                                ? 'linear-gradient(90deg, #0d9488, #2dd4bf)'
                                                : 'linear-gradient(90deg, #f87171, #fca5a5)';
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
                                                            style={{ background: barColor }}
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
                                    <h2 className="sh-empty-title">{t('empty.title')}</h2>
                                    <p className="sh-empty-desc">{t('empty.desc')}</p>
                                    <motion.button
                                        className="sh-btn-primary"
                                        onClick={() => navigate('/apply')}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {t('empty.action_btn')}
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