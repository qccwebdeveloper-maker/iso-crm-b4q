import React,{useState,useEffect,useRef}from 'react';
import{useParams,useNavigate}from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import{ArrowLeft,Upload,Download,Eye,Send,Star,FileText,CheckCircle,PenLine}from 'lucide-react';
const FL=['draft','submitted','under_review','audit_stage1','audit_stage2','approved','certified'];
export default function ClientApplicationDetail(){
  const{id}=useParams();const navigate=useNavigate();
  const[app,setApp]=useState(null);const[loading,setLoading]=useState(true);
  const[tab,setTab]=useState('overview');const[uploading,setUploading]=useState(false);
  const[fb,setFb]=useState({message:'',rating:5});const[submitting,setSubmitting]=useState(false);
  const[signModal,setSignModal]=useState(false);const cvs=useRef(null);const[drawing,setDrawing]=useState(false);
  const load=()=>{setLoading(true);axios.get(`/api/applications/${id}`).then(r=>setApp(r.data)).finally(()=>setLoading(false));};
  useEffect(load,[id]);
  const submit=async()=>{if(!window.confirm('Submit for review?'))return;try{await axios.post(`/api/applications/${id}/submit`);toast.success('Submitted!');load();}catch{toast.error('Failed');}};
  const upload=async(e,dt)=>{const f=e.target.files[0];if(!f)return;const fd=new FormData();fd.append('document',f);fd.append('docType',dt);setUploading(true);try{await axios.post(`/api/applications/${id}/upload`,fd,{headers:{'Content-Type':'multipart/form-data'}});toast.success('Uploaded!');load();}catch{toast.error('Failed');}finally{setUploading(false);}};
  const submitFb=async()=>{if(!fb.message.trim())return toast.error('Enter feedback');setSubmitting(true);try{await axios.post(`/api/applications/${id}/feedback`,fb);toast.success('Thank you!');setFb({message:'',rating:5});load();}catch{toast.error('Failed');}finally{setSubmitting(false);}};
  const sd=e=>{setDrawing(true);const c=cvs.current,r=c.getBoundingClientRect(),ctx=c.getContext('2d');ctx.beginPath();ctx.moveTo(e.clientX-r.left,e.clientY-r.top);};
  const dr=e=>{if(!drawing)return;const c=cvs.current,r=c.getBoundingClientRect(),ctx=c.getContext('2d');ctx.lineWidth=2;ctx.lineCap='round';ctx.strokeStyle='#16a34a';ctx.lineTo(e.clientX-r.left,e.clientY-r.top);ctx.stroke();};
  const saveSign=async()=>{const c=cvs.current;const blob=await new Promise(r=>c.toBlob(r));const fd=new FormData();fd.append('document',blob,`sig-${Date.now()}.png`);fd.append('docType','signedForm');try{await axios.post(`/api/applications/${id}/upload`,fd,{headers:{'Content-Type':'multipart/form-data'}});toast.success('Signature saved!');setSignModal(false);load();}catch{toast.error('Failed');}};
  if(loading)return<Layout title="Application"><div className="loading-box"><div className="spinner"/></div></Layout>;
  if(!app)return<Layout title="Not Found"><p style={{padding:20}}>Not found</p></Layout>;
  const si=FL.indexOf(app.status);
  return(
    <Layout title={app.applicationId}>
      <div className="page-hdr">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/client/applications')}><ArrowLeft size={14}/>Back</button>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10}}><span className="mono">{app.applicationId}</span><span className={`badge bdg-${app.status}`}>{app.status?.replace(/_/g,' ')}</span></div>
            <p className="page-subtitle">{app.organizationName} · {app.isoStandard}</p>
          </div>
        </div>
        {app.status==='draft'&&<button className="btn btn-primary" onClick={submit}><Send size={14}/>Submit Application</button>}
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
        {app.adminNotes&&<div className="alert alert-info" style={{marginTop:12}}><strong>Admin Note:</strong> {app.adminNotes}</div>}
      </div></div>
      <div className="tabs-bar">{['overview','documents','reports','feedback'].map(t=><button key={t} className={`tab-item ${tab===t?'on':''}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}</div>
      {tab==='overview'&&<div className="dash-grid">
        <div className="card"><div className="card-hdr"><div className="card-title">Organization</div></div><div className="card-body">{[['Name',app.organizationName],['Address',[app.address1,app.city,app.state,app.country].filter(Boolean).join(', ')],['Website',app.website]].map(([l,v])=>v?<div key={l} className="info-row"><span className="ir-label">{l}</span><span className="ir-value">{v}</span></div>:null)}</div></div>
        <div className="card"><div className="card-hdr"><div className="card-title">ISO Details</div></div><div className="card-body">{[['Standard',app.isoStandard],['Scope',app.scope],['Body',app.accreditationBody],['Employees',app.employeeCount?.total]].map(([l,v])=>v?<div key={l} className="info-row"><span className="ir-label">{l}</span><span className="ir-value">{v}</span></div>:null)}</div></div>
        <div className="card"><div className="card-hdr"><div className="card-title">Assigned Team</div></div><div className="card-body">
          {[{r:'Auditor',u:app.assignedAuditor},{r:'Reviewer',u:app.assignedReviewer}].map(({r,u})=>(
            <div key={r} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:'1px solid var(--primary-100)'}}>
              <span className="ir-label">{r}</span>
              {u?<div style={{display:'flex',alignItems:'center',gap:8}}><div className="avatar" style={{width:26,height:26,fontSize:10}}>{u.name?.[0]}</div><span style={{fontSize:13,fontWeight:600}}>{u.name}</span></div>:<span style={{fontSize:12,color:'var(--gray-400)'}}>Not assigned yet</span>}
            </div>
          ))}
        </div></div>
      </div>}
      {tab==='documents'&&<div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div className="card"><div className="card-hdr"><div className="card-title"><FileText size={14} style={{color:'var(--primary)'}}/>Application Documents</div></div>
          <div className="card-body">
            <div className="alert alert-info" style={{marginBottom:16}}>📋 <strong>How it works:</strong> Download the form → Fill it out → Upload it back. Use the Sign button for a digital signature.</div>
            {[{label:'Application Form',key:'applicationForm',sign:false},{label:'Agreement',key:'agreement',sign:false},{label:'Signed Form',key:'signedForm',sign:true}].map(doc=>(
              <div key={doc.key} className="doc-row">
                <div className="doc-row-info"><FileText size={18} style={{color:app[doc.key]?'var(--primary)':'var(--gray-300)',flexShrink:0}}/><div><div className="doc-row-name">{doc.label}</div><div className="doc-row-meta">{app[doc.key]?'✓ Uploaded':'Not uploaded'}</div></div></div>
                <div className="doc-row-actions">
                  {app[doc.key]&&<><a href={app[doc.key]} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><Eye size={12}/>Preview</a><a href={app[doc.key]} download className="btn btn-success btn-sm"><Download size={12}/>Download</a></>}
                  {doc.sign&&<button className="btn btn-gold btn-sm" onClick={()=>setSignModal(true)}><PenLine size={12}/>Sign</button>}
                  <label className="btn btn-outline btn-sm" style={{cursor:'pointer'}}><Upload size={12}/>Upload<input type="file" style={{display:'none'}} onChange={e=>upload(e,doc.key)} disabled={uploading}/></label>
                </div>
              </div>
            ))}
            <div style={{marginTop:16}}>
              <div className="section-label">Additional Supporting Documents</div>
              <div className="drop-zone" onClick={()=>document.getElementById('ext-up').click()}>
                <Upload size={28} style={{color:'var(--primary)',margin:'0 auto'}}/>
                <div className="drop-zone-title">Click to upload additional documents</div>
                <div className="drop-zone-sub">PDF, DOC, DOCX, JPG, PNG — up to 10MB</div>
                <input id="ext-up" type="file" style={{display:'none'}} onChange={e=>upload(e,'document')} disabled={uploading}/>
              </div>
            </div>
          </div>
        </div>
        {app.uploadedDocuments?.length>0&&<div className="card"><div className="card-hdr"><div className="card-title">Uploaded Files ({app.uploadedDocuments.length})</div></div>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Name</th><th>Uploaded By</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>{app.uploadedDocuments.map((d,i)=>(
              <tr key={i}><td style={{fontWeight:600}}>{d.name}</td><td>{d.uploadedBy?.name||'—'}</td><td style={{fontSize:12,color:'var(--gray-400)'}}>{d.uploadedAt?new Date(d.uploadedAt).toLocaleDateString():'—'}</td>
              <td><div className="tbl-actions"><a href={d.path} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><Eye size={12}/>Preview</a><a href={d.path} download className="btn btn-ghost btn-sm"><Download size={12}/>Download</a></div></td></tr>
            ))}</tbody>
          </table></div>
        </div>}
      </div>}
      {tab==='reports'&&<div style={{display:'flex',flexDirection:'column',gap:16}}>
        {[{label:'Audit Report',key:'auditReport'},{label:'Review Report',key:'reviewReport'},{label:'Certificate',key:'certificate'}].map(doc=>(
          <div key={doc.key} className="card"><div className="card-hdr"><div className="card-title"><FileText size={14} style={{color:'var(--primary)'}}/>{doc.label}</div>{app[doc.key]&&<span className="badge bdg-certified">✓ Available</span>}</div>
            <div className="card-body">{app[doc.key]?<div style={{display:'flex',gap:10}}>
              <a href={app[doc.key]} target="_blank" rel="noreferrer" className="btn btn-primary"><Eye size={14}/>Preview</a>
              <a href={app[doc.key]} download className="btn btn-secondary"><Download size={14}/>Download</a>
            </div>:<div style={{color:'var(--gray-400)',fontSize:14,display:'flex',alignItems:'center',gap:8}}>⏳ Not available yet — will appear once uploaded by your team</div>}</div>
          </div>
        ))}
      </div>}
      {tab==='feedback'&&<div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div className="card"><div className="card-hdr"><div className="card-title"><Star size={14} style={{color:'var(--amber)'}}/>Submit Feedback</div></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Your Rating</label>
              <div style={{display:'flex',gap:6}}>{[1,2,3,4,5].map(n=><button key={n} className="star-btn" onClick={()=>setFb(p=>({...p,rating:n}))}><Star size={28} fill={n<=fb.rating?'#f59e0b':'none'} stroke={n<=fb.rating?'#f59e0b':'#d1d5db'}/></button>)}</div>
            </div>
            <div className="form-group"><label className="form-label">Your Feedback</label><textarea className="form-control" rows={4} value={fb.message} onChange={e=>setFb(p=>({...p,message:e.target.value}))} placeholder="Share your experience with the certification process…"/></div>
            <button className="btn btn-primary" onClick={submitFb} disabled={submitting}><Send size={14}/>{submitting?'Submitting…':'Submit Feedback'}</button>
          </div>
        </div>
        {app.feedbacks?.length>0&&<div className="card"><div className="card-hdr"><div className="card-title">All Feedback</div></div><div className="card-body">
          {app.feedbacks.map((f,i)=>(
            <div key={i} style={{border:'1px solid var(--primary-100)',borderRadius:12,padding:14,marginBottom:10,background:'var(--gray-50)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}><div className="avatar">{f.from?.name?.[0]||'?'}</div><div><div style={{fontWeight:700,fontSize:13}}>{f.from?.name}</div><span className={`badge bdg-${f.role}`}>{f.role}</span></div></div>
                <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(n=><Star key={n} size={13} fill={n<=f.rating?'#f59e0b':'none'} stroke={n<=f.rating?'#f59e0b':'#d1d5db'}/>)}</div>
              </div>
              <p style={{fontSize:13.5,color:'var(--gray-700)',lineHeight:1.6}}>{f.message}</p>
            </div>
          ))}
        </div></div>}
      </div>}
      {signModal&&<div className="modal-bg" onClick={()=>setSignModal(false)}>
        <div className="modal-box" style={{maxWidth:560}} onClick={e=>e.stopPropagation()}>
          <div className="modal-head"><div className="modal-title"><PenLine size={16} style={{color:'var(--primary)',marginRight:8,verticalAlign:'middle'}}/>Digital Signature</div><button className="modal-close" onClick={()=>setSignModal(false)}>✕</button></div>
          <div className="modal-body">
            <p style={{fontSize:13.5,color:'var(--gray-500)',marginBottom:16,lineHeight:1.6}}>Draw your signature below using mouse or touch. This will be attached to your application form.</p>
            <div style={{border:'1.5px solid var(--primary-200)',borderRadius:12,overflow:'hidden',marginBottom:12,background:'#fafafa'}}>
              <canvas ref={cvs} width={480} height={150} style={{display:'block',width:'100%',cursor:'crosshair',touchAction:'none'}}
                onMouseDown={sd} onMouseMove={dr} onMouseUp={()=>setDrawing(false)} onMouseLeave={()=>setDrawing(false)}
                onTouchStart={e=>{const t=e.touches[0];sd({clientX:t.clientX,clientY:t.clientY});}}
                onTouchMove={e=>{const t=e.touches[0];dr({clientX:t.clientX,clientY:t.clientY});}}
                onTouchEnd={()=>setDrawing(false)}/>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={()=>{const c=cvs.current;if(c)c.getContext('2d').clearRect(0,0,c.width,c.height);}}>Clear</button>
            <button className="btn btn-ghost" onClick={()=>setSignModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveSign}><CheckCircle size={14}/>Save Signature</button>
          </div>
        </div>
      </div>}
    </Layout>
  );
}
