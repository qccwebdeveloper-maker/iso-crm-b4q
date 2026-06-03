import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import { Target, Users, TrendingUp, ChevronRight, Plus, UserCheck, BarChart2, CheckCircle, Clock, Star, Edit, Trash2, Search, Phone } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const STATUS_CFG = {
  new:       { label:'New',       bdg:'bdg-submitted',    color:'#3b82f6' },
  contacted: { label:'Contacted', bdg:'bdg-under_review', color:'#f59e0b' },
  qualified: { label:'Qualified', bdg:'bdg-audit_stage1', color:'#8b5cf6' },
  converted: { label:'Converted', bdg:'bdg-certified',    color:'#16a34a' },
  lost:      { label:'Lost',      bdg:'bdg-rejected',     color:'#ef4444' },
};
const ISO = ['ISO 9001:2015','ISO 14001:2015','ISO 45001:2018','ISO 27001:2022','ISO 22000:2018','ISO 13485:2016','ISO 50001:2018'];
const SOURCES = ['Website','Referral','LinkedIn','Cold Call','Email Campaign','Trade Show','Other'];
const EMPTY = { companyName:'',contactPerson:'',email:'',mobile:'',isoStandard:'ISO 9001:2015',source:'Website',status:'new',priority:'medium',notes:'',city:'',country:'India' };

