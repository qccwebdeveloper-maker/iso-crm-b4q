import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, FTextarea, FSelect, SectionTitle, DynamicTable } from './QMSFormPage';

const ROLES = ['Lead Auditor','Auditor','Technical Expert','Observer','Guide'];
const CLAUSES_S1= [
  ['4.1 Understanding the Organization and its Context The organization shall determine whether climate change is a relevant issue'],[ '4.2 Needs and Expectations of Interested Parties Note Relevant interested partiees can have requirements related to climate change'],
  ['4.3 Scope of Management System'],[ '4.4 Management System and its Processes'],
  [ '5.1 Leadership and Commitment'],[ '5.2 Policy'],['5.3 Roles, Responsibilities and Authorities'],
  [ '6.1 Actions to Address Risks and Opportunities'],[ '6.2 Objectives and Planning to Achieve Them'],
  [ '6.3 Planning of Changes'],[ '7.1 Resources'],[ '7.2 Competence'],
  [ '7.3 Awareness'],[ '7.4 Communication'],[ '7.5 Documented Information'],
  [ '8.1 Operational Planning and Control'],[ '8.2 Requirements for Products and Services'],
  [ '8.3 Design and Development'],[ '8.4 Control of Externally Provided Processes'],
  [ '8.5 Production and Service Provision'],[ '8.6 Release of Products and Services'],
  ['8.7 Control of Nonconforming Outputs'],
  [ '9.1 Monitoring, Measurement, Analysis and Evaluation'],
   [ '9.2 Internal Audit'],[ '9.3 Management Review'],
  [ '10.1 Improvement / Continual Improvement'],
  [ '10.2 Nonconformity and Corrective Action'],
  [ '10.3 Continual Improvement '],
];


const EMPTY_TEAM  = { name: '', role: '', competency: '', manDays: '' };
const EMPTY_SCHED = { dayTime: '', clauses: '', standard: '', auditorName: '' };

const DEFAULT = {
  idNo: '', orgName: '', address: '', contactPerson: '', contactDetails: '',
  auditType: '', auditStandards: '', auditPlanDate: '',
  auditDateFrom: '', auditDateTo: '', modeOfAudit: '', onlineMeetingLink: '',
  scopeOfCertification: '', iafCode: '',
  auditObjectives: 'Judging the availability to 2nd assessment by checking system conformity and performance status regarding policy and objective.\n1. Conformity of documents regarding developed system.\n2. Review internal audit and management review records.\n3. Site-specific conditions, process and equipments used.\n4. Applicable statutory and regulatory requirements.',
  auditLanguage: 'English',
  auditTeam: [{ ...EMPTY_TEAM }],
  schedule: CLAUSES_S1.map(c => ({ dayTime: '', clauses: c, standard: 'ISO 9001', auditorName: '' })),
};

