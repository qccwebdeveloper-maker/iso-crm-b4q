import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, FTextarea, FSelect, SectionTitle, DynamicTable, StandardChips } from './QMSFormPage';

const ROLES = ['Lead Auditor','Auditor','Technical Expert'];
const NC_TYPES = ['Minor NC','Major NC'];
const CONFORMITY = ['C','NC','O','OFI','N/A'];
const CLAUSES_S2 = [
  ['4.1','4.1 Understanding the Organization and its Context The organization shall determine whether climate change is a relevant issue'],['4.2','4.2 Needs and Expectations of Interested Parties Note Relevant interested partiees can have requirements related to climate change'],
  ['4.3','4.3 Scope of Management System'],['4.4','4.4 Management System and its Processes'],
  ['5.1','5.1 Leadership and Commitment'],['5.2','5.2 Policy'],['5.3','5.3 Roles, Responsibilities and Authorities'],
  ['6.1','6.1 Actions to Address Risks and Opportunities'],['6.2','6.2 Objectives and Planning to Achieve Them'],
  ['6.3','6.3 Planning of Changes'],['7.1','7.1 Resources'],['7.2','7.2 Competence'],
  ['7.3','7.3 Awareness'],['7.4','7.4 Communication'],['7.5','7.5 Documented Information'],
  ['8.1','8.1 Operational Planning and Control'],['8.2','8.2 Requirements for Products and Services'],
  ['8.3','8.3 Design and Development'],['8.4','8.4 Control of Externally Provided Processes'],
  ['8.5','8.5 Production and Service Provision'],['8.6','8.6 Release of Products and Services'],
  ['8.7','8.7 Control of Nonconforming Outputs'],
  ['9.1','9.1 Monitoring, Measurement, Analysis and Evaluation'],
   ['9.2','9.2 Internal Audit'],['9.3','9.3 Management Review'],
  ['10.1','10.1 Improvement / Continual Improvement'],
  ['10.2','10.2 Nonconformity and Corrective Action'],
  ['10.3','10.3 Continual Improvement '],
];

const buildChecklist = () => CLAUSES_S2.map(([no,desc]) => ({ clause: no, description: desc, done: false, conformity: 'N/A', finding: '' }));
const SURV_CHECKS = [
  'Closure of Previous NC & its effectiveness',
  'Compliance of use of QCC logo/marks & Applicable AB logo / marks, if applicable',
  'Any changes with respect to management system',
  'Any Complaints / interested party feedback',
  'Any Change in Scope',  
  'Any additional Information',
];

const DEFAULT = {
  idNo: '', orgName: '', address: '', contactPerson: '', contactDetails: '',
  auditType: 'Stage II', auditStandards: 'ISO 9001', modeOfAudit: '',
  onlineMeetingLink: '', scopeOfCertification: '', iafCode: '',
  auditLanguage: 'English', auditDates: '',
  auditTeam: [{ name: '', role: '', competency: '', stage2MD: '' }],
  auditObjectives: '',
  auditCriteria: '',
  deviationFromPlan: '',
  significantIssues: '',
  significantChanges: '',
  survChecks: Object.fromEntries(SURV_CHECKS.map((_, i) => [`check_${i}`, 'N/A'])),
  minorNC: '0', majorNC: '0', observations: '0', ofi: '0',
  recommendation: '',
  proposedNextAuditDate: '',
  resultsEvaluation: '',
  ncList: [],
  observationList: [],
  ofiList: [],
  checklist: buildChecklist(),
};

const REC_OPTS = [
  { value: 'certified',   label: 'Recommended for Certification — The QMS complies with requirements.' },
  { value: 'minor_nc',    label: 'Recommended with Minor NC — Certification recommended upon off-site verification within 60 days.' },
  { value: 'major_nc',    label: 'Not recommended due to Major NC — Follow-up assessment required within 60 days.' },
  { value: 'suspend',     label: 'Not Recommended / Suspension / Withdrawal / Surveillance / Re-Certification.' },
];

