'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Loader2, ArrowRight, Cpu, Server, Wifi } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        router.push(data.user.role === 'EMPLOYEE' ? '/portal' : '/dashboard');
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Animated background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      {/* Left panel - branding */}
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logoMark}>
            <Shield size={36} color="#3b82f6" strokeWidth={1.5} />
          </div>
          <h1 style={styles.brandName}>Konecta</h1>
          <p style={styles.brandTagline}>IT Management System</p>

          <div style={styles.featureList}>
            {[
              { icon: <Cpu size={16} />, text: 'Asset Tracking & Lifecycle' },
              { icon: <Server size={16} />, text: 'Inventory Intelligence' },
              { icon: <Wifi size={16} />, text: 'Real-time Infrastructure Health' },
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={styles.versionBadge}>v2.4.0 · STABLE</div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSubtitle}>Sign in to your account to continue</p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <Shield size={14} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={16} style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@konecta.com"
                  required
                  style={styles.input}
                  onFocus={(e) => { e.target.parentElement.style.borderColor = 'rgba(59,130,246,0.6)'; e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={(e) => { e.target.parentElement.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.parentElement.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={styles.input}
                  onFocus={(e) => { e.target.parentElement.style.borderColor = 'rgba(59,130,246,0.6)'; e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={(e) => { e.target.parentElement.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.parentElement.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick fill buttons */}
          <div style={styles.quickFill}>
            <p style={styles.quickFillLabel}>Quick fill:</p>
            <div style={styles.quickBtns}>
              {[
                { label: 'Youssef', email: 'youssef@konecta.com' },
                { label: 'Mohamed', email: 'mohamed@konecta.com' },
                { label: 'Abdelrahman', email: 'abdelrahman@konecta.com' },
              ].map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => { setEmail(a.email); setPassword('admin123'); }}
                  style={styles.quickBtn}
                  onMouseEnter={(e) => { e.target.style.borderColor = 'rgba(59,130,246,0.4)'; e.target.style.color = '#60a5fa'; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.color = '#4d6580'; }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.08); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,40px) scale(1.05); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,20px) scale(1.06); } }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#010b18',
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'fixed', width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
    top: '-150px', left: '-100px', animation: 'float1 12s ease-in-out infinite', pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed', width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)',
    bottom: '-120px', right: '-80px', animation: 'float2 15s ease-in-out infinite', pointerEvents: 'none',
  },
  orb3: {
    position: 'fixed', width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
    top: '50%', right: '35%', animation: 'float3 10s ease-in-out infinite', pointerEvents: 'none',
  },
  leftPanel: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    borderRight: '1px solid rgba(255,255,255,0.04)',
    background: 'linear-gradient(180deg, rgba(13,27,46,0.4) 0%, rgba(5,15,35,0.6) 100%)',
    backdropFilter: 'blur(8px)',
    position: 'relative',
    zIndex: 1,
  },
  brandContent: { maxWidth: '380px' },
  logoMark: {
    width: '72px', height: '72px', borderRadius: '20px',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(124,58,237,0.2))',
    border: '1px solid rgba(59,130,246,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 0 40px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
  },
  brandName: {
    fontSize: '2.8rem', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 0.25rem 0',
    background: 'linear-gradient(135deg, #f0f6ff 0%, #60a5fa 60%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  brandTagline: { fontSize: '1rem', color: '#4d6580', marginBottom: '3rem', fontWeight: '500' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '0.875rem' },
  featureIcon: {
    width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', flexShrink: 0,
  },
  featureText: { fontSize: '0.875rem', color: '#8ba3c0', fontWeight: '500' },
  versionBadge: {
    fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1.5px', color: '#4d6580',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    padding: '0.35rem 0.875rem', borderRadius: '999px', display: 'inline-block', fontFamily: 'monospace',
  },
  rightPanel: {
    width: '480px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', position: 'relative', zIndex: 1,
  },
  formCard: {
    width: '100%', padding: '2.5rem 2.25rem',
    background: 'rgba(13,27,46,0.6)', backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
  },
  formHeader: { marginBottom: '2rem' },
  formTitle: { fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#f0f6ff', margin: '0 0 0.5rem 0' },
  formSubtitle: { fontSize: '0.875rem', color: '#4d6580' },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
    color: '#f87171', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.875rem',
    marginBottom: '1.5rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#8ba3c0', textTransform: 'uppercase', letterSpacing: '0.8px' },
  inputWrapper: {
    display: 'flex', alignItems: 'center', position: 'relative',
    background: 'rgba(5,15,35,0.6)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', transition: 'all 0.2s ease', overflow: 'hidden',
  },
  inputIcon: { position: 'absolute', left: '1rem', color: '#4d6580', pointerEvents: 'none', zIndex: 1 },
  input: {
    width: '100%', background: 'transparent', border: 'none', outline: 'none',
    padding: '0.875rem 1rem 0.875rem 2.75rem', color: '#f0f6ff', fontSize: '0.9rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    padding: '0.95rem 1.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white', fontWeight: '700', fontSize: '0.95rem',
    boxShadow: '0 6px 25px -4px rgba(59,130,246,0.55)',
    transition: 'all 0.2s ease', letterSpacing: '0.2px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  quickFill: { paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' },
  quickFillLabel: { fontSize: '0.75rem', color: '#4d6580', marginBottom: '0.75rem', textAlign: 'center' },
  quickBtns: { display: 'flex', gap: '0.5rem', justifyContent: 'center' },
  quickBtn: {
    padding: '0.4rem 0.875rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(5,15,35,0.5)', color: '#4d6580', fontSize: '0.8rem', fontWeight: '500',
    cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};
