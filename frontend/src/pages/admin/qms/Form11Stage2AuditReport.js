import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, FTextarea, FSelect, SectionTitle, DynamicTable } from './QMSFormPage';

const ROLES = ['Lead Auditor','Auditor','Technical Expert'];
const NC_TYPES = ['Minor NC','Major NC'];
const CONFORMITY = ['C','NC','O','OFI','N/A'];
const CLAUSES_S2 = [
  ['4.1','4.1 Understanding the Organization and its Context\nThe organization shall determine whether climate change is a relevant issue'],
  ['4.2','4.2 Needs and Expectations of Interested Parties\nNOTE: Relevant interested parties can have requirements related to climate change'],
  ['4.3','4.3 Scope of Management System'],
  ['4.4','4.4 Management System and its Processes'],
  ['5.1','5.1 Leadership and commitment\n5.1.1 General\n5.1.2 Customer focus'],
  ['5.2','5.2 Policy\n5.2.1 Establishing the quality policy\n5.2.2 Communicating the quality policy'],
  ['5.3','5.3 Organizational roles, responsibilities and authorities'],
  ['6.1','6.1 Actions to address risks and opportunities'],
  ['6.2','6.2 Quality objectives and planning to achieve them'],
  ['6.3','6.3 Planning of changes'],
  ['7.1','7.1 Resources\n7.1.1 General  7.1.2 People  7.1.3 Infrastructure\n7.1.4 Environment for the operation of processes\n7.1.5 Monitoring and measuring resources  7.1.6 Organizational knowledge'],
  ['7.2','7.2 Competence'],
  ['7.3','7.3 Awareness'],
  ['7.4','7.4 Communication'],
  ['7.5','7.5 Documented information\n7.5.1 General  7.5.2 Creating and updating  7.5.3 Control of documented information'],
  ['8.1','8.1 Operational planning and control'],
  ['8.2','8.2 Requirements for products and services\n8.2.1 Customer communication  8.2.2 Determining the requirements\n8.2.3 Review of the requirements  8.2.4 Changes to requirements'],
  ['8.3','8.3 Design and development of products and services\n8.3.1–8.3.6 General through Design and development changes'],
  ['8.4','8.4 Control of externally provided processes, products and services\n8.4.1 General  8.4.2 Type and extent of control  8.4.3 Information for external providers'],
  ['8.5','8.5 Production and service provision\n8.5.1–8.5.6 Control through Control of changes'],
  ['8.6','8.6 Release of products and services'],
  ['8.7','8.7 Control of nonconforming outputs'],
  ['9.1','9.1 Monitoring, measurement, analysis and evaluation\n9.1.1 General  9.1.2 Customer satisfaction  9.1.3 Analysis and evaluation'],
  ['9.2','9.2 Internal audit\n9.2.1 General  9.2.2 Internal audit programme'],
  ['9.3','9.3 Management review\n9.3.1 General  9.3.2 Management review inputs  9.3.3 Management review outputs'],
  ['10.1','10.1 General'],
  ['10.2','10.2 Nonconformity and corrective action'],
  ['10.3','10.3 Continual improvement'],
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
              <FormField label="1.6 Audit Standard(s)"><FInput value={data.auditStandards} onChange={v=>set('auditStandards',v)} /></FormField>
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
                    {['Clause','Description','Done?','C/NC/O/OFI','Finding'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                  <tr style={{ background: '#f1f5f9', fontSize: 10, color: '#9ca3af' }}>
                    <th style={{ padding: '4px 10px' }}></th>
                    <th style={{ padding: '4px 10px' }}>☑ Done / ☐ Not Done / N/A Not Applicable</th>
                    <th style={{ padding: '4px 10px' }}></th>
                    <th style={{ padding: '4px 10px' }}>C–Conformity NC–Non Conformity O–Observation OFI–Opportunity N/A–Not Applicable</th>
                    <th style={{ padding: '4px 10px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(data.checklist || buildChecklist()).map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', background: ri%2===0?'white':'#fafafa' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--primary-dark)', whiteSpace: 'nowrap' }}>{row.clause}</td>
                      <td style={{ padding: '6px 10px', fontSize: 11.5, whiteSpace: 'pre-line', maxWidth: 340 }}>{row.description}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                        <input type="checkbox" checked={!!row.done} onChange={e=>setCL(ri,'done',e.target.checked)} />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <select value={row.conformity||'N/A'} onChange={e=>setCL(ri,'conformity',e.target.value)}
                          style={{ padding: '4px 6px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none', background: 'white' }}>
                          {CONFORMITY.map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input type="text" value={row.finding||''} onChange={e=>setCL(ri,'finding',e.target.value)}
                          placeholder="Finding..." style={{ padding: '4px 8px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none', width: '100%', minWidth: 160 }} />
                      </td>
                    </tr>
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
