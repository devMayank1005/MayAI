import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';
import { useSelector } from 'react-redux';
import './auth.css';

const RESEND_COOLDOWN_SECONDS = 30;

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailDispatchQueued, setEmailDispatchQueued] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { handleRegister, handleResendVerificationEmail } = useAuth();
  const error = useSelector((state) => state.auth.error);
  const loading = useSelector((state) => state.auth.loading);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showSuccessToast) {
      return undefined;
    }

    const toastTimer = window.setTimeout(() => {
      setShowSuccessToast(false);
    }, 3500);

    return () => window.clearTimeout(toastTimer);
  }, [showSuccessToast]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [resendCooldown]);

  const submitForm = async (event) => {
    event.preventDefault();

    if (!agreed) {
      return;
    }

    const response = await handleRegister(email, username, password);
    if (response?.user) {
      setRegisterMessage(response.message || 'Registration successful.');
      setEmailSent(Boolean(response.emailSent));
      setEmailDispatchQueued(Boolean(response.emailDispatchQueued));
      setResendCooldown(0);
      setResendMessage('');
      setResendError('');
      setRegistered(true);
      setShowSuccessToast(true);
    }
  };

  const resendVerification = async () => {
    if (!email || resendLoading || resendCooldown > 0) {
      return;
    }

    setResendLoading(true);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    setResendMessage('');
    setResendError('');

    const response = await handleResendVerificationEmail(email);

    if (response?.success) {
      setResendMessage(response.message || 'Verification email resend requested.');
      setEmailDispatchQueued(Boolean(response.emailDispatchQueued));
    } else {
      setResendError('Unable to resend email right now. Please try again.');
    }

    setResendLoading(false);
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

      {showSuccessToast && (
        <div className="auth-toast auth-toast--success" role="status" aria-live="polite">
          <strong>Registration successful.</strong> {emailSent ? 'Verification email sent.' : 'Verification email dispatch queued.'}
        </div>
      )}

      <main className="auth-layout">
        <section className="auth-copy auth-copy--register">
          <img src="/mayai-logo.svg" alt="MayAi" className="auth-logo" />
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

          {registered ? (
            <div className="verification-message" style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
              <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>Registration Successful!</h3>
              <p style={{ marginBottom: '16px', color: '#666' }}>
                {registerMessage}
              </p>
              {emailSent && (
                <>
                  <p style={{ marginBottom: '16px', color: '#666' }}>
                    Verification email sent to <strong>{email}</strong>
                  </p>
                  <p style={{ marginBottom: '20px', color: '#666' }}>
                    Please click the link in the email to verify your account and proceed to login.
                  </p>
                </>
              )}
              {!emailSent && emailDispatchQueued && (
                <>
                  <p style={{ marginBottom: '12px', color: '#666' }}>
                    We are sending your verification email to <strong>{email}</strong>. If you do not receive it, check spam or resend.
                  </p>
                  <button
                    onClick={resendVerification}
                    className="btn-primary"
                    style={{ marginBottom: '12px' }}
                    disabled={resendLoading || resendCooldown > 0}
                  >
                    {resendLoading
                      ? 'Resending...'
                      : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend Verification Email'}
                  </button>
                  {resendMessage && (
                    <p style={{ marginBottom: '8px', color: '#2f7a4f', fontSize: '14px' }}>
                      {resendMessage}
                    </p>
                  )}
                  {resendError && (
                    <p style={{ marginBottom: '8px', color: '#d14343', fontSize: '14px' }}>
                      {resendError}
                    </p>
                  )}
                </>
              )}
              <button 
                onClick={() => navigate('/login')} 
                className="btn-primary"
                style={{ marginTop: '16px' }}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
            <form className="auth-form" onSubmit={submitForm}>
            <label htmlFor="register-name" className="field-label">Username</label>
            <input
              id="register-name"
              type="text"
              className="auth-input"
              autoComplete="username"
              placeholder="Letters, numbers, underscores only"
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

            {error && (
              <p style={{ color: '#d14343', margin: '4px 0 0', fontSize: '14px' }}>
                {error}
              </p>
            )}

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

            <button type="submit" className="btn-primary" disabled={!agreed || loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            </form>

            <p className="panel-footer">
              Already have an account? <Link to="/login" className="text-link">Sign in</Link>
            </p>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Register;