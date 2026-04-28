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
      setEmail('ahmed.m@company.com');
      setPassword('emp123');
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <Monitor size={40} color="var(--accent-primary)" />
          </div>
          <h1 style={styles.title}>IT Management System</h1>
          <p className="text-muted">Sign in to your account</p>
        </div>

        {error && (
          <div style={styles.errorBanner} className="animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={styles.inputContainer}>
              <Mail size={20} style={styles.inputIcon} />
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
            <div style={styles.inputContainer}>
              <Lock size={20} style={styles.inputIcon} />
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

        <div style={styles.demoSection}>
          <p style={styles.demoText}>Demo Accounts</p>
          <div style={styles.demoButtons}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => handleDemoClick('admin')}
              style={styles.demoBtn}
            >
              Admin
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => handleDemoClick('employee')}
              style={styles.demoBtn}
            >
              Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '3rem 2.5rem',
    borderRadius: 'var(--radius-xl)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  logoContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem auto',
    boxShadow: '0 0 20px var(--accent-glow)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--danger)',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  demoSection: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--border-color)',
  },
  demoText: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginBottom: '1rem',
  },
  demoButtons: {
    display: 'flex',
    gap: '1rem',
  },
  demoBtn: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '0.875rem',
  }
};
