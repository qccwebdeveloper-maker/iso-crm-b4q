import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ArrowRight, Save, FileText,
  CheckCircle, Building, Users, ClipboardCheck, Plus
} from 'lucide-react';

/* ── constants ── */
const ISO_LIST = [
  'ISO 9001:2015','ISO 14001:2015','ISO 45001:2018','ISO 22000:2018',
  'ISO 27001:2022','ISO/IEC 27701:2025','ISO/IEC 42001:2023',
  'ISO 22301:2019','ISO 37001:2016','ISO 21001:2018',
];
const APP_TYPES   = ['Initial','Surveillance','Re-certification','Un-Announced','Follow-up'];
const ACCRED      = ['USF','UASL'];
const COUNTRY_CODES = [
  {code:'+1',country:'US/Canada'},{code:'+7',country:'Russia'},{code:'+20',country:'Egypt'},
  {code:'+27',country:'South Africa'},{code:'+30',country:'Greece'},{code:'+31',country:'Netherlands'},
  {code:'+32',country:'Belgium'},{code:'+33',country:'France'},{code:'+34',country:'Spain'},
  {code:'+36',country:'Hungary'},{code:'+39',country:'Italy'},{code:'+40',country:'Romania'},
  {code:'+41',country:'Switzerland'},{code:'+43',country:'Austria'},{code:'+44',country:'UK'},
  {code:'+45',country:'Denmark'},{code:'+46',country:'Sweden'},{code:'+47',country:'Norway'},
  {code:'+48',country:'Poland'},{code:'+49',country:'Germany'},{code:'+52',country:'Mexico'},
  {code:'+54',country:'Argentina'},{code:'+55',country:'Brazil'},{code:'+56',country:'Chile'},
  {code:'+57',country:'Colombia'},{code:'+60',country:'Malaysia'},{code:'+61',country:'Australia'},
  {code:'+62',country:'Indonesia'},{code:'+63',country:'Philippines'},{code:'+64',country:'New Zealand'},
  {code:'+65',country:'Singapore'},{code:'+66',country:'Thailand'},{code:'+81',country:'Japan'},
  {code:'+82',country:'South Korea'},{code:'+84',country:'Vietnam'},{code:'+86',country:'China'},
  {code:'+90',country:'Turkey'},{code:'+91',country:'India'},{code:'+92',country:'Pakistan'},
  {code:'+94',country:'Sri Lanka'},{code:'+98',country:'Iran'},{code:'+212',country:'Morocco'},
  {code:'+213',country:'Algeria'},{code:'+216',country:'Tunisia'},{code:'+234',country:'Nigeria'},
  {code:'+254',country:'Kenya'},{code:'+255',country:'Tanzania'},{code:'+351',country:'Portugal'},
  {code:'+353',country:'Ireland'},{code:'+358',country:'Finland'},{code:'+380',country:'Ukraine'},
  {code:'+420',country:'Czech Republic'},{code:'+880',country:'Bangladesh'},{code:'+960',country:'Maldives'},
  {code:'+961',country:'Lebanon'},{code:'+962',country:'Jordan'},{code:'+964',country:'Iraq'},
  {code:'+965',country:'Kuwait'},{code:'+966',country:'Saudi Arabia'},{code:'+968',country:'Oman'},
  {code:'+971',country:'UAE'},{code:'+972',country:'Israel'},{code:'+973',country:'Bahrain'},
  {code:'+974',country:'Qatar'},{code:'+977',country:'Nepal'},
];
const EMP_ROWS    = ['Top Management','Production Area / Service','Quality Control / Technical','Administration','Other'];
const EMP_COLS    = ['Full Time','Part Time','Performing Same type of Job','Temporary Unskilled Workers','Effective No. Filled by QCC'];
const LOCATION_CONDITIONS = ['Special countermeasure area','Protection area of source water','Industrial complex','City'];

const emptyRow = () => Array(EMP_COLS.length).fill(0);

