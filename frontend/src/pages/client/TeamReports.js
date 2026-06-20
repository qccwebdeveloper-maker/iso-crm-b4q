import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import { FileText, Phone, Mail, User, ExternalLink, ClipboardCheck, Eye } from 'lucide-react';

export default function ClientTeamReports() {
  const navigate = useNavigate();
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState(null);

  useEffect(() => {
    axios.get('/api/applications')
      .then(r => {
        const list = r.data || [];
        setApps(list);
        setActive(list.find(a => a.assignedAuditor || a.assignedReviewer)?._id || list[0]?._id || null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="My Reports"><div className="loading-box"><div className="spinner"/></div></Layout>;

  const selected = apps.find(a => a._id === active);

  const ROLES = selected ? [
    { role: 'Auditor',  person: selected.assignedAuditor,  report: selected.auditReport,  color: 'var(--primary)', light: 'var(--primary-50)' },
    { role: 'Reviewer', person: selected.assignedReviewer, report: selected.reviewReport, color: '#7c3aed',        light: '#f5f3ff'          },
  ] : [];

  return (
    <Layout title="My Reports">
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Team &amp; Reports</h1>
          <p className="page-subtitle">View your assigned auditor &amp; reviewer and download their reports</p>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="card">
          <div className="empty-box">
            <FileText size={36}/>
            <h3>No applications yet</h3>
            <p>Reports will appear here once you have an active application</p>
            <button className="btn btn-primary" style={{marginTop:14}} onClick={()=>navigate('/client/applications/new')}>Start Application</button>
          </div>
        </div>
      ) : (
        <>
          {/* Application selector tabs */}
          {apps.length > 1 && (
            <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
              {apps.map(a => (
                <button
                  key={a._id}
                  onClick={() => setActive(a._id)}
                  style={{
                    padding:'7px 14px', borderRadius:8, border:'1.5px solid',
                    borderColor: active===a._id ? 'var(--primary)' : 'var(--gray-200)',
                    background:  active===a._id ? 'var(--primary-50)' : 'white',
                    color:       active===a._id ? 'var(--primary-dark)' : 'var(--gray-500)',
                    fontWeight:  active===a._id ? 700 : 500,
                    fontSize:12, cursor:'pointer',
                  }}
                >
                  {(a.client?.clientId || '—')} — {a.organizationName}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <>
              {/* Application info bar */}
              <div style={{display:'flex',alignItems:'center',gap:14,padding:'12px 16px',background:'var(--primary-50)',borderRadius:10,border:'1px solid var(--primary-100)',marginBottom:20}}>
                <ClipboardCheck size={18} style={{color:'var(--primary)',flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13.5,color:'var(--text-1)'}}>{selected.organizationName}</div>
                  <div style={{fontSize:11,color:'var(--gray-400)',marginTop:2}}>
                    {(selected.client?.clientId || '—')} &nbsp;·&nbsp; {selected.isoStandard} &nbsp;·&nbsp;
                    <span className={`badge bdg-${selected.status}`} style={{fontSize:10,marginLeft:4}}>{selected.status?.replace(/_/g,' ')}</span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={()=>navigate(`/client/applications/${selected._id}`)}>
                  <Eye size={12}/> Open Application
                </button>
              </div>

              {/* Two role cards */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
                {ROLES.map(({role,person,report,color,light})=>(
                  <div key={role} className="card" style={{padding:0,overflow:'hidden'}}>
                    {/* Card header stripe */}
                    <div style={{background:color,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:38,height:38,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:15,fontWeight:800,color:'white'}}>
                        {person ? person.name?.slice(0,1).toUpperCase() : '?'}
                      </div>
                      <div>
                        <div style={{fontSize:9.5,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'rgba(255,255,255,0.75)',marginBottom:2}}>{role}</div>
                        <div style={{fontWeight:700,fontSize:14,color:'white'}}>{person ? person.name : 'Not Yet Assigned'}</div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}}>
                      {person ? (
                        <>
                          {/* Email */}
                          <div style={{display:'flex',alignItems:'center',gap:9,padding:'8px 12px',background:light,borderRadius:7,border:`1px solid ${color}20`}}>
                            <Mail size={13} style={{color,flexShrink:0}}/>
                            <div>
                              <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--gray-400)'}}>Email</div>
                              <div style={{fontSize:12,fontWeight:600,color:'var(--text-1)',wordBreak:'break-all'}}>{person.email}</div>
                            </div>
                          </div>

                          {/* Phone */}
                          <div style={{display:'flex',alignItems:'center',gap:9,padding:'8px 12px',background:light,borderRadius:7,border:`1px solid ${color}20`}}>
                            <Phone size={13} style={{color,flexShrink:0}}/>
                            <div style={{flex:1}}>
                              <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--gray-400)'}}>Phone</div>
                              {person.phone
                                ? <a href={`tel:${person.phone}`} style={{fontSize:12,fontWeight:600,color,textDecoration:'none'}}>{person.phone}</a>
                                : <span style={{fontSize:12,color:'var(--gray-300)',fontStyle:'italic'}}>Not provided</span>
                              }
                            </div>
                          </div>

                          {/* Report */}
                          <div style={{marginTop:4}}>
                            <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--gray-400)',marginBottom:8}}>{role} Report</div>
                            {report ? (
                              <a
                                href={report}
                                target="_blank"
                                rel="noreferrer"
                                style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'10px 14px',background:color,color:'white',borderRadius:8,textDecoration:'none',fontWeight:700,fontSize:13}}
                              >
                                <ExternalLink size={14}/>View {role} Report
                              </a>
                            ) : (
                              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'10px 14px',background:'var(--gray-50)',color:'var(--gray-300)',borderRadius:8,border:'1px dashed var(--gray-200)',fontSize:13}}>
                                <FileText size={14}/>Report Not Available Yet
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,padding:'24px 16px',textAlign:'center'}}>
                          <User size={28} style={{color:'var(--gray-200)'}}/>
                          <div style={{fontSize:13,fontWeight:600,color:'var(--gray-300)'}}>No {role} Assigned</div>
                          <div style={{fontSize:11,color:'var(--gray-200)'}}>Admin will assign a {role.toLowerCase()} soon</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reports summary row */}
              {(selected.auditReport || selected.reviewReport) && (
                <div className="card">
                  <div className="card-hdr">
                    <div className="card-title"><FileText size={14} style={{color:'var(--primary)'}}/>Reports Summary</div>
                  </div>
                  <div style={{padding:'4px 0'}}>
                    {[
                      { label:'Audit Report',   url:selected.auditReport,  color:'var(--primary)' },
                      { label:'Review Report',  url:selected.reviewReport, color:'#7c3aed'        },
                    ].map(({label,url,color})=>(
                      <div key={label} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 16px',borderBottom:'1px solid var(--primary-50)'}}>
                        <div style={{width:36,height:36,borderRadius:8,background:`${color}12`,border:`1px solid ${color}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <FileText size={15} style={{color}}/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:13,color:'var(--text-1)'}}>{label}</div>
                          <div style={{fontSize:11,color:url?'var(--green)':'var(--gray-300)',marginTop:2}}>
                            {url ? '✓ Available' : 'Not uploaded yet'}
                          </div>
                        </div>
                        {url && (
                          <a href={url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',background:color,color:'white',borderRadius:7,textDecoration:'none',fontWeight:700,fontSize:12}}>
                            <ExternalLink size={12}/>Open
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Layout>
  );
}
