import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import { MessageSquare, Star, TrendingUp } from 'lucide-react';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    // Try dedicated endpoint first, fallback to aggregating from applications
    axios.get('/api/feedback').then(r => setFeedbacks(r.data || []))
      .catch(() => axios.get('/api/applications').then(r => {
        const all = (r.data || []).flatMap(app =>
          (app.feedbacks || []).map(f => ({ ...f, applicationId: app.applicationId, organizationName: app.organizationName, isoStandard: app.isoStandard }))
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFeedbacks(all);
      }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = feedbacks.filter(f =>
    (!filterRole || f.role === filterRole) && (f.rating || 0) >= minRating
  );

  const avgRating = filtered.length
    ? (filtered.reduce((s, f) => s + (f.rating || 0), 0) / filtered.length).toFixed(1)
    : '—';

  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: feedbacks.filter(f => f.rating === r).length,
    pct: feedbacks.length ? Math.round((feedbacks.filter(f => f.rating === r).length / feedbacks.length) * 100) : 0,
  }));

  if (loading) return <Layout title="Feedback Center"><div className="loading-box"><div className="spinner" /></div></Layout>;

  return (
    <Layout title="Feedback Center">
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Feedback Center</h1>
          <p className="page-subtitle">{filtered.length} feedback entries · Avg rating: {avgRating} ⭐</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Feedback', value: feedbacks.length, color: 'orange' },
          { label: 'Avg Rating',     value: avgRating + ' ★', color: 'gold' },
          { label: '5-Star Reviews', value: ratingDist[0].count, color: 'green' },
          { label: 'This Month',     value: feedbacks.filter(f => new Date(f.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length, color: 'blue' },
        ].map((s, i) => (
          <div key={i} className="kpi-card">
            <div className={`kpi-icon ${s.color}`}><Star size={16} /></div>
            <div className="kpi-value">{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: 20, marginBottom: 20 }}>
        {/* Rating Distribution */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-hdr"><div className="card-title"><TrendingUp size={14} style={{ color: 'var(--primary)' }} />Rating Breakdown</div></div>
          <div style={{ padding: '16px 20px' }}>
            {ratingDist.map(r => (
              <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 1, width: 72, flexShrink: 0 }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= r.stars ? '#f59e0b' : 'none'} stroke="#f59e0b" />)}
                </div>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${r.pct}%`, background: r.stars >= 4 ? 'var(--green)' : r.stars === 3 ? 'var(--amber)' : 'var(--red)' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, width: 20, textAlign: 'right', color: 'var(--gray-600)' }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-hdr"><div className="card-title"><MessageSquare size={14} style={{ color: 'var(--primary)' }} />Filter Feedback</div></div>
          <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-control" style={{ width: 'auto', minWidth: 150 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">All Roles</option>
              {['client', 'auditor', 'reviewer'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <select className="form-control" style={{ width: 'auto', minWidth: 150 }} value={minRating} onChange={e => setMinRating(Number(e.target.value))}>
              <option value={0}>All Ratings</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}+ Stars</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Cards */}
      {filtered.length === 0
        ? <div className="empty-box"><MessageSquare size={40} /><h3>No feedback found</h3><p>Client feedback will appear here once submitted</p></div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filtered.map((f, i) => (
              <div key={i} style={{ background: 'white', border: '1.5px solid var(--primary-100)', borderRadius: 14, padding: '16px 18px', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--primary-200)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--primary-100)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{f.organizationName || 'Unknown Org'}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                      {f.applicationId} · <span className={`badge bdg-${f.role}`} style={{ fontSize: 9.5, padding: '1px 6px' }}>{f.role}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s <= (f.rating || 0) ? '#f59e0b' : 'none'} stroke="#f59e0b" />)}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.55, marginBottom: 10 }}>{f.message}</p>
                <div style={{ fontSize: 10.5, color: 'var(--gray-400)' }}>{f.createdAt ? new Date(f.createdAt).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>
      }
    </Layout>
  );
}
