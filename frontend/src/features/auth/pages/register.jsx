import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';
import './auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const submitForm = async (event) => {
    event.preventDefault();

    if (!agreed) {
      return;
    }

    const user = await handleRegister(email, username, password);
    if (user) {
      navigate('/login');
    }
  };

  const getStrength = (pwd) => {
    if (!pwd) return { label: '', pct: 0, color: 'transparent' };
    if (pwd.length < 6) return { label: 'Weak', pct: 25, color: '#ff6e84' };
    if (pwd.length < 10 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
      return { label: 'Medium', pct: 60, color: '#bd9dff' };
    return { label: 'Strong', pct: 100, color: '#4ade80' };
  };

  const strength = getStrength(password);

  return (
    <div className="auth-shell auth-shell--register">
      <div className="auth-background" />

      <main className="auth-layout">
        <section className="auth-copy auth-copy--register">
          <p className="auth-kicker">MayAi</p>
          <h1 className="auth-title">Create your account and build with live intelligence.</h1>
          <p className="auth-description">
            Clean workspace. Continuous context. One place for every question and idea.
          </p>
          <div className="auth-metrics">
            <span>3 model modes</span>
            <span>Team-ready prompts</span>
          </div>
        </section>

        <section className="auth-panel">
          <h2 className="panel-title">Create account</h2>
          <p className="panel-subtitle">Start using MayAi in less than a minute.</p>

          <form className="auth-form" onSubmit={submitForm}>
            <label htmlFor="register-name" className="field-label">Full name</label>
            <input
              id="register-name"
              type="text"
              className="auth-input"
              autoComplete="name"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="register-email" className="field-label">Email</label>
            <input
              id="register-email"
              type="email"
              className="auth-input"
              autoComplete="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="register-password" className="field-label">Password</label>
            <div className="password-wrap">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Create password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {password.length > 0 && (
              <div className="strength-wrapper" aria-live="polite">
                <span className="strength-label">Strength: {strength.label}</span>
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
                  />
                </div>
              </div>
            )}

            <label className="checkbox-row" htmlFor="terms-checkbox">
              <input
                id="terms-checkbox"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>I agree to the terms and privacy policy.</span>
            </label>

            <button type="submit" className="btn-primary" disabled={!agreed}>Create account</button>
          </form>

          <p className="panel-footer">
            Already have an account? <Link to="/login" className="text-link">Sign in</Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Register;