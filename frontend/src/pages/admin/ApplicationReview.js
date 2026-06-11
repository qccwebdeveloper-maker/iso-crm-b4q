import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import { Plus, Eye, Edit, FileText, Search } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

const STATUS_COLOR = { draft: 'bdg-draft', submitted: 'bdg-submitted', approved: 'bdg-certified' };

export default function ApplicationReview() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    axios.get('/api/application-reviews')
      .then(r => setReviews(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = reviews.filter(r => {
    const q = search.toLowerCase();
    return !q
      || r.idNo?.toLowerCase().includes(q)
      || r.organizationName?.toLowerCase().includes(q)
      || r.application?.applicationId?.toLowerCase().includes(q);
  });

  useEffect(() => setPage(1), [search]);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <Layout title="Application Review">
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Application Review — AUD-F-03</h1>
          <p className="page-subtitle">Application Review &amp; Audit Planning forms</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/application-review/new')}>
          <Plus size={14} /> Create
        </button>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-body" style={{ padding: 14 }}>
          <div className="search-wrap">
            <Search size={15} className="search-ico" />
            <input className="search-input" placeholder="Search by ID, organization…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        {loading
          ? <div className="loading-box"><div className="spinner" /></div>
          : filtered.length === 0
            ? <div className="empty-box"><FileText size={40} /><h3>No reviews yet</h3><p>Click + Create to add the first one</p></div>
            : (
              <>
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>ID No.</th>
                        <th>Organization</th>
                        <th>Standard(s)</th>
                        <th>Risk</th>
                        <th>Status</th>
                        <th>Reviewer</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map(r => (
                        <tr key={r._id}>
                          <td><span className="mono">{r.idNo || r.application?.applicationId || '—'}</span></td>
                          <td style={{ fontWeight: 600 }}>{r.organizationName || r.application?.organizationName || '—'}</td>
                          <td><span className="badge bdg-info" style={{ fontSize: 10 }}>{r.auditStandards || '—'}</span></td>
                          <td>
                            {r.risk && (
                              <span style={{
                                padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                                background: r.risk === 'H' ? '#fee2e2' : r.risk === 'M' ? '#fef3c7' : '#dcfce7',
                                color: r.risk === 'H' ? '#dc2626' : r.risk === 'M' ? '#d97706' : '#16a34a',
                              }}>{r.risk}</span>
                            )}
                          </td>
                          <td><span className={`badge ${STATUS_COLOR[r.reviewStatus] || 'bdg-draft'}`} style={{ fontSize: 10 }}>{r.reviewStatus}</span></td>
                          <td style={{ fontSize: 12 }}>{r.reviewedBy?.name || '—'}</td>
                          <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{r.reviewDate ? new Date(r.reviewDate).toLocaleDateString() : new Date(r.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="tbl-actions">
                              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/application-review/${r._id}`)}>
                                <Eye size={13} /> View
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/application-review/${r._id}?edit=1`)}>
                                <Edit size={13} /> Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
              </>
            )
        }
      </div>
    </Layout>
  );
}
