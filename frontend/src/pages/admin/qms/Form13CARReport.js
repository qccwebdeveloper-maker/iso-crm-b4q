import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, FTextarea, FSelect, SectionTitle } from './QMSFormPage';

const DEFAULT = {
  orgName: '', auditStandards: '', ncrNo: '', dept: '', auditType: 'Stage-2',
  clauseNo: '', detailsOfNC: '', rootCause: '', correction: '', correctiveAction: '',
  completionDate: '', evaluationResult: '', evaluationAccepted: '',
  confirmationOfficer: '', confirmationDate: '', confirmationResult: '',
  unsatisfiedReason: '',
};

export default function Form13CARReport() {
  return (
    <QMSFormPage
      formType={13}
      formCode="AUD-F-17"
      formTitle="Corrective Action Report"
      defaultData={DEFAULT}
    >
      {({ data, set }) => (
        <div>
          <SectionTitle>Organization Details</SectionTitle>
          <FormRow cols={2}>
            <FormField label="Organization Name" required>
              <FInput value={data.orgName} onChange={v => set('orgName', v)} placeholder="Organization name" />
            </FormField>
            <FormField label="Audit Standard(s)">
              <FInput value={data.auditStandards} onChange={v => set('auditStandards', v)} placeholder="ISO 9001:2015..." />
            </FormField>
          </FormRow>
          <FormRow cols={3}>
            <FormField label="NCR No.">
              <FInput value={data.ncrNo} onChange={v => set('ncrNo', v)} placeholder="NCR-001" />
            </FormField>
            <FormField label="Department">
              <FInput value={data.dept} onChange={v => set('dept', v)} placeholder="Department name" />
            </FormField>
            <FormField label="Audit Type">
              <FSelect value={data.auditType} onChange={v => set('auditType', v)} placeholder="Select type"
                options={['Stage-2','Surveillance','Re-certification','Follow-up']} />
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="Clause No.">
              <FInput value={data.clauseNo} onChange={v => set('clauseNo', v)} placeholder="e.g. 8.5.1" />
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="Details of Non-Conformity">
              <FTextarea value={data.detailsOfNC} onChange={v => set('detailsOfNC', v)} rows={3} placeholder="Describe the non-conformity in detail..." />
            </FormField>
          </FormRow>

          <SectionTitle>Result of Corrective Action</SectionTitle>
          <FormRow cols={1}>
            <FormField label="1. Root Cause">
              <FTextarea value={data.rootCause} onChange={v => set('rootCause', v)} rows={3} placeholder="Identify the root cause of the non-conformity..." />
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="2. Correction (Immediate Action)">
              <FTextarea value={data.correction} onChange={v => set('correction', v)} rows={3} placeholder="Describe the immediate correction taken..." />
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="3. Corrective Action (Systematic Action)">
              <FTextarea value={data.correctiveAction} onChange={v => set('correctiveAction', v)} rows={3} placeholder="Describe the systemic corrective action to prevent recurrence..." />
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="Completion Date of Corrective Action">
              <FInput value={data.completionDate} onChange={v => set('completionDate', v)} type="date" />
            </FormField>
          </FormRow>

          <SectionTitle>For Auditor(s) / QCC Use Only</SectionTitle>
          <FormRow cols={1}>
            <FormField label="Evaluation Result of Corrective Action">
              <FTextarea value={data.evaluationResult} onChange={v => set('evaluationResult', v)} rows={3} placeholder="Auditor's evaluation of the corrective action..." />
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="Accepted by Auditor">
              <FInput value={data.evaluationAccepted} onChange={v => set('evaluationAccepted', v)} placeholder="Auditor name" />
            </FormField>
          </FormRow>

          <SectionTitle>QCC Confirmation</SectionTitle>
          <FormRow cols={2}>
            <FormField label="Confirmation Result">
              <FSelect value={data.confirmationResult} onChange={v => set('confirmationResult', v)} placeholder="Select result"
                options={['Satisfied','Unsatisfied']} />
            </FormField>
            <FormField label="Confirmation Date">
              <FInput value={data.confirmationDate} onChange={v => set('confirmationDate', v)} type="date" />
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="Confirmation Officer">
              <FInput value={data.confirmationOfficer} onChange={v => set('confirmationOfficer', v)} placeholder="Confirmation officer name" />
            </FormField>
          </FormRow>
          {data.confirmationResult === 'Unsatisfied' && (
            <FormRow cols={1}>
              <FormField label="Reason (if Unsatisfied)">
                <FTextarea value={data.unsatisfiedReason} onChange={v => set('unsatisfiedReason', v)} rows={3} placeholder="Describe reason for unsatisfied result..." />
              </FormField>
            </FormRow>
          )}
        </div>
      )}
    </QMSFormPage>
  );
}
