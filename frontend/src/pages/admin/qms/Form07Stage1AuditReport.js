import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, FTextarea, FSelect, FRadioGroup, SectionTitle, DynamicTable } from './QMSFormPage';

const ROLES = ['Lead Auditor','Auditor','Technical Expert'];
const NC_TYPES = ['Minor NC','Major NC','Observation','OFI'];
const REC_OPTS = [
  { value: 'proceed', label: 'Recommended proceeding with Stage 2 within agreed timeframe after review of Stage-1 audit results.' },
  { value: 'pending', label: 'Recommended not proceeding to Stage 2 until audit evidence has been submitted showing that concerns have been rectified.' },
  { value: 'repeat',  label: 'Recommended not proceeding without a further Stage 1 audit due to severity of concerns raised.' },
];
const CLAUSES = [
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
const CONFORMITY = ['C','NC','O','OFI','N/A'];

const buildChecklist = () => CLAUSES.map(([no, desc]) => ({ clause: no, description: desc, done: false, conformity: 'C', finding: '' }));

const DEFAULT = {
  idNo: '', isoStandards: '', orgName: '', auditLanguage: 'English', address: '',
  modeOfAudit: '', contactPerson: '', onlineMeetingLink: '',
  contactDetails: '', auditDates: '', auditType: '', stage1Duration: '',
  scopeOfCertification: '', iafCode: '', quotedManDaysAdequate: '',
  auditStandards: '',
  auditTeam: [{ name: '', role: '', standard: '', stage1MD: '' }],
  briefAboutOrg: '',
  auditDurationChange: '', employeeDetailChange: '', scopeChange: '', additionalInfo: '',
  nonConformitiesRaised: '',
  minorNC: '0', majorNC: '0', observations: '0', ofi: '0', overallReadiness: '',
  recommendation: '',
  ncList: [],
  observationList: [],
  ofiList: [],
  checklist: buildChecklist(),
};

export default function Form07Stage1AuditReport() {
  return (
    <QMSFormPage
      formType={7}
      formCode="AUD-F-09"
      formTitle="Stage-1 Audit Report — Quality Management System"
      defaultData={DEFAULT}
    >
      {({ data, set }) => {
        const setTeam = (ri, k, v) => { const t=[...(data.auditTeam||[])]; t[ri]={...t[ri],[k]:v}; set('auditTeam',t); };
        const setNC   = (ri, k, v) => { const t=[...(data.ncList||[])]; t[ri]={...t[ri],[k]:v}; set('ncList',t); };
        const setObs  = (ri, k, v) => { const t=[...(data.observationList||[])]; t[ri]={...t[ri],[k]:v}; set('observationList',t); };
        const setOFI  = (ri, k, v) => { const t=[...(data.ofiList||[])]; t[ri]={...t[ri],[k]:v}; set('ofiList',t); };
        const setCL   = (ri, k, v) => { const t=[...(data.checklist||[])]; t[ri]={...t[ri],[k]:v}; set('checklist',t); };
        return (
          <div>
            <SectionTitle>1. Organization & Audit Details</SectionTitle>
            <FormRow cols={2}>
              <FormField label="1.1 ID No." required><FInput value={data.idNo} onChange={v=>set('idNo',v)} placeholder="Client ID" /></FormField>
              <FormField label="ISO Standards"><FInput value={data.isoStandards} onChange={v=>set('isoStandards',v)} placeholder="ISO 9001:2015..." /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.2 Organization Name" required><FInput value={data.orgName} onChange={v=>set('orgName',v)} /></FormField>
              <FormField label="Language of Audit"><FInput value={data.auditLanguage} onChange={v=>set('auditLanguage',v)} placeholder="English" /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.3 Address"><FTextarea value={data.address} onChange={v=>set('address',v)} rows={2} /></FormField>
              <FormField label="Mode of Audit">
                <FSelect value={data.modeOfAudit} onChange={v=>set('modeOfAudit',v)} placeholder="Select" options={['Online','Onsite','Hybrid']} />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.4 Contact Person"><FInput value={data.contactPerson} onChange={v=>set('contactPerson',v)} /></FormField>
              <FormField label="Online Meeting Link"><FInput value={data.onlineMeetingLink} onChange={v=>set('onlineMeetingLink',v)} placeholder="https://..." /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.5 Contact Details"><FInput value={data.contactDetails} onChange={v=>set('contactDetails',v)} /></FormField>
              <FormField label="Audit Dates"><FInput value={data.auditDates} onChange={v=>set('auditDates',v)} placeholder="DD Mon - DD Mon YYYY" /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.6 Type of Audit">
                <FSelect value={data.auditType} onChange={v=>set('auditType',v)} placeholder="Select" options={['Initial','Surveillance','Re-certification']} />
              </FormField>
              <FormField label="Stage-1 Audit Duration"><FInput value={data.stage1Duration} onChange={v=>set('stage1Duration',v)} placeholder="e.g. 1 day" /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.7 Scope of Certification"><FTextarea value={data.scopeOfCertification} onChange={v=>set('scopeOfCertification',v)} rows={2} /></FormField>
              <FormField label="Applicable IAF / EA Code"><FInput value={data.iafCode} onChange={v=>set('iafCode',v)} /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.8 Audit Standard(s)"><FInput value={data.auditStandards} onChange={v=>set('auditStandards',v)} /></FormField>
              <FormField label="Quoted Man-days Adequate?">
                <FRadioGroup value={data.quotedManDaysAdequate} onChange={v=>set('quotedManDaysAdequate',v)} options={[{value:'Yes',label:'Yes'},{value:'No',label:'No'}]} />
              </FormField>
            </FormRow>

            <SectionTitle>2. Audit Team Details</SectionTitle>
            <DynamicTable
              columns={[{key:'name',label:'Name',minWidth:140},{key:'role',label:'Role',type:'select',options:ROLES},{key:'standard',label:'Standard / Competency',minWidth:160},{key:'stage1MD',label:'Stage-1 MD',minWidth:80}]}
              rows={data.auditTeam||[]} onAdd={()=>set('auditTeam',[...(data.auditTeam||[]),{name:'',role:'',standard:'',stage1MD:''}])}
              onRemove={ri=>set('auditTeam',(data.auditTeam||[]).filter((_,i)=>i!==ri))} onCellChange={setTeam} addLabel="Add Member" />

            <SectionTitle>Brief About the Organization</SectionTitle>
            <FTextarea value={data.briefAboutOrg} onChange={v=>set('briefAboutOrg',v)} rows={4} placeholder="Brief organizational overview..." />

            <SectionTitle>Changes & Summary</SectionTitle>
            <FormRow cols={2}>
              <FormField label="Audit Duration for Stage 1"><FInput value={data.auditDurationChange} onChange={v=>set('auditDurationChange',v)} /></FormField>
              <FormField label="Any change in employee details?"><FInput value={data.employeeDetailChange} onChange={v=>set('employeeDetailChange',v)} placeholder="Yes / No / Details" /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="Any change in Scope?"><FInput value={data.scopeChange} onChange={v=>set('scopeChange',v)} placeholder="Yes / No" /></FormField>
              <FormField label="Non-Conformities Raised"><FInput value={data.nonConformitiesRaised} onChange={v=>set('nonConformitiesRaised',v)} /></FormField>
            </FormRow>
            <FormRow cols={1}>
              <FormField label="Additional Information"><FTextarea value={data.additionalInfo} onChange={v=>set('additionalInfo',v)} rows={2} /></FormField>
            </FormRow>

            <SectionTitle>Non-Conformity / Observation Summary</SectionTitle>
            <FormRow cols={4}>
              <FormField label="Minor NC"><FInput value={data.minorNC} onChange={v=>set('minorNC',v)} type="number" placeholder="0" /></FormField>
              <FormField label="Major NC"><FInput value={data.majorNC} onChange={v=>set('majorNC',v)} type="number" placeholder="0" /></FormField>
              <FormField label="Observations"><FInput value={data.observations} onChange={v=>set('observations',v)} type="number" placeholder="0" /></FormField>
              <FormField label="OFI"><FInput value={data.ofi} onChange={v=>set('ofi',v)} type="number" placeholder="0" /></FormField>
            </FormRow>
            <FormRow cols={1}>
              <FormField label="Overall Readiness %"><FInput value={data.overallReadiness} onChange={v=>set('overallReadiness',v)} placeholder="e.g. 85%" /></FormField>
            </FormRow>

            <SectionTitle>Recommendation</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {REC_OPTS.map(o => (
                <label key={o.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${data.recommendation===o.value?'var(--primary)':'#e2e8f0'}`, background: data.recommendation===o.value?'#fff7ed':'white', cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" value={o.value} checked={data.recommendation===o.value} onChange={()=>set('recommendation',o.value)} style={{marginTop:2}} />
                  {o.label}
                </label>
              ))}
            </div>

            <div style={{ margin: '16px 0', padding: '12px 16px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
              <strong>Disclaimer:</strong> This audit has been conducted on a sampling basis of the available information, documents, records, processes and activities reviewed during the audit. The audit findings are based only on the evidence verified at the time of audit and do not guarantee detection of all possible nonconformities or system weaknesses.
            </div>

            <SectionTitle>3. Non-Conformities Overview</SectionTitle>
            <DynamicTable
              columns={[{key:'sNo',label:'S.No.',minWidth:50},{key:'standard',label:'MS Standard',minWidth:120},{key:'type',label:'Type',type:'select',options:NC_TYPES},{key:'clause',label:'Clause No.',minWidth:80},{key:'details',label:'Details of NC',type:'textarea',minWidth:200}]}
              rows={data.ncList||[]} onAdd={()=>set('ncList',[...(data.ncList||[]),{sNo:String((data.ncList||[]).length+1),standard:'ISO 9001:2015',type:'Minor NC',clause:'',details:''}])}
              onRemove={ri=>set('ncList',(data.ncList||[]).filter((_,i)=>i!==ri))} onCellChange={setNC} addLabel="Add NC" />

            <SectionTitle>Observations Overview</SectionTitle>
            <DynamicTable
              columns={[{key:'sNo',label:'S.No.',minWidth:50},{key:'standard',label:'MS Standard',minWidth:120},{key:'clause',label:'Clause No.',minWidth:80},{key:'details',label:'Details',type:'textarea',minWidth:200}]}
              rows={data.observationList||[]} onAdd={()=>set('observationList',[...(data.observationList||[]),{sNo:String((data.observationList||[]).length+1),standard:'ISO 9001:2015',clause:'',details:''}])}
              onRemove={ri=>set('observationList',(data.observationList||[]).filter((_,i)=>i!==ri))} onCellChange={setObs} addLabel="Add Observation" />

            <SectionTitle>4. Opportunities for Improvement (OFI)</SectionTitle>
            <DynamicTable
              columns={[{key:'sNo',label:'S.No.',minWidth:50},{key:'standard',label:'MS Standard',minWidth:120},{key:'clause',label:'Clause',minWidth:80},{key:'ofi',label:'Opportunity for Improvement',type:'textarea',minWidth:200}]}
              rows={data.ofiList||[]} onAdd={()=>set('ofiList',[...(data.ofiList||[]),{sNo:String((data.ofiList||[]).length+1),standard:'ISO 9001:2015',clause:'',ofi:''}])}
              onRemove={ri=>set('ofiList',(data.ofiList||[]).filter((_,i)=>i!==ri))} onCellChange={setOFI} addLabel="Add OFI" />

            <SectionTitle>5. Stage-1 Audit Checklist</SectionTitle>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Clause','Description','Done?','Conformity','Finding'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.checklist || buildChecklist()).map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', background: ri%2===0?'white':'#fafafa' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--primary-dark)', whiteSpace: 'nowrap' }}>{row.clause}</td>
                      <td style={{ padding: '6px 10px', fontSize: 12, whiteSpace: 'pre-line', lineHeight: 1.55 }}>{row.description}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <input type="checkbox" checked={row.done||false} onChange={e=>setCL(ri,'done',e.target.checked)} />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <select value={row.conformity||'C'} onChange={e=>setCL(ri,'conformity',e.target.value)}
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
