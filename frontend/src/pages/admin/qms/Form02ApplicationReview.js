import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, FTextarea, FSelect, FRadioGroup, SectionTitle, DynamicTable } from './QMSFormPage';

const YN = [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }];
const RISK = ['High (H)','Medium (M)','Low (L)'];
const ROLES = ['Lead Auditor','Auditor','Technical Expert','Application Reviewer','Report Reviewer','HOD'];

const EMPTY_AUDITOR = { name: '', role: '', stage1Days: '', stage2Days: '' };

const DEFAULT = {
  idNo: '', orgName: '', address: '', contactPerson: '', contactNumbers: '',
  noOfPersons: '', auditTypeStage1: 'Stage I', auditTypeStage2: 'Stage II',
  auditStandards: '', modeOfAudit: '', onlineMeetingLink: '',
  scopeOfCertification: '', auditLanguage: 'English', iafCode: '',
  transferNCClosed: '', transferReason: '', transferFromIAFCB: '', certValidityDate: '',
  risk: '',
  auditTeam: [{ ...EMPTY_AUDITOR }, { ...EMPTY_AUDITOR }],
  totalMandays: '', totalMandaysS1S2: '', totalMandaysIAF: '',
  stage1DateFrom: '', stage1DateTo: '', stage2DateFrom: '', stage2DateTo: '',
  reviewerName: '', verificationName: '', reviewDate: '',
};