export default function Form11Stage2AuditReport() {
  return (
    <QMSFormPage
      formType={11}
      formCode="AUD-F-15"
      formTitle="Stage 2 / Surveillance / Recertification Audit Report"
      defaultData={DEFAULT}
    >
      {({ data, set }) => {
        const setTeam = (ri,k,v)=>{ const t=[...(data.auditTeam||[])]; t[ri]={...t[ri],[k]:v}; set('auditTeam',t); };
        const setNC   = (ri,k,v)=>{ const t=[...(data.ncList||[])]; t[ri]={...t[ri],[k]:v}; set('ncList',t); };
        const setObs  = (ri,k,v)=>{ const t=[...(data.observationList||[])]; t[ri]={...t[ri],[k]:v}; set('observationList',t); };
        const setOFI  = (ri,k,v)=>{ const t=[...(data.ofiList||[])]; t[ri]={...t[ri],[k]:v}; set('ofiList',t); };
        const setCL   = (ri,k,v)=>{ const t=[...(data.checklist||buildChecklist())]; t[ri]={...t[ri],[k]:v}; set('checklist',t); };
        const survChecks = data.survChecks || {};
        return (
          <div>
            <SectionTitle>1. Organization & Audit Details</SectionTitle>
            <FormRow cols={2}>
              <FormField label="1.1 ID No." required><FInput value={data.idNo} onChange={v=>set('idNo',v)} /></FormField>
              <FormField label="1.2 Organization Name" required><FInput value={data.orgName} onChange={v=>set('orgName',v)} /></FormField>
            </FormRow>
            <FormRow cols={1}><FormField label="1.3 Address"><FTextarea value={data.address} onChange={v=>set('address',v)} rows={2} /></FormField></FormRow>
            <FormRow cols={2}>
              <FormField label="1.4 Contact Person"><FInput value={data.contactPerson} onChange={v=>set('contactPerson',v)} /></FormField>
              <FormField label="Contact Details"><FInput value={data.contactDetails} onChange={v=>set('contactDetails',v)} /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.5 Type of Audit">
                <FSelect value={data.auditType} onChange={v=>set('auditType',v)} placeholder="Select" options={['Stage II','Surveillance','Recertification','Special Audit']} />
              </FormField>
              <FormField label="1.6 Audit Standard(s)"><StandardChips value={data.auditStandards} /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.7 Mode of Audit">
                <FSelect value={data.modeOfAudit} onChange={v=>set('modeOfAudit',v)} placeholder="Select" options={['Online','Onsite','Hybrid']} />
              </FormField>
              <FormField label="1.8 Online Meeting Link"><FInput value={data.onlineMeetingLink} onChange={v=>set('onlineMeetingLink',v)} placeholder="https://..." /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.9 Scope of Certification"><FTextarea value={data.scopeOfCertification} onChange={v=>set('scopeOfCertification',v)} rows={2} /></FormField>
              <FormField label="1.10 Applicable IAF / EA Code"><FInput value={data.iafCode} onChange={v=>set('iafCode',v)} /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.11 Language of Audit"><FInput value={data.auditLanguage} onChange={v=>set('auditLanguage',v)} placeholder="English" /></FormField>
              <FormField label="1.12 Audit Dates"><FInput value={data.auditDates} onChange={v=>set('auditDates',v)} placeholder="DD Mon - DD Mon YYYY" /></FormField>
            </FormRow>

            <SectionTitle>2. Audit Team Details</SectionTitle>
            <DynamicTable
              columns={[{key:'name',label:'Name',minWidth:140},{key:'role',label:'Role',type:'select',options:ROLES},{key:'competency',label:'Competency Standard(s)',minWidth:160},{key:'stage2MD',label:'Stage-2 MD',minWidth:80}]}
              rows={data.auditTeam||[]} onAdd={()=>set('auditTeam',[...(data.auditTeam||[]),{name:'',role:'',competency:'',stage2MD:''}])}
              onRemove={ri=>set('auditTeam',(data.auditTeam||[]).filter((_,i)=>i!==ri))} onCellChange={setTeam} addLabel="Add Member" />

            <div style={{ margin: '16px 0', padding: '12px 16px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
              <strong>Disclaimer:</strong> This audit has been conducted on a sampling basis of the available information, documents, records, processes and activities reviewed during the audit. The audit findings are based only on the evidence verified at the time of audit and do not guarantee detection of all possible nonconformities or system weaknesses.
            </div>

            <SectionTitle>Audit Context</SectionTitle>
            <FormRow cols={1}><FormField label="Audit Objectives"><FTextarea value={data.auditObjectives} onChange={v=>set('auditObjectives',v)} rows={3} placeholder="Describe audit objectives..." /></FormField></FormRow>
            <FormRow cols={1}><FormField label="Audit Criteria"><FTextarea value={data.auditCriteria} onChange={v=>set('auditCriteria',v)} rows={3} placeholder="Applicable criteria..." /></FormField></FormRow>
            <FormRow cols={2}>
              <FormField label="Any deviation from the audit plan?"><FTextarea value={data.deviationFromPlan} onChange={v=>set('deviationFromPlan',v)} rows={2} /></FormField>
              <FormField label="Significant issues impacting audit programme?"><FTextarea value={data.significantIssues} onChange={v=>set('significantIssues',v)} rows={2} /></FormField>
            </FormRow>
            <FormRow cols={1}><FormField label="Significant changes affecting management system since last audit"><FTextarea value={data.significantChanges} onChange={v=>set('significantChanges',v)} rows={2} /></FormField></FormRow>

            <SectionTitle>Surveillance / Recertification Verification</SectionTitle>
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0', minWidth: 320 }}>Verification Item</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0', minWidth: 200 }}>Status / Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {SURV_CHECKS.map((check, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i%2===0?'white':'#fafafa' }}>
                      <td style={{ padding: '8px 12px', fontSize: 13 }}>{check}</td>
                      <td style={{ padding: '6px 8px' }}>
                        <input type="text" value={survChecks[`check_${i}`] || 'N/A'} onChange={e=>set('survChecks',{...survChecks,[`check_${i}`]:e.target.value})}
                          style={{ padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SectionTitle>Non-Conformities Summary</SectionTitle>
            <FormRow cols={4}>
              <FormField label="Minor NC"><FInput value={data.minorNC} onChange={v=>set('minorNC',v)} type="number" placeholder="0" /></FormField>
              <FormField label="Major NC"><FInput value={data.majorNC} onChange={v=>set('majorNC',v)} type="number" placeholder="0" /></FormField>
              <FormField label="Observations"><FInput value={data.observations} onChange={v=>set('observations',v)} type="number" placeholder="0" /></FormField>
              <FormField label="OFI"><FInput value={data.ofi} onChange={v=>set('ofi',v)} type="number" placeholder="0" /></FormField>
            </FormRow>

            <SectionTitle>Recommendation</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {REC_OPTS.map(o => (
                <label key={o.value} style={{ display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',borderRadius:8,border:`1.5px solid ${data.recommendation===o.value?'var(--primary)':'#e2e8f0'}`,background:data.recommendation===o.value?'#fff7ed':'white',cursor:'pointer',fontSize:13 }}>
                  <input type="radio" value={o.value} checked={data.recommendation===o.value} onChange={()=>set('recommendation',o.value)} style={{marginTop:2}} />
                  {o.label}
                </label>
              ))}
            </div>
            <FormRow cols={1} style={{marginTop:16}}>
              <FormField label="Proposed Next Audit Date (Surveillance / Re-certification)">
                <FInput value={data.proposedNextAuditDate} onChange={v=>set('proposedNextAuditDate',v)} type="date" />
              </FormField>
            </FormRow>

            <SectionTitle>3. Non-Conformities Overview</SectionTitle>
            <DynamicTable
              columns={[{key:'sNo',label:'S.No.',minWidth:50},{key:'standard',label:'MS Standard',minWidth:120},{key:'type',label:'Type of NC',type:'select',options:NC_TYPES},{key:'clause',label:'Clause No.',minWidth:80},{key:'details',label:'Details of NC',type:'textarea',minWidth:200}]}
              rows={data.ncList||[]} onAdd={()=>set('ncList',[...(data.ncList||[]),{sNo:String((data.ncList||[]).length+1),standard:'ISO 9001:2015',type:'Minor NC',clause:'',details:''}])}
              onRemove={ri=>set('ncList',(data.ncList||[]).filter((_,i)=>i!==ri))} onCellChange={setNC} addLabel="Add NC" />

            <SectionTitle>Observations Overview</SectionTitle>
            <DynamicTable
              columns={[{key:'sNo',label:'S.No.',minWidth:50},{key:'standard',label:'MS Standard',minWidth:120},{key:'clause',label:'Clause No.',minWidth:80},{key:'details',label:'Details',type:'textarea',minWidth:200}]}
              rows={data.observationList||[]} onAdd={()=>set('observationList',[...(data.observationList||[]),{sNo:String((data.observationList||[]).length+1),standard:'ISO 9001:2015',clause:'',details:''}])}
              onRemove={ri=>set('observationList',(data.observationList||[]).filter((_,i)=>i!==ri))} onCellChange={setObs} addLabel="Add Observation" />

            <SectionTitle>4. Opportunities for Improvement (OFI)</SectionTitle>
            <DynamicTable
              columns={[{key:'sNo',label:'S.No.',minWidth:50},{key:'ofi',label:'Opportunity for Improvement',type:'textarea',minWidth:240},{key:'standard',label:'MS Standard',minWidth:120},{key:'clause',label:'Relevant Clause',minWidth:100}]}
              rows={data.ofiList||[]} onAdd={()=>set('ofiList',[...(data.ofiList||[]),{sNo:String((data.ofiList||[]).length+1),ofi:'',standard:'ISO 9001:2015',clause:''}])}
              onRemove={ri=>set('ofiList',(data.ofiList||[]).filter((_,i)=>i!==ri))} onCellChange={setOFI} addLabel="Add OFI" />

            <SectionTitle>Results of Evaluation of Management System Documents and Implementation</SectionTitle>
            <FormRow cols={1}>
              <FormField label="Results of the evaluation of management system documents and their implementation">
                <FTextarea value={data.resultsEvaluation} onChange={v=>set('resultsEvaluation',v)} rows={4}
                  placeholder="Summarise findings from evaluation of management system documents and observed implementation..." />
              </FormField>
            </FormRow>

 
 
    

            <SectionTitle>5. Quality Stage-2 Audit Checklist</SectionTitle>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Clause','Description','C/NC/O/OFI'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                  <tr style={{ background: '#f1f5f9', fontSize: 10, color: '#9ca3af' }}>
                    <th style={{ padding: '4px 10px' }}></th>
                    <th style={{ padding: '4px 10px' }}></th>
                    <th style={{ padding: '4px 10px' }}>C–Conformity NC–Non Conformity O–Observation OFI–Opportunity N/A–Not Applicable</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.checklist || buildChecklist()).map((row, ri) => (
                    <React.Fragment key={ri}>
                      <tr style={{ background: ri%2===0?'white':'#fafafa' }}>
                        <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--primary-dark)', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{row.clause}</td>
                        <td style={{ padding: '6px 10px', fontSize: 11.5, whiteSpace: 'pre-line', maxWidth: 340, verticalAlign: 'top' }}>{row.description}</td>
                        <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>
                          <select value={row.conformity||'N/A'} onChange={e=>setCL(ri,'conformity',e.target.value)}
                            style={{ padding: '4px 6px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none', background: 'white' }}>
                            {CONFORMITY.map(c=><option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', background: ri%2===0?'white':'#fafafa' }}>
                        <td colSpan={3} style={{ padding: '0 10px 10px' }}>
                          <textarea value={row.finding||''}
                            onChange={e=>setCL(ri,'finding',e.target.value)}
                            onInput={e=>{ e.target.style.height='auto'; e.target.style.height=e.target.scrollHeight+'px'; }}
                            ref={el=>{ if(el){ el.style.height='auto'; el.style.height=el.scrollHeight+'px'; } }}
                            rows={2}
                            placeholder="Finding / evidence / notes..."
                            style={{ padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none', width: '100%', resize: 'none', overflow: 'hidden', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }} />
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }}
    </QMSFormPage>
  );
}
