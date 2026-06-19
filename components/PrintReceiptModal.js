'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, CheckSquare, Square, FileText } from 'lucide-react';

export default function PrintReceiptModal({ user, onClose }) {
  const [docType, setDocType] = useState('assignment'); // 'assignment', 'release', 'change'
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [notes, setNotes] = useState('');
  const [changeType, setChangeType] = useState('permanent'); // 'permanent', 'temporary'
  const [itSpecialist, setItSpecialist] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Default to select all assigned assets
    if (user && user.assignedAssets) {
      setSelectedAssets(user.assignedAssets.map(a => a.id));
    }
  }, [user]);

  if (!mounted) return null;

  const toggleAsset = (assetId) => {
    if (selectedAssets.includes(assetId)) {
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
    } else {
      setSelectedAssets([...selectedAssets, assetId]);
    }
  };

  const handlePrint = () => {
    if (selectedAssets.length === 0) {
      alert('Please select at least one asset to print.');
      return;
    }
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  const activeAssets = user.assignedAssets?.filter(a => selectedAssets.includes(a.id)) || [];
  const currentDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const currentDateEn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Render Modal UI + Portal for print layout
  return (
    <>
      {/* Modal Controller UI (no-print) */}
      <div className="modal-overlay no-print animate-fade-in">
        <div className="modal-container" style={{ maxWidth: '650px' }}>
          <div style={styles.modalHeader}>
            <div className="flex items-center gap-2">
              <Printer className="text-accent-primary" size={22} />
              <h2 className="text-xl">Print IT Receipt / طباعة مستند عهدة</h2>
            </div>
            <button onClick={onClose} className="icon-btn-small">
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
              Generate official bilingual custody, return, or alteration documents for <strong>{user.fullName}</strong>.
            </p>

            {/* Document Type Selection */}
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

            {/* Change Type Details (only shown if alteration selected) */}
            {docType === 'change' && (
              <div className="form-group" style={styles.subConfig}>
                <label className="form-label">Alteration Type / نوع التعديل</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="changeType" value="permanent" checked={changeType === 'permanent'} onChange={() => setChangeType('permanent')} />
                    <span>Permanent / دائم</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="changeType" value="temporary" checked={changeType === 'temporary'} onChange={() => setChangeType('temporary')} />
                    <span>Temporary / مؤقت</span>
                  </label>
                </div>
              </div>
            )}

            {/* Select Assets list */}
            <div className="form-group">
              <label className="form-label">Select Assets / اختر الأجهزة المضمنة</label>
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
                  <p className="text-center text-muted p-4">No assets assigned to this user / لا توجد أجهزة عهدة للموظف.</p>
                )}
              </div>
            </div>

            {/* Input Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">IT Specialist Name / اسم مسؤول الـ IT</label>
                <input type="text" placeholder="e.g., Youssef Ashraf" value={itSpecialist} onChange={(e) => setItSpecialist(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Transaction Notes / ملاحظات إضافية</label>
                <input type="text" placeholder="Reason for exchange, condition details, etc." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-secondary">Cancel / إلغاء</button>
            <button onClick={handlePrint} className="btn btn-success" disabled={selectedAssets.length === 0}>
              <Printer size={16} />
              <span>Generate & Print / توليد وطباعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet (Appended directly to Body, visible only during @media print) */}
      {isPrinting && createPortal(
        <div id="print-area" style={printStyles.container}>
          {/* Company header logo area */}
          <div style={printStyles.header}>
            <div style={printStyles.headerRtl}>
              <h1 style={printStyles.companyTitle}>كـونـكـتـا</h1>
              <h2 style={printStyles.departmentTitle}>إدارة تقنية المعلومات</h2>
            </div>
            <div style={printStyles.headerLtr}>
              <h1 style={printStyles.companyTitle}>KONECTA</h1>
              <h2 style={printStyles.departmentTitle}>Information Technology Dept.</h2>
            </div>
          </div>

          <div style={printStyles.dividerDouble}></div>

          {/* Form Title */}
          <div style={printStyles.titleContainer}>
            {docType === 'assignment' && (
              <>
                <h2 style={printStyles.formTitleAr}>محضر تسليم عهدة أجهزة تقنية معلومات</h2>
                <h3 style={printStyles.formTitleEn}>IT Device Custody Handover Form</h3>
              </>
            )}
            {docType === 'release' && (
              <>
                <h2 style={printStyles.formTitleAr}>محضر استلام عهدة وإخلاء طرف</h2>
                <h3 style={printStyles.formTitleEn}>IT Custody Return & Clearance Form</h3>
              </>
            )}
            {docType === 'change' && (
              <>
                <h2 style={printStyles.formTitleAr}>محضر تعديل عهدة أجهزة (تعديل {changeType === 'permanent' ? 'دائم' : 'مؤقت'})</h2>
                <h3 style={printStyles.formTitleEn}>IT Custody Alteration Form ({changeType === 'permanent' ? 'Permanent' : 'Temporary'})</h3>
              </>
            )}
          </div>

          {/* Employee Metadata */}
          <div style={printStyles.sectionTitle}>
            <span>بيانات الموظف / Employee Information</span>
          </div>
          <table style={printStyles.metaTable}>
            <tbody>
              <tr>
                <td style={printStyles.metaLabel}>اسم الموظف / Name:</td>
                <td style={printStyles.metaValue}>{user.fullName}</td>
                <td style={printStyles.metaLabel}>القسم / Department:</td>
                <td style={printStyles.metaValue}>{user.department?.name || 'N/A'}</td>
              </tr>
              <tr>
                <td style={printStyles.metaLabel}>المسمى الوظيفي / Job Title:</td>
                <td style={printStyles.metaValue}>{user.jobTitle || 'N/A'}</td>
                <td style={printStyles.metaLabel}>تاريخ الطباعة / Date:</td>
                <td style={printStyles.metaValue}>{currentDateEn} - {currentDate}</td>
              </tr>
              <tr>
                <td style={printStyles.metaLabel}>البريد الإلكتروني / Email:</td>
                <td style={printStyles.metaValue}>{user.konectaMail || user.personalEmail}</td>
                <td style={printStyles.metaLabel}>مسؤول الـ IT / Support:</td>
                <td style={printStyles.metaValue}>{itSpecialist || 'IT Operations'}</td>
              </tr>
            </tbody>
          </table>

          {/* Declaration Statement */}
          <div style={printStyles.declaration}>
            {docType === 'assignment' && (
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                <strong>إقرار استلام:</strong> أقر أنا الموظف الموضح بياناتي أعلاه بأنني قد استلمت الأجهزة والملحقات المذكورة في الجدول أدناه بحالة سليمة وجيدة كعهدة شخصية لأداء مهام عملي بالشركة، وأتعهد بالحفاظ عليها وعدم تسليمها للغير، وإعادتها فوراً إلى قسم تقنية المعلومات عند طلبي بذلك، أو عند انتهاء خدماتي بالشركة.
                <br />
                <span style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginTop: '6px' }}>
                  <strong>Acknowledgment:</strong> I, the employee mentioned above, acknowledge that I have received the devices listed below in good condition as personal custody to perform my duties, and I pledge to maintain them, not hand them to others, and return them to the IT Department immediately upon request or termination.
                </span>
              </p>
            )}
            {docType === 'release' && (
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                <strong>إخلاء طرف عهدة:</strong> يشهد قسم تقنية المعلومات بشركة كونتكا بأنه قد تم فحص واستلام الأجهزة والملحقات المذكورة أدناه من الموظف المذكور أعلاه، وتم إرجاعها إلى المخازن وتبرئة ذمته من عهدة هذه الأجهزة المحددة.
                <br />
                <span style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginTop: '6px' }}>
                  <strong>Clearance:</strong> The IT Department certifies that the devices listed below have been inspected and returned to stock from the above-mentioned employee. The employee is hereby cleared of custody for these specified devices.
                </span>
              </p>
            )}
            {docType === 'change' && (
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                <strong>تعديل عهدة:</strong> بموجب هذا المحضر، تم تعديل وتحديث العهدة العينية للموظف الموضح أعلاه وفقاً للتفاصيل المذكورة بالجدول أدناه ({changeType === 'permanent' ? 'تعديل دائم' : 'تعديل مؤقت'}).
                <br />
                <span style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginTop: '6px' }}>
                  <strong>Custody Modification:</strong> Pursuant to this document, the asset custody details of the employee named above have been updated and modified as described in the table below ({changeType === 'permanent' ? 'Permanent' : 'Temporary'}).
                </span>
              </p>
            )}
          </div>

          {/* Assets Table */}
          <div style={printStyles.sectionTitle}>
            <span>الأجهزة والملحقات / Devices & Accessories</span>
          </div>
          <table style={printStyles.assetsTable}>
            <thead>
              <tr style={printStyles.tableHeader}>
                <th style={{ ...printStyles.th, width: '50px' }}>#</th>
                <th style={printStyles.th}>الفئة / Category</th>
                <th style={printStyles.th}>الموديل والنوع / Brand & Model</th>
                <th style={printStyles.th}>الرقم التسلسلي / Serial Number</th>
                <th style={printStyles.th}>تاريخ الصرف / Assigned Date</th>
                <th style={{ ...printStyles.th, width: '120px' }}>الملاحظات / Notes</th>
              </tr>
            </thead>
            <tbody>
              {activeAssets.map((asset, index) => (
                <tr key={asset.id}>
                  <td style={{ ...printStyles.td, textAlign: 'center' }}>{index + 1}</td>
                  <td style={printStyles.td}>{asset.inventoryItem?.category}</td>
                  <td style={{ ...printStyles.td, fontWeight: 'bold' }}>{asset.inventoryItem?.brand} {asset.inventoryItem?.model}</td>
                  <td style={{ ...printStyles.td, fontFamily: 'monospace', fontSize: '0.9rem' }}>{asset.serialNumber}</td>
                  <td style={printStyles.td}>{asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : 'N/A'}</td>
                  <td style={printStyles.td}>-</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Transaction Notes (if provided) */}
          {notes && (
            <div style={printStyles.notesArea}>
              <strong>ملاحظات إضافية / Additional Notes:</strong>
              <p style={{ margin: '4px 0 0 0', fontStyle: 'italic', fontSize: '0.9rem' }}>{notes}</p>
            </div>
          )}

          {/* Print Date & Signatures Block */}
          <div style={printStyles.signatureContainer}>
            <div style={printStyles.sigBox}>
              <p style={printStyles.sigTitle}>الموظف المستلم / Receiver</p>
              <div style={printStyles.sigLine}></div>
              <p style={printStyles.sigDetails}>الاسم / Name: {user.fullName}</p>
              <p style={printStyles.sigDetails}>التوقيع / Signature:</p>
              <p style={printStyles.sigDetails}>التاريخ / Date:</p>
            </div>

            <div style={printStyles.sigBox}>
              <p style={printStyles.sigTitle}>مسؤول تقنية المعلومات / IT Support</p>
              <div style={printStyles.sigLine}></div>
              <p style={printStyles.sigDetails}>الاسم / Name: {itSpecialist || '................................'}</p>
              <p style={printStyles.sigDetails}>التوقيع / Signature:</p>
              <p style={printStyles.sigDetails}>التاريخ / Date:</p>
            </div>

            <div style={printStyles.sigBox}>
              <p style={printStyles.sigTitle}>اعتماد القسم / Dept. Head Approval</p>
              <div style={printStyles.sigLine}></div>
              <p style={printStyles.sigDetails}>الاسم / Name: ................................</p>
              <p style={printStyles.sigDetails}>التوقيع / Signature:</p>
              <p style={printStyles.sigDetails}>التاريخ / Date:</p>
            </div>
          </div>

          {/* Corporate Footer */}
          <div style={printStyles.footer}>
            <div style={printStyles.dividerLine}></div>
            <p style={printStyles.footerText}>
              شركة كونتكا - تقنية المعلومات | Konecta Corp - IT Department &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Styling definitions for Modal and Print layouts
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
    display: 'flex', alignItems: 'flex-start', padding: '1rem',
    borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s',
  },
  subConfig: {
    background: 'rgba(255, 255, 255, 0.02)', padding: '1rem',
    borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)',
    marginTop: '-0.5rem', marginBottom: '1rem'
  },
  assetList: {
    maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column',
    gap: '0.5rem', padding: '0.5rem', background: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
  },
  assetItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer', transition: 'all 0.2s',
  },
};

