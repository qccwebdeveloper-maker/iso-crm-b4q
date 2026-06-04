import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import axios from 'axios';
import { FileText, Search, Eye, Calendar, Building2, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  submitted:      { label: 'Submitted',      color: '#3b82f6', bg: '#dbeafe' },
  under_review:   { label: 'Under Review',   color: '#f59e0b', bg: '#fef3c7' },
  audit_stage1:   { label: 'Audit Stage 1',  color: '#8b5cf6', bg: '#ede9fe' },
  audit_stage2:   { label: 'Audit Stage 2',  color: '#06b6d4', bg: '#cffafe' },
  certified:      { label: 'Certified',      color: '#10b981', bg: '#d1fae5' },
  rejected:       { label: 'Rejected',       color: '#ef4444', bg: '#fee2e2' },
  draft:          { label: 'Draft',          color: '#6b7280', bg: '#f3f4f6' },
};

const AUDIT_FORMS_VISIBLE = [
  { no: 'AUD-F-02', name: 'Request for Proposal cum Application Form', stage: 'Application' },
  { no: 'AUD-F-03', name: 'Application Review & Audit Planning', stage: 'Planning' },
  { no: 'AUD-F-09', name: 'Stage 1 Audit Report', stage: 'Stage 1' },
  { no: 'AUD-F-15', name: 'Audit Report (Stage 2)', stage: 'Stage 2' },
  { no: 'AUD-F-16', name: 'Request for Corrective Action', stage: 'Corrective Action' },
  { no: 'AUD-F-21', name: 'Draft for Certificate Approval', stage: 'Certification' },
  { no: 'AUD-F-22', name: 'Review Report', stage: 'Review' },
];

