'use client';

import { useState, useRef } from 'react';
import {
  X, Upload, FileText, Loader2, AlertCircle,
  CheckCircle2, Download, RefreshCw
} from 'lucide-react';

// ─── Column definitions in exact CSV order ─────────────────────────────────
// Index: 0..18
const COLUMNS = [
  { key: 'fullName',       label: 'Full Name',            required: true  },
  { key: 'jobTitle',       label: 'Job Title',            required: true  },
  { key: 'personalEmail',  label: 'Personal Email',       required: true  },
  { key: 'konectaMail',    label: 'Konecta Mail',         required: true  },
  { key: 'contactNo',      label: 'Contact No.',          required: false },
  { key: 'hiringDate',     label: 'Hiring Date',          required: false },
  { key: 'reportingTo',    label: 'Reporting To',         required: false },
  { key: 'laptopModel',    label: 'Laptop Model',         required: false },
  { key: 'laptopGen',      label: 'Gen',                  required: false },
  { key: 'processorCore',  label: 'Processor Core',       required: false },
  { key: 'ram',            label: 'RAM',                  required: false },
  { key: 'harddisk',       label: 'Harddisk',             required: false },
  { key: 'laptopSerial',   label: 'Laptop Serial No',     required: false },
  { key: 'laptopBrand',    label: 'Laptop Brand',         required: false },
  { key: 'macSerial',      label: 'MAC Serial',           required: false },
  { key: 'macEthernet',    label: 'MAC Ethernet',         required: false },
  { key: 'windowsLicense', label: 'Windows License',      required: false },
  { key: 'headsetSerial',  label: 'Headset S/N',          required: false },
  { key: 'screenSerial',   label: 'Screen S/N',           required: false },
];

