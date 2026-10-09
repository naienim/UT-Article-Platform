import React from 'react';

export default function PasswordStrengthMeter({ password }) {
    const requirements = [
        { id: 'length', text: 'At least 6 characters', regex: /.{6,}/ },
        { id: 'lowercase', text: 'At least one lowercase letter', regex: /[a-z]/ },
        { id: 'uppercase', text: 'At least one uppercase letter', regex: /[A-Z]/ },
        { id: 'number', text: 'At least one number', regex: /[0-9]/ }
    ];

    const calculateStrength = () => {
        let score = 0;
        requirements.forEach((req) => {
            if (req.regex.test(password)) {
                score += 1;
            }
        });

        if (score === 4 && password.length >= 10) {
            score += 1;
        }

        if (score >= 4 && /[^A-Za-z0-9]/.test(password)) {
            score += 1;
        }

        return score;
    };

    const score = calculateStrength();

    const getStrengthDetails = () => {
        if (!password) return { label: '', color: 'transparent', width: '0%' };
        if (score <= 2) return { label: 'Weak', color: '#dc2626', width: '25%' };
        if (score === 3) return { label: 'Fair', color: '#eab308', width: '50%' };
        if (score === 4) return { label: 'Good', color: '#3b82f6', width: '75%' };
        return { label: 'Strong', color: '#16a34a', width: '100%' };
    };

    const strengthDetails = getStrengthDetails();

    return (
        <div className="passwordStrengthContainer">
            {password.length > 0 && (
                <>
                    <div className="strengthBarTrack">
                        <div 
                            className="strengthBarFill" 
                            style={{ width: strengthDetails.width, backgroundColor: strengthDetails.color }}
                        ></div>
                    </div>
                    <div className="strengthLabel" style={{ color: strengthDetails.color }}>
                        {strengthDetails.label}
                    </div>
                </>
            )}

            <ul className="requirementsList">
                {requirements.map((req) => {
                    const isMet = req.regex.test(password);
                    return (
                        <li key={req.id} className={`requirementItem ${isMet ? 'met' : ''}`}>
                            <span className="requirementIcon">
                                {isMet ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                    </svg>
                                )}
                            </span>
                            {req.text}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}