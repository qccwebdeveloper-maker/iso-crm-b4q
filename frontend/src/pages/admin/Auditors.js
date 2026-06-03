import React,{useState,useEffect}from 'react';import axios from 'axios';import Layout from '../../components/common/Layout';
import{ClipboardCheck,Star,Mail,Phone}from 'lucide-react';
export default function AdminAuditors(){
  const[people,setPeople]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{axios.get('/api/auditors').then(r=>setPeople(r.data||[])).finally(()=>setLoading(false));},[]);
  const aud=people.filter(p=>p.role==='auditor');const rev=people.filter(p=>p.role==='reviewer');
  const Card=({p})=>(
    <div style={{background:'white',border:'1px solid var(--primary-100)',borderRadius:14,padding:20,boxShadow:'var(--shadow-sm)',transition:'all .2s'}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-lg)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow-sm)'}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
        <div className="avatar avatar-lg">{p.name?.[0]?.toUpperCase()}</div>
        <div><div style={{fontWeight:700,fontSize:15,color:'var(--text-1)'}}>{p.name}</div><span className={`badge bdg-${p.role}`}>{p.role}</span></div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:7}}>
        <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--gray-700)'}}><Mail size={13} style={{color:'var(--gray-400)'}}/>{p.email}</div>
        {p.phone&&<div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--gray-700)'}}><Phone size={13} style={{color:'var(--gray-400)'}}/>{p.phone}</div>}
      </div>
      <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid var(--primary-100)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:12,color:'var(--gray-400)'}}>Assigned</span>
        <span style={{fontWeight:700,fontFamily:'JetBrains Mono',fontSize:15,color:'var(--primary)'}}>{p.assignedApplications?.length||0}</span>
      </div>
    </div>
  );
  return(
    <Layout title="Auditors & Reviewers">
      <div className="page-hdr"><div><h1 className="page-title">Audit & Review Team</h1><p className="page-subtitle">{people.length} members</p></div></div>
      {loading?<div className="loading-box"><div className="spinner"/></div>:(
        <>
          <div className="section-label" style={{display:'flex',alignItems:'center',gap:6}}><ClipboardCheck size={13}/> Auditors ({aud.length})</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16,marginBottom:32}}>
            {aud.map(p=><Card key={p._id} p={p}/>)}
            {aud.length===0&&<p style={{color:'var(--gray-400)',fontSize:13}}>No auditors yet — add via User Management</p>}
          </div>
          <div className="section-label" style={{display:'flex',alignItems:'center',gap:6}}><Star size={13}/> Reviewers ({rev.length})</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
            {rev.map(p=><Card key={p._id} p={p}/>)}
            {rev.length===0&&<p style={{color:'var(--gray-400)',fontSize:13}}>No reviewers yet</p>}
          </div>
        </>
      )}
    </Layout>
  );
}
