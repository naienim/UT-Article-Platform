import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function SignUpPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({username: '', password: '', email: '', phoneNumber: ''});
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/signup', formData);
            
            login(response.data.token, response.data.username);
            
            toast.success('Sign up successful! Welcome to the platform.');
            navigate('/');
        } 
        catch (error) {
            toast.error(error.response?.data?.error || 'Sign up failed');
        }
    };

    return (
        <div className="container" style={{ maxWidth: 500 }}>
            <h1 className="pageTitle">Create an Account</h1>
            <p className="pageSubtitle">Sign up to join our community and publish articles.</p>

            <div className="card">
                <div className="cardBody">
                    <form onSubmit={handleSubmit} className="formGrid">
                        <div>
                            <label className="label">Username *</label>
                            <input className="input" type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Password *</label>
                            {/* <input className="input" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="" /> */}
                            <div className="passwordWrapper">
                                <input className="input" type={showPassword ? "text" : "password"} required value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="" />
                                <button type="button" className="passwordToggleBtn" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                            <PasswordStrengthMeter password={formData.password} />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input className="input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Phone Number</label>
                            <input className="input" type="text" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="" />
                        </div>
                        <p className="muted rs" style={{ margin: 0 }}>* At least one of Email or Phone is required.</p>
                        
                        <button className="btn btnPrimary" type="submit" style={{ marginTop: 10 }}>Sign Up</button>
                        
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <span className="muted">Already have an account? </span>
                            <Link to="/login" style={{ color: 'var(--link-color)', fontWeight: 600 }}>Log in here</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}