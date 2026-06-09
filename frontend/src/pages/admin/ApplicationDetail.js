import React,{useState,useEffect}from 'react';
import{useParams,useNavigate}from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import{ArrowLeft,Download,Upload,FileText,CheckCircle,Star,User,Building,Globe,Send,Edit2,Save,X}from 'lucide-react';
const FL=['draft','submitted','under_review','audit_stage1','audit_stage2','approved','certified'];
const ISO_LIST=['ISO 9001:2015','ISO 14001:2015','ISO 45001:2018','ISO 22000:2018','ISO 27001:2022','ISO/IEC 27701:2025','ISO/IEC 42001:2023','ISO 22301:2019','ISO 37001:2016','ISO 21001:2018'];
const APP_TYPES=['Initial','Surveillance','Re-certification','Un-Announced','Follow-up'];
const ACCRED=['USF','UASL'];
const COUNTRY_CODES=[
  {code:'+1',country:'US/Canada'},{code:'+7',country:'Russia'},{code:'+20',country:'Egypt'},
  {code:'+27',country:'South Africa'},{code:'+31',country:'Netherlands'},{code:'+33',country:'France'},
  {code:'+34',country:'Spain'},{code:'+39',country:'Italy'},{code:'+44',country:'UK'},
  {code:'+45',country:'Denmark'},{code:'+46',country:'Sweden'},{code:'+49',country:'Germany'},
  {code:'+52',country:'Mexico'},{code:'+55',country:'Brazil'},{code:'+60',country:'Malaysia'},
  {code:'+61',country:'Australia'},{code:'+62',country:'Indonesia'},{code:'+65',country:'Singapore'},
  {code:'+66',country:'Thailand'},{code:'+81',country:'Japan'},{code:'+82',country:'South Korea'},
  {code:'+86',country:'China'},{code:'+90',country:'Turkey'},{code:'+91',country:'India'},
  {code:'+92',country:'Pakistan'},{code:'+94',country:'Sri Lanka'},{code:'+234',country:'Nigeria'},
  {code:'+254',country:'Kenya'},{code:'+880',country:'Bangladesh'},{code:'+966',country:'Saudi Arabia'},
  {code:'+971',country:'UAE'},{code:'+974',country:'Qatar'},{code:'+977',country:'Nepal'},
];
export default function AdminApplicationDetail(){
  const{id}=useParams();const navigate=useNavigate();
  const[app,setApp]=useState(null);const[loading,setLoading]=useState(true);
  const[auditorsList,setAuditorsList]=useState([]);
  const[assigning,setAssigning]=useState(false);
  const[selectedAuditor,setSelectedAuditor]=useState('');
  const[selectedReviewer,setSelectedReviewer]=useState('');
  const[tab,setTab]=useState('overview');const[ns,setNs]=useState('');const[note,setNote]=useState('');const[uploading,setUploading]=useState(false);
  const[editForm,setEditForm]=useState({});const[saving,setSaving]=useState(false);
  const load=()=>{setLoading(true);axios.get(`/api/applications/${id}`).then(r=>{
    const d=r.data;setApp(d);setNs(d.status);
    setEditForm({
      organizationName:d.organizationName||'',
      address:d.address||'',
      additionalSites:d.additionalSites||'',
      countryCode:d.countryCode||'+91',
      mobileNumber:d.mobileNumber||'',
      contactNumbers:d.contactNumbers||'',
      emailId:d.emailId||'',
      contactPerson:d.contactPerson||'',
      designation:d.designation||'',
      modeOfWorking:d.modeOfWorking||'Onsite',
      scopeOfCertification:d.scopeOfCertification||d.scope||'',
      mainProcesses:d.mainProcesses||'',
      outsourcedProcesses:d.outsourcedProcesses||'',
      standards:d.standards||[d.isoStandard].filter(Boolean),
      applicationType:d.applicationType||'Initial',
      accreditationBody:d.accreditationBody||'USF',
      totalEmployees:d.totalEmployees||d.employeeCount?.total||0,
      adminNotes:d.adminNotes||'',
    });
  }).finally(()=>setLoading(false));};
  useEffect(()=>{
    axios.get('/api/auditors').then(r=>setAuditorsList(r.data||[])).catch(()=>setAuditorsList([]));
  },[]);
  useEffect(load,[id]);
  const updateStatus=async()=>{try{await axios.put(`/api/applications/${id}/status`,{status:ns,notes:note});toast.success('Status updated & client notified');setNote('');load();}catch{toast.error('Failed');}};
  const ef=(k,v)=>setEditForm(p=>({...p,[k]:v}));
  const toggleStd=(s)=>setEditForm(p=>({...p,standards:p.standards.includes(s)?p.standards.filter(x=>x!==s):[...p.standards,s]}));
  const saveEdit=async()=>{
    if(!editForm.organizationName.trim()){toast.error('Organization name required');return;}
    if(!editForm.address.trim()){toast.error('Address required');return;}
    if(!editForm.mobileNumber.trim()){toast.error('Mobile number required');return;}
    if(!editForm.contactPerson.trim()){toast.error('Contact person required');return;}
    setSaving(true);
    try{
      const payload={...editForm,scope:editForm.scopeOfCertification,isoStandard:editForm.standards[0]||app.isoStandard};
      await axios.put(`/api/applications/${id}`,payload);
      toast.success('Application updated');load();setTab('overview');
    }catch{toast.error('Save failed');}
    finally{setSaving(false);}
  };
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
      <div className="tabs-bar">{['overview','edit','documents','status','feedback'].map(t=><button key={t} className={`tab-item ${tab===t?'on':''}`} onClick={()=>setTab(t)} style={{display:'flex',alignItems:'center',gap:5}}>{t==='edit'&&<Edit2 size={11}/>}{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}</div>
      {tab==='edit'&&<div className="card"><div className="card-hdr" style={{justifyContent:'space-between'}}><div className="card-title"><Edit2 size={14} style={{color:'var(--primary)'}}/>Edit Application</div><div style={{display:'flex',gap:8}}><button className="btn btn-ghost btn-sm" onClick={()=>setTab('overview')}><X size={13}/>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}><Save size={13}/>{saving?'Saving…':'Save Changes'}</button></div></div><div className="card-body" style={{display:'flex',flexDirection:'column',gap:16}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'0 16px'}}>
          <div className="form-group" style={{gridColumn:'1/-1'}}><label className="form-label">Organization Name <span style={{color:'var(--red)'}}>*</span></label><input className="form-control" value={editForm.organizationName||''} onChange={e=>ef('organizationName',e.target.value)}/></div>
          <div className="form-group" style={{gridColumn:'1/-1'}}><label className="form-label">Address <span style={{color:'var(--red)'}}>*</span></label><textarea className="form-control" rows={2} value={editForm.address||''} onChange={e=>ef('address',e.target.value)}/></div>
          <div className="form-group" style={{gridColumn:'1/-1'}}><label className="form-label">Additional Sites</label><textarea className="form-control" rows={2} value={editForm.additionalSites||''} onChange={e=>ef('additionalSites',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Mobile Number <span style={{color:'var(--red)'}}>*</span></label><div className="mobile-input-row"><select className="form-control" value={editForm.countryCode||'+91'} onChange={e=>ef('countryCode',e.target.value)}>{COUNTRY_CODES.map(c=><option key={c.code+c.country} value={c.code}>{c.code} {c.country}</option>)}</select><input className="form-control" value={editForm.mobileNumber||''} onChange={e=>ef('mobileNumber',e.target.value.replace(/\D/g,'').slice(0,15))}/></div></div>
          <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={editForm.emailId||''} onChange={e=>ef('emailId',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Contact Person <span style={{color:'var(--red)'}}>*</span></label><input className="form-control" value={editForm.contactPerson||''} onChange={e=>ef('contactPerson',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Designation</label><input className="form-control" value={editForm.designation||''} onChange={e=>ef('designation',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Mode of Working</label><select className="form-control" value={editForm.modeOfWorking||'Onsite'} onChange={e=>ef('modeOfWorking',e.target.value)}><option>Online</option><option>Onsite</option><option>Hybrid</option></select></div>
          <div className="form-group"><label className="form-label">Application Type</label><select className="form-control" value={editForm.applicationType||'Initial'} onChange={e=>ef('applicationType',e.target.value)}>{APP_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Accreditation Body</label><select className="form-control" value={editForm.accreditationBody||'USF'} onChange={e=>ef('accreditationBody',e.target.value)}>{ACCRED.map(a=><option key={a}>{a}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Total Employees</label><input type="number" className="form-control" min={0} value={editForm.totalEmployees||0} onChange={e=>ef('totalEmployees',Number(e.target.value))}/></div>
          <div className="form-group" style={{gridColumn:'1/-1'}}><label className="form-label">Scope of Certification</label><textarea className="form-control" rows={3} value={editForm.scopeOfCertification||''} onChange={e=>ef('scopeOfCertification',e.target.value)}/></div>
          <div className="form-group" style={{gridColumn:'1/-1'}}><label className="form-label">Main Processes</label><input className="form-control" value={editForm.mainProcesses||''} onChange={e=>ef('mainProcesses',e.target.value)}/></div>
          <div className="form-group" style={{gridColumn:'1/-1'}}><label className="form-label">Outsourced Processes</label><input className="form-control" value={editForm.outsourcedProcesses||''} onChange={e=>ef('outsourcedProcesses',e.target.value)}/></div>
        </div>
        <div><label className="form-label">Standards</label><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:8,marginTop:6}}>{ISO_LIST.map(s=><label key={s} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',border:`1.5px solid ${(editForm.standards||[]).includes(s)?'var(--primary)':'var(--gray-200)'}`,borderRadius:8,cursor:'pointer',background:(editForm.standards||[]).includes(s)?'var(--primary-50)':'white',fontSize:12.5,fontWeight:(editForm.standards||[]).includes(s)?700:500}}><input type="checkbox" checked={(editForm.standards||[]).includes(s)} onChange={()=>toggleStd(s)} style={{accentColor:'var(--primary)'}}/>{s}</label>)}</div></div>
        <div className="form-group"><label className="form-label">Internal Notes (Admin only)</label><textarea className="form-control" rows={3} value={editForm.adminNotes||''} onChange={e=>ef('adminNotes',e.target.value)}/></div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,paddingTop:8,borderTop:'1px solid var(--primary-100)'}}><button className="btn btn-ghost" onClick={()=>setTab('overview')}><X size={13}/>Cancel</button><button className="btn btn-primary" onClick={saveEdit} disabled={saving}><Save size={13}/>{saving?'Saving…':'Save Changes'}</button></div>
      </div></div>}
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