export default function Form05Stage1AuditPlan() {
  return (
    <QMSFormPage
      formType={5}
      formCode="AUD-F-05"
      formTitle="Audit Plan — Stage 1"
      defaultData={DEFAULT}
    >
      {({ data, set }) => {
        const setTeam = (ri, key, val) => {
          const t = [...(data.auditTeam || [])];
          t[ri] = { ...t[ri], [key]: val };
          set('auditTeam', t);
        };
        const setSched = (ri, key, val) => {
          const s = [...(data.schedule || [])];
          s[ri] = { ...s[ri], [key]: val };
          set('schedule', s);
        };
        return (
          <div>
            <SectionTitle>1. Plan Information</SectionTitle>
            <FormRow cols={2}>
              <FormField label="1.1 ID No." required>
                <FInput value={data.idNo} onChange={v => set('idNo', v)} placeholder="Client / Application ID" />
              </FormField>
              <FormField label="1.2 Organization Name" required>
                <FInput value={data.orgName} onChange={v => set('orgName', v)} placeholder="Organization name" />
              </FormField>
            </FormRow>
            <FormRow cols={1}>
              <FormField label="1.3 Address">
                <FTextarea value={data.address} onChange={v => set('address', v)} rows={2} placeholder="Address" />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.4 Contact Person">
                <FInput value={data.contactPerson} onChange={v => set('contactPerson', v)} placeholder="Contact person" />
              </FormField>
              <FormField label="Contact Details">
                <FInput value={data.contactDetails} onChange={v => set('contactDetails', v)} placeholder="+91 XXXXX / email" />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.5 Type of Audit">
                <FSelect value={data.auditType} onChange={v => set('auditType', v)} placeholder="Select type"
                  options={['Initial','Surveillance','Re-certification','Un-Announced','Follow-up']} />
              </FormField>
              <FormField label="1.6 Audit Standard(s)">
                <FInput value={data.auditStandards} onChange={v => set('auditStandards', v)} placeholder="ISO 9001:2015..." />
              </FormField>
            </FormRow>
            <FormRow cols={3}>
              <FormField label="1.7 Audit Plan Date">
                <FInput value={data.auditPlanDate} onChange={v => set('auditPlanDate', v)} type="date" />
              </FormField>
              <FormField label="1.8 Audit Date From">
                <FInput value={data.auditDateFrom} onChange={v => set('auditDateFrom', v)} type="date" />
              </FormField>
              <FormField label="Audit Date To">
                <FInput value={data.auditDateTo} onChange={v => set('auditDateTo', v)} type="date" />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.9 Mode of Audit">
                <FSelect value={data.modeOfAudit} onChange={v => set('modeOfAudit', v)} placeholder="Select mode" options={['Online','Onsite','Hybrid']} />
              </FormField>
              <FormField label="Online Meeting Link (if applicable)">
                <FInput value={data.onlineMeetingLink} onChange={v => set('onlineMeetingLink', v)} placeholder="https://..." />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.10 Scope of Certification">
                <FTextarea value={data.scopeOfCertification} onChange={v => set('scopeOfCertification', v)} rows={2} placeholder="Scope" />
              </FormField>
              <FormField label="1.11 Applicable IAF / EA Code">
                <FInput value={data.iafCode} onChange={v => set('iafCode', v)} placeholder="IAF / EA Code" />
              </FormField>
            </FormRow>
            <FormRow cols={1}>
              <FormField label="1.12 Audit Objectives">
                <FTextarea value={data.auditObjectives} onChange={v => set('auditObjectives', v)} rows={4} />
              </FormField>
            </FormRow>
            <FormRow cols={1}>
              <FormField label="1.13 Language of Audit">
                <FInput value={data.auditLanguage} onChange={v => set('auditLanguage', v)} placeholder="English" />
              </FormField>
            </FormRow>

            <SectionTitle>Audit Team Details</SectionTitle>
            <DynamicTable
              columns={[
                { key: 'name',       label: 'Name',            minWidth: 140 },
                { key: 'role',       label: 'Role',            type: 'select', options: ROLES },
                { key: 'competency', label: 'Competency / Standard', minWidth: 160 },
                { key: 'manDays',    label: 'Stage-1 Man-days', minWidth: 80 },
              ]}
              rows={data.auditTeam || []}
              onAdd={() => set('auditTeam', [...(data.auditTeam || []), { ...EMPTY_TEAM }])}
              onRemove={ri => set('auditTeam', (data.auditTeam || []).filter((_, i) => i !== ri))}
              onCellChange={setTeam}
              addLabel="Add Team Member"
            />

            <SectionTitle>Audit Schedule — Stage 1</SectionTitle>
            <DynamicTable
              columns={[
                { key: 'dayTime',    label: 'Day & Time (From–To)', minWidth: 160 },
                { key: 'clauses',    label: 'Clauses',             type: 'textarea', minWidth: 200 },
                { key: 'standard',   label: 'Standard',            minWidth: 100 },
                { key: 'auditorName',label: 'Auditor Name',        minWidth: 120 },
              ]}
              rows={data.schedule || []}
              onAdd={() => set('schedule', [...(data.schedule || []), { ...EMPTY_SCHED }])}
              onRemove={ri => set('schedule', (data.schedule || []).filter((_, i) => i !== ri))}
              onCellChange={setSched}
              addLabel="Add Schedule Row"
            />
          </div>
        );
      }}
    </QMSFormPage>
  );
}
