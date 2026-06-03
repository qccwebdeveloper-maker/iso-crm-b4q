import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Upload, Building, FileText, Image } from 'lucide-react';

const ISO_STANDARDS = ['ISO 9001:2015','ISO 14001:2015','ISO 45001:2018','ISO 27001:2022','ISO 22000:2018','ISO 13485:2016','ISO 50001:2018'];
const ACCREDITATION = ['NABCB','DAkkS','UKAS','NAB','ANAB','JAB','KAN'];

export default function AdminNewApplication() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [form, setForm] = useState({
    client: '', organizationName: '', organizationAbbr: '',
    address1: '', city: '', state: '', country: 'India', pincode: '',
    website: '', isoStandard: 'ISO 9001:2015', scope: '',
    accreditationBody: 'NABCB',
    employeeCount: { headOffice: 0, branches: 0, temporary: 0, total: 0 },
    adminNotes: ''
  });

  useEffect(() => {
    axios.get('/api/users?role=client').then(r => setClients(r.data||[])).catch(()=>{});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setEmp = (k, v) => {
    const emp = { ...form.employeeCount, [k]: Number(v)||0 };
    emp.total = emp.headOffice + emp.branches + emp.temporary;
    setForm(f => ({ ...f, employeeCount: emp }));
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const submit = async (asDraft = false) => {
    if (!form.organizationName) return toast.error('Organization name required');
    if (!form.scope) return toast.error('Scope required');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.client) delete payload.client;
      const { data } = await axios.post('/api/applications', payload);
      if (!asDraft) {
        await axios.post(`/api/applications/${data._id}/submit`).catch(()=>{});
      }
      toast.success(asDraft ? 'Saved as draft' : 'Application created & submitted!');
      navigate('/admin/applications');
    } catch { toast.error('Failed to create'); }
    finally { setSaving(false); }
  };

  return (
    <Layout title="New Application">

      {/* ── Page Header ── */}
      <div className="page-hdr">
        <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
          <button className="btn btn-ghost btn-sm" style={{flexShrink:0}} onClick={()=>navigate('/admin/applications')}>
            <ArrowLeft size={14}/>Back
          </button>
          <div style={{minWidth:0}}>
            <h1 className="page-title">New Application</h1>
            <p className="page-subtitle">Create a new ISO certification application</p>
          </div>
        </div>
        <div className="form-action-row">
          <button className="btn btn-secondary" onClick={()=>submit(true)} disabled={saving}>
            <Save size={14}/> Save Draft
          </button>
          <button className="btn btn-primary" onClick={()=>submit(false)} disabled={saving}>
            <FileText size={14}/> {saving ? 'Creating…' : 'Create & Submit'}
          </button>
        </div>
      </div>

      {/* ── Organization Logo ── */}
      <div className="card" style={{marginBottom:18}}>
        <div className="card-hdr">
          <div className="card-title"><Image size={14} style={{color:'var(--primary)'}}/>Organization Logo</div>
        </div>
        <div className="card-body">
          <div style={{display:'flex',alignItems:'flex-start',gap:20,flexWrap:'wrap'}}>
            <div style={{width:90,height:90,borderRadius:10,border:'2px dashed var(--primary-200)',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--primary-50)',overflow:'hidden',flexShrink:0}}>
              {logoPreview
                ? <img src={logoPreview} alt="Logo" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : <div style={{textAlign:'center',color:'var(--primary-300)'}}>
                    <Image size={26}/>
                    <div style={{fontSize:10,marginTop:3}}>No image</div>
                  </div>
              }
            </div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{fontSize:13,fontWeight:600,color:'var(--text-1)',marginBottom:6}}>Upload Organization Logo</div>
              <div style={{fontSize:12,color:'var(--gray-500)',marginBottom:10}}>PNG, JPG up to 5 MB · Recommended 200×200 px</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <label style={{cursor:'pointer'}}>
                  <span className="btn btn-outline btn-sm"><Upload size={12}/> Choose Image</span>
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={handleLogo}/>
                </label>
                {logoPreview && (
                  <button className="btn btn-ghost btn-sm" onClick={()=>setLogoPreview(null)}>Remove</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Client Assignment ── */}
      <div className="card" style={{marginBottom:18}}>
        <div className="card-hdr">
          <div className="card-title"><Building size={14} style={{color:'var(--primary)'}}/>Client Assignment</div>
        </div>
        <div className="card-body">
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Select Client <span style={{fontWeight:400,color:'var(--gray-400)'}}>(optional)</span></label>
            <select className="form-control" value={form.client} onChange={e=>set('client',e.target.value)}>
              <option value="">— Assign client later —</option>
              {clients.map(c=><option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Organization Details ── */}
      <div className="card" style={{marginBottom:18}}>
        <div className="card-hdr">
          <div className="card-title"><Building size={14} style={{color:'var(--primary)'}}/>Organization Details</div>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Organization Name *</label>
              <input className="form-control" placeholder="e.g. ABC Manufacturing Ltd" value={form.organizationName} onChange={e=>set('organizationName',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Abbreviation</label>
              <input className="form-control" placeholder="e.g. ABC" value={form.organizationAbbr} onChange={e=>set('organizationAbbr',e.target.value)} maxLength={10}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-control" placeholder="Street address" value={form.address1} onChange={e=>set('address1',e.target.value)}/>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-control" value={form.city} onChange={e=>set('city',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-control" value={form.state} onChange={e=>set('state',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input className="form-control" value={form.pincode} onChange={e=>set('pincode',e.target.value)}/>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Country</label>
              <input className="form-control" value={form.country} onChange={e=>set('country',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-control" placeholder="www.example.com" value={form.website} onChange={e=>set('website',e.target.value)}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── ISO Certification Details ── */}
      <div className="card" style={{marginBottom:18}}>
        <div className="card-hdr">
          <div className="card-title"><FileText size={14} style={{color:'var(--primary)'}}/>ISO Certification Details</div>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">ISO Standard *</label>
              <select className="form-control" value={form.isoStandard} onChange={e=>set('isoStandard',e.target.value)}>
                {ISO_STANDARDS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Accreditation Body</label>
              <select className="form-control" value={form.accreditationBody} onChange={e=>set('accreditationBody',e.target.value)}>
                {ACCREDITATION.map(a=><option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Scope of Certification *</label>
            <textarea className="form-control" rows={4} placeholder="Describe the scope of activities to be certified…" value={form.scope} onChange={e=>set('scope',e.target.value)}/>
          </div>
        </div>
      </div>

      {/* ── Employee Count ── */}
      <div className="card" style={{marginBottom:18}}>
        <div className="card-hdr">
          <div className="card-title">Employee Count</div>
        </div>
        <div className="card-body">
          <div className="form-row-3">
            {[
              {key:'headOffice', label:'Head Office'},
              {key:'branches',   label:'Branches'},
              {key:'temporary',  label:'Temporary'},
            ].map(({key,label})=>(
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-control" type="number" min="0"
                  value={form.employeeCount[key]}
                  onChange={e=>setEmp(key,e.target.value)}/>
              </div>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',background:'var(--primary-50)',borderRadius:8,border:'1px solid var(--primary-200)',width:'fit-content'}}>
            <span style={{fontSize:12,color:'var(--primary)',fontWeight:600}}>Total Employees</span>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:800,color:'var(--text-1)',fontSize:18}}>{form.employeeCount.total}</span>
          </div>
        </div>
      </div>

      {/* ── Admin Notes ── */}
      <div className="card" style={{marginBottom:24}}>
        <div className="card-hdr">
          <div className="card-title">Admin Notes</div>
        </div>
        <div className="card-body">
          <textarea className="form-control" rows={3} placeholder="Internal notes for this application…" value={form.adminNotes} onChange={e=>set('adminNotes',e.target.value)}/>
        </div>
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="form-action-bar">
        <button className="btn btn-ghost" onClick={()=>navigate('/admin/applications')}>Cancel</button>
        <div className="form-action-row">
          <button className="btn btn-secondary" onClick={()=>submit(true)} disabled={saving}>
            <Save size={14}/> Save Draft
          </button>
          <button className="btn btn-primary" onClick={()=>submit(false)} disabled={saving}>
            <FileText size={14}/> {saving ? 'Creating…' : 'Create & Submit'}
          </button>
        </div>
      </div>

    </Layout>
  );
}
