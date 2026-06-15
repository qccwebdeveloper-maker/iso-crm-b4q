import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import { FileText, Eye } from 'lucide-react';

const STATUS_COLORS = {
  draft:       { bg: '#f1f5f9', color: '#64748b', label: 'Draft' },
  in_progress: { bg: '#fff7ed', color: '#c2410c', label: 'In Progress' },
  completed:   { bg: '#f0fdf4', color: '#15803d', label: 'Completed' },
};

export default function ClientAuditReportList() {
  const navigate = useNavigate();
  const [reports, setReports]  = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => { 
    axios.get('/api/audit-reports')
      .then(res => setReports(res.data || []))
      .catch(() => toast.error('Failed to load audit reports'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Layout title="Audit Reports">
      <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--gray-800)' }}>My Audit Reports</h2>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--gray-500)' }}>Reports shared with you by the certification body</p>
          </div>
        </div>

        {/* Info banner */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1d4ed8' }}>
          <strong>Your access:</strong> You can fill in Organization Information and Standards & Employees sections. Other sections are managed by the audit team.
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 10 }}>
              <div className="spinner" />
              <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>Loading...</span>
            </div>
          ) : reports.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <FileText size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>No audit reports yet</div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>Reports assigned to your Client ID will appear here</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                    {['Ref No.', 'Organization', 'Status', 'Created', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => {
                    const sc = STATUS_COLORS[r.status] || STATUS_COLORS.draft;
                    return (
                      <tr key={r._id} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
                          {r.refNo || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: 'var(--gray-800)' }}>
                          {r.orgName || <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>Unnamed</span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700 }}>
                            {sc.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                          {fmt(r.createdAt)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            onClick={() => navigate(`/client/audit-reports/${r._id}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 7, border: '1.5px solid var(--primary)', background: '#fff7ed', color: 'var(--primary-dark)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                          >
                            <Eye size={12} /> View & Fill
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
