import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, FTextarea, FSelect, SectionTitle } from './QMSFormPage';

const CHECKS = [
  'Is audit team competent (IAF code) to conduct audit?',
  'Is application & audit reviewer competent (IAF code)?',
  'Is correct calculation of Man-day(s) as per application filled?',
  'Does Agreement signed by the client?',
  'What is the name of Auditor(s) approved for Stage 1 Audit?',
  'Is Declaration (AD-F-03) signed by the auditor(s)?',
  'Stage 1: Was Audit Plan & Schedule informed to client prior 7 days to audit?',
  'Stage 1: What was the Audit date?',
  'Does Scope finalize as per client products / Service?',
  'What is the difference found between the given details and Stage 1 report?',
  'Total No. of observations found.',
  'Total No. of Minor NC found.',
  'Total No. of Major NC found.',
  'What is Lead Auditor recommendation for client organization? (Renewal / Suspend / Withdrawal / Reduce/Extend Scope)',
];

const buildRemarks = () => {
  const r = {};
  CHECKS.forEach((_, i) => { r[`check_${i}`] = ''; });
  return r;
};

const DEFAULT = {
  orgName: '', standard: '', auditType: '', modeOfAudit: '', onlineMeetingLink: '',
  remarks: buildRemarks(),
  reviewDecision: '',
  supplementEvidences: '',
  reviewerName: '', reviewDate: '',
};

export default function Form08Stage1ReviewReport() {
  return (
    <QMSFormPage
      formType={8}
      formCode="AUD-F-22 (S1)"
      formTitle="Review Report — Stage 1 (After Application Review)"
      defaultData={DEFAULT}
    >
      {({ data, set }) => {
        const remarks = data.remarks || buildRemarks();
        const setRemark = (key, val) => set('remarks', { ...remarks, [key]: val });
        return (
          <div>
            <SectionTitle>Organization Details</SectionTitle>
            <FormRow cols={2}>
              <FormField label="Organization Name" required>
                <FInput value={data.orgName} onChange={v => set('orgName', v)} placeholder="Organization name" />
              </FormField>
              <FormField label="Standard">
                <FInput value={data.standard} onChange={v => set('standard', v)} placeholder="ISO 9001:2015..." />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="Audit Type">
                <FSelect value={data.auditType} onChange={v => set('auditType', v)} placeholder="Select type"
                  options={['Initial Audit','Surveillance','Re-certification']} />
              </FormField>
              <FormField label="Mode of Audit">
                <FSelect value={data.modeOfAudit} onChange={v => set('modeOfAudit', v)} placeholder="Select mode"
                  options={['Online','Onsite','Hybrid']} />
              </FormField>
            </FormRow>
            <FormRow cols={1}>
              <FormField label="Online Meeting Link (if applicable)">
                <FInput value={data.onlineMeetingLink} onChange={v => set('onlineMeetingLink', v)} placeholder="https://..." />
              </FormField>
            </FormRow>

            <SectionTitle>Review Checklist</SectionTitle>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0', minWidth: 360 }}>Review Details</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0', minWidth: 240 }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {CHECKS.map((check, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{check}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <input
                          type="text"
                          value={remarks[`check_${i}`] || ''}
                          onChange={e => setRemark(`check_${i}`, e.target.value)}
                          placeholder="Enter remarks..."
                          style={{ padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SectionTitle>Review Decision</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                { value: 'appropriate', label: 'Appropriate — Sufficient objective evidence present. Issuance of Certification will be granted.' },
                { value: 'supplement',  label: 'Supplement Required — Insufficient objective evidence. Additional evidence required (describe below).' },
              ].map(o => (
                <label key={o.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${data.reviewDecision === o.value ? 'var(--primary)' : '#e2e8f0'}`, background: data.reviewDecision === o.value ? '#fff7ed' : 'white', cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" value={o.value} checked={data.reviewDecision === o.value} onChange={() => set('reviewDecision', o.value)} style={{ marginTop: 2 }} />
                  {o.label}
                </label>
              ))}
            </div>
            {data.reviewDecision === 'supplement' && (
              <FormRow cols={1}>
                <FormField label="Required Supplement Objective Evidences">
                  <FTextarea value={data.supplementEvidences} onChange={v => set('supplementEvidences', v)} rows={4} placeholder="Describe required evidences..." />
                </FormField>
              </FormRow>
            )}

            <SectionTitle>Reviewer Details</SectionTitle>
            <FormRow cols={2}>
              <FormField label="Reviewer Name">
                <FInput value={data.reviewerName} onChange={v => set('reviewerName', v)} placeholder="Reviewer name" />
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
