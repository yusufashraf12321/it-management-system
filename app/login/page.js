'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user.role === 'EMPLOYEE') {
          router.push('/portal');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (role) => {
    if (role === 'admin') {
      setEmail('admin@company.com');
      setPassword('admin123');
    } else {
      setEmail('ahmed.konecta@konecta.com');
      setPassword('emp123');
    }
  };

  return (
    <div className="login-container">
      <div className="glass-card login-card">
        <div className="login-header">
          <div className="login-logo-container">
            <Monitor size={40} color="var(--accent-primary)" />
          </div>
          <h1 className="login-title">IT Management System</h1>
          <p className="text-muted">Sign in to your account</p>
        </div>

        {error && (
          <div className="login-error-banner animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="login-input-container">
              <Mail size={20} className="login-input-icon" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required 
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <div className="login-input-container">
              <Lock size={20} className="login-input-icon" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required 
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
            disabled={loading}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="login-demo-section">
          <p className="login-demo-text">Demo Accounts</p>
          <div className="login-demo-buttons">
            <button 
              type="button" 
              className="btn btn-secondary login-demo-btn" 
              onClick={() => handleDemoClick('admin')}
            >
              Admin
            </button>
            <button 
              type="button" 
              className="btn btn-secondary login-demo-btn" 
              onClick={() => handleDemoClick('employee')}
            >
              Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
