import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Phone, Lock, FileText, Settings, Shield, Award, Calendar, Activity, AlertCircle } from 'lucide-react';
import axios from 'axios';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

const truncateWords = (text, maxWords) => {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length > maxWords) {
        return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
};

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('articles');
    
    const [detailsData, setDetailsData] = useState({ email: '', phoneNumber: '' });

    const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '' });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const loadProfile = async () => {
        try {
            const response = await axios.get('/api/users/me');
            setProfile(response.data);
            setDetailsData({ email: response.data.email || '', phoneNumber: response.data.phoneNumber || '' });
        } 
        catch (error) {
            toast.error('Failed to load profile');
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/users/me', detailsData);
            toast.success('Profile details updated successfully!');
            loadProfile();
        } 
        catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update details');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!securityData.currentPassword) {
            return toast.error('Please enter your current password');
        }
        if (!securityData.newPassword) {
            return toast.error('Please enter a new password');
        }
        try {
            await axios.put('/api/users/me', { currentPassword: securityData.currentPassword, newPassword: securityData.newPassword });
            toast.success('Password updated successfully!');
            setSecurityData({ currentPassword: '', newPassword: '' });
            setShowCurrentPassword(false);
            setShowNewPassword(false);
        } 
        catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update password');
        }
    };

    if (!profile) {
        return <div className="card"><div className="cardBody">Loading profile...</div></div>;
    }

    const articleCount = profile.articles?.length || 0;
    
    let rank = "Reader";
    let rankColor = "#64748b";
    if (articleCount >= 1 && articleCount <= 2) { 
        rank = "Novice Writer"; 
        rankColor = "#3b82f6"; 
    }
    else if (articleCount >= 3 && articleCount <= 5) { 
        rank = "Contributor"; 
        rankColor = "#10b981"; 
    }
    else if (articleCount >= 6) { 
        rank = "Scholar"; 
        rankColor = "#f59e0b"; 
    }
    else if (articleCount >= 10) { 
        rank = "Scholar"; 
        rankColor = "#8b5cf6"; 
    }

    let strengthScore = 25;
    if (profile.email) {
        strengthScore += 25;
    }
    if (profile.phoneNumber) {
        strengthScore += 25;
    }
    if (articleCount > 0) {
        strengthScore += 25;
    }


    const latestArticle = articleCount > 0 ? profile.articles[0] : null;
    const latestDate = latestArticle ? new Date(latestArticle.publishTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No activity yet';
    const dynamicBio = articleCount > 0 ? `An active contributor to the UT Platform, passionate about sharing knowledge and research.`: `A curious reader exploring the UT Platform. Hasn't published any articles yet.`;
    const initial = profile.username ? profile.username.charAt(0) : '?';

    return (
        <div>
            <h1 className="pageTitle">My Profile</h1>
            <p className="pageSubtitle">Manage your account settings and view your publications.</p>
            
            <div className="profileContainer">
                <aside className="profileSidebar">
                    <div className="avatarLarge">{initial}</div>
                    
                    <div className="badge" style={{ color: rankColor, backgroundColor: `${rankColor}15` }}>
                        <Award size={14} />
                        {rank}
                    </div>

                    <h2 className="profileName">{profile.username}</h2>
                    <p className="bioText">{dynamicBio}</p>

                    <div className="statsGrid">
                        <div className="statBox">
                            <span className="statValue">{articleCount}</span>
                            <span className="statLabel">Articles</span>
                        </div>
                        <div className="statBox">
                            <span className="statValue" style={{ fontSize: 16, marginTop: 4 }}>
                                {latestArticle ? <Activity size={20} color="var(--primary)" /> : '-'}
                            </span>
                            <span className="statLabel" style={{ marginTop: 4 }}>Active</span>
                        </div>
                    </div>

                    <div className="sidebarDivider"></div>

                    <div className="contactInfoList">
                        <div className="contactItem">
                            <div className="contactIconWrapper"><Mail size={16} /></div>
                            <span style={{ wordBreak: 'break-all' }}>
                                {profile.email ? profile.email : <span className="muted">No email added</span>}
                            </span>
                        </div>
                        <div className="contactItem">
                            <div className="contactIconWrapper"><Phone size={16} /></div>
                            <span>
                                {profile.phoneNumber ? profile.phoneNumber : <span className="muted">No phone added</span>}
                            </span>
                        </div>
                        <div className="contactItem">
                            <div className="contactIconWrapper"><Calendar size={16} /></div>
                            <span>
                                {/* <span className="muted" style={{ display: 'block', fontSize: 11 }}>Latest Pub: {latestDate}</span> */}
                                {<span>Latest Pub: {latestDate}</span>}
                            </span>
                        </div>
                    </div>

                    <div className="profileStrength">
                        <div className="strengthHeader">
                            <span>Profile Strength</span>
                            <span style={{ color: strengthScore === 100 ? '#10b981' : 'var(--text)' }}>
                                {strengthScore}%
                            </span>
                        </div>
                        <div className="strengthBarBg">
                            <div 
                                className="strengthBarFill" 
                                style={{ 
                                    width: `${strengthScore}%`,
                                    backgroundColor: strengthScore === 100 ? '#10b981' : 'var(--primary)'
                                }}
                            ></div>
                        </div>
                        {strengthScore < 100 && (
                            <p className="muted" style={{ fontSize: 11, marginTop: 8, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <AlertCircle size={12} /> Add missing info to reach 100%
                            </p>
                        )}
                    </div>
                </aside>

                <main>
                    <div className="tabNav">
                        <button 
                            className={`tabBtn ${activeTab === 'articles' ? 'active' : ''}`}
                            onClick={() => setActiveTab('articles')}
                        >
                            <FileText size={18} />
                            My Articles
                            <span style={{ 
                                background: activeTab === 'articles' ? 'rgba(37, 99, 235, 0.15)' : 'var(--border)', 
                                padding: '2px 8px', 
                                borderRadius: '999px', 
                                fontSize: '12px' 
                            }}>
                                {profile.articles?.length || 0}
                            </span>
                        </button>
                        <button 
                            className={`tabBtn ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={18} />
                            Account Details
                        </button>
                        <button 
                            className={`tabBtn ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Shield size={18} />
                            Security
                        </button>
                    </div>

                    <div className="tabContent">
                        {activeTab === 'articles' && (
                            <div className="stack scrollableList">
                                {profile.articles?.length === 0 ? (
                                    <div className="emptyState">
                                        <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                                        <h3 style={{ margin: '0 0 8px' }}>No articles yet</h3>
                                        <p style={{ margin: 0 }}>You haven't published any articles. When you do, they'll appear here.</p>
                                        <p></p>
                                        <Link to="/add-article" className="btn btnPrimary" style={{ display: 'inline-block', marginTop: '10px', textDecoration: 'none' }}>
                                            Submit an Article
                                        </Link>
                                    </div>
                                ) : (
                                    profile.articles.map(article => (
                                        <div key={article.id} className="card">
                                            <div className="cardBody">
                                                <h2 className="cardTitle">
                                                    <Link to={`/article/${article.id}`}>{article.title}</Link>
                                                </h2>
                                                <div className="metaRow">
                                                    <span>Published: {new Date(article.publishTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                    <span>References to this article: {article.referenceCount}</span>
                                                </div>
                                                {/* <p className="muted" style={{ margin: 0 }}>{article.summary}</p> */}
                                                <p className="muted" style={{ margin: 0 }}> {truncateWords(article.summary, 45)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="card">
                                <div className="cardBody">
                                    <h2 className="cardTitle" style={{ marginBottom: 16 }}>Contact Information</h2>
                                    <form onSubmit={handleUpdateDetails} className="formGrid">
                                        <div>
                                            <label className="label">Email Address</label>
                                            <div className="passwordWrapper">
                                                <Mail size={18} className="muted" style={{ position: 'absolute', left: 12 }} />
                                                <input 
                                                    className="input" 
                                                    type="email" 
                                                    style={{ paddingLeft: 40 }}
                                                    value={detailsData.email} 
                                                    onChange={(e) => setDetailsData({ ...detailsData, email: e.target.value })} 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="label">Phone Number</label>
                                            <div className="passwordWrapper">
                                                <Phone size={18} className="muted" style={{ position: 'absolute', left: 12 }} />
                                                <input 
                                                    className="input" 
                                                    type="text" 
                                                    style={{ paddingLeft: 40 }}
                                                    value={detailsData.phoneNumber} 
                                                    onChange={(e) => setDetailsData({ ...detailsData, phoneNumber: e.target.value })} 
                                                />
                                            </div>
                                        </div>
                                        <button className="btn btnPrimary" type="submit" style={{ width: 'fit-content', marginTop: 8 }}>
                                            Save Changes
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="card">
                                <div className="cardBody">
                                    <h2 className="cardTitle" style={{ marginBottom: 16 }}>Change Password</h2>
                                    <form onSubmit={handleUpdatePassword} className="formGrid">
                                        <div>
                                            <label className="label">Current Password</label>
                                            <div className="passwordWrapper">
                                                <Lock size={18} className="muted" style={{ position: 'absolute', left: 12 }} />
                                                <input 
                                                    className="input" 
                                                    type={showCurrentPassword ? "text" : "password"} 
                                                    style={{ paddingLeft: 40 }}
                                                    value={securityData.currentPassword} 
                                                    placeholder="Enter your current password"
                                                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })} 
                                                />
                                                <button type="button" className="passwordToggleBtn" onClick={() => setShowCurrentPassword(!showCurrentPassword)} tabIndex="-1">
                                                    {showCurrentPassword ? (
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                    ) : (
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="label">New Password</label>
                                            <div className="passwordWrapper">
                                                <Lock size={18} className="muted" style={{ position: 'absolute', left: 12 }} />
                                                <input 
                                                    className="input" 
                                                    type={showNewPassword ? "text" : "password"} 
                                                    style={{ paddingLeft: 40 }}
                                                    value={securityData.newPassword} 
                                                    placeholder="Enter a strong new password"
                                                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })} 
                                                />
                                                <button type="button" className="passwordToggleBtn" onClick={() => setShowNewPassword(!showNewPassword)} tabIndex="-1">
                                                    {showNewPassword ? (
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                    ) : (
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                    )}
                                                </button>
                                            </div>
                                            <div style={{ marginTop: 12 }}>
                                                <PasswordStrengthMeter password={securityData.newPassword} />
                                            </div>
                                        </div>

                                        <button className="btn btnPrimary" type="submit" style={{ width: 'fit-content', marginTop: 8 }}>
                                            Update Password
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}