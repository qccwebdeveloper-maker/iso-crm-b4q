import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import { Plus, Eye, Edit, FileText, Search } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

export default function ClientApplications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const PER_PAGE = 10;

  const load = () => {
    setLoading(true);
    axios.get('/api/applications').then(r => setApps(r.data || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    return !q || a.applicationId?.toLowerCase().includes(q) || a.organizationName?.toLowerCase().includes(q);
  });

  useEffect(() => setPage(1), [search]);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const renderTable = () => {
    if (loading) return <div className="loading-box"><div className="spinner" /></div>;
    if (filtered.length === 0) return (
      <div className="empty-box">
        <FileText size={40} />
        <h3>No applications yet</h3>
        <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => navigate('/client/applications/new')}>
          <Plus size={14} /> Start Now
        </button>
      </div>
    );
    return (
      <>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Client ID</th><th>Organization</th><th>Standard</th><th>Status</th><th>Auditor</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {paged.map(app => (
                <tr key={app._id}>
                  <td><span className="mono">{app.client?.clientId || user?.clientId || '—'}</span></td>
                  <td style={{ fontWeight: 600 }}>{app.organizationName}</td>
                  <td><span className="badge bdg-info" style={{ fontSize: 10.5 }}>{app.isoStandard}</span></td>
                  <td><span className={`badge bdg-${app.status}`} style={{ fontSize: 10.5 }}>{app.status?.replace(/_/g, ' ')}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{app.assignedAuditor?.name || '—'}</td>
                  <td>
                    <div className="tbl-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/client/applications/${app._id}`)}><Eye size={13} /> View</button>
                      {['draft', 'submitted'].includes(app.status) && (
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/client/applications/${app._id}/edit`)}><Edit size={13} /> Edit</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
      </>
    );
  };

  return (
    <Layout title="My Applications">
      <div className="page-hdr">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">{filtered.length} applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/client/applications/new')}><Plus size={14} /> New Application</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: 14 }}>
          <div className="search-wrap">
            <Search size={15} className="search-ico" />
            <input className="search-input" placeholder="Search applications…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        {renderTable()}
      </div>
    </Layout>
  );
}
