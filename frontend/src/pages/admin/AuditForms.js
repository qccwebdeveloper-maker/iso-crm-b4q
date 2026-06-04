import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import {
  FileText, CheckCircle, XCircle, Search, ExternalLink,
  ClipboardList, ClipboardCheck, Award, AlertTriangle, Users, BookOpen
} from 'lucide-react';

const FORMS = [
  { no: 'AUD-F-01', name: 'Query Follow Up', rev: '0', remarks: 'Refer Separate File', category: 'Pre-Application', status: 'active', link: '/admin/leads' },
  { no: 'AUD-F-02', name: 'Request for Proposal cum Application Form', rev: 'Rev.:01', remarks: '', category: 'Application', status: 'active', link: '/admin/applications/new' },
  { no: 'AUD-F-03', name: 'Application Review & Audit Planning', rev: 'Rev.:02', remarks: '', category: 'Planning', status: 'active', link: '/admin/applications' },
  { no: 'AUD-F-03-01', name: 'Audit Planning (Part 2)', rev: 'Rev.:02', remarks: '', category: 'Planning', status: 'active', link: '/admin/applications' },
  { no: 'AUD-F-03A', name: 'Audit Planning for 3 Years', rev: 'Rev.:01', remarks: '', category: 'Planning', status: 'active', link: '/admin/audit-stage1' },
  { no: 'AD-F-03', name: "Auditor(s) Declaration", rev: 'Rev.:01', remarks: '', category: 'Declaration', status: 'active', link: '/admin/auditors' },
  { no: 'AUD-F-05', name: 'Audit Plan Stage 1', rev: 'Rev.:01', remarks: '', category: 'Stage 1', status: 'active', link: '/admin/audit-stage1' },
  { no: 'AUD-F-06', name: 'Audit Schedule Stage 1', rev: 'Rev.:01', remarks: '', category: 'Stage 1', status: 'active', link: '/admin/audit-stage1' },
  { no: 'AUD-F-07 S1', name: 'Opening & Closing Meeting Attendants (Stage 1)', rev: 'Rev.:01', remarks: '', category: 'Stage 1', status: 'active', link: '/admin/audit-stage1' },
  { no: 'AUD-F-07 S2', name: 'Opening & Closing Meeting Attendants (Stage 2)', rev: 'Rev.:01', remarks: '', category: 'Stage 2', status: 'active', link: '/admin/audit-stage2' },
  { no: 'AUD-F-08', name: 'N/A', rev: '', remarks: '', category: '', status: 'na', link: null },
  { no: 'AUD-F-09', name: 'Stage 1 Audit Report', rev: 'Rev.:01', remarks: '', category: 'Stage 1', status: 'active', link: '/admin/audit-stage1' },
  { no: 'AUD-F-10', name: 'N/A', rev: '', remarks: '', category: '', status: 'na', link: null },
  { no: 'AUD-F-11', name: 'Audit Plan (Stage 2)', rev: 'Rev.:01', remarks: '', category: 'Stage 2', status: 'active', link: '/admin/audit-stage2' },
  { no: 'AUD-F-12', name: 'Audit Schedule (Stage 2)', rev: 'Rev.:01', remarks: '', category: 'Stage 2', status: 'active', link: '/admin/audit-stage2' },
  { no: 'AUD-F-13', name: 'N/A', rev: '', remarks: '', category: '', status: 'na', link: null },
  { no: 'AUD-F-14', name: 'N/A', rev: '', remarks: '', category: '', status: 'na', link: null },
  { no: 'AUD-F-15', name: 'Audit Report (Stage 2)', rev: 'Rev.:02', remarks: '', category: 'Stage 2', status: 'active', link: '/admin/audit-stage2' },
  { no: 'AUD-F-16', name: 'Request for Corrective Action', rev: 'Rev.:01', remarks: '', category: 'Corrective Action', status: 'active', link: '/admin/observation' },
  { no: 'AUD-F-17', name: 'Corrective Action Report', rev: 'Rev.:01', remarks: 'Separate File', category: 'Corrective Action', status: 'active', link: '/admin/observation' },
  { no: 'AUD-F-18', name: 'N/A', rev: '', remarks: '', category: '', status: 'na', link: null },
  { no: 'AUD-F-19', name: 'N/A', rev: '', remarks: '', category: '', status: 'na', link: null },
  { no: 'AUD-F-20', name: 'N/A', rev: '', remarks: '', category: '', status: 'na', link: null },
  { no: 'AUD-F-21', name: 'Draft for Certificate Approval', rev: 'Rev.:02', remarks: '', category: 'Certification', status: 'active', link: '/admin/certificates' },
  { no: 'AUD-F-22', name: 'Review Report (Initial Audit & Stage 2)', rev: 'Rev.:00', remarks: '', category: 'Review', status: 'active', link: '/admin/reports' },
  { no: 'AUD-F-23', name: 'N/A', rev: '', remarks: '', category: '', status: 'na', link: null },
];

const CATEGORIES = ['All', 'Pre-Application', 'Application', 'Planning', 'Declaration', 'Stage 1', 'Stage 2', 'Corrective Action', 'Certification', 'Review'];