// Official Corporate Print styling (rendered only in printing window.print)
const printStyles = {
  container: {
    direction: 'rtl',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '15mm 15mm',
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '8px'
  },
  headerRtl: {
    textAlign: 'right',
  },
  headerLtr: {
    textAlign: 'left',
    direction: 'ltr'
  },
  companyTitle: {
    fontSize: '1.6rem', fontWeight: '800', margin: '0', color: '#000000', letterSpacing: '1px'
  },
  departmentTitle: {
    fontSize: '0.95rem', fontWeight: '600', margin: '4px 0 0 0', color: '#444444'
  },
  dividerDouble: {
    borderBottom: '3px double #000000', margin: '12px 0 20px 0'
  },
  titleContainer: {
    textAlign: 'center', marginBottom: '25px', padding: '6px 0'
  },
  formTitleAr: {
    fontSize: '1.45rem', fontWeight: 'bold', margin: '0', color: '#000000'
  },
  formTitleEn: {
    fontSize: '1.1rem', fontWeight: '500', margin: '5px 0 0 0', color: '#333333', letterSpacing: '0.5px'
  },
  sectionTitle: {
    background: '#f2f2f2', padding: '6px 12px', fontSize: '0.95rem', fontWeight: 'bold',
    borderRight: '4px solid #000000', marginBottom: '10px', display: 'flex', justifyContent: 'space-between',
    direction: 'rtl'
  },
  metaTable: {
    width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.9rem'
  },
  metaLabel: {
    padding: '8px', fontWeight: 'bold', color: '#222', border: '1px solid #ddd', width: '18%', background: '#fafafa'
  },
  metaValue: {
    padding: '8px', border: '1px solid #ddd', width: '32%'
  },
  declaration: {
    border: '1px solid #000000', padding: '12px 16px', borderRadius: '4px',
    backgroundColor: '#fcfcfc', marginBottom: '25px', fontSize: '0.9rem', textAlign: 'justify'
  },
  assetsTable: {
    width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.9rem'
  },
  tableHeader: {
    background: '#f2f2f2'
  },
  th: {
    border: '1px solid #000000', padding: '8px', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'right'
  },
  td: {
    border: '1px solid #dddddd', padding: '8px', fontSize: '0.85rem'
  },
  notesArea: {
    border: '1px solid #ddd', padding: '10px 15px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '25px'
  },
  signatureContainer: {
    display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '40px', marginBottom: '40px'
  },
  sigBox: {
    flex: 1, border: '1px solid #ddd', borderRadius: '4px', padding: '12px', fontSize: '0.85rem', backgroundColor: '#fcfcfc'
  },
  sigTitle: {
    fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '6px', margin: '0 0 12px 0', textAlign: 'center'
  },
  sigLine: {
    height: '40px'
  },
  sigDetails: {
    margin: '4px 0 0 0', fontSize: '0.8rem', color: '#333'
  },
  footer: {
    marginTop: 'auto', textAlign: 'center'
  },
  dividerLine: {
    borderBottom: '1px solid #cccccc', marginBottom: '8px'
  },
  footerText: {
    fontSize: '0.75rem', color: '#666666', margin: '0'
  }
};
