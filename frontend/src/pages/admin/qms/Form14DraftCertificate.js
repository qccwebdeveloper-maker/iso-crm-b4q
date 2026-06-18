import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, FTextarea, FSelect, SectionTitle, StandardChips } from './QMSFormPage';
import useStandards from './useStandards';

const MS_TYPES  = ['Quality Management System','Environmental Management System','Occupational Health and Safety Management System','Food Safety Management System','Information Security Management System','Energy Management System'];

const DEFAULT = {
  orgName: '', managementSystemType: 'Quality Management System',
  standard: '', scopeOfCertification: '',
  confirmationPersonName: '', leadAuditor: '', stage2ClosingDate: '',
  certIssueDate: '', certNo: '', selectedStandard: '',
  multiSiteLocations: '',
  additionalNotes: '',
};

export default function Form14DraftCertificate() {
  return (
    <QMSFormPage
      formType={14}
      formCode="AUD-F-21"
      formTitle="Draft for Certificate Approval"
      defaultData={DEFAULT}
    >
      {({ data, set }) => <CertBody data={data} set={set} />}
    </QMSFormPage>
  );
}

function CertBody({ data, set }) {
  const { names } = useStandards();
  return (
        <div>
          <div style={{ background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe', padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
            <strong>Important:</strong> This content will be used in your certificate. Please write carefully and confirm. If you have a previous certificate, please note the details below.
          </div>

          <SectionTitle>Certificate Content</SectionTitle>
          <FormRow cols={2}>
            <FormField label="Organization Name" required>
              <FInput value={data.orgName} onChange={v => set('orgName', v)} placeholder="Organization name as on certificate" />
            </FormField>
            <FormField label="Management System Type">
              <FSelect value={data.managementSystemType} onChange={v => set('managementSystemType', v)} placeholder="Select type" options={MS_TYPES} />
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="Standard for Certificate Generation">
              <FSelect value={data.selectedStandard} onChange={v => set('selectedStandard', v)} placeholder="Select standard" options={names} />
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="Standard (as on certificate)">
              <StandardChips value={data.standard} />
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="Scope of Certification" required>
              <FTextarea value={data.scopeOfCertification} onChange={v => set('scopeOfCertification', v)} rows={4}
                placeholder="Describe the scope of certification as it should appear on the certificate..." />
            </FormField>
          </FormRow>

          <SectionTitle>Confirmation Details</SectionTitle>
          <FormRow cols={2}>
            <FormField label="Client Authorized Person Name">
              <FInput value={data.confirmationPersonName} onChange={v => set('confirmationPersonName', v)} placeholder="Authorized person name" />
            </FormField>
            <FormField label="Assigned Lead Auditor">
              <FInput value={data.leadAuditor} onChange={v => set('leadAuditor', v)} placeholder="Lead auditor name" />
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="Stage 2 Closing Date">
              <FInput value={data.stage2ClosingDate} onChange={v => set('stage2ClosingDate', v)} type="date" />
            </FormField>
          </FormRow>

          <SectionTitle>Certificate Details</SectionTitle>
          <FormRow cols={2}>
            <FormField label="Certificate Issue Date">
              <FInput value={data.certIssueDate} onChange={v => set('certIssueDate', v)} type="date" />
            </FormField>
            <FormField label="Certificate Number">
              <FInput value={data.certNo} onChange={v => set('certNo', v)} placeholder="Certificate number" />
            </FormField>
          </FormRow>

          <SectionTitle>Multi-Site Details (if applicable)</SectionTitle>
          <div style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#6b7280' }}>
            If you have more than 3 multi locations and/or each location's scope is different, please specify here.
          </div>
          <FormRow cols={1}>
            <FormField label="Multi-site Locations">
              <FTextarea value={data.multiSiteLocations} onChange={v => set('multiSiteLocations', v)} rows={3}
                placeholder="List additional site locations and their scopes..." />
            </FormField>
          </FormRow>

          <SectionTitle>Additional Notes</SectionTitle>
          <FormRow cols={1}>
            <FormField label="Additional Notes / Comments">
              <FTextarea value={data.additionalNotes} onChange={v => set('additionalNotes', v)} rows={3} placeholder="Any additional information..." />
            </FormField>
          </FormRow>
        </div>
  );
}
