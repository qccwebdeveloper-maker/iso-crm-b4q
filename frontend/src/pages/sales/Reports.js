import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Download, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function SalesReports() {
  const [leads,   setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('overview');

  useEffect(() => {
    axios.get('/api/leads').catch(() => ({ data: [] })).then(r => setLeads(r.data || [])).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
  };

  const pieData = [
    { name: 'New',       value: stats.new,       fill: '#3b82f6' },
    { name: 'Contacted', value: stats.contacted,  fill: '#f59e0b' },
    { name: 'Qualified', value: stats.qualified,  fill: '#8b5cf6' },
    { name: 'Converted', value: stats.converted,  fill: '#16a34a' },
    { name: 'Lost',      value: stats.lost,       fill: '#ef4444' },
  ].filter(d => d.value > 0);

  const monthlyData = MONTHS.map((m, i) => ({
    name: m,
    Leads: leads.filter(l => new Date(l.createdAt).getMonth() === i).length,
    Converted: leads.filter(l => l.status === 'converted' && new Date(l.updatedAt).getMonth() === i).length,
  }));

  const exportCSV = () => {
    const rows = [['Company','Contact','Standard','Status','Priority','Assigned To','Created'],
      ...leads.map(l => [l.companyName, l.contactPerson, l.isoStandard, l.status, l.priority, l.assignedTo?.name || '', new Date(l.createdAt).toLocaleDateString()])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sales-leads.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported!');
  };

  if (loading) return <Layout title="Sales Reports"><div className="loading-box"><div className="spinner" /></div></Layout>;

  return (
    <Layout title="Sales Reports">
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Sales Reports</h1>
          <p className="page-subtitle">Performance analytics and insights</p>
        </div>
        <button className="btn btn-primary" onClick={exportCSV}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="kpi-grid">
        {[
          { l: 'Total Leads',   v: stats.total,     c: 'purple' },
          { l: 'Converted',     v: stats.converted,  c: 'green' },
          { l: 'Conv. Rate',    v: `${stats.total > 0 ? Math.round(stats.converted / stats.total * 100) : 0}%`, c: 'orange' },
          { l: 'Qualified',     v: stats.qualified,  c: 'blue' },
        ].map((k, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-value">{k.v}</div>
            <div className="kpi-label">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="tabs-bar">
        {['overview', 'monthly', 'funnel'].map(t => (
          <button key={t} className={`tab-item ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-hdr"><div className="card-title"><Target size={14} style={{ color: 'var(--primary)' }} />Lead Status Distribution</div></div>
            <div style={{ padding: '16px', height: 260 }}>
              {pieData.length > 0
                ? <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                : <div className="empty-box"><p>No data yet</p></div>
              }
            </div>
          </div>
          <div className="card">
            <div className="card-hdr"><div className="card-title"><TrendingUp size={14} style={{ color: 'var(--primary)' }} />Funnel Summary</div></div>
            <div style={{ padding: '16px 20px' }}>
              {[
                { l: 'Total Leads',    v: stats.total,     pct: 100,                                                             c: 'var(--primary)' },
                { l: 'Contacted',      v: stats.contacted, pct: stats.total > 0 ? Math.round(stats.contacted/stats.total*100) : 0, c: 'var(--amber)' },
                { l: 'Qualified',      v: stats.qualified, pct: stats.total > 0 ? Math.round(stats.qualified/stats.total*100) : 0, c: 'var(--purple)' },
                { l: 'Converted',      v: stats.converted, pct: stats.total > 0 ? Math.round(stats.converted/stats.total*100) : 0, c: 'var(--green)' },
              ].map((m, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{m.l}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{m.v} ({m.pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${m.pct}%`, background: m.c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'monthly' && (
        <div className="card">
          <div className="card-hdr"><div className="card-title"><TrendingUp size={14} style={{ color: 'var(--primary)' }} />Monthly Leads & Conversions</div></div>
          <div style={{ padding: '16px', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffedd5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip />
                <Bar dataKey="Leads"     fill="#f97316" radius={[4,4,0,0]} />
                <Bar dataKey="Converted" fill="#16a34a" radius={[4,4,0,0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'funnel' && (
        <div className="card">
          <div className="card-hdr"><div className="card-title"><Target size={14} style={{ color: 'var(--primary)' }} />Sales Funnel</div></div>
          <div style={{ padding: '24px 20px' }}>
            {[
              { l: 'Total Leads',  v: stats.total,     w: '100%', c: '#3b82f6' },
              { l: 'Contacted',    v: stats.contacted, w: `${stats.total > 0 ? Math.round(stats.contacted/stats.total*100) : 0}%`, c: '#f59e0b' },
              { l: 'Qualified',    v: stats.qualified, w: `${stats.total > 0 ? Math.round(stats.qualified/stats.total*100) : 0}%`, c: '#8b5cf6' },
              { l: 'Converted',    v: stats.converted, w: `${stats.total > 0 ? Math.round(stats.converted/stats.total*100) : 0}%`, c: '#16a34a' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 90, fontSize: 12.5, fontWeight: 600, color: 'var(--gray-600)' }}>{m.l}</div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <div style={{ height: 32, background: `${m.c}20`, borderRadius: 6, overflow: 'hidden', border: `1px solid ${m.c}30` }}>
                    <div style={{ height: '100%', width: m.w, background: m.c, borderRadius: 6, transition: 'width .6s', display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                      <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{m.v}</span>
                    </div>
                  </div>
                </div>
                <div style={{ width: 40, fontSize: 12, color: 'var(--gray-500)', textAlign: 'right' }}>{m.w}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