const CATEGORY_COLORS = {
  'Pre-Application':   { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
  'Application':       { bg: '#dbeafe', text: '#1e40af', border: '#60a5fa' },
  'Planning':          { bg: '#ede9fe', text: '#5b21b6', border: '#a78bfa' },
  'Declaration':       { bg: '#fce7f3', text: '#9d174d', border: '#f472b6' },
  'Stage 1':           { bg: '#d1fae5', text: '#065f46', border: '#34d399' },
  'Stage 2':           { bg: '#cffafe', text: '#164e63', border: '#22d3ee' },
  'Corrective Action': { bg: '#fee2e2', text: '#991b1b', border: '#f87171' },
  'Certification':     { bg: '#fef9c3', text: '#713f12', border: '#facc15' },
  'Review':            { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' },
};

const CATEGORY_ICONS = {
  'Pre-Application':   ClipboardList,
  'Application':       FileText,
  'Planning':          BookOpen,
  'Declaration':       Users,
  'Stage 1':           ClipboardCheck,
  'Stage 2':           ClipboardCheck,
  'Corrective Action': AlertTriangle,
  'Certification':     Award,
  'Review':            ClipboardList,
};

const activeForms   = FORMS.filter(f => f.status === 'active');
const stage1Forms   = FORMS.filter(f => f.category === 'Stage 1');
const stage2Forms   = FORMS.filter(f => f.category === 'Stage 2');
const certForms     = FORMS.filter(f => f.category === 'Certification');

export default function AuditForms() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState('');
  const [activeTab, setTab]   = useState('All');

  const filtered = FORMS.filter(f => {
    const matchCat = activeTab === 'All' || f.category === activeTab;
    const matchQ   = !search || f.no.toLowerCase().includes(search.toLowerCase()) || f.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <Layout title="QMS Audit Forms">
      <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={20} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--gray-800)' }}>QMS Audit Format Index</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-500)' }}>Quality Control Certification — Complete Audit Documentation Package</p>
            </div>
          </div>
          <div style={{ marginTop: 8, padding: '8px 14px', background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa', fontSize: 12, color: '#9a3412', display: 'inline-flex', gap: 8 }}>
            <span>ISO 9001:2015</span><span>|</span><span>ISO 14001:2015</span><span>|</span><span>ISO 45001:2018</span><span>|</span><span>ISO 27001:2022</span><span>|</span><span>ISO 22000:2018</span><span>|</span><span>ISO/IEC 42001:2023</span><span>|</span><span>ISO 37001:2016</span><span>|</span><span>ISO 21001:2018</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Forms', value: FORMS.length, color: '#6366f1', bg: '#eef2ff', icon: FileText },
            { label: 'Active Forms', value: activeForms.length, color: '#10b981', bg: '#d1fae5', icon: CheckCircle },
            { label: 'Stage 1 Forms', value: stage1Forms.length, color: '#f59e0b', bg: '#fef3c7', icon: ClipboardCheck },
            { label: 'Stage 2 Forms', value: stage2Forms.length, color: '#06b6d4', bg: '#cffafe', icon: ClipboardCheck },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', padding: 20, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by form number or name..."
                style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setTab(cat)}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1.5px solid',
                  background: activeTab === cat ? 'var(--primary)' : 'white',
                  color: activeTab === cat ? 'white' : 'var(--gray-600)',
                  borderColor: activeTab === cat ? 'var(--primary)' : '#e2e8f0',
                  transition: 'all .15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Forms Table */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Format No.', 'Form Name', 'Category', 'Revision', 'Remarks', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((form, i) => {
                const CatIcon = form.category ? (CATEGORY_ICONS[form.category] || FileText) : null;
                const catStyle = form.category ? (CATEGORY_COLORS[form.category] || {}) : {};
                return (
                  <tr
                    key={form.no}
                    style={{ background: i % 2 === 0 ? 'white' : '#fafafa', borderBottom: '1px solid #f1f5f9', opacity: form.status === 'na' ? 0.45 : 1 }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {form.no}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: form.status === 'na' ? 'var(--gray-400)' : 'var(--gray-800)', fontStyle: form.status === 'na' ? 'italic' : 'normal', maxWidth: 340 }}>
                      {form.name}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {form.category ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}`, whiteSpace: 'nowrap' }}>
                          {CatIcon && <CatIcon size={11} />}
                          {form.category}
                        </span>
                      ) : <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                      {form.rev || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-500)' }}>
                      {form.remarks || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {form.status === 'active'
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#d1fae5', color: '#065f46', border: '1px solid #34d399' }}>
                            <CheckCircle size={11} /> Active
                          </span>
                        : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                            <XCircle size={11} /> N/A
                          </span>
                      }
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {form.link
                        ? <button
                            onClick={() => navigate(form.link)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'var(--primary)', color: 'white', border: 'none' }}
                          >
                            <ExternalLink size={11} /> Open
                          </button>
                        : <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)', fontSize: 14 }}>
              No forms found matching your criteria.
            </div>
          )}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 16, padding: '10px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, color: 'var(--gray-500)' }}>
          <strong>Note:</strong> Forms marked "N/A" are not currently in use. Active forms are linked to their respective module in the system. Contact the HOD for form revisions.
        </div>
      </div>
    </Layout>
  );
}
