import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import {
  Award, Download, Edit2, Plus, Trash2, Save,
  Clock, AlertCircle, RefreshCw, CheckCircle, Eye,
} from 'lucide-react';

const ISO_STDS = [
  'ISO 9001:2015','ISO 14001:2015','ISO 45001:2018','ISO 22000:2018',
  'ISO 27001:2022','ISO/IEC 27701:2025','ISO/IEC 42001:2023',
  'ISO 22301:2019','ISO 37001:2016','ISO 21001:2018',
];
const ACCRED = ['NABCB','DAkkS','UKAS','NAB','ANAB','JAB','KAN'];

const blank = () => ({
  orgName:'', standard:'', scope:'', address:'',
  contactPerson:'', designation:'', contactNumber:'', email:'',
  auditorName:'', auditorRole:'', iafCode:'', accreditation:'NABCB',
  certNumber:'', issueDate:'', expiryDate:'', surveillanceDate:'', notes:'',
});

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

/* ─── ISO management system label ─── */
function msLabel(standard) {
  if (!standard) return 'Management System';
  if (standard.includes('9001'))  return 'Quality Management System';
  if (standard.includes('14001')) return 'Environmental Management System';
  if (standard.includes('45001')) return 'Occupational Health & Safety Management System';
  if (standard.includes('22000')) return 'Food Safety Management System';
  if (standard.includes('27001')) return 'Information Security Management System';
  if (standard.includes('42001')) return 'AI Management System';
  if (standard.includes('22301')) return 'Business Continuity Management System';
  if (standard.includes('37001')) return 'Anti-Bribery Management System';
  if (standard.includes('21001')) return 'Educational Organizations Management System';
  return 'Management System';
}

