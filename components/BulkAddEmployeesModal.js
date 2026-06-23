'use client';

import { useState } from 'react';
import { X, Upload, FileText, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function BulkAddEmployeesModal({ departmentId, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' or 'upload'
  const [pasteText, setPasteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parsedEmployees, setParsedEmployees] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  // CSV parsing logic client side
  const parseCSVData = (text) => {
    setError('');
    setConflicts([]);
    
    if (!text.trim()) {
      setParsedEmployees([]);
      return;
    }

    const lines = text.split('\n');
    const list = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle CSV parsing (splitting by comma, taking care of possible whitespace)
      const columns = line.split(',').map(col => col.trim());

      // Let's check headers. If the first row matches template columns, skip it
      if (i === 0 && (
        columns[0].toLowerCase().includes('name') || 
        columns[2]?.toLowerCase().includes('email')
      )) {
        continue;
      }

      // Expected columns: Name, Job Title, Personal Email, Konecta Email, Contact Number, Hiring Date, Reporting To
      const [fullName, jobTitle, personalEmail, konectaMail, contactNo, hiringDate, reportingTo] = columns;

      const emp = {
        fullName: fullName || '',
        jobTitle: jobTitle || '',
        personalEmail: personalEmail || '',
        konectaMail: konectaMail || '',
        contactNo: contactNo || '',
        hiringDate: hiringDate || new Date().toISOString().split('T')[0],
        reportingTo: reportingTo || '',
        errors: []
      };

      // Perform validation checks
      if (!emp.fullName) emp.errors.push('Name is required');
      if (!emp.jobTitle) emp.errors.push('Job title is required');
      if (!emp.personalEmail || !emp.personalEmail.includes('@')) emp.errors.push('Valid Personal Email is required');
      if (!emp.konectaMail || !emp.konectaMail.includes('@')) emp.errors.push('Valid Konecta Email is required');
      if (!emp.contactNo) emp.errors.push('Contact number is required');

      list.push(emp);
    }

    setParsedEmployees(list);
  };

  const handleTextChange = (e) => {
    setPasteText(e.target.value);
    parseCSVData(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setPasteText(text);
      parseCSVData(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedEmployees.length === 0) return;
    
    // Check if there are any client-side validation errors
    const hasErrors = parsedEmployees.some(emp => emp.errors.length > 0);
    if (hasErrors) {
      setError('Please fix all validation errors before importing / يرجى تصحيح أخطاء التحقق قبل الاستيراد.');
      return;
    }

    setLoading(true);
    setError('');
    setConflicts([]);

    try {
      const res = await fetch('/api/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: parsedEmployees,
          departmentId
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Successfully imported ${data.count} employees!`);
        setTimeout(() => {
          onUpdate();
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to import users');
        if (data.conflicts) {
          setConflicts(data.conflicts);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred during the import process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in no-print">
      <div className="modal-container" style={{ maxWidth: '850px', width: '90%' }}>
        <div style={styles.header}>
          <div className="flex items-center gap-2 text-accent-primary">
            <Upload size={22} />
            <h2 className="text-xl">Bulk Upload Employees / رفع جماعي للموظفين</h2>
          </div>
          <button onClick={onClose} className="icon-btn-small">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div className="badge badge-danger p-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', alignItems: 'center' }}>
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
              {conflicts.length > 0 && (
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'left', alignSelf: 'stretch', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                  <strong>Conflicts:</strong>
                  <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                    {conflicts.map((c, idx) => <li key={idx}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className="badge badge-success p-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Form instructions */}
          <div style={styles.instructions}>
            <strong>Format Details:</strong> CSV/Text fields must be comma-separated in this exact order:<br />
            <code style={styles.codeBlock}>
              Full Name, Job Title, Personal Email, Konecta Email, Contact Number, Hiring Date (YYYY-MM-DD), Reporting To (Optional)
            </code>
          </div>

          {/* Tabs */}
          <div style={styles.tabContainer}>
            <button
              onClick={() => setActiveTab('paste')}
              style={{ ...styles.tabButton, borderBottom: activeTab === 'paste' ? '2px solid var(--accent-primary)' : 'none', color: activeTab === 'paste' ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              <FileText size={16} />
              <span>Paste CSV text</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              style={{ ...styles.tabButton, borderBottom: activeTab === 'upload' ? '2px solid var(--accent-primary)' : 'none', color: activeTab === 'upload' ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              <Upload size={16} />
              <span>Upload CSV File</span>
            </button>
          </div>

          {activeTab === 'paste' ? (
            <div className="form-group">
              <textarea
                value={pasteText}
                onChange={handleTextChange}
                placeholder="Paste your CSV rows here...&#10;Example:&#10;Yousef Ashraf, Developer, yousef@gmail.com, yousef.ashraf@konecta.com, 01020304050, 2026-06-23, Manager Name"
                style={styles.textarea}
                rows={6}
              />
            </div>
          ) : (
            <div style={styles.dragDropBox}>
              <Upload size={32} className="text-muted mb-2" />
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Select or drag a CSV file to parse</p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          )}

          {/* Preview Table */}
          {parsedEmployees.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                  Parsed Employees Preview ({parsedEmployees.length})
                </h3>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {parsedEmployees.filter(e => e.errors.length > 0).length} errors found
                </span>
              </div>

              <div className="table-responsive" style={styles.tableWrapper}>
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-white/10" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <th className="p-2">Name</th>
                      <th className="p-2">Title</th>
                      <th className="p-2">Emails</th>
                      <th className="p-2">Contact</th>
                      <th className="p-2">Reporting To</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedEmployees.map((emp, index) => (
                      <tr key={index} className="border-b border-white/5" style={{ fontSize: '0.85rem', background: emp.errors.length > 0 ? 'rgba(239,68,68,0.03)' : 'none' }}>
                        <td className="p-2 font-semibold" style={{ color: emp.errors.length > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{emp.fullName || '—'}</td>
                        <td className="p-2">{emp.jobTitle || '—'}</td>
                        <td className="p-2">
                          <div style={{ fontSize: '0.75rem' }}>P: {emp.personalEmail || '—'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>K: {emp.konectaMail || '—'}</div>
                        </td>
                        <td className="p-2">{emp.contactNo || '—'}</td>
                        <td className="p-2">{emp.reportingTo || '—'}</td>
                        <td className="p-2">
                          {emp.errors.length > 0 ? (
                            <span className="text-danger" style={{ fontSize: '0.75rem', display: 'block' }}>
                              {emp.errors.join(', ')}
                            </span>
                          ) : (
                            <span className="text-success" style={{ fontSize: '0.75rem' }}>Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleImport}
            disabled={loading || parsedEmployees.length === 0}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              `Import ${parsedEmployees.length} Employees`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)',
  },
  instructions: {
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5
  },
  codeBlock: {
    display: 'block',
    marginTop: '0.25rem',
    fontFamily: 'monospace',
    color: 'var(--accent-primary)',
    fontSize: '0.75rem'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    gap: '1.5rem'
  },
  tabButton: {
    background: 'none',
    border: 'none',
    padding: '0.5rem 0.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.2s'
  },
  textarea: {
    width: '100%',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.75rem',
    color: 'var(--text-primary)',
    resize: 'vertical'
  },
  dragDropBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '2px dashed var(--border-color)',
    borderRadius: '8px',
    textAlign: 'center'
  },
  tableWrapper: {
    maxHeight: '220px',
    overflowY: 'auto',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    background: 'rgba(15, 23, 42, 0.2)'
  }
};