const PBar = ({label,value,max,color,fmt}) => (
  <div style={{marginBottom:11}}>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
      <span style={{fontSize:12.5,fontWeight:600,color:'var(--text-1)'}}>{label}</span>
      <span style={{fontSize:12.5,fontWeight:700,color:'var(--text-2)'}}>{fmt?fmt(value):value}</span>
    </div>
    <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(100,(value/Math.max(1,max))*100)}%`,background:color}}/></div>
  </div>
);

export default function SalesDashboard() {
  const { user } = useAuth();
  const navigate   = useNavigate();
  const [leads,   setLeads]   = useState([]);
  const [team,    setTeam]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('overview');
  const [search,  setSearch]  = useState('');
  const [statusF, setStatusF] = useState('');
  const [modal,   setModal]   = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [assignModal, setAssignModal] = useState(null);
  const [assignTo, setAssignTo] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/leads').catch(()=>({data:[]})),
      axios.get('/api/users').catch(()=>({data:[]})),
    ]).then(([l,u]) => {
      setLeads(l.data||[]);
      setTeam((u.data||[]).filter(x=>['sales','admin'].includes(x.role)));
    }).finally(()=>setLoading(false));
  }, []);
  useEffect(()=>{ load(); },[load]);

  const stats = {
    total:     leads.length,
    new:       leads.filter(l=>l.status==='new').length,
    qualified: leads.filter(l=>l.status==='qualified').length,
    converted: leads.filter(l=>l.status==='converted').length,
    lost:      leads.filter(l=>l.status==='lost').length,
  };
  const convRate = stats.total>0 ? Math.round((stats.converted/stats.total)*100) : 0;

  const pipelineData = Object.entries(STATUS_CFG).map(([k,v])=>({name:v.label,count:leads.filter(l=>l.status===k).length,fill:v.color}));

  const filtered = leads.filter(l=>{
    const q=search.toLowerCase();
    return (!q||l.companyName?.toLowerCase().includes(q)||l.contactPerson?.toLowerCase().includes(q)||l.email?.toLowerCase().includes(q))
      && (!statusF||l.status===statusF);
  });

  const openAdd   = () => { setForm(EMPTY); setEditLead(null); setModal(true); };
  const openEdit  = (l) => { setForm({companyName:l.companyName||'',contactPerson:l.contactPerson||'',email:l.email||'',mobile:l.mobile||'',isoStandard:l.isoStandard||'ISO 9001:2015',source:l.source||'Website',status:l.status||'new',priority:l.priority||'medium',notes:l.notes||'',city:l.city||'',country:l.country||'India'}); setEditLead(l); setModal(true); };

  const saveLead = async () => {
    if (!form.companyName) return toast.error('Company name required');
    setSaving(true);
    try {
      if (editLead) { await axios.put(`/api/leads/${editLead._id}`,form); toast.success('Lead updated!'); }
      else          { await axios.post('/api/leads',form); toast.success('Lead added!'); }
      setModal(false); setEditLead(null); load();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try { await axios.delete(`/api/leads/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  const assignLead = async () => {
    if (!assignTo) return toast.error('Select a team member');
    setSaving(true);
    try {
      await axios.put(`/api/leads/${assignModal._id}`,{ assignedTo:assignTo });
      toast.success('Lead assigned!');
      setAssignModal(null); setAssignTo(''); load();
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const teamStats = team.map(m=>({
    ...m,
    leadsCount: leads.filter(l=>l.assignedTo===m._id||l.assignedTo?._id===m._id).length,
    converted:  leads.filter(l=>(l.assignedTo===m._id||l.assignedTo?._id===m._id)&&l.status==='converted').length,
  }));

  const TABS = [{id:'overview',label:'📊 Overview'},{id:'leads',label:'🎯 Leads'},{id:'team',label:'👥 Sales Team'}];

  return (
    <Layout title="Sales Dashboard">
      <div className="page-hdr">
        <div><h1 className="page-title">Sales Dashboard</h1><p className="page-subtitle">Lead management &amp; team overview</p></div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn btn-secondary" onClick={()=>navigate('/sales/leads')}><Target size={13}/> All Leads</button>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={13}/> Add Lead</button>
        </div>
      </div>

      <div className="welcome-card">
        <div className="wc-text" style={{position:'relative',zIndex:1}}>
          <h2>Welcome, {user?.name?.split(' ')[0]} 👋</h2>
          <p>{leads.filter(l=>!l.assignedTo).length} leads unassigned · {stats.new} new this week</p>
        </div>
        <div className="wc-stats">
          {[{v:stats.total,l:'Total Leads'},{v:stats.qualified,l:'Qualified'},{v:stats.converted,l:'Converted'},{v:`${convRate}%`,l:'Conv. Rate'}].map((s,i)=>(
            <div key={i} className="wc-stat"><div className="wc-stat-v">{s.v}</div><div className="wc-stat-l">{s.l}</div></div>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        {[
          {label:'Total Leads',    value:stats.total,     icon:Target,     color:'orange'},
          {label:'Qualified',      value:stats.qualified, icon:Star,       color:'blue'  },
          {label:'Converted',      value:stats.converted, icon:CheckCircle,color:'green' },
          {label:'Conversion Rate',value:`${convRate}%`,  icon:TrendingUp, color:'teal'  },
        ].map((k,i)=>(
          <div key={i} className="kpi-card">
            <div className={`kpi-icon ${k.color}`}><k.icon size={17}/></div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{display:'flex',gap:4,marginBottom:22,background:'var(--primary-50)',borderRadius:12,padding:4,width:'fit-content',border:'1.5px solid var(--primary-100)',flexWrap:'wrap'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:'8px 18px',borderRadius:9,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:700,transition:'all .15s',
            background:tab===t.id?'linear-gradient(135deg,var(--primary),var(--primary-dark))':'transparent',
            color:tab===t.id?'white':'var(--primary-dark)',boxShadow:tab===t.id?'0 2px 8px rgba(249,115,22,0.3)':'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==='overview' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
          <div className="card" style={{marginBottom:0}}>
            <div className="card-hdr"><div className="card-title"><BarChart2 size={14} style={{color:'var(--primary)'}}/>Lead Pipeline</div></div>
            <div style={{padding:'12px 8px 8px'}}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffedd5"/>
                  <XAxis dataKey="name" tick={{fontSize:10}}/>
                  <YAxis tick={{fontSize:10}}/>
                  <Tooltip contentStyle={{borderRadius:10,border:'1px solid #fed7aa',fontSize:12}}/>
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {pipelineData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card" style={{marginBottom:0}}>
            <div className="card-hdr">
              <div className="card-title"><Target size={14} style={{color:'var(--primary)'}}/>Recent Leads</div>
              <button className="btn btn-ghost btn-sm" onClick={()=>setTab('leads')}>View All <ChevronRight size={11}/></button>
            </div>
            {[...leads].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5).map(l=>(
              <div key={l._id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderBottom:'1px solid var(--primary-50)'}}>
                <div className="avatar" style={{width:28,height:28,fontSize:10,background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',flexShrink:0}}>{l.companyName?.[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:12.5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.companyName}</div>
                  <div style={{fontSize:10.5,color:'var(--gray-400)'}}>{l.isoStandard}</div>
                </div>
                <span className={`badge ${STATUS_CFG[l.status]?.bdg||'bdg-info'}`} style={{fontSize:9.5}}>{STATUS_CFG[l.status]?.label||l.status}</span>
                <button className="btn btn-ghost btn-sm" style={{padding:'3px 7px'}} onClick={()=>{setAssignModal(l);setAssignTo('');}}>
                  <UserCheck size={11}/>
                </button>
              </div>
            ))}
            {leads.length===0 && <div style={{textAlign:'center',padding:28,color:'var(--gray-400)',fontSize:12.5}}>No leads yet</div>}
          </div>
        </div>
      )}

      {/* LEADS TABLE */}
      {tab==='leads' && (
        <>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-body" style={{display:'flex',gap:10,flexWrap:'wrap',padding:12,alignItems:'center'}}>
              <div className="search-wrap" style={{flex:1,minWidth:180}}><Search size={13} className="search-ico"/><input className="search-input" placeholder="Search leads…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
              <select className="form-control" style={{width:'auto'}} value={statusF} onChange={e=>setStatusF(e.target.value)}>
                <option value="">All Status</option>
                {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
              <button className="btn btn-primary" onClick={openAdd}><Plus size={12}/> Add</button>
            </div>
          </div>
          <div className="card">
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Company</th><th>Contact</th><th>Standard</th><th>Status</th><th>Priority</th><th>Assigned</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(l=>(
                    <tr key={l._id}>
                      <td style={{fontWeight:600}}>{l.companyName}</td>
                      <td><div style={{fontSize:12.5}}>{l.contactPerson}</div><div style={{fontSize:10.5,color:'var(--gray-400)'}}>{l.email}</div></td>
                      <td><span className="badge bdg-info" style={{fontSize:9.5}}>{l.isoStandard}</span></td>
                      <td><span className={`badge ${STATUS_CFG[l.status]?.bdg||'bdg-info'}`} style={{fontSize:9.5}}>{STATUS_CFG[l.status]?.label||l.status}</span></td>
                      <td><span style={{fontSize:10.5,fontWeight:700,padding:'2px 7px',borderRadius:99,background:l.priority==='high'?'var(--red-50)':l.priority==='low'?'var(--green-50)':'var(--amber-50)',color:l.priority==='high'?'var(--red)':l.priority==='low'?'var(--green)':'var(--amber)'}}>{l.priority||'medium'}</span></td>
                      <td style={{fontSize:12.5}}>{l.assignedTo?.name||l.assignedAuditor?.name||<span style={{color:'var(--gray-400)'}}>Unassigned</span>}</td>
                      <td style={{fontSize:11,color:'var(--gray-400)'}}>{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="tbl-actions">
                          {l.mobile&&<a href={`tel:${l.mobile}`} className="btn btn-ghost btn-sm"><Phone size={11}/></a>}
                          <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(l)}><Edit size={11}/></button>
                          <button className="btn btn-primary btn-sm" onClick={()=>{setAssignModal(l);setAssignTo('');}}><UserCheck size={11}/></button>
                          <button className="btn btn-danger btn-sm" onClick={()=>deleteLead(l._id)}><Trash2 size={11}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length===0 && <tr><td colSpan={8} style={{textAlign:'center',padding:36,color:'var(--gray-400)'}}>No leads found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TEAM */}
      {tab==='team' && (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:14,marginBottom:18}}>
            {teamStats.map(m=>(
              <div key={m._id} className="card" style={{marginBottom:0}}>
                <div className="card-body">
                  <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:13}}>
                    <div className="avatar" style={{width:40,height:40,fontSize:14,background:'linear-gradient(135deg,#16a34a,#15803d)'}}>{m.name?.[0]}</div>
                    <div><div style={{fontWeight:700,fontSize:14}}>{m.name}</div><span className={`badge bdg-${m.role}`} style={{fontSize:10}}>{m.role}</span></div>
                  </div>
                  <div style={{fontSize:12,color:'var(--gray-600)',marginBottom:13}}>
                    {m.email&&<div style={{marginBottom:3}}>✉ {m.email}</div>}
                    {m.phone&&<div>📞 {m.phone}</div>}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    <div style={{textAlign:'center',padding:'9px 7px',background:'var(--primary-50)',borderRadius:8,border:'1px solid var(--primary-100)'}}>
                      <div style={{fontWeight:800,fontSize:17,color:'var(--primary)'}}>{m.leadsCount}</div>
                      <div style={{fontSize:10,color:'var(--gray-500)',marginTop:1}}>Assigned</div>
                    </div>
                    <div style={{textAlign:'center',padding:'9px 7px',background:'var(--green-50)',borderRadius:8,border:'1px solid var(--green-200)'}}>
                      <div style={{fontWeight:800,fontSize:17,color:'var(--green)'}}>{m.converted}</div>
                      <div style={{fontSize:10,color:'var(--gray-500)',marginTop:1}}>Converted</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {teamStats.length===0 && <p style={{color:'var(--gray-400)',fontSize:13}}>No sales team members. Add via User Management.</p>}
          </div>
          <div className="card">
            <div className="card-hdr"><div className="card-title"><TrendingUp size={14} style={{color:'var(--primary)'}}/>Team Performance</div></div>
            <div style={{padding:'16px 18px'}}>
              {teamStats.map(m=><PBar key={m._id} label={m.name} value={m.leadsCount} max={Math.max(10,leads.length)} color="var(--primary)"/>)}
              {teamStats.length===0 && <p style={{color:'var(--gray-400)',fontSize:13}}>No team data</p>}
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-bg" onClick={()=>setModal(false)}>
          <div className="modal-box" style={{maxWidth:580}} onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">{editLead?<><Edit size={14} style={{color:'var(--primary)',marginRight:7,verticalAlign:'middle'}}/>Edit Lead</>:<><Plus size={14} style={{color:'var(--primary)',marginRight:7,verticalAlign:'middle'}}/>Add Lead</>}</div>
              <button className="modal-close" onClick={()=>setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Company Name *</label><input className="form-control" value={form.companyName} onChange={e=>setForm(p=>({...p,companyName:e.target.value}))}/></div>
                <div className="form-group"><label className="form-label">Contact Person</label><input className="form-control" value={form.contactPerson} onChange={e=>setForm(p=>({...p,contactPerson:e.target.value}))}/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
                <div className="form-group"><label className="form-label">Mobile</label><input className="form-control" value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value}))}/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">ISO Standard</label>
                  <select className="form-control" value={form.isoStandard} onChange={e=>setForm(p=>({...p,isoStandard:e.target.value}))}>{ISO.map(s=><option key={s}>{s}</option>)}</select>
                </div>
                <div className="form-group"><label className="form-label">Source</label>
                  <select className="form-control" value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                    {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Priority</label>
                  <select className="form-control" value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
                    {['high','medium','low'].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Additional notes…"/></div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveLead} disabled={saving}>{saving?'Saving…':editLead?<><Edit size={13}/> Save</>:<><Plus size={13}/> Add Lead</>}</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="modal-bg" onClick={()=>setAssignModal(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title"><UserCheck size={15} style={{color:'var(--primary)',marginRight:7,verticalAlign:'middle'}}/>Assign Lead</div>
              <button className="modal-close" onClick={()=>setAssignModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{background:'var(--primary-50)',borderRadius:9,padding:'9px 13px',marginBottom:14,fontSize:12.5}}>
                <strong>{assignModal.companyName}</strong>
                <div style={{fontSize:11.5,color:'var(--gray-500)',marginTop:2}}>{assignModal.contactPerson} · {assignModal.isoStandard}</div>
              </div>
              <div className="form-group"><label className="form-label">Assign to Sales Team Member *</label>
                <select className="form-control" value={assignTo} onChange={e=>setAssignTo(e.target.value)}>
                  <option value="">— Select Member —</option>
                  {team.map(m=><option key={m._id} value={m._id}>{m.name} ({m.role}) — {leads.filter(l=>l.assignedTo===m._id||l.assignedTo?._id===m._id).length} leads</option>)}
                </select>
              </div>
              {assignTo && <div style={{background:'var(--green-50)',border:'1px solid var(--green-200)',borderRadius:8,padding:'9px 13px',fontSize:12.5,color:'var(--green)'}}>✓ Assigning to: <strong>{team.find(m=>m._id===assignTo)?.name}</strong></div>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setAssignModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={assignLead} disabled={saving}>{saving?'Assigning…':<><UserCheck size={13}/> Assign</>}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