/* ─── Certificate HTML generator (matches B4Q design) ─── */
function generateCertificate(cert) {
  const orgName     = cert.orgName || cert.organizationName || 'Your Organization Name';
  const standard    = cert.standard || '';
  const scope       = cert.scope || 'Your Organization Scope';
  const certNumber  = cert.certNumber || 'XXX/XXXX/XXXX';
  const issueDate   = fmt(cert.issueDate);
  const expiryDate  = fmt(cert.expiryDate);
  const origDate    = fmt(cert.originalCertDate || cert.issueDate);
  const iafCode     = cert.iafCode || '';
  const address     = cert.address || '';
  const additionalSites = cert.additionalSites || '';
  const msName      = msLabel(standard);
  const bgUrl       = `${window.location.origin}/certificate-bg.jpg`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Certificate — ${certNumber}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;background:#dce8f5;display:flex;flex-direction:column;align-items:center;padding:24px 12px;min-height:100vh}
.no-print{display:flex;gap:10px;margin-bottom:16px}
.btn-dl{padding:10px 26px;background:#1a3a6b;color:white;border:none;border-radius:7px;font-size:13px;font-weight:700;cursor:pointer}
.btn-cl{padding:10px 20px;background:white;color:#334155;border:1.5px solid #cbd5e1;border-radius:7px;font-size:13px;cursor:pointer}

/* ── Certificate card (image background + overlays) ── */
.cert{width:620px;aspect-ratio:1591/2263;background:white;position:relative;padding:0;box-shadow:0 6px 32px rgba(0,0,0,.22);overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cert-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.ov{position:absolute;z-index:1;text-align:center}

/* Blue border system */
.b1{position:absolute;inset:6px;border:3px solid #1a5cb8;pointer-events:none;z-index:20}
.b2{position:absolute;inset:11px;border:1px solid #5a9af0;pointer-events:none;z-index:20}

/* Inner content area */
.inner{padding:18px 30px 14px;position:relative;overflow:hidden;min-height:820px}

/* Globe SVG watermark */
.globe-wrap{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:320px;height:320px;opacity:.07;pointer-events:none;z-index:0}

/* QR + title row */
.top-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2px;position:relative;z-index:1}
.qr-box{width:72px;height:72px;flex-shrink:0}
.cert-title-wrap{flex:1;text-align:center;padding:0 10px}
.cert-script{font-family:'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif;font-size:46px;color:#d4790a;font-style:italic;line-height:1;letter-spacing:.02em}
.top-right{width:72px;text-align:right;font-size:8px;color:#555;line-height:1.5}

/* Certify text */
.certify-txt{text-align:center;font-size:12.5px;color:#333;margin:8px 0 4px;position:relative;z-index:1}

/* Org name */
.org-name{text-align:center;font-size:20px;font-weight:bold;color:#1a237e;margin:4px 0;position:relative;z-index:1}
.org-site{text-align:center;font-size:12px;font-weight:bold;color:#1a237e;margin:2px 0;position:relative;z-index:1}

/* Middle dot */
.mid-dot{text-align:center;font-size:18px;color:#555;margin:4px 0;position:relative;z-index:1}

/* Compliance line */
.compliance-txt{text-align:center;font-size:11.5px;color:#333;margin:4px 0;position:relative;z-index:1}

/* MS name */
.ms-name{text-align:center;font-size:15px;font-weight:bold;color:#1a237e;margin:2px 0;position:relative;z-index:1}

/* Big ISO number */
.iso-big{text-align:center;font-size:52px;font-weight:900;color:#1e2a8f;letter-spacing:2px;line-height:1.1;margin:4px 0;position:relative;z-index:1}

/* Scope */
.scope-lbl{text-align:center;font-size:11.5px;color:#333;margin:4px 0;position:relative;z-index:1}
.scope-txt{text-align:center;font-size:13px;font-weight:bold;color:#1a237e;margin:4px 30px 12px;line-height:1.5;position:relative;z-index:1}

/* Bottom section */
.bottom{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 10px 0;position:relative;z-index:1}
.cert-details{font-size:10px;color:#333;line-height:1.9}
.cert-details b{font-size:10.5px}
.verify-txt{font-size:9px;color:#333;margin-top:6px}
.verify-link{font-size:9px;color:#1e2a8f;font-style:italic}

/* Signature area */
.sig-area{text-align:right;font-size:10px;color:#333}
.sig-line-top{border-top:1px dotted #666;width:170px;margin-left:auto;margin-bottom:3px}
.sig-heading{font-size:9px;color:#666;text-align:center;width:170px;margin-left:auto}
.sig-company{font-size:13px;font-weight:bold;color:#d4790a;margin-top:2px}
.sig-addr{font-size:8.5px;color:#555;line-height:1.5;margin-top:3px}

/* Logo stamps row */
.stamps{display:flex;justify-content:center;align-items:center;gap:10px;padding:8px 10px 6px;border-top:1px solid #ddd;margin-top:8px}
.stamp-circle{width:54px;height:54px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:7px;font-weight:bold;text-align:center;line-height:1.3;border:2px solid}
.stamp-rect{padding:4px 8px;border:2px solid;border-radius:6px;font-size:8px;font-weight:bold;text-align:center;line-height:1.4}

/* Footer */
.cert-footer{background:#f8fafc;border-top:1px solid #ddd;padding:5px 30px;font-size:7.5px;color:#666;text-align:center;line-height:1.5}

@media print{
  body{background:none;padding:0}
  .no-print{display:none}
  @page{size:A4 portrait;margin:0}
  .cert{box-shadow:none;width:209mm;height:auto;aspect-ratio:1591/2263;margin:0 auto}
}
</style>
</head>
<body>

<div class="no-print">
  <button class="btn-dl" onclick="window.print()">⬇ Download / Print PDF</button>
  <button class="btn-cl" onclick="window.close()">✕ Close</button>
</div>

<div class="cert">
  <!-- Certificate background image -->
  <img class="cert-bg" src="${bgUrl}" alt="Certificate"/>

  <!-- Organization name (blank area under "This is to Certify that") -->
  <div class="ov" style="top:21%;left:6%;right:6%">
    <div style="font-size:23px;font-weight:bold;color:#1a237e;line-height:1.25">${orgName}</div>
    ${address ? `<div style="font-size:12px;font-weight:bold;color:#1a237e;margin-top:6px;line-height:1.4">${address}</div>` : ''}
    ${additionalSites ? `<div style="font-size:11px;color:#1a237e;margin-top:3px;line-height:1.4">${additionalSites}</div>` : ''}
  </div>

  <!-- Management system type + ISO standard (masks the baked-in text, kept dynamic) -->
  <div class="ov" style="top:34.3%;left:4%;right:4%;height:10%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2">
    <div style="font-size:22px;font-weight:bold;color:#222;line-height:1.1">${msName}</div>
    <div style="font-size:42px;font-weight:900;color:#1f7fd6;letter-spacing:1px;line-height:1.05;margin-top:2px">${standard}</div>
  </div>

  <!-- Scope (blank area under "for the following scope:") -->
  <div class="ov" style="top:51%;left:10%;right:10%">
    <div style="font-size:13px;font-weight:bold;color:#1a237e;line-height:1.55">${scope}</div>
  </div>

  <!-- Certificate details (bottom-left blank area) -->
  <div class="ov" style="top:69%;left:7%;width:52%;text-align:left;font-size:10px;color:#222;line-height:1.85">
    <div><b>Certificate No.</b> : ${certNumber}</div>
    <div><b>Original Issue Date</b> : ${origDate}</div>
    <div><b>Issue Date</b> : ${issueDate}</div>
    <div><b>Expiry Date</b> : ${expiryDate}</div>
    ${iafCode ? `<div><b>IAF Code</b> : ${iafCode}</div>` : ''}
    <div style="margin-top:5px;font-size:9px">To verify this certificate visit:</div>
    <div style="font-size:9px;color:#1e2a8f;font-style:italic">"http://b4q.in/certifiedorganization.html"</div>
  </div>
</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=680,height=900,scrollbars=yes');
  if (win) {
    win.document.write(html);
    win.document.close();
  } else {
    toast.error('Pop-up blocked — please allow pop-ups for this site.');
  }
}

const FG = ({ label, required, children, full }) => (
  <div className="form-group" style={full ? { gridColumn:'1/-1' } : {}}>
    <label className="form-label">{label}{required && <span style={{ color:'var(--red)' }}> *</span>}</label>
    {children}
  </div>
);

const SectionBand = ({ title }) => (
  <div style={{ background:'linear-gradient(90deg,var(--primary-50),white)', border:'1px solid var(--primary-100)', borderRadius:8, padding:'7px 14px', margin:'18px 0 12px', fontWeight:700, fontSize:12, color:'var(--primary-dark)', letterSpacing:'.04em' }}>
    {title}
  </div>
);

function statusOf(c) {
  if (!c.expiryDate) return { label:'Active', color:'#10b981', bg:'#d1fae5' };
  const days = Math.floor((new Date(c.expiryDate) - new Date()) / 86400000);
  if (days < 0)  return { label:'Expired',              color:'#ef4444', bg:'#fee2e2' };
  if (days < 90) return { label:`Expiring (${days}d)`,  color:'#f59e0b', bg:'#fef3c7' };
  return { label:'Active', color:'#10b981', bg:'#d1fae5' };
}

/* ─── Edit / Issue form (reused in both modal and full tab) ─── */
function CertForm({ data, set, isEdit }) {
  return (
    <>
      <SectionBand title="Organization Details" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <FG label="Organization Name" required>
          <input className="form-control" value={data.orgName||''} onChange={e=>set('orgName',e.target.value)} placeholder="ABC Pvt. Ltd." />
        </FG>
        <FG label="ISO Standard" required>
          <select className="form-control" value={data.standard||''} onChange={e=>set('standard',e.target.value)}>
            <option value="">— Select Standard —</option>
            {ISO_STDS.map(s=><option key={s}>{s}</option>)}
          </select>
        </FG>
        <FG label="Address" full>
          <textarea className="form-control" rows={2} value={data.address||''} onChange={e=>set('address',e.target.value)} placeholder="Full address..." />
        </FG>
        <FG label="Scope of Certification" full>
          <textarea className="form-control" rows={2} value={data.scope||''} onChange={e=>set('scope',e.target.value)} placeholder="Design, Development and Provision of..." />
        </FG>
        <FG label="Contact Person">
          <input className="form-control" value={data.contactPerson||''} onChange={e=>set('contactPerson',e.target.value)} />
        </FG>
        <FG label="Designation">
          <input className="form-control" value={data.designation||''} onChange={e=>set('designation',e.target.value)} />
        </FG>
        <FG label="Contact Number">
          <input className="form-control" value={data.contactNumber||''} onChange={e=>set('contactNumber',e.target.value)} />
        </FG>
        <FG label="Email">
          <input type="email" className="form-control" value={data.email||''} onChange={e=>set('email',e.target.value)} />
        </FG>
      </div>

      <SectionBand title="Certificate Details" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
        <FG label="Certificate Number" required>
          <input className="form-control" value={data.certNumber||''} onChange={e=>set('certNumber',e.target.value)} placeholder="B4Q-2024-001" />
        </FG>
        <FG label="IAF Code">
          <input className="form-control" value={data.iafCode||''} onChange={e=>set('iafCode',e.target.value)} placeholder="e.g. 33" />
        </FG>
        <FG label="Accreditation Body">
          <select className="form-control" value={data.accreditation||'NABCB'} onChange={e=>set('accreditation',e.target.value)}>
            {ACCRED.map(a=><option key={a}>{a}</option>)}
          </select>
        </FG>
        <FG label="Issue Date">
          <input type="date" className="form-control" value={(data.issueDate||'').slice(0,10)} onChange={e=>set('issueDate',e.target.value)} />
        </FG>
        <FG label="Expiry Date">
          <input type="date" className="form-control" value={(data.expiryDate||'').slice(0,10)} onChange={e=>set('expiryDate',e.target.value)} />
        </FG>
        <FG label="Surveillance Date">
          <input type="date" className="form-control" value={(data.surveillanceDate||'').slice(0,10)} onChange={e=>set('surveillanceDate',e.target.value)} />
        </FG>
      </div>

      <SectionBand title="Auditor Details" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <FG label="Auditor Name">
          <input className="form-control" value={data.auditorName||''} onChange={e=>set('auditorName',e.target.value)} />
        </FG>
        <FG label="Auditor Role">
          <select className="form-control" value={data.auditorRole||''} onChange={e=>set('auditorRole',e.target.value)}>
            <option value="">— Select —</option>
            <option>Lead Auditor</option><option>Auditor</option><option>Technical Expert</option>
          </select>
        </FG>
        <FG label="Notes / Remarks" full>
          <textarea className="form-control" rows={2} value={data.notes||''} onChange={e=>set('notes',e.target.value)} />
        </FG>
      </div>

      {isEdit && (data.updatedAt||data.createdAt) && (
        <div style={{ marginTop:14, padding:'8px 12px', background:'var(--primary-50)', borderRadius:8, fontSize:11.5, color:'var(--gray-500)', display:'flex', alignItems:'center', gap:6 }}>
          <Clock size={12} />
          Last updated: <strong style={{ color:'var(--primary-dark)' }}>{fmt(data.updatedAt||data.createdAt)}</strong>
          &nbsp;·&nbsp; Created: <strong style={{ color:'var(--primary-dark)' }}>{fmt(data.createdAt)}</strong>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function CertificateManagement() {
  const [tab,         setTab]         = useState('list');
  const [certs,       setCerts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [manualForm,  setManualForm]  = useState(blank());
  const [editModal,   setEditModal]   = useState(null);
  const [viewModal,   setViewModal]   = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [setting,     setSetting]     = useState({
    title:'Certificate of Registration', authority:'B4Q Management Limited Pvt Ltd',
    validityYears:3, footerText:'This certificate is subject to certification body regulations.', accreditation:'NABCB',
  });

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/certificates').catch(()=>({ data:[] })),
    ]).then(([c]) => {
      setCerts(c.data||[]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const setM = (k,v) => setManualForm(p=>({...p,[k]:v}));
  const setE = (k,v) => setEditModal(p=>({...p,[k]:v}));

  const issueManual = async () => {
    if (!manualForm.orgName.trim())   return toast.error('Organization name required');
    if (!manualForm.standard)         return toast.error('Standard required');
    if (!manualForm.certNumber.trim()) return toast.error('Certificate number required');
    setSaving(true);
    try {
      await axios.post('/api/certificates/manual', manualForm);
      toast.success('Certificate issued!');
      setManualForm(blank());
      setTab('list');
      load();
    } catch { toast.error('Failed to issue certificate'); }
    finally { setSaving(false); }
  };

  const updateCert = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      await axios.put(`/api/certificates/${editModal._id}`, editModal);
      toast.success('Certificate updated!');
      setEditModal(null);
      load();
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const deleteCert = async () => {
    try {
      await axios.delete(`/api/certificates/${deleteId}`);
      toast.success('Certificate deleted');
      setDeleteId(null);
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const saveSetting = async () => {
    setSaving(true);
    try {
      await axios.put('/api/certificates/settings', setting);
      toast.success('Settings saved');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  // Summary counts
  const active    = certs.filter(c => !c.expiryDate || new Date(c.expiryDate) > new Date()).length;
  const expiringSoon = certs.filter(c => {
    if (!c.expiryDate) return false;
    const d = Math.floor((new Date(c.expiryDate) - new Date()) / 86400000);
    return d >= 0 && d < 90;
  }).length;
  const expired   = certs.filter(c => c.expiryDate && new Date(c.expiryDate) < new Date()).length;

  const TABS = [
    { id:'list',     label:'All Certificates' },
    { id:'manual',   label:'+ Issue Manual'   },
    { id:'settings', label:'Settings'         },
  ];

  return (
    <Layout title="Certificate Management">

      {/* ── Header ── */}
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Certificate Management</h1>
          <p className="page-subtitle">Issue, update and manage ISO certifications</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost" onClick={load}><RefreshCw size={14}/> Refresh</button>
          <button className="btn btn-primary" onClick={()=>setTab('manual')}><Plus size={14}/> Issue Certificate</button>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:20 }}>
        {[
          { label:'Total Issued',    value:certs.length, color:'#3b82f6', bg:'#dbeafe', icon:Award        },
          { label:'Active',          value:active,        color:'#10b981', bg:'#d1fae5', icon:CheckCircle  },
          { label:'Expiring Soon',   value:expiringSoon,  color:'#f59e0b', bg:'#fef3c7', icon:Clock        },
          { label:'Expired',         value:expired,       color:'#ef4444', bg:'#fee2e2', icon:AlertCircle  },
        ].map((s,i)=>(
          <div key={i} style={{ background:'white', borderRadius:10, padding:'14px 18px', border:'1.5px solid #f1f5f9', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <s.icon size={16} color={s.color}/>
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--gray-500)', marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom:0 }}>
        {/* ── Tabs ── */}
        <div className="tabs-bar">
          {TABS.map(t=>(
            <button key={t.id} className={`tab-item ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding:'20px 24px' }}>

          {/* ═══ LIST TAB ═══ */}
          {tab==='list'&&(
            loading
              ? <div className="loading-box"><div className="spinner"/></div>
              : certs.length===0
                ? (
                  <div className="empty-box" style={{ padding:'48px 20px' }}>
                    <Award size={40}/>
                    <h3>No certificates yet</h3>
                    <p>Issue your first certificate to get started.</p>
                    <button className="btn btn-primary btn-sm" style={{ marginTop:10 }} onClick={()=>setTab('manual')}>
                      <Plus size={12}/> Issue Certificate
                    </button>
                  </div>
                )
                : (
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>Cert #</th>
                          <th>Organization</th>
                          <th>Standard</th>
                          <th>Issue Date</th>
                          <th>Expiry Date</th>
                          <th>Last Updated</th>
                          <th>Status</th>
                          <th style={{ textAlign:'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certs.map(c=>{
                          const st = statusOf(c);
                          return (
                            <tr key={c._id}>
                              <td style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'var(--primary-dark)' }}>{c.certNumber||'—'}</td>
                              <td style={{ fontWeight:600, maxWidth:180 }}>
                                <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.orgName||c.organizationName||'—'}</div>
                                {c.iafCode&&<div style={{ fontSize:10, color:'var(--gray-400)' }}>IAF: {c.iafCode}</div>}
                              </td>
                              <td style={{ fontSize:12 }}>{c.standard||'—'}</td>
                              <td style={{ fontSize:12 }}>{fmt(c.issueDate)}</td>
                              <td style={{ fontSize:12 }}>{fmt(c.expiryDate)}</td>
                              <td>
                                <div style={{ fontSize:11.5, color:'var(--gray-500)' }}>{fmt(c.updatedAt||c.createdAt)}</div>
                                {c.updatedAt&&c.createdAt&&c.updatedAt!==c.createdAt&&(
                                  <div style={{ fontSize:10, color:'var(--primary)' }}>Updated</div>
                                )}
                              </td>
                              <td>
                                <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:st.bg, color:st.color }}>
                                  {st.label}
                                </span>
                              </td>
                              <td>
                                <div style={{ display:'flex', gap:5, justifyContent:'center', flexWrap:'wrap' }}>
                                  <button className="btn btn-ghost btn-sm" title="View Details"
                                    onClick={()=>setViewModal(c)}>
                                    <Eye size={13}/> View
                                  </button>
                                  <button className="btn btn-ghost btn-sm" title="Edit / Update"
                                    onClick={()=>setEditModal({ ...c, issueDate:(c.issueDate||'').slice(0,10), expiryDate:(c.expiryDate||'').slice(0,10), surveillanceDate:(c.surveillanceDate||'').slice(0,10) })}>
                                    <Edit2 size={13}/> Edit
                                  </button>
                                  <button className="btn btn-secondary btn-sm" onClick={()=>generateCertificate(c)}>
                                    <Download size={13}/> Download
                                  </button>
                                  <button
                                    style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:7, border:'1px solid #fecaca', background:'#fef2f2', color:'#ef4444', cursor:'pointer', fontSize:12, fontWeight:600 }}
                                    onClick={()=>setDeleteId(c._id)}>
                                    <Trash2 size={13}/> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
          )}

          {/* ═══ MANUAL ISSUE TAB ═══ */}
          {tab==='manual'&&(
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'var(--gray-700)', marginBottom:18, paddingBottom:12, borderBottom:'1.5px solid var(--primary-50)' }}>
                Issue New Certificate Manually
              </div>
              <CertForm data={manualForm} set={setM} isEdit={false}/>
              <div style={{ display:'flex', gap:10, marginTop:22, paddingTop:16, borderTop:'1.5px solid var(--primary-50)' }}>
                <button className="btn btn-ghost" onClick={()=>setTab('list')}>Cancel</button>
                <button className="btn btn-primary" onClick={issueManual} disabled={saving}>
                  <Award size={14}/> {saving?'Issuing…':'Issue Certificate'}
                </button>
              </div>
            </div>
          )}

          {/* ═══ SETTINGS TAB ═══ */}
          {tab==='settings'&&(
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'var(--gray-700)', marginBottom:18, paddingBottom:12, borderBottom:'1.5px solid var(--primary-50)' }}>
                Certificate Template Settings
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Certificate Title</label>
                  <input className="form-control" value={setting.title} onChange={e=>setSetting(p=>({...p,title:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Issuing Authority</label>
                  <input className="form-control" value={setting.authority} onChange={e=>setSetting(p=>({...p,authority:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Validity (Years)</label>
                  <input type="number" className="form-control" value={setting.validityYears} onChange={e=>setSetting(p=>({...p,validityYears:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Accreditation Body</label>
                  <select className="form-control" value={setting.accreditation} onChange={e=>setSetting(p=>({...p,accreditation:e.target.value}))}>
                    {ACCRED.map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Footer Text</label>
                  <textarea className="form-control" rows={2} value={setting.footerText} onChange={e=>setSetting(p=>({...p,footerText:e.target.value}))}/>
                </div>
              </div>
              <button className="btn btn-primary" onClick={saveSetting} disabled={saving}>
                <Save size={14}/> {saving?'Saving…':'Save Settings'}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ═══ VIEW MODAL ═══ */}
      {viewModal&&(
        <div className="modal-bg" onClick={()=>setViewModal(null)}>
          <div className="modal-box" style={{ maxWidth:560 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">
                <Eye size={15} style={{ color:'var(--primary)', marginRight:7, verticalAlign:'middle' }}/>
                Certificate Details
              </div>
              <button className="modal-close" onClick={()=>setViewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Header card */}
              <div style={{ background:'linear-gradient(135deg,#1a3a6b,#2563eb)', borderRadius:10, padding:'16px 20px', marginBottom:16, color:'white' }}>
                <div style={{ fontSize:11, opacity:.7, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>Certificate of Registration</div>
                <div style={{ fontSize:20, fontWeight:800, marginBottom:2 }}>{viewModal.orgName||viewModal.organizationName||'—'}</div>
                <div style={{ fontSize:13, opacity:.8 }}>{viewModal.standard}</div>
                <div style={{ marginTop:10, display:'flex', gap:8, flexWrap:'wrap' }}>
                  {(() => { const st = statusOf(viewModal); return <span style={{ padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:700, background:st.bg, color:st.color }}>{st.label}</span>; })()}
                  <span style={{ padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:700, background:'rgba(255,255,255,.15)', color:'white' }}>{viewModal.certNumber||'No Cert #'}</span>
                </div>
              </div>

              {/* Quick date update */}
              <div style={{ background:'#fff7ed', border:'1.5px solid #fed7aa', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
                <div style={{ fontWeight:700, fontSize:12, color:'var(--primary-dark)', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                  <Clock size={13}/> Quick Update Dates
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { label:'Issue Date',        key:'issueDate'        },
                    { label:'Expiry Date',        key:'expiryDate'       },
                    { label:'Surveillance Date',  key:'surveillanceDate' },
                    { label:'Cert Number',        key:'certNumber', type:'text' },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <div style={{ fontSize:10.5, fontWeight:600, color:'var(--gray-500)', marginBottom:4 }}>{label}</div>
                      <input
                        type={type||'date'}
                        className="form-control"
                        style={{ fontSize:12 }}
                        value={viewModal[key]||(type?'':(viewModal[key]||'').slice?.(0,10)||'')}
                        onChange={e=>setViewModal(p=>({...p,[key]:e.target.value}))}
                      />
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-primary"
                  style={{ marginTop:12, fontSize:12 }}
                  onClick={async()=>{
                    try{
                      await axios.put(`/api/certificates/${viewModal._id}`, viewModal);
                      toast.success('Certificate updated!');
                      setViewModal(null);
                      load();
                    }catch{ toast.error('Failed to update'); }
                  }}>
                  <Save size={12}/> Save Date Changes
                </button>
              </div>

              {/* Detail rows */}
              {[
                { label:'Organization',         value: viewModal.orgName||viewModal.organizationName },
                { label:'ISO Standard',         value: viewModal.standard },
                { label:'Certificate No.',      value: viewModal.certNumber },
                { label:'Accreditation Body',   value: viewModal.accreditation },
                { label:'IAF Code',             value: viewModal.iafCode },
                { label:'Issue Date',           value: fmt(viewModal.issueDate) },
                { label:'Expiry Date',          value: fmt(viewModal.expiryDate) },
                { label:'Surveillance Date',    value: fmt(viewModal.surveillanceDate) },
                { label:'Address',              value: viewModal.address },
                { label:'Scope',                value: viewModal.scope },
                { label:'Contact Person',       value: viewModal.contactPerson },
                { label:'Designation',          value: viewModal.designation },
                { label:'Contact Number',       value: viewModal.contactNumber },
                { label:'Email',                value: viewModal.email },
                { label:'Auditor',              value: viewModal.auditorName ? `${viewModal.auditorName} (${viewModal.auditorRole||''})` : null },
                { label:'Notes',                value: viewModal.notes },
                { label:'Created',              value: fmt(viewModal.createdAt) },
                { label:'Last Updated',         value: fmt(viewModal.updatedAt) },
              ].filter(r=>r.value).map(r=>(
                <div key={r.label} style={{ display:'flex', gap:12, padding:'7px 0', borderBottom:'1px solid var(--primary-50)', alignItems:'flex-start' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--gray-500)', minWidth:120, textTransform:'uppercase', letterSpacing:'.04em', flexShrink:0 }}>{r.label}</div>
                  <div style={{ fontSize:12.5, color:'var(--text-1)', wordBreak:'break-word' }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setViewModal(null)}>Close</button>
              <button className="btn btn-secondary" onClick={()=>{ setViewModal(null); generateCertificate(viewModal); }}>
                <Download size={13}/> Download Certificate
              </button>
              <button className="btn btn-primary" onClick={()=>{ setEditModal({ ...viewModal, issueDate:(viewModal.issueDate||'').slice(0,10), expiryDate:(viewModal.expiryDate||'').slice(0,10) }); setViewModal(null); }}>
                <Edit2 size={13}/> Full Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT MODAL ═══ */}
      {editModal&&(
        <div className="modal-bg" onClick={()=>setEditModal(null)}>
          <div className="modal-box" style={{ maxWidth:700 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">
                <Edit2 size={15} style={{ color:'var(--primary)', marginRight:7, verticalAlign:'middle' }}/>
                Update Certificate — <span style={{ fontFamily:'monospace' }}>{editModal.certNumber}</span>
              </div>
              <button className="modal-close" onClick={()=>setEditModal(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight:'72vh', overflowY:'auto' }}>
              <CertForm data={editModal} set={setE} isEdit={true}/>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={updateCert} disabled={saving}>
                <Save size={13}/> {saving?'Saving…':'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRM MODAL ═══ */}
      {deleteId&&(
        <div className="modal-bg" onClick={()=>setDeleteId(null)}>
          <div className="modal-box" style={{ maxWidth:420 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title" style={{ color:'#ef4444' }}>
                <Trash2 size={15} style={{ marginRight:7, verticalAlign:'middle' }}/>Confirm Delete
              </div>
              <button className="modal-close" onClick={()=>setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <AlertCircle size={40} style={{ color:'#ef4444', marginBottom:14 }}/>
                <p style={{ fontSize:14, color:'var(--gray-700)', margin:0, lineHeight:1.6 }}>
                  Are you sure you want to permanently delete this certificate?<br/>
                  <strong>This action cannot be undone.</strong>
                </p>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setDeleteId(null)}>Cancel</button>
              <button
                style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:8, border:'none', background:'#ef4444', color:'white', cursor:'pointer', fontSize:13, fontWeight:700 }}
                onClick={deleteCert}>
                <Trash2 size={13}/> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
