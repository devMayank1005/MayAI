import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';
import './auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {handleLogin} = useAuth();
  const navigate = useNavigate();
  const submitForm = async (event ) => {
    event.preventDefault();

    const user = await handleLogin(email, password);
    if (user) {
      navigate('/');
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-background" />

      <main className="auth-layout">
        <section className="auth-copy auth-copy--login">
          <p className="auth-kicker">MayAi</p>
          <h1 className="auth-title">Sign in and continue your thinking loop.</h1>
          <p className="auth-description">
            A quiet, fast workspace for research, drafting, and discovery.
          </p>
          <div className="auth-metrics">
            <span>Latency: 0.4s</span>
            <span>Context memory: live</span>
          </div>
        </section>

        <section className="auth-panel">
          <h2 className="panel-title">Welcome back</h2>
          <p className="panel-subtitle">Use your MayAi account to sign in.</p>

          <form className="auth-form" onSubmit={submitForm}>
            <label htmlFor="login-email" className="field-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="auth-input"
              autoComplete="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div className="field-row">
              <label htmlFor="login-password" className="field-label">Password</label>
              <a href="#" className="text-link">Forgot?</a>
            </div>
            <div className="password-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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

            <button type="submit" className="btn-primary">Sign in</button>
          </form>

          <p className="panel-footer">
            New to MayAi? <Link to="/register" className="text-link">Create account</Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Login;