export default function Form02ApplicationReview() {
  return (
    <QMSFormPage
      formType={2}
      formCode="AUD-F-03"
      formTitle="Application Review & Audit Planning"
      defaultData={DEFAULT}
    >
      {({ data, set }) => {
        const setTeam = (ri, key, val) => {
          const t = [...(data.auditTeam || [])];
          t[ri] = { ...t[ri], [key]: val };
          set('auditTeam', t);
        };
        return (
          <div>
            <SectionTitle>Organization Information</SectionTitle>
            <FormRow cols={2}>
              <FormField label="ID No." required>
                <FInput value={data.idNo} onChange={v => set('idNo', v)} placeholder="Client / Application ID" />
              </FormField>
              <FormField label="Organization Name" required>
                <FInput value={data.orgName} onChange={v => set('orgName', v)} placeholder="Organization name" />
              </FormField>
            </FormRow>
            <FormRow cols={1}>
              <FormField label="Address">
                <FTextarea value={data.address} onChange={v => set('address', v)} rows={2} placeholder="Address" />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="Contact Person">
                <FInput value={data.contactPerson} onChange={v => set('contactPerson', v)} placeholder="Contact person" />
              </FormField>
              <FormField label="Contact Numbers">
                <FInput value={data.contactNumbers} onChange={v => set('contactNumbers', v)} placeholder="+91 XXXXX XXXXX" />
              </FormField>
            </FormRow>
            <FormRow cols={3}>
              <FormField label="No. of Persons under Certification">
                <FInput value={data.noOfPersons} onChange={v => set('noOfPersons', v)} type="number" placeholder="0" />
              </FormField>
              <FormField label="Audit Type — Stage I">
                <FInput value={data.auditTypeStage1} onChange={v => set('auditTypeStage1', v)} placeholder="Stage I" />
              </FormField>
              <FormField label="Audit Type — Stage II">
                <FInput value={data.auditTypeStage2} onChange={v => set('auditTypeStage2', v)} placeholder="Stage II" />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="Audit Standard(s)">
                <FInput value={data.auditStandards} onChange={v => set('auditStandards', v)} placeholder="ISO 9001:2015, ISO 14001:2015..." />
              </FormField>
              <FormField label="IAF Code">
                <FInput value={data.iafCode} onChange={v => set('iafCode', v)} placeholder="IAF / EA Code" />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="Mode of Audit">
                <FSelect value={data.modeOfAudit} onChange={v => set('modeOfAudit', v)} placeholder="Select mode"
                  options={['Online','Onsite','Hybrid']} />
              </FormField>
              <FormField label="Online Meeting Link (if applicable)">
                <FInput value={data.onlineMeetingLink} onChange={v => set('onlineMeetingLink', v)} placeholder="https://..." />
              </FormField>
            </FormRow>
            <FormRow cols={1}>
              <FormField label="Scope of Certification">
                <FTextarea value={data.scopeOfCertification} onChange={v => set('scopeOfCertification', v)} rows={2} placeholder="Scope" />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="Audit Language">
                <FInput value={data.auditLanguage} onChange={v => set('auditLanguage', v)} placeholder="English" />
              </FormField>
              <FormField label="Risk Level">
                <FSelect value={data.risk} onChange={v => set('risk', v)} placeholder="Select risk" options={RISK} />
              </FormField>
            </FormRow>

            <SectionTitle>Transfer Details (if applicable)</SectionTitle>
            <FormRow cols={2}>
              <FormField label="All nonconformities closed by existing CB?">
                <FRadioGroup value={data.transferNCClosed} onChange={v => set('transferNCClosed', v)} options={YN} />
              </FormField>
              <FormField label="Transfer from IAF member CB">
                <FInput value={data.transferFromIAFCB} onChange={v => set('transferFromIAFCB', v)} placeholder="CB name" />
              </FormField>
            </FormRow>
            {data.transferNCClosed === 'No' && (
              <FormRow cols={1}>
                <FormField label="Reason for non-closure">
                  <FTextarea value={data.transferReason} onChange={v => set('transferReason', v)} placeholder="Describe reason" />
                </FormField>
              </FormRow>
            )}
            <FormRow cols={1}>
              <FormField label="Certificate Validity Date">
                <FInput value={data.certValidityDate} onChange={v => set('certValidityDate', v)} type="date" />
              </FormField>
            </FormRow>

            <SectionTitle>Audit Team Details</SectionTitle>
            <DynamicTable
              columns={[
                { key: 'name',      label: 'Auditor Name',   minWidth: 140 },
                { key: 'role',      label: 'Role',           type: 'select', options: ROLES },
                { key: 'stage1Days',label: 'Stage-1 Man-days',type: 'text', minWidth: 80 },
                { key: 'stage2Days',label: 'Stage-2 Man-days',type: 'text', minWidth: 80 },
              ]}
              rows={data.auditTeam || []}
              onAdd={() => set('auditTeam', [...(data.auditTeam || []), { ...EMPTY_AUDITOR }])}
              onRemove={ri => set('auditTeam', (data.auditTeam || []).filter((_, i) => i !== ri))}
              onCellChange={setTeam}
              addLabel="Add Auditor"
            />

            <SectionTitle>Audit Man-days</SectionTitle>
            <FormRow cols={3}>
              <FormField label="Total Audit Mandays">
                <FInput value={data.totalMandays} onChange={v => set('totalMandays', v)} type="number" placeholder="0" />
              </FormField>
              <FormField label="Total Audit Mandays (Stage 1 + Stage 2)">
                <FInput value={data.totalMandaysS1S2} onChange={v => set('totalMandaysS1S2', v)} type="number" placeholder="0" />
              </FormField>
              <FormField label="Total Audit Mandays (as per IAF MD 5)">
                <FInput value={data.totalMandaysIAF} onChange={v => set('totalMandaysIAF', v)} type="number" placeholder="0" />
              </FormField>
            </FormRow>

            <SectionTitle>Audit Dates</SectionTitle>
            <FormRow cols={2}>
              <FormField label="Stage-1 Audit Date From (Tentative)">
                <FInput value={data.stage1DateFrom} onChange={v => set('stage1DateFrom', v)} type="date" />
              </FormField>
              <FormField label="Stage-1 Audit Date To">
                <FInput value={data.stage1DateTo} onChange={v => set('stage1DateTo', v)} type="date" />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="Stage-2 Audit Date From (Tentative)">
                <FInput value={data.stage2DateFrom} onChange={v => set('stage2DateFrom', v)} type="date" />
              </FormField>
              <FormField label="Stage-2 Audit Date To">
                <FInput value={data.stage2DateTo} onChange={v => set('stage2DateTo', v)} type="date" />
              </FormField>
            </FormRow>

            <SectionTitle>Reviewer Details</SectionTitle>
            <FormRow cols={3}>
              <FormField label="Reviewer Name">
                <FInput value={data.reviewerName} onChange={v => set('reviewerName', v)} placeholder="Reviewer name" />
              </FormField>
              <FormField label="Verification Officer (if applicable)">
                <FInput value={data.verificationName} onChange={v => set('verificationName', v)} placeholder="Verification officer" />
              </FormField>
              <FormField label="Review Date">
                <FInput value={data.reviewDate} onChange={v => set('reviewDate', v)} type="date" />
              </FormField>
            </FormRow>
          </div>
        );
      }}
    </QMSFormPage>
  );
}