const INIT = {
  /* step 1 */
  refno:'', client:'', organizationName:'', address:'', additionalSites:'',
  countryCode:'+91', mobileNumber:'', contactNumbers:'', emailId:'', contactPerson:'', designation:'',
  modeOfWorking:'Onsite', hybridCoreActivities:'',
  scopeOfCertification:'',
  /* step 2 */
  mainProcesses:'', outsourcedProcesses:'',
  standards:[], othersStandard:'',
  applicationType:'Initial', accreditationBody:'USF',
  /* step 3 */
  totalEmployees:0, contractual:0, workingShifts:1,
  empTable: EMP_ROWS.map(() => emptyRow()),
  remotePersonnel:0, weekendOperation:'',
  /* step 4 */
  legalAct:'', keyProcessArea:'', productsServices:'',
  outsourcingProcess:'', consultantDetails:'',
  establishmentDate:'', manualDate:'', internalAuditDate:'', managementReviewDate:'',
  alreadyCertified:false, certStandard:'', certBody:'', certIssueDate:'', certExpiryDate:'',
  /* combined/integrated audit */
  combinedAudit:'', jointAudit:'', integratedAudit:'', separateAudit:'',
  internalAuditCombined:'', mrmCombined:'', manualCombined:'',
  systemIntegrated:'', integratedApproach:'', integratedMgmt:'',
  integrationPercentage:'',
  /* ISO 50001 */
  annualEnergyConsumption:'', enmsPersonnels:'',
  energySources:'', significantEnergyUses:'',
  /* ISO 14001 / 45001 */
  locationConditions:[],
  airEmissionFacility:'', wastewaterFacility:'',
  wastesAmount:'', hazardousChemicals:'',
  pollutionClearance:'', criticalAspectsOHSAS:'',
  envAspectDetails:'', personnelOnSite:'', personnelAwayFromSite:'',
  risksAwayFromSite:'', ohsmsSignificantRisk:'',
  notRegulatedByLaw:'',
  relevantLaws:'',
  /* internal */
  adminNotes:'',
};

const STEPS = [
  { label:'Basic Info',  icon:Building,      desc:'Organisation & Contact' },
  { label:'Standards',   icon:FileText,       desc:'ISO Standards & Type' },
  { label:'Employees',   icon:Users,          desc:'Workforce Details' },
  { label:'Mgmt System', icon:ClipboardCheck, desc:'System Info & Submit' },
];

