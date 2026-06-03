import React,{useState,useEffect}from 'react';
import{useParams,useNavigate}from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import{ArrowLeft,Download,Upload,FileText,CheckCircle,Star,User,Building,Globe,Send}from 'lucide-react';
const FL=['draft','submitted','under_review','audit_stage1','audit_stage2','approved','certified'];
export default function AdminApplicationDetail(){
  const{id}=useParams();const navigate=useNavigate();
  const[app,setApp]=useState(null);const[loading,setLoading]=useState(true);
  const[auditorsList,setAuditorsList]=useState([]);
  const[assigning,setAssigning]=useState(false);
  const[selectedAuditor,setSelectedAuditor]=useState('');
  const[selectedReviewer,setSelectedReviewer]=useState('');
  const[tab,setTab]=useState('overview');const[ns,setNs]=useState('');const[note,setNote]=useState('');const[uploading,setUploading]=useState(false);
  const load=()=>{setLoading(true);axios.get(`/api/applications/${id}`).then(r=>{setApp(r.data);setNs(r.data.status);}).finally(()=>setLoading(false));};
  useEffect(()=>{
    axios.get('/api/auditors').then(r=>setAuditorsList(r.data||[])).catch(()=>setAuditorsList([]));
  },[]);
  useEffect(load,[id]);
  const updateStatus=async()=>{try{await axios.put(`/api/applications/${id}/status`,{status:ns,notes:note});toast.success('Status updated & client notified');setNote('');load();}catch{toast.error('Failed');}};
  const upload=async(e,dt)=>{const f=e.target.files[0];if(!f)return;const fd=new FormData();fd.append('document',f);fd.append('docType',dt);setUploading(true);try{await axios.post(`/api/applications/${id}/upload`,fd,{headers:{'Content-Type':'multipart/form-data'}});toast.success('Uploaded');load();}catch{toast.error('Upload failed');}finally{setUploading(false);};};
  if(loading)return<Layout title="Application"><div className="loading-box"><div className="spinner"/></div></Layout>;
  if(!app)return<Layout title="Not Found"><p style={{padding:20}}>Not found</p></Layout>;
  const si=FL.indexOf(app.status);
  return(
    <Layout title={app.applicationId}>
      <div className="page-hdr">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/admin/applications')}><ArrowLeft size={14}/>Back</button>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span className="mono">{app.applicationId}</span>
              <span className={`badge bdg-${app.status}`}>{app.status?.replace(/_/g,' ')}</span>
            </div>
            <p className="page-subtitle">{app.organizationName} · {app.isoStandard}</p>
          </div>
        </div>
      </div>
      <div className="card" style={{marginBottom:20}}><div className="card-body">
        <div className="stepper">
          {FL.map((s,i)=>(
            <div key={s} className={`step ${i<si?'done':''} ${i===si?'active':''}`}>
              <div className="step-node"><div className="step-circle">{i<si?<CheckCircle size={13}/>:i+1}</div><div className="step-lbl">{s.replace(/_/g,' ')}</div></div>
              {i<FL.length-1&&<div className="step-connector"/>}
            </div>
          ))}
        </div>
      </div></div>
      <div className="tabs-bar">{['overview','documents','status','feedback'].map(t=><button key={t} className={`tab-item ${tab===t?'on':''}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}</div>
      {tab==='overview'&&<div className="dash-grid">
        <div className="card"><div className="card-hdr"><div className="card-title"><Building size={14} style={{color:'var(--primary)'}}/>Organization</div></div><div className="card-body">
          {[['Name',app.organizationName],['Abbr',app.organizationAbbr],['Address',[app.address1,app.city,app.state,app.country].filter(Boolean).join(', ')],['Website',app.website],['Submitted',app.submittedAt?new Date(app.submittedAt).toLocaleDateString():'—']].map(([l,v])=>v?<div key={l} className="info-row"><span className="ir-label">{l}</span><span className="ir-value">{v}</span></div>:null)}
        </div></div>
        <div className="card"><div className="card-hdr"><div className="card-title"><Globe size={14} style={{color:'var(--primary)'}}/>ISO Details</div></div><div className="card-body">
          {[['Standard',app.isoStandard],['Scope',app.scope],['Body',app.accreditationBody],['Employees',app.employeeCount?.total]].map(([l,v])=>v?<div key={l} className="info-row"><span className="ir-label">{l}</span><span className="ir-value">{v}</span></div>:null)}
        </div></div>
        <div className="card"><div className="card-hdr"><div className="card-title"><User size={14} style={{color:'var(--primary)'}}/>Team</div></div><div className="card-body">
          {[{r:'Client',u:app.client}].map(({r,u})=>(
            <div key={r} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--primary-100)'}}>
              <span className="ir-label">{r}</span>
              {u?<div style={{display:'flex',alignItems:'center',gap:8}}><div className="avatar" style={{width:26,height:26,fontSize:10}}>{u.name?.[0]}</div><span style={{fontSize:13,fontWeight:600}}>{u.name}</span></div>:<span style={{fontSize:12,color:'var(--gray-400)'}}>Not available</span>}
            </div>
          ))}

          <div style={{marginTop:12,borderTop:'1px dashed var(--primary-50)',paddingTop:12}}>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
              <div style={{flex:1}}>
                <label className="form-label">Assign Auditor</label>
                <select className="form-control" value={selectedAuditor} onChange={e=>setSelectedAuditor(e.target.value)}>
                  <option value="">— Select Auditor —</option>
                  {auditorsList.filter(a=>a.role==='auditor').map(a=> <option key={a._id} value={a._id}>{a.name} — {a.email}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <label className="form-label">Assign Reviewer</label>
                <select className="form-control" value={selectedReviewer} onChange={e=>setSelectedReviewer(e.target.value)}>
                  <option value="">— Select Reviewer —</option>
                  {auditorsList.filter(a=>a.role==='reviewer').map(a=> <option key={a._id} value={a._id}>{a.name} — {a.email}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button className="btn btn-ghost" onClick={()=>{setSelectedAuditor('');setSelectedReviewer('');}}>Reset</button>
              <button className="btn btn-primary" disabled={assigning} onClick={async()=>{
                if(!selectedAuditor && !selectedReviewer){toast.error('Select auditor or reviewer to assign');return}
                setAssigning(true);
                try{
                  await axios.post(`/api/applications/${id}/assign`,{ auditorId: selectedAuditor||undefined, reviewerId: selectedReviewer||undefined });
                  toast.success('Assigned successfully');
                  setSelectedAuditor('');setSelectedReviewer('');
                  load();
                }catch(e){toast.error('Assignment failed');}
                finally{setAssigning(false);}
              }}>Assign</button>
            </div>
          </div>
        </div></div>
      </div>}
      {tab==='documents'&&<div className="card"><div className="card-hdr"><div className="card-title"><FileText size={14} style={{color:'var(--primary)'}}/>Documents</div></div><div className="card-body">
        {[{label:'Application Form',key:'applicationForm'},{label:'Agreement',key:'agreement'},{label:'Signed Form',key:'signedForm'},{label:'Audit Report',key:'auditReport'},{label:'Review Report',key:'reviewReport'},{label:'Certificate',key:'certificate'}].map(doc=>(
          <div key={doc.key} className="doc-row">
            <div className="doc-row-info"><FileText size={18} style={{color:app[doc.key]?'var(--primary)':'var(--gray-300)',flexShrink:0}}/><div><div className="doc-row-name">{doc.label}</div><div className="doc-row-meta">{app[doc.key]?'✓ Uploaded':'Not uploaded yet'}</div></div></div>
            <div className="doc-row-actions">
              {app[doc.key]&&<a href={app[doc.key]} download className="btn btn-success btn-sm"><Download size={12}/>Download</a>}
              <label className="btn btn-outline btn-sm" style={{cursor:'pointer'}}><Upload size={12}/>{app[doc.key]?'Replace':'Upload'}<input type="file" style={{display:'none'}} onChange={e=>upload(e,doc.key)} disabled={uploading}/></label>
            </div>
          </div>
        ))}
        {app.uploadedDocuments?.length>0&&<div style={{marginTop:16}}>
          <div className="section-label">Additional Files</div>
          {app.uploadedDocuments.map((d,i)=>(
            <div key={i} className="doc-row"><div className="doc-row-info"><FileText size={16} style={{color:'var(--primary)',flexShrink:0}}/><div><div className="doc-row-name">{d.name}</div><div className="doc-row-meta">By {d.uploadedBy?.name||'—'}</div></div></div><a href={d.path} download className="btn btn-ghost btn-sm"><Download size={12}/>Download</a></div>
          ))}
        </div>}
      </div></div>}
      {tab==='status'&&<div className="card"><div className="card-hdr"><div className="card-title"><CheckCircle size={14} style={{color:'var(--primary)'}}/>Update Status</div></div><div className="card-body">
        <div className="form-group"><label className="form-label">New Status</label><select className="form-control" value={ns} onChange={e=>setNs(e.target.value)}>{FL.concat(['rejected']).map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Notes for Client</label><textarea className="form-control" rows={4} value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a message for the client about this status change…"/></div>
        <button className="btn btn-primary" onClick={updateStatus}><Send size={14}/>Update & Notify Client</button>
        {app.adminNotes&&<div className="alert alert-info" style={{marginTop:16}}><strong>Previous note:</strong> {app.adminNotes}</div>}
      </div></div>}
      {tab==='feedback'&&<div className="card"><div className="card-hdr"><div className="card-title"><Star size={14} style={{color:'var(--amber)'}}/>All Feedback ({app.feedbacks?.length||0})</div></div><div className="card-body">
        {!app.feedbacks?.length?<div className="empty-box" style={{padding:40}}><Star size={36}/><p>No feedback yet</p></div>:app.feedbacks.map((fb,i)=>(
          <div key={i} style={{border:'1px solid var(--primary-100)',borderRadius:12,padding:16,marginBottom:12,background:'var(--gray-50)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}><div className="avatar">{fb.from?.name?.[0]||'?'}</div><div><div style={{fontWeight:700,fontSize:14}}>{fb.from?.name||'User'}</div><span className={`badge bdg-${fb.role}`}>{fb.role}</span></div></div>
              <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(n=><Star key={n} size={14} fill={n<=fb.rating?'#f59e0b':'none'} stroke={n<=fb.rating?'#f59e0b':'#d1d5db'}/>)}</div>
            </div>
            <p style={{fontSize:13.5,color:'var(--gray-700)',lineHeight:1.6,background:'white',padding:'10px 14px',borderRadius:8,border:'1px solid var(--primary-100)'}}>{fb.message}</p>
            <div style={{fontSize:11,color:'var(--gray-400)',marginTop:8}}>{fb.createdAt?new Date(fb.createdAt).toLocaleString():''}</div>
          </div>
        ))}
      </div></div>}
    </Layout>
  );
}
