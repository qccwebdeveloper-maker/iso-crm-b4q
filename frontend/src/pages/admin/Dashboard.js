import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';
import {
  FileText, Users, Award, Clock, TrendingUp, ChevronRight,
  CheckCircle, Plus, MessageSquare, Target, Star, UserCheck,
  ClipboardCheck, Eye, AlertCircle, Activity, ClipboardList, BookOpen, AlertTriangle, Settings
} from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,     setStats]     = useState({ totalApplications:0, clients:0, auditors:0, statusCounts:[], monthlyApps:[], recentApps:[] });
  const [apps,      setApps]      = useState([]);
  const [leads,     setLeads]     = useState([]);
  const [auditors,  setAuditors]  = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [salesTeam, setSalesTeam] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [assignModal,     setAssignModal]     = useState(null);
  const [assignForm,      setAssignForm]      = useState({ auditorId:'', reviewerId:'' });
  const [assignLeadModal, setAssignLeadModal] = useState(null);
  const [assignTo,        setAssignTo]        = useState('');
  const [saving,          setSaving]          = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      axios.get('/api/dashboard/stats').catch(() => ({ data: { totalApplications:0, clients:0, auditors:0, statusCounts:[], monthlyApps:[], recentApps:[] } })),
      axios.get('/api/applications').catch(() => ({ data: [] })),
      axios.get('/api/leads').catch(() => ({ data: [] })),
      axios.get('/api/auditors').catch(() => ({ data: [] })),
      axios.get('/api/users').catch(() => ({ data: [] })),
    ]).then(([s, a, l, au, u]) => {
      const statsData = s.data || {};
      const appsData  = a.data || [];
      setStats({
        totalApplications: statsData.totalApplications || 0,
        clients:           statsData.clients           || 0,
        auditors:          statsData.auditors          || 0,
        statusCounts:      statsData.statusCounts      || [],
        monthlyApps:       statsData.monthlyApps       || [],
        recentApps:        statsData.recentApps        || [],
      });
      setApps(appsData);
      setLeads(l.data || []);
      setAuditors(au.data || []);
      setSalesTeam((u.data || []).filter(x => x.role === 'sales'));
      setFeedbacks(
        appsData.flatMap(app =>
          (app.feedbacks || []).map(f => ({ ...f, appId: app.applicationId, org: app.organizationName }))
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    }).catch(err => {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data. Please refresh.');
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Layout title="Dashboard"><div className="loading-box"><div className="spinner"/></div></Layout>;

  if (error) return (
    <Layout title="Dashboard">
      <div style={{ padding: 32, textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: 'var(--red)', marginBottom: 12 }} />
        <h3 style={{ color: 'var(--text-1)', marginBottom: 8 }}>Dashboard Error</h3>
        <p style={{ color: 'var(--gray-400)', marginBottom: 16 }}>{error}</p>
        <button className="btn btn-primary" onClick={load}>Retry</button>
      </div>
    </Layout>
  );

  const certified    = (stats.statusCounts || []).find(s => s._id === 'certified')?.count || 0;
  const pending      = (stats.statusCounts || []).filter(s => ['submitted','under_review','audit_stage1','audit_stage2'].includes(s._id)).reduce((a, s) => a + s.count, 0);
  const compliance   = stats.totalApplications ? Math.round((certified / stats.totalApplications) * 100) : 0;
  const monthly      = (stats.monthlyApps || []).map(m => ({ name: MONTHS[(m._id?.month || 1) - 1], Apps: m.count }));
  const recent       = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const unassigned   = apps.filter(a => !a.assignedAuditor && ['submitted','under_review'].includes(a.status));
  const auditorList  = auditors.filter(a => a.role === 'auditor');
  const reviewerList = auditors.filter(a => a.role === 'reviewer');
  const avgRating    = feedbacks.length ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1) : '—';

  const kpis = [
    { label: 'Total Applications', value: stats.totalApplications, icon: FileText,      color: 'orange', to: '/admin/applications' },
    { label: 'Active Clients',     value: stats.clients,           icon: Users,          color: 'blue',   to: '/admin/users' },
    { label: 'Auditors',           value: auditorList.length,      icon: ClipboardCheck, color: 'purple', to: '/admin/auditors' },
    { label: 'Certified',          value: certified,               icon: Award,          color: 'gold',   to: '/admin/applications' },
    { label: 'Pending Review',     value: pending,                 icon: Clock,          color: 'amber',  to: '/admin/approval-pending' },
    { label: 'Compliance Rate',    value: `${compliance}%`,        icon: TrendingUp,     color: 'teal',   to: '/admin/reports' },
  ];

  const handleAssignAudit = async () => {
    if (!assignForm.auditorId && !assignForm.reviewerId) return toast.error('Select at least one person');
    setSaving(true);
    try {
      await axios.post(`/api/applications/${assignModal._id}/assign`, assignForm);
      toast.success('Assigned! Auditor notified.');
      setAssignModal(null);
      load();
    } catch { toast.error('Assignment failed'); }
    finally { setSaving(false); }
  };

  const handleAssignLead = async () => {
    if (!assignTo) return toast.error('Select a team member');
    setSaving(true);
    try {
      await axios.put(`/api/leads/${assignLeadModal._id}`, { assignedTo: assignTo });
      toast.success('Lead assigned!');
      setAssignLeadModal(null);
      setAssignTo('');
      load();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };


  return (
    <Layout title="Dashboard">
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Here's everything happening today</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/leads')}><Target size={14}/> Leads</button>
          <button className="btn btn-primary"   onClick={() => navigate('/admin/applications/new')}><Plus size={14}/> New Application</button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="welcome-card">
        <div className="wc-text" style={{ position:'relative', zIndex:1 }}>
          <h2>ISO Certification CRM</h2>
          <p>{apps.filter(a => a.status === 'submitted').length} new submissions · {unassigned.length} need auditor assignment</p>
        </div>
        <div className="wc-stats">
          {[
            { v: stats.totalApplications, l: 'Total Apps' },
            { v: certified,               l: 'Certified'  },
            { v: pending,                 l: 'Pending'    },
            { v: `${compliance}%`,        l: 'Compliance' },
          ].map((s, i) => (
            <div key={i} className="wc-stat">
              <div className="wc-stat-v">{s.v}</div>
              <div className="wc-stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => navigate(k.to)}>
            <div className={`kpi-icon ${k.color}`}><k.icon size={17}/></div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* QMS Audit Forms Quick Access */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>QMS Audit Report Forms</span>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#e3f2fd', color: 'var(--primary-dark)', border: '1px solid #90caf9', fontWeight: 700 }}>PDF</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/audit-forms')}>View All Forms <ChevronRight size={11}/></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { code: 'AUD-F-02', name: 'Application Form', desc: 'Request for Proposal cum Application', icon: FileText, color: '#3b82f6', bg: '#dbeafe', link: '/admin/audit-report/new' },
            { code: 'AUD-F-03', name: 'Audit Planning', desc: 'Application Review & Audit Planning', icon: BookOpen, color: '#8b5cf6', bg: '#ede9fe', link: '/admin/audit-report/new' },
            { code: 'AUD-F-09', name: 'Stage 1 Report', desc: 'Stage 1 QMS Audit Report', icon: ClipboardCheck, color: '#10b981', bg: '#d1fae5', link: '/admin/audit-report/new' },
            { code: 'AUD-F-15', name: 'Stage 2 Report', desc: 'Stage 2 QMS Audit Report', icon: ClipboardCheck, color: '#06b6d4', bg: '#cffafe', link: '/admin/audit-report/new' },
            { code: 'AUD-F-16', name: 'Corrective Action', desc: 'Request for Corrective Action', icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2', link: '/admin/observation' },
            { code: 'AUD-F-21', name: 'Certificate Approval', desc: 'Draft for Certificate Approval', icon: Award, color: '#f59e0b', bg: '#fef3c7', link: '/admin/certificates' },
            { code: 'AUD-F-22', name: 'Review Report', desc: 'Final Review & HOD Decision', icon: Settings, color: '#6366f1', bg: '#eef2ff', link: '/admin/audit-report/new' },
            { code: 'ALL FORMS', name: 'Forms Index', desc: 'View all 26 audit format documents', icon: ClipboardList, color: '#0f172a', bg: '#f1f5f9', link: '/admin/audit-forms' },
            { code: 'AUDIT',     name: 'Audit Details', desc: 'View audit details per application (QMS)', icon: Eye, color: '#1565c0', bg: '#e3f2fd', link: '/admin/audit-details' },
          ].map(f => (
            <div
              key={f.code}
              onClick={() => navigate(f.link)}
              style={{ background: 'white', borderRadius: 10, border: '1.5px solid #f1f5f9', padding: '14px 16px', cursor: 'pointer', transition: 'all .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.10)'; e.currentTarget.style.borderColor = f.color + '60'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={15} color={f.color} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: f.color, fontFamily: 'monospace', background: f.bg, padding: '2px 7px', borderRadius: 5 }}>{f.code}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 3 }}>{f.name}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', lineHeight: 1.4 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Chart + Recent Apps */}
      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:18, marginBottom:18 }}>
        <div className="card" style={{ marginBottom:0 }}>
          <div className="card-hdr">
            <div className="card-title"><TrendingUp size={14} style={{ color:'var(--primary)' }}/>Monthly Applications</div>
          </div>
          <div style={{ padding:'12px 8px 8px' }}>
            {monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height={185}>
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1565c0" stopOpacity={0.18}/>
                      <stop offset="95%" stopColor="#1565c0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3f2fd"/>
                  <XAxis dataKey="name" tick={{ fontSize:10 }}/>
                  <YAxis tick={{ fontSize:10 }}/>
                  <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #90caf9', fontSize:12 }}/>
                  <Area type="monotone" dataKey="Apps" stroke="#1565c0" fill="url(#ag)" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-box" style={{ height:185, padding:0 }}>
                <TrendingUp size={28}/><h3>No data yet</h3>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginBottom:0 }}>
          <div className="card-hdr">
            <div className="card-title"><FileText size={14} style={{ color:'var(--primary)' }}/>Recent Applications</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/applications')}>All <ChevronRight size={11}/></button>
          </div>
          {recent.length === 0 ? (
            <div className="empty-box" style={{ padding:'28px 20px' }}>
              <FileText size={28}/><h3>No applications yet</h3>
              <button className="btn btn-primary btn-sm" style={{ marginTop:10 }} onClick={() => navigate('/admin/applications/new')}><Plus size={11}/> Create First</button>
            </div>
          ) : recent.map(a => (
            <div key={a._id}
              onClick={() => navigate(`/admin/applications/${a._id}`)}
              style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 16px', borderBottom:'1px solid var(--primary-50)', cursor:'pointer', transition:'background .12s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-50)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <div className="avatar" style={{ width:26, height:26, fontSize:9, flexShrink:0 }}>{a.organizationName?.[0] || '?'}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:12.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.organizationName}</div>
                <div style={{ fontSize:10.5, color:'var(--gray-400)' }}>{a.applicationId}</div>
              </div>
              <span className={`badge bdg-${a.status}`} style={{ fontSize:9.5, flexShrink:0 }}>{a.status?.replace(/_/g,' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Auditor Panel + Unassigned */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
        <div className="card" style={{ marginBottom:0 }}>
          <div className="card-hdr">
            <div className="card-title"><ClipboardCheck size={14} style={{ color:'var(--primary)' }}/>Auditors</div>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/auditors')}>View All</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/users')}><Plus size={11}/> Add</button>
            </div>
          </div>
          {auditorList.length === 0 ? (
            <div className="empty-box" style={{ padding:'24px 20px' }}>
              <ClipboardCheck size={28}/><h3>No auditors yet</h3>
              <button className="btn btn-primary btn-sm" style={{ marginTop:10 }} onClick={() => navigate('/admin/users')}><Plus size={11}/> Add Auditor</button>
            </div>
          ) : auditorList.slice(0, 5).map(a => (
            <div key={a._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderBottom:'1px solid var(--primary-50)' }}>
              <div className="avatar" style={{ width:30, height:30, fontSize:10, background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', flexShrink:0 }}>{a.name?.[0]}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:12.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.name}</div>
                <div style={{ fontSize:10.5, color:'var(--gray-400)' }}>{a.email}</div>
              </div>
              <div style={{ textAlign:'center', padding:'3px 8px', background:'var(--primary-50)', borderRadius:7, fontSize:11, fontWeight:700, color:'var(--primary-dark)', flexShrink:0 }}>
                {(a.assignedApplications || []).length} apps
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom:0 }}>
          <div className="card-hdr">
            <div className="card-title"><UserCheck size={14} style={{ color:'var(--primary)' }}/>Needs Auditor Assignment</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/applications')}>All Apps</button>
          </div>
          {unassigned.length === 0 ? (
            <div className="empty-box" style={{ padding:'24px 20px' }}><CheckCircle size={28}/><h3>All assigned!</h3></div>
          ) : unassigned.slice(0, 5).map(a => (
            <div key={a._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderBottom:'1px solid var(--primary-50)' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:12.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.organizationName}</div>
                <div style={{ fontSize:10.5, color:'var(--gray-400)' }}>{a.applicationId} · {a.isoStandard}</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setAssignModal(a); setAssignForm({ auditorId:'', reviewerId:'' }); }}>
                <UserCheck size={11}/> Assign
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Status Chart + Feedback */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
        <div className="card" style={{ marginBottom:0 }}>
          <div className="card-hdr"><div className="card-title"><Activity size={14} style={{ color:'var(--primary)' }}/>Application Status Overview</div></div>
          <div style={{ padding:'12px 8px 8px' }}>
            {(stats.statusCounts || []).length > 0 ? (
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={(stats.statusCounts || []).map(s => ({ name: s._id.replace(/_/g,' '), count: s.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3f2fd"/>
                  <XAxis dataKey="name" tick={{ fontSize:9 }}/>
                  <YAxis tick={{ fontSize:10 }}/>
                  <Tooltip contentStyle={{ borderRadius:10, border:'1px solid #90caf9', fontSize:12 }}/>
                  <Bar dataKey="count" fill="#1565c0" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-box" style={{ height:170, padding:0 }}><Activity size={28}/><h3>No data yet</h3></div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginBottom:0 }}>
          <div className="card-hdr">
            <div className="card-title">
              <MessageSquare size={14} style={{ color:'var(--primary)' }}/>Client Feedback
              <span style={{ fontSize:11, fontWeight:500, color:'var(--gray-400)', marginLeft:6 }}>{feedbacks.length} · avg {avgRating}⭐</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/feedback')}>All <ChevronRight size={11}/></button>
          </div>
          <div style={{ maxHeight:220, overflowY:'auto' }}>
            {feedbacks.length === 0 ? (
              <div className="empty-box" style={{ padding:'24px 20px' }}><MessageSquare size={28}/><h3>No feedback yet</h3></div>
            ) : feedbacks.slice(0, 4).map((f, i) => (
              <div key={i} style={{ padding:'11px 16px', borderBottom:'1px solid var(--primary-50)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <div style={{ fontWeight:600, fontSize:12.5 }}>{f.org}</div>
                  <div style={{ display:'flex', gap:1 }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= (f.rating || 0) ? '#f59e0b' : 'none'} stroke="#f59e0b"/>)}
                  </div>
                </div>
                <div style={{ fontSize:12, color:'var(--gray-600)', lineHeight:1.4 }}>{f.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Team + Unassigned Leads */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <div className="card" style={{ marginBottom:0 }}>
          <div className="card-hdr">
            <div className="card-title"><Users size={14} style={{ color:'var(--primary)' }}/>Sales Team</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/users')}><Plus size={11}/> Add</button>
          </div>
          {salesTeam.length === 0 ? (
            <div className="empty-box" style={{ padding:'24px 20px' }}><Users size={28}/><h3>No sales members</h3></div>
          ) : salesTeam.map(m => (
            <div key={m._id} style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 16px', borderBottom:'1px solid var(--primary-50)' }}>
              <div className="avatar" style={{ width:30, height:30, fontSize:10, background:'linear-gradient(135deg,#16a34a,#15803d)', flexShrink:0 }}>{m.name?.[0]}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:12.5 }}>{m.name}</div>
                <div style={{ fontSize:10.5, color:'var(--gray-400)' }}>{m.email}</div>
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--primary-dark)', background:'var(--primary-50)', padding:'2px 8px', borderRadius:6, flexShrink:0 }}>
                {leads.filter(l => l.assignedTo === m._id || l.assignedTo?._id === m._id).length} leads
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom:0 }}>
          <div className="card-hdr">
            <div className="card-title"><Target size={14} style={{ color:'var(--primary)' }}/>Unassigned Leads</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/leads')}>All <ChevronRight size={11}/></button>
          </div>
          {leads.filter(l => !l.assignedTo).length === 0 ? (
            <div className="empty-box" style={{ padding:'24px 20px' }}><CheckCircle size={28}/><h3>All leads assigned!</h3></div>
          ) : leads.filter(l => !l.assignedTo).slice(0, 5).map(l => (
            <div key={l._id} style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 16px', borderBottom:'1px solid var(--primary-50)' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:12.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.companyName}</div>
                <div style={{ fontSize:10.5, color:'var(--gray-400)' }}>{l.isoStandard} · {l.status}</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setAssignLeadModal(l); setAssignTo(''); }}>
                <UserCheck size={11}/> Assign
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Auditor Modal */}
      {assignModal && (
        <div className="modal-bg" onClick={() => setAssignModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title"><UserCheck size={15} style={{ color:'var(--primary)', marginRight:7, verticalAlign:'middle' }}/>Assign Team — {assignModal.applicationId}</div>
              <button className="modal-close" onClick={() => setAssignModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background:'var(--primary-50)', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13 }}>
                <strong>{assignModal.organizationName}</strong>
                <div style={{ fontSize:11.5, color:'var(--gray-500)', marginTop:2 }}>{assignModal.isoStandard} · <span className={`badge bdg-${assignModal.status}`} style={{ fontSize:10 }}>{assignModal.status?.replace(/_/g,' ')}</span></div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign Auditor</label>
                <select className="form-control" value={assignForm.auditorId} onChange={e => setAssignForm(p => ({ ...p, auditorId: e.target.value }))}>
                  <option value="">— Select Auditor —</option>
                  {auditorList.map(a => <option key={a._id} value={a._id}>{a.name} — {(a.assignedApplications || []).length} apps</option>)}
                </select>
              </div>
              {reviewerList.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Assign Reviewer</label>
                  <select className="form-control" value={assignForm.reviewerId} onChange={e => setAssignForm(p => ({ ...p, reviewerId: e.target.value }))}>
                    <option value="">— Select Reviewer —</option>
                    {reviewerList.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssignAudit} disabled={saving}>{saving ? 'Saving…' : <><UserCheck size={13}/> Assign</>}</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Lead Modal */}
      {assignLeadModal && (
        <div className="modal-bg" onClick={() => setAssignLeadModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title"><UserCheck size={15} style={{ color:'var(--primary)', marginRight:7, verticalAlign:'middle' }}/>Assign Lead to Sales</div>
              <button className="modal-close" onClick={() => setAssignLeadModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background:'var(--primary-50)', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13 }}>
                <strong>{assignLeadModal.companyName}</strong>
                <div style={{ fontSize:11.5, color:'var(--gray-500)', marginTop:2 }}>{assignLeadModal.contactPerson} · {assignLeadModal.isoStandard}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign to Sales Team Member *</label>
                <select className="form-control" value={assignTo} onChange={e => setAssignTo(e.target.value)}>
                  <option value="">— Select Member —</option>
                  {salesTeam.length === 0
                    ? <option disabled>No sales members found</option>
                    : salesTeam.map(m => <option key={m._id} value={m._id}>{m.name} — {leads.filter(l => l.assignedTo === m._id || l.assignedTo?._id === m._id).length} leads</option>)
                  }
                </select>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setAssignLeadModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssignLead} disabled={saving}>{saving ? 'Assigning…' : <><UserCheck size={13}/> Assign</>}</button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