/* ── tiny helpers ── */
const Row = ({children, mb=12}) => (
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'0 16px',marginBottom:mb}}>
    {children}
  </div>
);
const FG = ({label, required, children, full}) => (
  <div className="form-group" style={full?{gridColumn:'1/-1'}:{}}>
    <label className="form-label">{label}{required&&<span style={{color:'var(--red)'}}> *</span>}</label>
    {children}
  </div>
);
const TCell = ({children, head, bold, accent}) => (
  <td style={{
    padding:'7px 10px', border:'1px solid var(--primary-100)',
    fontWeight: head||bold ? 700 : 400,
    fontSize: head ? 10.5 : 12,
    background: head ? 'var(--primary-50)' : accent ? '#fffbeb' : 'white',
    color: head ? 'var(--primary-dark)' : 'var(--text-1)',
    textAlign: head ? 'center' : 'left',
    whiteSpace: head ? 'pre-wrap' : 'normal',
    lineHeight:1.3,
  }}>{children}</td>
);
const YNRow = ({label, field, form, set}) => (
  <div style={{display:'flex',alignItems:'center',padding:'9px 14px',borderBottom:'1px solid var(--primary-50)',gap:12,flexWrap:'wrap'}}>
    <span style={{flex:1,fontSize:12.5,color:'var(--text-1)'}}>{label}</span>
    <div style={{display:'flex',gap:12}}>
      {['YES','NO'].map(v=>(
        <label key={v} style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer',fontWeight:form[field]===v?700:500,
          color:form[field]===v?(v==='YES'?'var(--green)':'var(--red)'):'var(--gray-400)',fontSize:12.5}}>
          <input type="radio" name={field} value={v} checked={form[field]===v}
            onChange={()=>set(field,v)} style={{accentColor:v==='YES'?'var(--green)':'var(--red)'}}/>
          {v}
        </label>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════ */
export default function AdminNewApplication() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [clients, setClients] = useState([]);
  const [step,    setStep]    = useState(0);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(INIT);

  const isClient = user?.role === 'client';
  const backTo = isClient ? '/client/applications'
    : user?.role === 'sales' ? '/sales/leads'
    : '/admin/applications';

  useEffect(()=>{
    // Client doesn't need the clients list — they are the client
    if (!isClient) {
      axios.get('/api/users?role=client').then(r=>setClients(r.data||[])).catch(()=>{});
    }
  },[isClient]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const toggleStd = (s) => setForm(f=>({
    ...f, standards: f.standards.includes(s) ? f.standards.filter(x=>x!==s) : [...f.standards,s]
  }));
  const toggleLoc = (l) => setForm(f=>({
    ...f, locationConditions: f.locationConditions.includes(l)
      ? f.locationConditions.filter(x=>x!==l) : [...f.locationConditions,l]
  }));

  const setEmp = (row,col,val) => setForm(f=>{
    const t = f.empTable.map((r,ri)=>ri===row ? r.map((c,ci)=>ci===col ? Number(val)||0 : c) : r);
    return {...f, empTable:t};
  });

  const rowTotal  = (row) => form.empTable[row].reduce((a,b)=>a+b,0);
  const colTotal  = (col) => form.empTable.reduce((a,r)=>a+r[col],0);
  const grandTotal= () => form.empTable.flat().reduce((a,b)=>a+b,0);

  const validate = () => {
    if(step===0&&!form.organizationName.trim()){toast.error('Organization name required');return false;}
    if(step===0&&!form.address.trim()){toast.error('Address is required');return false;}
    if(step===0&&!form.mobileNumber.trim()){toast.error('Mobile number is required');return false;}
    if(step===0&&!form.contactPerson.trim()){toast.error('Contact person name is required');return false;}
    if(step===0&&!form.scopeOfCertification.trim()){toast.error('Scope of certification required');return false;}
    if(step===1&&form.standards.length===0){toast.error('Select at least one standard');return false;}
    return true;
  };
  const next = ()=>{ if(validate()) setStep(s=>Math.min(3,s+1)); };
  const prev = ()=> setStep(s=>Math.max(0,s-1));

  const submit = async(asDraft=false)=>{
    if(!form.organizationName.trim()){toast.error('Organization name required');setStep(0);return;}
    if(!form.scopeOfCertification.trim()){toast.error('Scope required');setStep(0);return;}
    setSaving(true);
    try{
      const payload={
        ...form,
        isoStandard: form.standards[0]||'ISO 9001:2015',
        scope: form.scopeOfCertification,
        country:'India',
        employeeCount:{headOffice:grandTotal(),branches:0,temporary:0,total:grandTotal()},
      };
      // For client role: let backend auto-assign from token (don't send client field)
      if(isClient) delete payload.client;
      else if(!payload.client) delete payload.client;

      const {data} = await axios.post('/api/applications', payload);
      if(!asDraft) await axios.post(`/api/applications/${data._id}/submit`).catch(()=>{});
      toast.success(asDraft?'Saved as draft':'Application submitted!');
      navigate(backTo);
    }catch(e){
      toast.error(e?.response?.data?.message || 'Failed to create application');
    }
    finally{ setSaving(false); }
  };

  /* ─── Step indicator ─── */
  const StepBar = () => (
    <div style={{display:'flex',alignItems:'flex-start',gap:0,marginBottom:28,overflowX:'auto'}}>
      {STEPS.map((s,i)=>{
        const done  = i < step;
        const act   = i === step;
        const col   = done?'var(--green)':act?'var(--primary)':'var(--gray-300)';
        return (
          <React.Fragment key={i}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',minWidth:80,cursor:done?'pointer':'default'}}
              onClick={()=>done&&setStep(i)}>
              <div style={{width:44,height:44,borderRadius:'50%',border:`2.5px solid ${col}`,display:'flex',alignItems:'center',justifyContent:'center',
                background:done?'var(--green)':act?'var(--primary-50)':'white',marginBottom:5,transition:'all .2s'}}>
                {done
                  ? <CheckCircle size={20} color="white"/>
                  : <s.icon size={17} color={act?'var(--primary)':'var(--gray-300)'}/>}
              </div>
              <div style={{fontSize:11.5,fontWeight:act?700:500,color:act?'var(--primary-dark)':done?'var(--green)':'var(--gray-400)',textAlign:'center'}}>{s.label}</div>
              <div style={{fontSize:10,color:'var(--gray-300)',textAlign:'center'}}>{s.desc}</div>
            </div>
            {i<3 && <div style={{flex:1,height:2.5,background:i<step?'var(--green)':'var(--gray-200)',marginTop:21,minWidth:16,transition:'background .2s'}}/>}
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ─── STEP 1: Basic Info ─── */
  const S1 = ()=>(
    <div>
      <div style={{background:'linear-gradient(135deg,var(--primary-50),white)',border:'1.5px solid var(--primary-200)',borderRadius:10,padding:'12px 18px',marginBottom:22,textAlign:'center'}}>
        <div style={{fontWeight:800,fontSize:15,color:'var(--text-1)',marginBottom:2}}>Request for Proposal cum Application Form</div>
        <div style={{fontSize:11.5,color:'var(--gray-500)'}}>QC Certification · ISO Certification Management</div>
      </div>

      {/* REFNO and client selector — hidden for client role */}
      {!isClient && (
        <Row mb={0}>
          <FG label="REFNO"><input className="form-control" placeholder="Auto-generated" value={form.refno} onChange={e=>set('refno',e.target.value)}/></FG>
          <FG label="Select Client"><select className="form-control" value={form.client} onChange={e=>set('client',e.target.value)}>
            <option value="">— Assign later —</option>
            {clients.map(c=><option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
          </select></FG>
        </Row>
      )}

      <FG label="Name of Organization" required>
        <input className="form-control" placeholder="e.g. ABC Manufacturing Ltd" value={form.organizationName} onChange={e=>set('organizationName',e.target.value)}/>
      </FG>

      <FG label="Address" required>
        <textarea className="form-control" rows={3} placeholder="Full address" value={form.address} onChange={e=>set('address',e.target.value)}/>
      </FG>

      <FG label="Additional Sites / Addresses, if any">
        <textarea className="form-control" rows={2} placeholder="List additional site addresses" value={form.additionalSites} onChange={e=>set('additionalSites',e.target.value)}/>
      </FG>

      <Row mb={0}>
        <FG label="Mobile Number" required>
          <div className="mobile-input-row">
            <select className="form-control" value={form.countryCode} onChange={e=>set('countryCode',e.target.value)}>
              {COUNTRY_CODES.map(c=>(
                <option key={c.code+c.country} value={c.code}>{c.code} {c.country}</option>
              ))}
            </select>
            <input className="form-control" placeholder="9000000000" value={form.mobileNumber}
              onChange={e=>set('mobileNumber',e.target.value.replace(/\D/g,'').slice(0,15))}/>
          </div>
        </FG>
        <FG label="Email Id"><input type="email" className="form-control" placeholder="info@company.com" value={form.emailId} onChange={e=>set('emailId',e.target.value)}/></FG>
        <FG label="Contact Person" required><input className="form-control" placeholder="Full name" value={form.contactPerson} onChange={e=>set('contactPerson',e.target.value)}/></FG>
        <FG label="Designation"><input className="form-control" placeholder="e.g. Quality Manager" value={form.designation} onChange={e=>set('designation',e.target.value)}/></FG>
      </Row>

      <Row mb={0}>
        <FG label="Mode of Working (i.e. Online / Onsite / Hybrid)">
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {['Online','Onsite','Hybrid'].map(m=>(
              <label key={m} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',padding:'8px 14px',border:`1.5px solid ${form.modeOfWorking===m?'var(--primary)':'var(--gray-200)'}`,borderRadius:8,background:form.modeOfWorking===m?'var(--primary-50)':'white',fontWeight:form.modeOfWorking===m?700:500,fontSize:13,color:form.modeOfWorking===m?'var(--primary-dark)':'var(--gray-500)'}}>
                <input type="radio" name="mode" value={m} checked={form.modeOfWorking===m} onChange={()=>set('modeOfWorking',m)} style={{accentColor:'var(--primary)'}}/>
                {m}
              </label>
            ))}
          </div>
        </FG>
        {form.modeOfWorking==='Hybrid'&&(
          <FG label="In-case of Hybrid, Core activities Online or Onsite?">
            <select className="form-control" value={form.hybridCoreActivities} onChange={e=>set('hybridCoreActivities',e.target.value)}>
              <option value="">Select</option>
              <option>Core activities Online</option>
              <option>Core activities Onsite</option>
            </select>
          </FG>
        )}
      </Row>

      <FG label="Scope of Certification" required>
        <textarea className="form-control" rows={4} placeholder="Describe the scope of activities, products/services to be certified…" value={form.scopeOfCertification} onChange={e=>set('scopeOfCertification',e.target.value)}/>
      </FG>
    </div>
  );

  /* ─── STEP 2: Standards ─── */
  const S2 = ()=>(
    <div>
      <Row mb={0}>
        <FG label="Main Processes / Activities" full>
          <input className="form-control" placeholder="e.g. purchase, store, production" value={form.mainProcesses} onChange={e=>set('mainProcesses',e.target.value)}/>
        </FG>
        <FG label="Outsourced Processes, if any" full>
          <input className="form-control" placeholder="e.g. printing, packaging" value={form.outsourcedProcesses} onChange={e=>set('outsourcedProcesses',e.target.value)}/>
        </FG>
      </Row>

      <div className="form-group">
        <label className="form-label">Standard(s)<span style={{color:'var(--red)'}}> *</span> <span style={{fontWeight:400,color:'var(--gray-400)'}}>— tick all applicable</span></label>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:8,marginBottom:8}}>
          {ISO_LIST.map(s=>(
            <label key={s} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 13px',border:`1.5px solid ${form.standards.includes(s)?'var(--primary)':'var(--gray-200)'}`,borderRadius:8,cursor:'pointer',background:form.standards.includes(s)?'var(--primary-50)':'white',transition:'all .14s'}}>
              <input type="checkbox" checked={form.standards.includes(s)} onChange={()=>toggleStd(s)} style={{accentColor:'var(--primary)',width:15,height:15,flexShrink:0}}/>
              <span style={{fontSize:12.5,fontWeight:form.standards.includes(s)?700:500,color:form.standards.includes(s)?'var(--primary-dark)':'var(--gray-600)'}}>{s}</span>
            </label>
          ))}
          <label style={{display:'flex',alignItems:'center',gap:9,padding:'9px 13px',border:'1.5px solid var(--gray-200)',borderRadius:8,cursor:'pointer',background:'white'}}>
            <input type="checkbox" style={{accentColor:'var(--primary)',width:15,height:15}}/><span style={{fontSize:12.5,color:'var(--gray-600)'}}>Others</span>
          </label>
        </div>
        {form.standards.length>0&&(
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>
            {form.standards.map(s=><span key={s} className="badge bdg-info" style={{fontSize:10.5}}>{s}</span>)}
          </div>
        )}
        {form.standards.includes('Others')&&(
          <input className="form-control" style={{marginTop:8}} placeholder="Specify other standard(s)" value={form.othersStandard} onChange={e=>set('othersStandard',e.target.value)}/>
        )}
      </div>

      <Row mb={0}>
        <FG label="Application Type">
          <select className="form-control" value={form.applicationType} onChange={e=>set('applicationType',e.target.value)}>
            {APP_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
          <div style={{fontSize:10.5,color:'var(--gray-400)',marginTop:3}}>Initial / Surveillance / Re-certification / Un-Announced / Follow-up</div>
        </FG>
        <FG label="Accreditation Body">
          <select className="form-control" value={form.accreditationBody} onChange={e=>set('accreditationBody',e.target.value)}>
            {ACCRED.map(a=><option key={a}>{a}</option>)}
          </select>
        </FG>
      </Row>
    </div>
  );

  /* ─── STEP 3: Employees ─── */
  const S3 = ()=>(
    <div>
      {/* Summary row */}
      <div style={{display:'flex',gap:14,marginBottom:18,flexWrap:'wrap'}}>
        {[
          {label:'No. of Employees — Total', field:'totalEmployees'},
          {label:'Contractual',              field:'contractual'},
          {label:'Working No. of Shifts',    field:'workingShifts'},
        ].map(({label,field})=>(
          <div key={field} style={{flex:1,minWidth:160}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--gray-600)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</div>
            <input className="form-control" type="number" min="0" value={form[field]} onChange={e=>set(field,Number(e.target.value)||0)}/>
          </div>
        ))}
      </div>

      {/* Employee table */}
      <div style={{overflowX:'auto',marginBottom:16}}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:750,fontSize:12}}>
          <thead>
            <tr>
              <TCell head>Activities</TCell>
              {EMP_COLS.map(c=><TCell key={c} head>{c}</TCell>)}
              <TCell head>Total</TCell>
            </tr>
          </thead>
          <tbody>
            {EMP_ROWS.map((row,ri)=>(
              <tr key={ri}>
                <td style={{padding:'8px 12px',fontWeight:600,fontSize:12.5,border:'1px solid var(--primary-100)',background:'var(--primary-50)',color:'var(--text-1)',minWidth:180}}>{row}</td>
                {EMP_COLS.map((_,ci)=>(
                  <td key={ci} style={{padding:'5px 7px',border:'1px solid var(--gray-100)',background:ri%2===0?'white':'var(--gray-50)'}}>
                    <input type="number" min="0" value={form.empTable[ri][ci]}
                      onChange={e=>setEmp(ri,ci,e.target.value)}
                      style={{width:'100%',padding:'5px 7px',border:'1.5px solid var(--primary-200)',borderRadius:6,fontSize:12,textAlign:'center',outline:'none',background:'white'}}/>
                  </td>
                ))}
                <td style={{padding:'8px 10px',textAlign:'center',fontWeight:700,fontSize:13,color:'var(--primary)',border:'1px solid var(--primary-100)',background:'var(--primary-50)'}}>{rowTotal(ri)}</td>
              </tr>
            ))}
            {/* Totals row */}
            <tr style={{background:'var(--primary-100)'}}>
              <td style={{padding:'9px 12px',fontWeight:800,border:'1px solid var(--primary-200)',fontSize:13,color:'var(--text-1)'}}>Total</td>
              {EMP_COLS.map((_,ci)=>(
                <td key={ci} style={{padding:'9px 10px',textAlign:'center',fontWeight:700,border:'1px solid var(--primary-200)',fontSize:13,color:'var(--primary-dark)'}}>{colTotal(ci)}</td>
              ))}
              <td style={{padding:'9px 10px',textAlign:'center',fontWeight:800,border:'1px solid var(--primary-200)',fontSize:15,color:'var(--primary)'}}>{grandTotal()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Row mb={0}>
        <FG label="No. of personnel working away from site (if applicable)">
          <input className="form-control" type="number" min="0" value={form.remotePersonnel} onChange={e=>set('remotePersonnel',Number(e.target.value)||0)}/>
        </FG>
        <FG label="No. of Employees (auto)">
          <input className="form-control" value={grandTotal()} readOnly style={{background:'var(--primary-50)',fontWeight:700,color:'var(--primary)'}}/>
        </FG>
        <FG label="Operation for Weekend / Weekly Holiday" full>
          <input className="form-control" placeholder="e.g. Saturday half day, Sunday off" value={form.weekendOperation} onChange={e=>set('weekendOperation',e.target.value)}/>
        </FG>
      </Row>
    </div>
  );

  /* ─── STEP 4: Management System Info ─── */
  const S4 = ()=>{
    const has14001 = form.standards.includes('ISO 14001:2015');
    const has45001 = form.standards.includes('ISO 45001:2018');
    const has50001 = form.standards.includes('ISO 50001:2018');
    const showEnv  = has14001 || has45001;

    return (
      <div>
        {/* Management System Info block */}
        <div style={{background:'var(--primary)',color:'white',padding:'8px 16px',borderRadius:'8px 8px 0 0',fontWeight:700,fontSize:13,marginBottom:0,textAlign:'center',letterSpacing:'.04em'}}>
          Management System Information(s)
        </div>
        <div className="card" style={{borderRadius:'0 0 10px 10px',marginBottom:18,border:'1.5px solid var(--primary-200)'}}>
          <div className="card-body">
            {[
              {n:'1.',label:'Applicable Legal, statuary & regulatory act',hint:'(i.e., Pvt. Ltd. / Ltd. / Partnership / proprietorship / Labour law)',field:'legalAct'},
              {n:'2.',label:'Organization Key Process Area',hint:'(i.e., purchase/store/production etc.)',field:'keyProcessArea'},
              {n:'3.',label:'Organization Products / Services',hint:'(i.e., abc & xyz products etc.)',field:'productsServices'},
              {n:'4.',label:'Any outsourcing process',hint:'(i.e., printing etc.)',field:'outsourcingProcess'},
              {n:'5.',label:'Consultant details, if used for Management System Preparation',hint:'',field:'consultantDetails'},
            ].map(({n,label,hint,field})=>(
              <div key={field} className="form-group">
                <label className="form-label">{n} {label} <span style={{fontWeight:400,color:'var(--gray-400)'}}>{hint}</span></label>
                <input className="form-control" value={form[field]} onChange={e=>set(field,e.target.value)}/>
              </div>
            ))}
            <Row mb={0}>
              <FG label="6. Organization establishment date"><input type="date" className="form-control" value={form.establishmentDate} onChange={e=>set('establishmentDate',e.target.value)}/></FG>
              <FG label="7. Manual Date"><input type="date" className="form-control" value={form.manualDate} onChange={e=>set('manualDate',e.target.value)}/></FG>
              <FG label="8. Internal audit date (Or planned date)"><input type="date" className="form-control" value={form.internalAuditDate} onChange={e=>set('internalAuditDate',e.target.value)}/></FG>
              <FG label="9. Management review date (Or planned date)"><input type="date" className="form-control" value={form.managementReviewDate} onChange={e=>set('managementReviewDate',e.target.value)}/></FG>
            </Row>
            {/* Already certified */}
            <div style={{background:'var(--primary-50)',borderRadius:8,padding:'12px 14px',marginTop:8}}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontWeight:600,fontSize:13,marginBottom:form.alreadyCertified?12:0}}>
                <input type="checkbox" checked={form.alreadyCertified} onChange={e=>set('alreadyCertified',e.target.checked)} style={{accentColor:'var(--primary)',width:15,height:15}}/>
                If org. already ISO Certified, write the standards:
              </label>
              {form.alreadyCertified&&(
                <Row mb={0}>
                  <FG label="Certified Standard(s)"><input className="form-control" placeholder="e.g. ISO 9001:2015" value={form.certStandard} onChange={e=>set('certStandard',e.target.value)}/></FG>
                  <FG label="Certification Body"><input className="form-control" value={form.certBody} onChange={e=>set('certBody',e.target.value)}/></FG>
                  <FG label="Issue Date"><input type="date" className="form-control" value={form.certIssueDate} onChange={e=>set('certIssueDate',e.target.value)}/></FG>
                  <FG label="Expiry Date"><input type="date" className="form-control" value={form.certExpiryDate} onChange={e=>set('certExpiryDate',e.target.value)}/></FG>
                </Row>
              )}
            </div>
          </div>
        </div>

        {/* Combined / Integrated audit */}
        <div style={{border:'2px solid var(--primary)',borderRadius:10,marginBottom:18,overflow:'hidden'}}>
          <div style={{background:'var(--primary)',color:'white',padding:'8px 16px',fontWeight:700,fontSize:13,textAlign:'center',letterSpacing:'.03em'}}>
            In case of joint, combined, integrated audit:—
          </div>
          {[
            {label:'Combined Audit — Do you want the audits for several certification programmes/standards to be conducted as a Combined Audit?',field:'combinedAudit'},
            {label:'Joint Audit — Do you want the audits to be conducted as a Joint Audit with another certification body / audit team?',field:'jointAudit'},
            {label:'Integrated Audit — Do you want the audits for multiple management system standards to be conducted as an Integrated Audit?',field:'integratedAudit'},
            {label:'Separate Audit — Do you want each certification programme/standard to be audited separately?',field:'separateAudit'},
            {label:'Is Internal Audit Combined?',field:'internalAuditCombined'},
            {label:'Is MRM Combined including business strategy and plan?',field:'mrmCombined'},
            {label:'Is Manual, Procedures are Combined?',field:'manualCombined'},
            {label:'Is Implemented System Integrated?',field:'systemIntegrated'},
            {label:'Is there integrated approach for correction, corrective action and continual improvement?',field:'integratedApproach'},
            {label:'Is there any integrated management support and responsibilities?',field:'integratedMgmt'},
          ].map(({label,field})=>(
            <YNRow key={field} label={label} field={field} form={form} set={set}/>
          ))}
          <div style={{padding:'9px 14px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <span style={{fontSize:12.5,color:'var(--text-1)',flex:1}}>Percentage level of integration (decided by QCC):</span>
            <input className="form-control" style={{width:160}} placeholder="e.g. 80%" value={form.integrationPercentage} onChange={e=>set('integrationPercentage',e.target.value)}/>
          </div>
        </div>

        {/* ISO 50001 Additional */}
        {has50001&&(
          <div style={{border:'2px solid #16a34a',borderRadius:10,marginBottom:18,overflow:'hidden'}}>
            <div style={{background:'#16a34a',color:'white',padding:'8px 16px',fontWeight:700,fontSize:13,textAlign:'center'}}>
              This Section for ISO 50001:2018 – Energy Management System – Additional Details
            </div>
            <div style={{padding:'16px 18px'}}>
              <Row mb={0}>
                <FG label="Annual Energy Consumption (Unit KWH etc.)"><input className="form-control" value={form.annualEnergyConsumption} onChange={e=>set('annualEnergyConsumption',e.target.value)}/></FG>
                <FG label="Number of EnMS Effective Personnels"><input className="form-control" type="number" min="0" value={form.enmsPersonnels} onChange={e=>set('enmsPersonnels',e.target.value)}/></FG>
                <FG label="Name & Number of Energy Sources"><input className="form-control" value={form.energySources} onChange={e=>set('energySources',e.target.value)}/></FG>
                <FG label="Name & Number of significant energy uses (SEUs)"><input className="form-control" value={form.significantEnergyUses} onChange={e=>set('significantEnergyUses',e.target.value)}/></FG>
              </Row>
            </div>
          </div>
        )}

        {/* ISO 14001 / 45001 Additional */}
        {showEnv&&(
          <div style={{border:'2px solid var(--red)',borderRadius:10,marginBottom:18,overflow:'hidden'}}>
            <div style={{background:'var(--red)',color:'white',padding:'8px 16px',fontWeight:700,fontSize:13,textAlign:'center'}}>
              This Section for {has14001?'ISO 14001:2015':''}{has14001&&has45001?' / ':''}{has45001?'ISO 45001:2018':''} – Additional Details (Fill out applicable details)
            </div>
            <div style={{padding:'16px 18px'}}>
              <div className="form-group">
                <label className="form-label">Select Condition of your location (tick all applicable)</label>
                <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                  {LOCATION_CONDITIONS.map(l=>(
                    <label key={l} style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',padding:'7px 12px',border:`1.5px solid ${form.locationConditions.includes(l)?'var(--red)':'var(--gray-200)'}`,borderRadius:8,background:form.locationConditions.includes(l)?'var(--red-50)':'white',fontSize:12.5,fontWeight:form.locationConditions.includes(l)?700:500}}>
                      <input type="checkbox" checked={form.locationConditions.includes(l)} onChange={()=>toggleLoc(l)} style={{accentColor:'var(--red)',width:14,height:14}}/>{l}
                    </label>
                  ))}
                </div>
              </div>
              <Row mb={8}>
                <FG label="Operating air emission facility"><select className="form-control" value={form.airEmissionFacility} onChange={e=>set('airEmissionFacility',e.target.value)}><option value="">Select</option><option>YES</option><option>NO</option></select></FG>
                <FG label="Operating waste water treatment facility"><select className="form-control" value={form.wastewaterFacility} onChange={e=>set('wastewaterFacility',e.target.value)}><option value="">Select</option><option>YES</option><option>NO</option></select></FG>
                <FG label="Kind of wastes & amount (Ton/year)"><input className="form-control" value={form.wastesAmount} onChange={e=>set('wastesAmount',e.target.value)}/></FG>
                <FG label="Usage of hazardous chemical substances?"><select className="form-control" value={form.hazardousChemicals} onChange={e=>set('hazardousChemicals',e.target.value)}><option value="">Select</option><option>YES</option><option>NO</option></select></FG>
              </Row>
              {[
                {label:'Does you have Pollution Clearance from local authorities?',field:'pollutionClearance'},
                {label:'Does you have more than 5 critical environmental aspect or OHSAS risks? (ex: air, water, waste, noise, chemical, soil)',field:'criticalAspectsOHSAS'},
              ].map(({label,field})=>(
                <YNRow key={field} label={label} field={field} form={form} set={set}/>
              ))}
              {[
                {label:'Details of the Environmental Aspects (If More Than 5 critical aspect)',field:'envAspectDetails'},
                {label:'How many no. of personnel working on site?',field:'personnelOnSite'},
                {label:'How many no. of personnel working away from site?',field:'personnelAwayFromSite'},
                {label:'What are the risks for personnel working away from the site?',field:'risksAwayFromSite'},
                {label:'Details of the OHSMS Significant RISK (if More Than 5 critical OHSMS RISK)',field:'ohsmsSignificantRisk'},
              ].map(({label,field})=>(
                <div key={field} className="form-group">
                  <label className="form-label" style={{fontSize:12}}>{label}</label>
                  <input className="form-control" value={form[field]} onChange={e=>set(field,e.target.value)}/>
                </div>
              ))}
              <YNRow label="Does your organization is not regulated by the law and don't need any license?" field="notRegulatedByLaw" form={form} set={set}/>
              <div className="form-group" style={{marginTop:10}}>
                <label className="form-label">Please write relevant laws applicable to your organization</label>
                <div style={{fontSize:11,color:'var(--gray-500)',marginBottom:6}}>(Ex. air, water, waste, noise, chemical, mining, labour etc. laws), process related and product related legal requirement.</div>
                <textarea className="form-control" rows={3} value={form.relevantLaws} onChange={e=>set('relevantLaws',e.target.value)}/>
              </div>
            </div>
          </div>
        )}

        {/* Admin Notes */}
        <div className="form-group">
          <label className="form-label">Internal Notes (Admin only)</label>
          <textarea className="form-control" rows={3} placeholder="Any internal notes…" value={form.adminNotes} onChange={e=>set('adminNotes',e.target.value)}/>
        </div>

        {/* Review summary */}
        <div style={{background:'var(--primary-50)',border:'1.5px solid var(--primary-200)',borderRadius:10,padding:'16px 18px'}}>
          <div style={{fontWeight:700,fontSize:13,color:'var(--primary-dark)',marginBottom:12,display:'flex',alignItems:'center',gap:7}}>
            <CheckCircle size={15} style={{color:'var(--primary)'}}/>Summary — Review before Submit
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'8px 20px'}}>
            {[
              {l:'Organization', v:form.organizationName||'—'},
              {l:'Standards',    v:form.standards.length>0?form.standards.join(', '):'—'},
              {l:'App. Type',    v:form.applicationType},
              {l:'Mode',         v:form.modeOfWorking},
              {l:'Contact',      v:form.contactPerson||'—'},
              {l:'Total Emp.',   v:grandTotal()},
              {l:'Accreditation',v:form.accreditationBody},
              {l:'Scope',        v:form.scopeOfCertification.slice(0,50)||(form.scopeOfCertification?form.scopeOfCertification:'—')},
            ].map(({l,v})=>(
              <div key={l} style={{borderBottom:'1px solid var(--primary-100)',paddingBottom:5}}>
                <div style={{fontSize:9.5,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--primary)',marginBottom:2}}>{l}</div>
                <div style={{fontSize:12.5,fontWeight:600,color:'var(--text-1)',wordBreak:'break-word'}}>{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ─── RENDER ─── */
  return (
    <Layout title="New Application">
      <div className="page-hdr">
        <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
          <button className="btn btn-ghost btn-sm" style={{flexShrink:0}} onClick={()=>navigate(backTo)}>
            <ArrowLeft size={14}/>Back
          </button>
          <div style={{minWidth:0}}>
            <h1 className="page-title">{isClient ? 'Apply for ISO Certification' : 'New Application'}</h1>
            <p className="page-subtitle">
              {isClient
                ? `ISO Certification Application — Step ${step+1} of 4`
                : `Request for Proposal cum Application Form — Step ${step+1} of 4`}
            </p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={()=>submit(true)} disabled={saving}>
          <Save size={14}/> Save Draft
        </button>
      </div>

      {StepBar()}

      <div className="card" style={{marginBottom:0,padding:0}}>
        <div style={{padding:'22px 24px'}}>
          {step===0&&S1()}
          {step===1&&S2()}
          {step===2&&S3()}
          {step===3&&S4()}
        </div>

        <div className="form-action-bar" style={{margin:0,padding:'14px 24px',borderTop:'1.5px solid var(--primary-50)'}}>
          <button className="btn btn-ghost" onClick={prev} disabled={step===0}>
            <ArrowLeft size={14}/> Previous
          </button>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {step<3
              ? <button className="btn btn-primary" onClick={next}>Next <ArrowRight size={14}/></button>
              : <>
                  <button className="btn btn-secondary" onClick={()=>submit(true)} disabled={saving}><Save size={14}/> Save Draft</button>
                  <button className="btn btn-primary" onClick={()=>submit(false)} disabled={saving}>
                    <FileText size={14}/> {saving?'Submitting…':'Submit Application'}
                  </button>
                </>
            }
          </div>
        </div>
      </div>
    </Layout>
  );
}
