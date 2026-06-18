import React, { useEffect } from 'react';
import QMSFormPage, { FormRow, FormField, FInput, FTextarea, FSelect, SectionTitle, DynamicTable, StandardChips } from './QMSFormPage';
import useStandards, { clausesForStandards } from './useStandards';

const ROLES = ['Lead Auditor','Auditor','Technical Expert','Observer','Guide'];

const EMPTY_TEAM  = { name: '', role: '', stage2Days: '' };
const EMPTY_SCHED = { dayTime: '', clauses: '', auditorName: '' };

// Fixed standard statement — displayed read-only, not editable.
const AUDIT_OBJECTIVES = 'Judging the Management System by checking system conformity and performance status regarding objective evidence as per ISO 9001 Standard\na. To assess conformity of the Client\'s Management system with the audit criteria\nb. To assess capacity of the client\'s criteria to meet its Objectives\nc. To identify areas of improvement in the Clients premises\nd. To make appropriate recommendation to the CB regarding client\'s certification.';

const DEFAULT = {
  idNo: '', orgName: '', address: '', contactPerson: '', contactDetails: '',
  auditType: '', auditStandards: '', auditPlanDate: '',
  auditDateFrom: '', auditDateTo: '', modeOfAudit: '', onlineMeetingLink: '',
  iafCode: '',
  auditObjectives: AUDIT_OBJECTIVES,
  auditLanguage: 'English',
  auditTeam: [{ ...EMPTY_TEAM }],
  schedule: [],
};

export default function Form09Stage2AuditPlan() {
  return (
    <QMSFormPage
      formType={9}
      formCode="AUD-F-11"
      formTitle="Audit Plan — Stage 2"
      defaultData={DEFAULT}
    >
      {(props) => <Stage2PlanBody {...props} />}
    </QMSFormPage>
  );
}

function Stage2PlanBody({ data, set, clientInfo }) {
  const { byName, loading } = useStandards();
  const selectedStandard = data.auditStandards || clientInfo?.isoStandard || '';

  useEffect(() => {
    if (loading) return;
    if ((data.schedule || []).length) return;
    const cls = clausesForStandards(byName, selectedStandard);
    if (cls.length) {
      set('schedule', cls.map(c => ({ dayTime: '', clauses: `${c.no} ${c.text}`.trim(), auditorName: '' })));
    }
  }, [loading, selectedStandard]); // eslint-disable-line

  const setTeam  = (ri,k,v)=>{ const t=[...(data.auditTeam||[])]; t[ri]={...t[ri],[k]:v}; set('auditTeam',t); };
  const setSched = (ri,k,v)=>{ const t=[...(data.schedule||[])]; t[ri]={...t[ri],[k]:v}; set('schedule',t); };
  return (
          <div>
            <SectionTitle>1. Plan Information</SectionTitle>
            <FormRow cols={2}>
              <FormField label="1.1 ID No." required><FInput value={data.idNo} onChange={v=>set('idNo',v)} placeholder="Client ID" /></FormField>
              <FormField label="1.2 Organization Name" required><FInput value={data.orgName} onChange={v=>set('orgName',v)} /></FormField>
            </FormRow>
            <FormRow cols={1}><FormField label="1.3 Address"><FTextarea value={data.address} onChange={v=>set('address',v)} rows={2} /></FormField></FormRow>
            <FormRow cols={2}>
              <FormField label="1.4 Contact Person"><FInput value={data.contactPerson} onChange={v=>set('contactPerson',v)} /></FormField>
              <FormField label="Contact Details"><FInput value={data.contactDetails} onChange={v=>set('contactDetails',v)} /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.5 Type of Audit">
                <FSelect value={data.auditType} onChange={v=>set('auditType',v)} placeholder="Select type" options={['Initial','Surveillance','Re-certification','Special']} />
              </FormField>
              <FormField label="1.6 Audit Standard(s)"><StandardChips value={data.auditStandards} /></FormField>
            </FormRow>
            <FormRow cols={3}>
              <FormField label="1.7 Audit Plan Date"><FInput value={data.auditPlanDate} onChange={v=>set('auditPlanDate',v)} type="date" /></FormField>
              <FormField label="1.8 Audit Date From"><FInput value={data.auditDateFrom} onChange={v=>set('auditDateFrom',v)} type="date" /></FormField>
              <FormField label="Audit Date To"><FInput value={data.auditDateTo} onChange={v=>set('auditDateTo',v)} type="date" /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.9 Mode of Audit">
                <FSelect value={data.modeOfAudit} onChange={v=>set('modeOfAudit',v)} placeholder="Select" options={['Online','Onsite','Hybrid']} />
              </FormField>
              <FormField label="Online Meeting Link"><FInput value={data.onlineMeetingLink} onChange={v=>set('onlineMeetingLink',v)} placeholder="https://..." /></FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.10 Applicable IAF / EA Code"><FInput value={data.iafCode} onChange={v=>set('iafCode',v)} /></FormField>
              <FormField label="1.12 Language of Audit"><FInput value={data.auditLanguage} onChange={v=>set('auditLanguage',v)} placeholder="English" /></FormField>
            </FormRow>
            <FormRow cols={1}>
              <FormField label="1.11 Audit Objectives">
                <div className="qms-readonly-block">{data.auditObjectives || AUDIT_OBJECTIVES}</div>
              </FormField>
            </FormRow>

            <SectionTitle>Audit Team Details</SectionTitle>
            <DynamicTable
              columns={[{key:'name',label:'Name',minWidth:140},{key:'role',label:'Role',type:'select',options:ROLES},{key:'stage2Days',label:'Stage-2 Man-days',minWidth:100}]}
              rows={data.auditTeam||[]} onAdd={()=>set('auditTeam',[...(data.auditTeam||[]),{...EMPTY_TEAM}])}
              onRemove={ri=>set('auditTeam',(data.auditTeam||[]).filter((_,i)=>i!==ri))} onCellChange={setTeam} addLabel="Add Team Member" />

            <SectionTitle>Audit Schedule — Stage 2</SectionTitle>
            <DynamicTable
              columns={[{key:'dayTime',label:'Day & Time (From–To)',minWidth:160},{key:'clauses',label:'Clauses',type:'textarea',minWidth:220},{key:'auditorName',label:'Auditor Name',minWidth:120}]}
              rows={data.schedule||[]} onAdd={()=>set('schedule',[...(data.schedule||[]),{...EMPTY_SCHED}])}
              onRemove={ri=>set('schedule',(data.schedule||[]).filter((_,i)=>i!==ri))} onCellChange={setSched} addLabel="Add Schedule Row" />
          </div>
  );
}