// Parse a single CSV line (handles tab-separated from Excel/Sheets or comma-separated)
function parseCSVLine(line) {
  // If line contains tabs, it is tab-separated (TSV)
  if (line.includes('\t')) {
    return line.split('\t').map(s => s.trim());
  }

  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// Detect if first row is a header
function isHeaderRow(cols) {
  const lower = (cols[0] || '').toLowerCase();
  return (
    lower.includes('name') ||
    lower.includes('full') ||
    lower.includes('employee')
  );
}

// Build a row object from CSV columns
function rowFromCols(cols) {
  const obj = {};
  COLUMNS.forEach((col, idx) => {
    obj[col.key] = cols[idx] || '';
  });
  return obj;
}

// Validate a parsed row — returns warnings (non-blocking)
function validateRow(row) {
  const warnings = [];
  if (!row.fullName)       warnings.push('Name missing');
  if (!row.jobTitle)       warnings.push('Job Title missing');
  if (!row.personalEmail || !row.personalEmail.includes('@'))
                           warnings.push('Personal Email invalid/missing');
  if (!row.konectaMail   || !row.konectaMail.includes('@'))
                           warnings.push('Konecta Email invalid/missing');
  return warnings;
}

// Count how many devices a row has
function countDevices(row) {
  return [
    row.laptopSerial, row.macSerial, row.windowsLicense,
    row.headsetSerial, row.screenSerial
  ].filter(s => s?.trim()).length;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function BulkAddEmployeesModal({ departmentId, onClose, onUpdate }) {
  const [activeTab, setActiveTab]           = useState('paste');
  const [pasteText, setPasteText]           = useState('');
  const [parsedRows, setParsedRows]         = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [conflicts, setConflicts]           = useState([]);
  const [success, setSuccess]               = useState('');
  const fileInputRef                        = useRef(null);

  // ── Parse ──────────────────────────────────────────────────────────────────
  const parseText = (text) => {
    setError(''); setConflicts([]);
    if (!text.trim()) { setParsedRows([]); return; }

    const lines  = text.split('\n');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = parseCSVLine(line);

      // Skip header if detected on first row
      if (i === 0 && isHeaderRow(cols)) continue;

      const row        = rowFromCols(cols);
      row._warnings    = validateRow(row);
      result.push(row);
    }

    setParsedRows(result);
  };

  const handlePasteChange = (e) => {
    setPasteText(e.target.value);
    parseText(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target.result;
      setPasteText(text);
      parseText(text);
    };
    reader.readAsText(file);
  };

  // ── Download template ──────────────────────────────────────────────────────
  const downloadTemplate = () => {
    const header = COLUMNS.map(c => c.label).join(',');
    const example = [
      'John Doe', 'Developer', 'john@gmail.com', 'john.doe@konecta.com',
      '01012345678', '2026-06-23', 'Manager Name',
      'ThinkPad E14', '12th', 'i5', '16GB', '512GB SSD',
      'LP-SN-001', 'Lenovo',
      'MAC-SN-001', 'MAC-ETH-001',
      'WIN-LIC-001', 'HS-SN-001', 'SCR-SN-001'
    ].join(',');
    const csv  = `${header}\n${example}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url; a.download = 'bulk_employees_template.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    // Warnings are non-blocking — always allow import
    setLoading(true); setError(''); setConflicts([]);

    // Strip internal _warnings key before sending
    const cleanRows = parsedRows.map(({ _warnings, ...rest }) => rest);

    try {
      const res  = await fetch('/api/users/bulk-with-assets', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rows: cleanRows, departmentId })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(`✅ Successfully imported ${data.count} employees with their devices!`);
        setTimeout(() => { onUpdate(); onClose(); }, 1800);
      } else {
        setError(data.error || 'Import failed');
        if (data.conflicts) setConflicts(data.conflicts);
      }
    } catch {
      setError('Unexpected error during import');
    } finally {
      setLoading(false);
    }
  };

  const totalWarnings = parsedRows.filter(r => r._warnings.length > 0).length;
  const totalDevices  = parsedRows.reduce((s, r) => s + countDevices(r), 0);
  const canImport     = parsedRows.length > 0 && !loading;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay animate-fade-in no-print">
      <div className="modal-container" style={{ maxWidth: '960px', width: '95%' }}>

        {/* Header */}
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Upload size={22} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Bulk Upload Employees & Assets
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Import employees with their assigned devices in one step
              </p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn-small"><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}>

          {/* Alerts */}
          {error && (
            <div style={s.alert('danger')}>
              <AlertCircle size={16} />
              <div>
                <div>{error}</div>
                {conflicts.length > 0 && (
                  <ul style={{ margin: '0.25rem 0 0 1rem', fontSize: '0.78rem' }}>
                    {conflicts.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                )}
              </div>
            </div>
          )}
          {success && (
            <div style={s.alert('success')}>
              <CheckCircle2 size={16} /> <span>{success}</span>
            </div>
          )}

          {/* Format guide */}
          <div style={s.guide}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.82rem' }}>Required column order (19 columns):</strong>
              <button onClick={downloadTemplate} style={s.dlBtn}>
                <Download size={13} /> Download Template CSV
              </button>
            </div>
            <code style={s.code}>
              Full Name, Job Title, Personal Email, Konecta Mail, Contact No., Hiring Date, Reporting To,
              Laptop Model, Gen, Processor Core, RAM, Harddisk, Laptop Serial No, Laptop Brand,
              MAC Serial, MAC Ethernet, Windows License, Headset S/N, Screen S/N
            </code>
          </div>

          {/* Tabs */}
          <div style={s.tabs}>
            {[
              { id: 'paste',  icon: <FileText size={15} />, label: 'Paste CSV' },
              { id: 'upload', icon: <Upload   size={15} />, label: 'Upload File' },
            ].map(tab => (
              <button
                key={tab.id}
                style={{ ...s.tabBtn, ...(activeTab === tab.id ? s.tabBtnActive : {}) }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'paste' ? (
            <textarea
              value={pasteText}
              onChange={handlePasteChange}
              placeholder={
                'Paste CSV rows here (skip the header row)...\n\nExample:\n' +
                'John Doe, Developer, john@gmail.com, john.doe@konecta.com, 01012345678, 2026-06-23, Manager, ThinkPad E14, 12th, i5, 16GB, 512GB SSD, LP-SN-001, Lenovo, , , WIN-LIC-001, HS-SN-001,'
              }
              style={s.textarea}
              rows={6}
            />
          ) : (
            <div style={s.dropZone} onClick={() => fileInputRef.current?.click()}>
              <Upload size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem' }}>Click to select a CSV file</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Supports .csv and .txt files
              </p>
              <input
                ref={fileInputRef}
                type="file" accept=".csv,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Stats bar */}
          {parsedRows.length > 0 && (
            <div style={s.statsBar}>
              <span className="badge badge-info"   style={{ fontSize: '0.75rem' }}>
                {parsedRows.length} Employees
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                {totalDevices} Devices
              </span>
              {totalWarnings > 0 && (
                <span className="badge badge-warning" style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                  ⚠ {totalWarnings} with warnings (will still import)
                </span>
              )}
            </div>
          )}

          {/* Preview table */}
          {parsedRows.length > 0 && (
            <div style={s.tableWrapper}>
              <table className="w-full" style={{ fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.25)', position: 'sticky', top: 0 }}>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Job Title</th>
                    <th style={s.th}>Personal Email</th>
                    <th style={s.th}>Konecta Mail</th>
                    <th style={s.th}>Contact</th>
                    <th style={s.th}>Hiring Date</th>
                    <th style={s.th}>Laptop</th>
                    <th style={s.th}>Specs</th>
                    <th style={s.th}>Laptop S/N</th>
                    <th style={s.th}>MAC S/N</th>
                    <th style={s.th}>Win License</th>
                    <th style={s.th}>Headset</th>
                    <th style={s.th}>Screen</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, idx) => {
                    const hasWarn = row._warnings.length > 0;
                    return (
                      <tr key={idx} style={{ background: hasWarn ? 'rgba(245,158,11,0.04)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={s.td}>{idx + 1}</td>
                        <td style={{ ...s.td, fontWeight: 600, color: hasWarn ? '#fbbf24' : 'var(--text-primary)' }}>
                          {row.fullName || '—'}
                        </td>
                        <td style={s.td}>{row.jobTitle || '—'}</td>
                        <td style={s.td}>{row.personalEmail || '—'}</td>
                        <td style={s.td}>{row.konectaMail || '—'}</td>
                        <td style={s.td}>{row.contactNo || '—'}</td>
                        <td style={s.td}>{row.hiringDate || '—'}</td>
                        <td style={s.td}>
                          {row.laptopBrand ? `${row.laptopBrand} ` : ''}
                          {row.laptopModel || '—'}
                        </td>
                        <td style={{ ...s.td, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {[row.laptopGen, row.processorCore, row.ram, row.harddisk].filter(Boolean).join(' / ') || '—'}
                        </td>
                        <td style={{ ...s.td, fontFamily: 'monospace' }}>{row.laptopSerial || '—'}</td>
                        <td style={{ ...s.td, fontFamily: 'monospace' }}>{row.macSerial || '—'}</td>
                        <td style={{ ...s.td, fontFamily: 'monospace' }}>{row.windowsLicense || '—'}</td>
                        <td style={{ ...s.td, fontFamily: 'monospace' }}>{row.headsetSerial || '—'}</td>
                        <td style={{ ...s.td, fontFamily: 'monospace' }}>{row.screenSerial || '—'}</td>
                        <td style={s.td}>
                          {hasWarn ? (
                            <span style={{ color: '#fbbf24', fontSize: '0.7rem' }}>
                              ⚠ {row._warnings.join(', ')}
                            </span>
                          ) : (
                            <span style={{ color: '#34d399', fontSize: '0.7rem' }}>✓ Ready</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          {parsedRows.length > 0 && (
            <button
              onClick={() => { setParsedRows([]); setPasteText(''); setError(''); }}
              className="btn btn-secondary"
              style={{ gap: '0.35rem' }}
            >
              <RefreshCw size={15} /> Clear
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={!canImport}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Importing…</>
              : `Import ${parsedRows.length} Employees + ${totalDevices} Devices`
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15,23,42,0.4)'
  },
  alert: (type) => ({
    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
    padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem',
    background: type === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
    border: `1px solid ${type === 'danger' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
    color: type === 'danger' ? '#f87171' : '#34d399'
  }),
  guide: {
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px', lineHeight: 1.6
  },
  code: {
    display: 'block', marginTop: '0.35rem',
    fontFamily: 'monospace', fontSize: '0.72rem',
    color: 'var(--accent-primary)', wordBreak: 'break-all'
  },
  dlBtn: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: '6px', padding: '0.3rem 0.75rem',
    color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.78rem'
  },
  tabs: { display: 'flex', gap: '0.5rem' },
  tabBtn: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)',
    borderRadius: '6px', padding: '0.4rem 0.85rem',
    color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500
  },
  tabBtnActive: {
    background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)',
    color: 'var(--text-primary)'
  },
  textarea: {
    width: '100%', fontFamily: 'monospace', fontSize: '0.78rem',
    background: 'rgba(15,23,42,0.5)', border: '1px solid var(--border-color)',
    borderRadius: '6px', padding: '0.75rem', color: 'var(--text-primary)',
    resize: 'vertical', lineHeight: 1.5
  },
  dropZone: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', border: '2px dashed var(--border-color)', borderRadius: '8px',
    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
  },
  statsBar: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  tableWrapper: {
    maxHeight: '260px', overflowY: 'auto', overflowX: 'auto',
    border: '1px solid var(--border-color)', borderRadius: '6px',
    background: 'rgba(15,23,42,0.2)'
  },
  th: {
    padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600,
    color: 'var(--text-muted)', whiteSpace: 'nowrap',
    borderBottom: '1px solid rgba(255,255,255,0.06)'
  },
  td: {
    padding: '0.45rem 0.75rem', color: 'var(--text-secondary)',
    whiteSpace: 'nowrap', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis'
  }
};
