import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, AlertCircle, CheckCircle, UploadCloud, FileImage, Trash2, ChevronDown } from 'lucide-react';

export default function SubmitTicketModal({ user, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [recNumber, setRecNumber] = useState('');
  
  const [file, setFile] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    requesterName: '',
    email: '',
    issueImpact: '',
    clientImpact: 'NO',
    clientName: '',
    priority: 'LOW'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        requesterName: user.fullName || '',
        email: user.konectaMail || user.personalEmail || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setError('Only image files are allowed (PNG, JPG, WEBP).');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }
    setError('');
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setFileBase64(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setFileBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        requesterId: user?.id,
        attachmentName: file ? file.name : null,
        attachmentBase64: fileBase64 || null
      };

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket');
      
      setRecNumber(data.recNumber);
      setSuccess(true);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Shared label style ─── */
  const labelClass = "block text-[10px] uppercase font-bold tracking-[0.18em] mb-2.5";
  /* ─── Shared input style ─── */
  const inputClass = "w-full py-3.5 px-4 rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/60";

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 24 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        style={{
          width: '92vw',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(12, 20, 38, 0.96)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '1.5rem',
          boxShadow: '0 32px 96px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.06)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 100001,
        }}
      >
        {/* Top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, #3b82f6 0%, #0ea5e9 50%, transparent 100%)',
          opacity: 0.7,
          zIndex: 1,
        }} />

        {success ? (
          /* ── Success State ── */
          <div style={{ padding: '5rem 3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '2rem',
              boxShadow: '0 0 50px rgba(16,185,129,0.15), 0 0 0 1px rgba(16,185,129,0.15)',
              position: 'relative',
            }}>
              <CheckCircle size={48} />
            </div>
            <h3 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
              Ticket Dispatched!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '400px', marginBottom: '2.5rem' }}>
              Your request has been forwarded to the IT team. You can track its status from your dashboard.
            </p>

            <div style={{
              padding: '1.75rem 3rem',
              marginBottom: '2.5rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '1rem',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Reference Code
              </p>
              <p style={{ fontFamily: 'Fira Code, monospace', fontSize: '2.25rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.1em', textShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
                {recNumber}
              </p>
            </div>

            <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.9rem 3rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '11px' }}>
              Back to Dashboard
            </button>
          </div>

        ) : (
          /* ── Form State ── */
          <>
            {/* Header */}
            <div style={{
              padding: '1.75rem 2rem',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.015)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Submit IT Support Request
                </h2>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Infrastructure · Diagnostics · Support
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, minHeight: 0 }}>
              <div style={{ padding: '2rem', flex: 1 }}>

                {/* ── Row 1: Identity read-only ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Your Name</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={formData.requesterName}
                      readOnly
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'not-allowed', fontWeight: 600 }}
                    />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Contact Email</label>
                    <input
                      type="email"
                      className={inputClass}
                      value={formData.email}
                      readOnly
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'not-allowed', fontWeight: 600 }}
                    />
                  </div>
                </div>

                {/* ── Main Grid: Form left, Dropzone right ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', alignItems: 'start' }}>

                  {/* Left side */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Issue description */}
                    <div>
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Incident Description <span style={{ color: '#ef4444' }}>*</span></label>
                      <textarea
                        name="issueImpact"
                        value={formData.issueImpact}
                        onChange={handleChange}
                        placeholder="Describe the issue and how it impacts your workflow in detail..."
                        required
                        style={{
                          width: '100%', minHeight: '120px', resize: 'none',
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                          color: 'var(--text-primary)', padding: '0.875rem 1rem', borderRadius: '0.875rem',
                          fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6,
                          transition: 'all 0.2s', outline: 'none',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>

                    {/* Severity + Client Impact row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Severity Level</label>
                        <div style={{ position: 'relative' }}>
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            style={{
                              width: '100%', appearance: 'none',
                              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                              color: 'var(--text-primary)', padding: '0.8rem 2.5rem 0.8rem 1rem',
                              borderRadius: '0.875rem', fontFamily: 'inherit', fontSize: '12px',
                              fontWeight: 600, cursor: 'pointer', outline: 'none',
                              transition: 'all 0.2s',
                            }}
                          >
                            <option value="LOW">🟢 Low — Minimal</option>
                            <option value="MEDIUM">🟡 Medium — Partial Block</option>
                            <option value="HIGH">🟠 High — Blocked</option>
                            <option value="CRITICAL">🔴 Critical — System Down</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Client Affected?</label>
                        <div style={{ position: 'relative' }}>
                          <select
                            name="clientImpact"
                            value={formData.clientImpact}
                            onChange={handleChange}
                            style={{
                              width: '100%', appearance: 'none',
                              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                              color: 'var(--text-primary)', padding: '0.8rem 2.5rem 0.8rem 1rem',
                              borderRadius: '0.875rem', fontFamily: 'inherit', fontSize: '12px',
                              fontWeight: 600, cursor: 'pointer', outline: 'none',
                              transition: 'all 0.2s',
                            }}
                          >
                            <option value="NO">No Impact</option>
                            <option value="YES">Yes, Client Hit</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                        </div>
                      </div>
                    </div>

                    {/* Client Name (conditional) */}
                    <AnimatePresence>
                      {formData.clientImpact === 'YES' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.06)', borderRadius: '0.875rem', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <label className={labelClass} style={{ color: '#f59e0b' }}>Impacted Client Name</label>
                            <input
                              type="text"
                              name="clientName"
                              value={formData.clientName}
                              onChange={handleChange}
                              placeholder="Official client identifier..."
                              required={formData.clientImpact === 'YES'}
                              style={{
                                background: 'rgba(10,10,10,0.6)', border: '1px solid rgba(245,158,11,0.2)',
                                color: 'var(--text-primary)', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                fontFamily: 'inherit', fontSize: '0.875rem', width: '100%', outline: 'none',
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right side: Dropzone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                    <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Screenshot / Visual Evidence</label>
                    
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                    
                    <div
                      onClick={() => !file && fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      style={{
                        flex: 1,
                        minHeight: '220px',
                        border: `2px dashed ${isDragOver ? 'rgba(59,130,246,0.7)' : file ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '1rem',
                        background: isDragOver ? 'rgba(59,130,246,0.08)' : file ? 'rgba(59,130,246,0.04)' : 'rgba(255,255,255,0.015)',
                        cursor: file ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: file ? 'flex-start' : 'center',
                        padding: '1.25rem',
                        transition: 'all 0.25s',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {file ? (
                        <div style={{ width: '100%' }}>
                          {/* Image preview */}
                          {fileBase64 && (
                            <div style={{ width: '100%', height: '130px', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '0.875rem', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                              <img src={fileBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          {/* File info row */}
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'rgba(0,0,0,0.35)', padding: '0.6rem 0.875rem',
                            borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.06)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                              <FileImage size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
                              <span style={{ fontSize: '11px', fontFamily: 'Fira Code, monospace', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={clearFile}
                              style={{ background: 'none', border: 'none', padding: '4px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#3b82f6' }}>
                            <UploadCloud size={26} />
                          </div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                            {isDragOver ? 'Drop it here!' : 'Click or drag & drop'}
                          </p>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            PNG · JPG · WEBP · Max 5MB
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Tip */}
                    <div style={{ padding: '0.875rem 1rem', borderRadius: '0.875rem', border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(14,165,233,0.05)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <AlertCircle size={15} style={{ color: '#0ea5e9', flexShrink: 0, marginTop: '1px' }} />
                      <p style={{ fontSize: '11px', color: '#0ea5e9', lineHeight: 1.6, fontWeight: 500 }}>
                        Screenshots help the IT team diagnose faster. Blur sensitive info before uploading.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div style={{ marginTop: '1.5rem', padding: '0.875rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '1.25rem 2rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.01)',
                display: 'flex', justifyContent: 'flex-end', gap: '0.875rem',
                flexShrink: 0,
              }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 2rem', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 2.5rem', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 8px 25px rgba(59,130,246,0.25)' }}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <><Send size={15} /> Dispatch Ticket</>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