export default function SalesApplicationsList() {
  const navigate   = useNavigate();
  const [apps, setApps]     = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get('/api/applications')
      .then(r => setApps(r.data?.applications || r.data || []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = apps.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (a.organizationName || '').toLowerCase().includes(q) ||
           (a.refNo || '').toLowerCase().includes(q) ||
           (a.scope || '').toLowerCase().includes(q);
  });

  const statusOf = (app) => STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted;

  return (
    <Layout title="Applications — Audit Details">
      <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--gray-800)' }}>Applications &amp; Audit Report Details</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--gray-500)' }}>View application status and QMS audit form details</p>
          </div>
        </div>

        {/* Audit Forms Reference Banner */}
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#9a3412', marginBottom: 8 }}>QMS Audit Forms Tracked Per Application</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AUDIT_FORMS_VISIBLE.map(f => (
              <span key={f.no} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'white', color: 'var(--gray-700)', border: '1px solid #e2e8f0' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{f.no}</span> — {f.name}
              </span>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #f1f5f9', padding: 16, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by organization name, ref no, or scope..."
              style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Applications grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)', background: 'white', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <FileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>No applications found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filtered.map(app => {
              const st = statusOf(app);
              return (
                <div
                  key={app._id}
                  style={{ background: 'white', borderRadius: 12, border: '1.5px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'box-shadow .15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
                  onClick={() => setSelected(app)}
                >
                  {/* Card header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={16} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>{app.organizationName || 'Unnamed Org'}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>{app.refNo || app._id?.slice(-6)?.toUpperCase() || 'N/A'}</div>
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Scope:</span> {app.scope || app.certificationScope || 'Not specified'}
                    </div>

                    {/* Standards */}
                    {app.standards && app.standards.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                        {app.standards.slice(0, 4).map(s => (
                          <span key={s} style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: '#ede9fe', color: '#5b21b6', border: '1px solid #c4b5fd' }}>{s}</span>
                        ))}
                        {app.standards.length > 4 && <span style={{ fontSize: 10, color: 'var(--gray-400)', padding: '2px 4px' }}>+{app.standards.length - 4} more</span>}
                      </div>
                    )}

                    {/* Audit Form Progress */}
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>Audit Form Progress</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        {[
                          { label: 'Application (F-02)', done: ['submitted','under_review','audit_stage1','audit_stage2','certified'].includes(app.status) },
                          { label: 'Planning (F-03)', done: ['under_review','audit_stage1','audit_stage2','certified'].includes(app.status) },
                          { label: 'Stage 1 (F-09)', done: ['audit_stage1','audit_stage2','certified'].includes(app.status) },
                          { label: 'Stage 2 (F-15)', done: ['audit_stage2','certified'].includes(app.status) },
                          { label: 'Corrective Action (F-16)', done: app.status === 'certified' },
                          { label: 'Certificate (F-21)', done: app.status === 'certified' },
                        ].map(item => (
                          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            {item.done
                              ? <CheckCircle size={11} color="#10b981" />
                              : <Clock size={11} color="#94a3b8" />
                            }
                            <span style={{ fontSize: 10, color: item.done ? '#065f46' : 'var(--gray-400)', fontWeight: item.done ? 600 : 400 }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date */}
                    <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={10} /> {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(app); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'var(--primary)', color: 'white', border: 'none' }}
                      >
                        <Eye size={11} /> View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setSelected(null)}>
            <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
              onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg,#fff7ed,#fff)', position: 'sticky', top: 0, zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-800)' }}>{selected.organizationName || 'Application Detail'}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Ref: {selected.refNo || selected._id} — QMS Audit Report View</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--gray-500)' }}>✕</button>
                </div>
              </div>

              <div style={{ padding: 24 }}>

                {/* Section: AUD-F-02 – Organization Info */}
                <Section title="AUD-F-02 — Request for Proposal cum Application Form" color="#3b82f6">
                  <Row label="Organization Name" value={selected.organizationName} />
                  <Row label="Address" value={selected.address || selected.organizationAddress} />
                  <Row label="Contact Person" value={selected.contactPerson} />
                  <Row label="Contact Number" value={selected.contactNumber || selected.phone} />
                  <Row label="Email" value={selected.email} />
                  <Row label="Designation" value={selected.designation} />
                  <Row label="Mode of Working" value={selected.modeOfWorking} />
                  <Row label="Scope of Certification" value={selected.scope || selected.certificationScope} />
                  <Row label="Main Processes / Activities" value={selected.mainProcesses} />
                  <Row label="Outsourced Processes" value={selected.outsourcedProcesses} />
                  <Row label="Application Type" value={selected.applicationType} />
                  <Row label="No. of Employees" value={selected.totalEmployees || selected.employeeCount} />
                  <Row label="Standards Applied" value={Array.isArray(selected.standards) ? selected.standards.join(', ') : selected.standards} />
                </Section>

                {/* Section: AUD-F-03 – Audit Planning */}
                <Section title="AUD-F-03 — Application Review & Audit Planning" color="#8b5cf6">
                  <Row label="Audit Type" value={selected.auditType} />
                  <Row label="Mode of Audit" value={selected.modeOfAudit} />
                  <Row label="IAF Code" value={selected.iafCode} />
                  <Row label="Risk Level" value={selected.risk} />
                  <Row label="Stage 1 Audit Dates" value={selected.stage1Dates ? `${selected.stage1Dates.from || ''} – ${selected.stage1Dates.to || ''}` : undefined} />
                  <Row label="Stage 2 Audit Dates" value={selected.stage2Dates ? `${selected.stage2Dates.from || ''} – ${selected.stage2Dates.to || ''}` : undefined} />
                </Section>

                {/* Section: AUD-F-09 / AUD-F-15 – Audit Reports */}
                <Section title="AUD-F-09 / AUD-F-15 — Stage 1 & Stage 2 Audit Reports" color="#06b6d4">
                  <Row label="Current Status" value={STATUS_CONFIG[selected.status]?.label || selected.status} />
                  <Row label="Minor NCs" value={selected.minorNCs} />
                  <Row label="Major NCs" value={selected.majorNCs} />
                  <Row label="Observations" value={selected.observations} />
                  <Row label="OFI (Opportunities for Improvement)" value={selected.ofi} />
                  <Row label="Auditor Recommendation" value={selected.recommendation} />
                </Section>

                {/* Section: AUD-F-21 – Certificate */}
                <Section title="AUD-F-21 — Draft for Certificate Approval" color="#f59e0b">
                  <Row label="Certificate Status" value={selected.status === 'certified' ? 'Issued' : 'Pending'} />
                  <Row label="Certificate Number" value={selected.certificateNumber} />
                  <Row label="Issue Date" value={selected.certificateIssueDate} />
                  <Row label="Expiry Date" value={selected.certificateExpiryDate} />
                  <Row label="Accreditation Body" value={selected.accreditationBody} />
                </Section>

                {/* Section: Management System Info */}
                <Section title="Management System Information" color="#10b981">
                  <Row label="Legal / Regulatory Acts" value={selected.legalActs} />
                  <Row label="Internal Audit Date" value={selected.internalAuditDate} />
                  <Row label="Management Review Date" value={selected.managementReviewDate} />
                  <Row label="Manual Date" value={selected.manualDate} />
                  <Row label="Consultant Details" value={selected.consultantDetails} />
                  <Row label="Admin Notes" value={selected.adminNotes} />
                </Section>

              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ padding: '8px 14px', background: color + '15', borderLeft: `3px solid ${color}`, borderRadius: '0 8px 8px 0', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: '.04em' }}>{title}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 7, border: '1px solid #f1f5f9' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--gray-800)', fontWeight: 500 }}>{String(value)}</div>
    </div>
  );
}
