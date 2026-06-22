'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, CheckSquare, Square, Shield, Info, Edit2 } from 'lucide-react';

export default function PrintReceiptModal({ user, docTypePreset = null, changeTypePreset = null, swapData = null, onClose }) {
  const [docType, setDocType] = useState(docTypePreset || 'assignment'); // 'assignment', 'release', 'change'
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [notes, setNotes] = useState(swapData?.notes || '');
  const [changeType, setChangeType] = useState(changeTypePreset || 'permanent'); // 'permanent', 'temporary'
  
  // Custom Specs inputs for the printable form (to match user's grid template)
  const [cpu, setCpu] = useState('Core i5');
  const [ram, setRam] = useState('16 GB');
  const [storage, setStorage] = useState('512 GB');
  const [os, setOs] = useState('Windows 11');
  const [headset, setHeadset] = useState('Logitech');
  const [headsetSerial, setHeadsetSerial] = useState('2452MET39GA9');
  
  // Signature & Info fields
  const [manager, setManager] = useState(user?.reportingTo || '');
  const [itSpecialist, setItSpecialist] = useState('IT Operations');
  const [isPrinting, setIsPrinting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (docTypePreset) setDocType(docTypePreset);
    if (changeTypePreset) setChangeType(changeTypePreset);

    // Default to select all assigned assets
    if (user && user.assignedAssets) {
      setSelectedAssets(user.assignedAssets.map(a => a.id));
    }
  }, [user, docTypePreset, changeTypePreset]);

  if (!mounted) return null;

  const toggleAsset = (assetId) => {
    if (selectedAssets.includes(assetId)) {
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
    } else {
      setSelectedAssets([...selectedAssets, assetId]);
    }
  };

  const handlePrint = () => {
    if (!swapData && selectedAssets.length === 0 && docType !== 'release') {
      alert('Please select at least one asset to print.');
      return;
    }
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  // Identify the primary device for the top grid (e.g. Laptop or Monitor)
  let primaryAsset = null;
  if (swapData) {
    primaryAsset = swapData.newAsset;
  } else if (user.assignedAssets && user.assignedAssets.length > 0) {
    // Try to find a laptop first, or just take the first assigned asset
    primaryAsset = user.assignedAssets.find(a => a.inventoryItem?.category.toLowerCase() === 'laptop') || user.assignedAssets[0];
  }

  const activeAssets = user.assignedAssets?.filter(a => selectedAssets.includes(a.id)) || [];
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });

  return (
    <>
      {/* Modal Controller UI (no-print) */}
      <div className="modal-overlay no-print animate-fade-in">
        <div className="modal-container" style={{ maxWidth: '700px' }}>
          <div style={styles.modalHeader}>
            <div className="flex items-center gap-2">
              <Shield className="text-accent-primary" size={22} />
              <h2 className="text-xl">IT Document Generator</h2>
            </div>
            <button onClick={onClose} className="icon-btn-small">
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
              Fill in the specification details to generate a corporate-standard printable form.
            </p>

            {/* Document Type Selection (Disabled if preset from swap/resign flows) */}
            {!docTypePreset && (
              <div className="form-group">
                <label className="form-label">Document Type / نوع المستند</label>
                <div style={styles.radioGroup}>
                  <label style={{ ...styles.radioLabel, border: docType === 'assignment' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', background: docType === 'assignment' ? 'rgba(59, 130, 246, 0.05)' : 'none' }}>
                    <input type="radio" name="docType" value="assignment" checked={docType === 'assignment'} onChange={() => setDocType('assignment')} style={{ marginRight: '8px' }} />
                    <div>
                      <strong style={{ display: 'block' }}>Custody Handover / تسليم عهدة</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Assigning assets to employee</span>
                    </div>
                  </label>
                  <label style={{ ...styles.radioLabel, border: docType === 'release' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', background: docType === 'release' ? 'rgba(59, 130, 246, 0.05)' : 'none' }}>
                    <input type="radio" name="docType" value="release" checked={docType === 'release'} onChange={() => setDocType('release')} style={{ marginRight: '8px' }} />
                    <div>
                      <strong style={{ display: 'block' }}>IT Clearance / إخلاء طرف</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Returning assets to inventory</span>
                    </div>
                  </label>
                  <label style={{ ...styles.radioLabel, border: docType === 'change' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', background: docType === 'change' ? 'rgba(59, 130, 246, 0.05)' : 'none' }}>
                    <input type="radio" name="docType" value="change" checked={docType === 'change'} onChange={() => setDocType('change')} style={{ marginRight: '8px' }} />
                    <div>
                      <strong style={{ display: 'block' }}>Custody Alteration / تعديل عهدة</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Replacing or changing assets</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Document presets notice */}
            {docTypePreset && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-md text-sm text-accent-primary">
                <Info size={16} />
                <span>
                  Preset Document Mode: <strong>{docType === 'release' ? 'Clearance' : docType === 'change' ? 'Device Swap (' + changeType + ')' : 'Custody Handover'}</strong>
                </span>
              </div>
            )}

            {/* Assets Selection list (hidden if it's a swap) */}
            {!swapData && docType !== 'release' && (
              <div className="form-group">
                <label className="form-label">Include Assets / الأجهزة المضمنة بالطباعة</label>
                <div style={styles.assetList}>
                  {user.assignedAssets?.map(asset => (
                    <div key={asset.id} style={styles.assetItem} onClick={() => toggleAsset(asset.id)}>
                      {selectedAssets.includes(asset.id) ? (
                        <CheckSquare size={18} className="text-accent-primary" />
                      ) : (
                        <Square size={18} className="text-muted" />
                      )}
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600 }}>{asset.inventoryItem?.brand} {asset.inventoryItem?.model}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '8px' }}>({asset.inventoryItem?.category})</span>
                        <div className="text-muted font-mono" style={{ fontSize: '0.75rem' }}>S/N: {asset.serialNumber}</div>
                      </div>
                    </div>
                  ))}
                  {(!user.assignedAssets || user.assignedAssets.length === 0) && (
                    <p className="text-center text-muted p-4">No assets assigned / لا توجد أجهزة للموظف.</p>
                  )}
                </div>
              </div>
            )}

            {/* Editable Specs Grid for print output */}
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Print Specifications / تفاصيل المواصفات للطباعة</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">CPU / المعالج</label>
                <input type="text" value={cpu} onChange={(e) => setCpu(e.target.value)} placeholder="e.g. Core i5" />
              </div>
              <div className="form-group">
                <label className="form-label">RAM / الذاكرة العشوائية</label>
                <input type="text" value={ram} onChange={(e) => setRam} placeholder="e.g. 16 GB" />
              </div>
              <div className="form-group">
                <label className="form-label">Storage / مساحة التخزين</label>
                <input type="text" value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="e.g. 512 GB SSD" />
              </div>
              <div className="form-group">
                <label className="form-label">Operating System / نظام التشغيل</label>
                <input type="text" value={os} onChange={(e) => setOs(e.target.value)} placeholder="e.g. Windows 11" />
              </div>
              <div className="form-group">
                <label className="form-label">Headset / سماعة الرأس</label>
                <input type="text" value={headset} onChange={(e) => setHeadset(e.target.value)} placeholder="e.g. Logitech Headset" />
              </div>
              <div className="form-group">
                <label className="form-label">Headset Serial / الرقم التسلسلي للسماعة</label>
                <input type="text" value={headsetSerial} onChange={(e) => setHeadsetSerial(e.target.value)} placeholder="e.g. Serial code" />
              </div>
              <div className="form-group">
                <label className="form-label">Direct Manager / المدير المباشر</label>
                <input type="text" value={manager} onChange={(e) => setManager(e.target.value)} placeholder="e.g. Manager Name" />
              </div>
              <div className="form-group">
                <label className="form-label">IT Specialist / مسؤول الـ IT</label>
                <input type="text" value={itSpecialist} onChange={(e) => setItSpecialist(e.target.value)} placeholder="e.g. IT Operations" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction Notes / ملاحظات إضافية</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Condition details, swap reasons..." />
            </div>
          </div>

          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-secondary">Cancel / إلغاء</button>
            <button onClick={handlePrint} className="btn btn-success">
              <Printer size={16} />
              <span>Generate & Print / توليد وطباعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet (Appended directly to Body, visible only during @media print) */}
      {isPrinting && createPortal(
        <div id="print-area" style={printStyles.container}>
          {/* Boxed header */}
          <table style={printStyles.headerTable}>
            <tbody>
              <tr>
                <td style={printStyles.headerLogoCell}>
                  <div style={printStyles.logoContainer}>
                    <span style={printStyles.logoText}>Konecta</span>
                  </div>
                </td>
                <td style={printStyles.headerTitleCell}>
                  <div style={printStyles.deptTitle}>IT DEPARTMENT</div>
                  <div style={printStyles.formTitle}>
                    {docType === 'assignment' && 'EMPLOYEE CUSTODY FORM'}
                    {docType === 'release' && 'EMPLOYEE RETURN & CLEARANCE FORM'}
                    {docType === 'change' && `CUSTODY SWAP & ALTERATION FORM`}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Metadata Block */}
          <div style={printStyles.metaBlock}>
            <table style={printStyles.metaTable}>
              <tbody>
                <tr>
                  <td style={printStyles.metaLeft}>
                    <strong>Name:</strong> {user.fullName}
                  </td>
                  <td style={printStyles.metaRight}>
                    <strong>Date:</strong> {currentDate}
                  </td>
                </tr>
              </tbody>
            </table>
            <p style={printStyles.introText}>
              {docType === 'assignment' && "This form declares Konecta EGYPT employees responsible for the company's assets in their custody."}
              {docType === 'release' && "This form certifies that the employee has returned all company assets to the IT department custody."}
              {docType === 'change' && `This form registers changes (type: ${changeType.toUpperCase()}) in the company assets assigned to the employee.`}
            </p>
          </div>

          {/* Swap details or single Device grid */}
          {docType === 'change' && swapData ? (
            <>
              {/* Swap Device Tables */}
              <div style={printStyles.sectionHeader}>Returned Device / الأجهزة المسترجعة</div>
              <table style={printStyles.gridTable}>
                <tbody>
                  <tr>
                    <td style={printStyles.gridLabel}>Device Type</td>
                    <td style={printStyles.gridValue}>{swapData.oldAsset.inventoryItem?.category || 'Laptop'}</td>
                    <td style={printStyles.gridLabel}>Brand</td>
                    <td style={printStyles.gridBrandValue}>{swapData.oldAsset.inventoryItem?.brand || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={printStyles.gridLabel}>Model</td>
                    <td style={printStyles.gridModelValue}>{swapData.oldAsset.inventoryItem?.model || 'N/A'}</td>
                    <td style={printStyles.gridLabel}>Serial Number</td>
                    <td style={printStyles.gridSerialValue}>{swapData.oldAsset.serialNumber}</td>
                  </tr>
                </tbody>
              </table>

              <div style={printStyles.sectionHeader}>Replacement Device / الأجهزة المسلمة الجديدة</div>
              <table style={printStyles.gridTable}>
                <tbody>
                  <tr>
                    <td style={printStyles.gridLabel}>Device Type</td>
                    <td style={printStyles.gridValue}>{swapData.newAsset.inventoryItem?.category || 'Laptop'}</td>
                    <td style={printStyles.gridLabel}>Brand</td>
                    <td style={printStyles.gridBrandValue}>{swapData.newAsset.inventoryItem?.brand || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={printStyles.gridLabel}>Model</td>
                    <td style={printStyles.gridModelValue}>{swapData.newAsset.inventoryItem?.model || 'N/A'}</td>
                    <td style={printStyles.gridLabel}>Serial Number</td>
                    <td style={printStyles.gridSerialValue}>{swapData.newAsset.serialNumber}</td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <>
              {/* Main Device Details */}
              <div style={printStyles.sectionHeader}>Device</div>
              <table style={printStyles.gridTable}>
                <tbody>
                  <tr>
                    <td style={printStyles.gridLabel}>Device Type</td>
                    <td style={printStyles.gridValue}>{primaryAsset?.inventoryItem?.category || 'Laptop'}</td>
                    <td style={printStyles.gridLabel}>Brand</td>
                    <td style={printStyles.gridBrandValue}>{primaryAsset?.inventoryItem?.brand || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={printStyles.gridLabel}>Model</td>
                    <td style={printStyles.gridModelValue}>{primaryAsset?.inventoryItem?.model || 'N/A'}</td>
                    <td style={printStyles.gridLabel}>Serial Number</td>
                    <td style={printStyles.gridSerialValue}>{primaryAsset?.serialNumber || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* System Specs Table */}
          <div style={printStyles.sectionHeader}>System Specs</div>
          <table style={printStyles.gridTable}>
            <tbody>
              <tr>
                <td style={printStyles.gridLabel}>CPU</td>
                <td style={printStyles.gridValue}>{cpu}</td>
                <td style={printStyles.gridLabel}>Memory (RAM)</td>
                <td style={printStyles.gridValue}>{ram}</td>
              </tr>
              <tr>
                <td style={printStyles.gridLabel}>Storage</td>
                <td style={printStyles.gridValue}>{storage}</td>
                <td style={printStyles.gridLabel}>Operating System</td>
                <td style={printStyles.gridValue}>{os}</td>
              </tr>
              <tr>
                <td style={printStyles.gridLabel}>Headset</td>
                <td style={printStyles.gridValue}>{headset}</td>
                <td style={printStyles.gridLabel}>Serial Number</td>
                <td style={printStyles.gridValue}>{headsetSerial}</td>
              </tr>
            </tbody>
          </table>

          {/* Employee INFO Table */}
          <div style={printStyles.sectionHeader}>Employee INFO</div>
          <table style={printStyles.gridTable}>
            <tbody>
              <tr>
                <td style={printStyles.gridLabel}>Employee name:</td>
                <td style={printStyles.gridValue}>{user.fullName}</td>
                <td style={printStyles.gridLabel}>Title/Department</td>
                <td style={printStyles.gridValue}>{user.jobTitle} / {user.department?.name || 'N/A'}</td>
              </tr>
              <tr>
                <td style={printStyles.gridLabel}>Manager</td>
                <td style={printStyles.gridValue}>{manager || '................................'}</td>
                <td style={printStyles.gridLabel}>Contact:</td>
                <td style={printStyles.gridValue}>{user.contactNo || '................................'}</td>
              </tr>
            </tbody>
          </table>

          {/* Additional details if multiple assets are assigned (but not in swap) */}
          {!swapData && activeAssets.length > 1 && (
            <div style={{ marginTop: '15px' }}>
              <div style={printStyles.sectionHeader}>Additional Accessories & Assets</div>
              <table style={printStyles.accessoriesTable}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Model & Brand</th>
                    <th>Serial Number</th>
                    <th>Assign Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAssets.filter(a => a.id !== primaryAsset?.id).map((asset) => (
                    <tr key={asset.id}>
                      <td>{asset.inventoryItem?.category}</td>
                      <td>{asset.inventoryItem?.brand} {asset.inventoryItem?.model}</td>
                      <td>{asset.serialNumber}</td>
                      <td>{asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : currentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notes area */}
          {notes && (
            <div style={{ marginTop: '15px', border: '1px solid #000', padding: '8px', fontSize: '0.85rem' }}>
              <strong>Transaction Notes:</strong> {notes}
            </div>
          )}

          {/* Signature Block */}
          <div style={printStyles.footerSignSection}>
            <p style={printStyles.signDecl}>
              By signing below, I declare my full responsibility for the company's assets.
            </p>
            
            <div style={printStyles.signatureRow}>
              <div style={printStyles.sigBox}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '25px' }}>IT Signature</div>
                <div>. . . . . . . . . . . . . . . . . .</div>
              </div>
              <div style={printStyles.sigBox}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '25px' }}>Employee Signature</div>
                <div>. . . . . . . . . . . . . . . . . .</div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

const styles = {
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)',
  },
  radioGroup: {
    display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem'
  },
  radioLabel: {
    display: 'flex', alignItems: 'flex-start', padding: '0.875rem',
    borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
  },
  assetList: {
    maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column',
    gap: '0.5rem', padding: '0.5rem', background: 'rgba(15, 23, 42, 0.3)',
    borderRadius: '8px', border: '1px solid var(--border-color)',
  },
  assetItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem',
    background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer', transition: 'all 0.2s',
  },
};

// CSS print styling matching the exact template design
const printStyles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '10mm 15mm',
    backgroundColor: '#ffffff',
    color: '#000000',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  headerTable: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1.5px solid #000000',
    marginBottom: '20px',
  },
  headerLogoCell: {
    width: '60%',
    padding: '20px 25px',
    verticalAlign: 'middle',
    borderRight: '1.5px solid #000000',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontSize: '2.5rem',
    fontWeight: '800',
    letterSpacing: '-2px',
    color: '#0d1b2e',
  },
  headerTitleCell: {
    width: '40%',
    padding: '15px',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  deptTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  formTitle: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#000000',
  },
  metaBlock: {
    marginBottom: '15px',
  },
  metaTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '8px',
  },
  metaLeft: {
    fontSize: '0.95rem',
    textAlign: 'left',
  },
  metaRight: {
    fontSize: '0.95rem',
    textAlign: 'right',
  },
  introText: {
    fontSize: '0.85rem',
    lineHeight: '1.4',
    margin: '10px 0 0 0',
  },
  sectionHeader: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    margin: '15px 0 6px 0',
  },
  gridTable: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1.5px solid #000000',
    marginBottom: '10px',
  },
  gridLabel: {
    width: '20%',
    padding: '6px 8px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    border: '1px solid #000000',
    backgroundColor: '#fafafa',
  },
  gridValue: {
    width: '30%',
    padding: '6px 8px',
    fontSize: '0.85rem',
    border: '1px solid #000000',
  },
  gridBrandValue: {
    width: '30%',
    padding: '6px 8px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    border: '1px solid #000000',
    color: '#2563eb', // THINKPAD in blue color
  },
  gridModelValue: {
    width: '30%',
    padding: '6px 8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    border: '1px solid #000000',
    color: '#2563eb', // Blue model
  },
  gridSerialValue: {
    width: '30%',
    padding: '6px 8px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    border: '1px solid #000000',
  },
  accessoriesTable: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #000000',
    fontSize: '0.8rem',
  },
  footerSignSection: {
    marginTop: 'auto',
    paddingTop: '20px',
  },
  signDecl: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '35px',
  },
  signatureRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 40px',
  },
  sigBox: {
    textAlign: 'center',
  }
};
