import React,{useState}from 'react';
import{useNavigate}from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import{ArrowLeft,ArrowRight,Check,Send}from 'lucide-react';
const STEPS=['Organization Details','Employee Count','ISO Information','Review & Submit'];
const STDS=['ISO 9001:2015','ISO 14001:2015','ISO 45001:2018','ISO 27001:2022','ISO 22000:2018','ISO 50001:2018'];
export default function ClientNewApplication(){
  const navigate=useNavigate();const[step,setStep]=useState(0);const[saving,setSaving]=useState(false);
  const[f,setF]=useState({organizationName:'',organizationAbbr:'',address1:'',city:'',state:'',country:'India',pincode:'',website:'',employeeHeadOffice:'',employeeBranches:'',employeeTemporary:'',isoStandard:'ISO 9001:2015',scope:'',accreditationBody:'NABCB',otherDetails:''});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const te=(parseInt(f.employeeHeadOffice)||0)+(parseInt(f.employeeBranches)||0)+(parseInt(f.employeeTemporary)||0);
  const save=async(draft=true)=>{setSaving(true);try{const p={...f,employeeCount:{headOffice:parseInt(f.employeeHeadOffice)||0,branches:parseInt(f.employeeBranches)||0,temporary:parseInt(f.employeeTemporary)||0,total:te}};const res=await axios.post('/api/applications',p);if(!draft)await axios.post(`/api/applications/${res.data._id}/submit`);toast.success(draft?'Saved as draft!':'Application submitted!');navigate('/client/applications');}catch{toast.error('Failed to save');}finally{setSaving(false);}};
  const F=({l,k,t='text',ph=''})=><div className="form-group"><label className="form-label">{l}</label><input type={t} className="form-control" placeholder={ph} value={f[k]||''} onChange={e=>set(k,e.target.value)}/></div>;
  const pages=[
    <div><div className="form-row"><F l="Organization Name *" k="organizationName" ph="ABC Manufacturing Ltd"/><F l="Abbreviation" k="organizationAbbr" ph="ABC"/></div><div className="form-row"><F l="Address Line 1" k="address1" ph="123 Industrial Area"/><F l="City" k="city" ph="Mumbai"/></div><div className="form-row"><F l="State" k="state" ph="Maharashtra"/><F l="Country" k="country" ph="India"/></div><div className="form-row"><F l="Pincode" k="pincode" ph="400001"/><F l="Website" k="website" ph="www.example.com"/></div></div>,
    <div><div className="alert alert-info" style={{marginBottom:20}}>Provide accurate employee counts across all locations for correct certification scoping.</div><div className="form-row-3"><F l="Head Office" k="employeeHeadOffice" t="number" ph="50"/><F l="Branches" k="employeeBranches" t="number" ph="30"/><F l="Temporary" k="employeeTemporary" t="number" ph="20"/></div><div style={{background:'var(--primary-50)',border:'1px solid var(--primary-200)',borderRadius:12,padding:20,marginTop:8,textAlign:'center'}}><div style={{fontSize:12,fontWeight:600,color:'var(--primary-dark)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6}}>Total Employees</div><div style={{fontSize:36,fontWeight:800,color:'var(--primary)',fontFamily:'JetBrains Mono'}}>{te}</div></div></div>,
    <div><div className="form-group"><label className="form-label">ISO Standard *</label><select className="form-control" value={f.isoStandard} onChange={e=>set('isoStandard',e.target.value)}>{STDS.map(s=><option key={s} value={s}>{s}</option>)}</select></div><div className="form-group"><label className="form-label">Scope of Certification *</label><textarea className="form-control" rows={4} placeholder="Describe activities to be covered under certification…" value={f.scope} onChange={e=>set('scope',e.target.value)}/></div><div className="form-group"><label className="form-label">Accreditation Body</label><select className="form-control" value={f.accreditationBody} onChange={e=>set('accreditationBody',e.target.value)}>{['NABCB','UKAS','DAkkS','ANAB','JAS-ANZ','COFRAC'].map(b=><option key={b} value={b}>{b}</option>)}</select></div></div>,
    <div><div style={{background:'var(--gray-50)',border:'1px solid var(--primary-100)',borderRadius:14,padding:20,marginBottom:20}}>
      <div style={{fontWeight:700,fontSize:14,color:'var(--text-1)',marginBottom:14}}>Application Summary</div>
      {[['Organization',f.organizationName||'—'],['ISO Standard',f.isoStandard],['Total Employees',te.toString()],['City / Country',`${f.city||'—'} / ${f.country}`],['Accreditation',f.accreditationBody]].map(([l,v])=>(
        <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13.5,padding:'8px 0',borderBottom:'1px solid var(--primary-100)'}}><span style={{color:'var(--gray-500)'}}>{l}</span><span style={{fontWeight:600}}>{v}</span></div>
      ))}
    </div><div className="form-group"><label className="form-label">Additional Notes (optional)</label><textarea className="form-control" rows={3} value={f.otherDetails} onChange={e=>set('otherDetails',e.target.value)} placeholder="Any special requirements or remarks…"/></div></div>,
  ];
  return(
    <Layout title="New Application">
      <div className="page-hdr">
        <div style={{display:'flex',alignItems:'center',gap:12}}><button className="btn btn-ghost btn-sm" onClick={()=>navigate('/client/applications')}><ArrowLeft size={14}/>Back</button><div><h1 className="page-title">New ISO Application</h1><p className="page-subtitle">Step {step+1} of {STEPS.length}: {STEPS[step]}</p></div></div>
      </div>
      <div className="card" style={{marginBottom:24}}><div className="card-body">
        <div className="stepper">{STEPS.map((s,i)=>(
          <div key={s} className={`step ${i<step?'done':''} ${i===step?'active':''}`}>
            <div className="step-node"><div className="step-circle">{i<step?<Check size={13}/>:i+1}</div><div className="step-lbl">{s}</div></div>
            {i<STEPS.length-1&&<div className="step-connector"/>}
          </div>
        ))}</div>
      </div></div>
      <div className="card"><div className="card-hdr"><div className="card-title">{STEPS[step]}</div></div><div className="card-body">{pages[step]}</div></div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:20,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',gap:10}}>
          {step>0&&<button className="btn btn-ghost" onClick={()=>setStep(s=>s-1)}><ArrowLeft size={14}/>Previous</button>}
          <button className="btn btn-secondary" onClick={()=>save(true)} disabled={saving}>Save Draft</button>
        </div>
        <div>{step<STEPS.length-1?<button className="btn btn-primary" onClick={()=>setStep(s=>s+1)}>Next Step <ArrowRight size={14}/></button>:<button className="btn btn-primary" onClick={()=>save(false)} disabled={saving}><Send size={14}/>{saving?'Submitting…':'Submit Application'}</button>}</div>
      </div>
    </Layout>
  );
}
