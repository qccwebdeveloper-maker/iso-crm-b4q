import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, FTextarea, FSelect, SectionTitle } from './QMSFormPage';

const INITIAL_CHECKS = [
  { key: 'stg2AuditorDiff',   label: 'Does stage 2 auditor different from stage 1? Yes / No' },
  { key: 'threeyearMechanism',label: 'Does the 3-year audit programme have a periodic verification mechanism?' },
  { key: 'stg2AuditorName',   label: 'Name of approved Auditor(s) for Stage 2 Audit?' },
  { key: 'stg2DeclarationSigned',label: 'Auditor(s) Declaration (AD-F-03) signed by auditor(s)?' },
  { key: 'stg2PlanSent',      label: 'Stage 2: Was Audit Plan & Schedule informed to client prior 7 days to audit?' },
  { key: 'stg2AuditDate',     label: 'Stage 2: What was the audit date?' },
  { key: 'totalObservations', label: 'Total number of observations found.' },
  { key: 'totalMinorNC',      label: 'Total number of Minor NC found.' },
  { key: 'totalMajorNC',      label: 'Total number of Major NC found.' },
  { key: 'leadAuditorRec',    label: 'What is the recommendation of Lead Auditor? (Certificate issue / Maintenance / Renewal / Suspend / Withdrawal / Reduce/Extend Scope)' },
];
const MULTISITE_CHECKS = [
  { key: 'hasMultiSite',      label: 'Does Client have multi-site location? Is calculation of man-days appropriate?' },
  { key: 'sampleSiteCalc',    label: 'Is calculation of sample site appropriate as per given multi-site location?' },
  { key: 'scopeChanges',      label: 'Does any changes with respect to process/manpower/activities or defined scope in multi-site?' },
  { key: 'siteNCRAction',     label: 'If NCR was raised about selected site, was equivalent corrective action taken in other sites?' },
];
const SURV1_CHECKS = [
  { key: 'siteChange',        label: 'Is any change at client site/address, scope or key management person?' },
  { key: 'auditorApproved',   label: 'What is Name of Auditor(s) approved for Audit?' },
  { key: 'decSigned',         label: 'Is Auditor(s) Declaration (AD-F-03) signed by auditor(s)?' },
  { key: 'auditPeriodic',     label: 'Was surveillance/renewal audit conducted periodically?' },
  { key: 'planSent',          label: 'Surveillance Audit Plan & Schedule was informed to client prior 7 days?' },
  { key: 'per3YearPlan',      label: 'Is surveillance audit plan prepared as per AUD-F-03A-Audit Planning for 3 years?' },
  { key: 'auditDate',         label: 'Date of audit conducted.' },
  { key: 'coreProcessesCovered',label: 'All the core processes were covered during the surveillance audit?' },
  { key: 'logoVerified',      label: 'Use of logo was verified and found in line with guidance.' },
  { key: 'observations',      label: 'Total number of observations.' },
  { key: 'minorNC',           label: 'Total number of Minor NC.' },
  { key: 'majorNC',           label: 'Total number of Major NC.' },
  { key: 'laRecommendation',  label: "What is Lead Auditor's recommendation? (Maintenance / Renewal / Suspend / Withdrawal / Reduce/Extend Scope)" },
];
const RECERT_CHECKS = [
  { key: 'withinTimeline',    label: 'Is Recertification audit planned and conducted within timeline/prior to expiry?' },
  { key: 'siteChange',        label: 'Is any change at client site/address, scope or key management person?' },
  { key: 'auditorName',       label: 'What is Name of approved Auditor(s) for Stage 2 Audit?' },
  { key: 'decSigned',         label: 'Is Auditor(s) Declaration (AD-F-03) signed by auditor(s)?' },
  { key: 'recertPlan',        label: 'Is Recertification audit plan prepared as per AUD-F-03A?' },
  { key: 'planSent',          label: 'Was Recertification Audit Plan & Schedule informed to client prior 7 days?' },
  { key: 'auditDate',         label: 'Date of audit conducted.' },
  { key: 'coreProcessesCovered',label: 'Were All the core processes covered during the surveillance audit?' },
  { key: 'logoVerified',      label: 'Was Use of logo verified and found in line with guidance?' },
  { key: 'recertDate',        label: 'Recertification Audit date.' },
  { key: 'observations',      label: 'Total number of observations found.' },
  { key: 'minorNC',           label: 'Total number of Minor NC found.' },
  { key: 'majorNC',           label: 'Total number of Major NC found.' },
  { key: 'laRecommendation',  label: 'What is Lead Auditor recommendation? (Renewal / Suspend / Withdrawal / Reduce/Extend Scope)' },
];

const buildChecks = (arr) => Object.fromEntries(arr.map(c => [c.key, 'NA']));

const DEFAULT = {
  orgName: '', standard: '', auditType: 'INITIAL AUDIT', modeOfAudit: '', onlineMeetingLink: '',
  initialChecks:    buildChecks(INITIAL_CHECKS),
  multiSiteChecks:  buildChecks(MULTISITE_CHECKS),
  surv1Checks:      buildChecks(SURV1_CHECKS),
  recertChecks:     buildChecks(RECERT_CHECKS),
  reviewDecision: '',
  supplementEvidences: '',
  reviewerName: '', reviewDate: '',
  hodDecision: '', hodReviewDate: '',
};

const ChecksTable = ({ checks, values, setVal }) => (
  <div style={{ overflowX: 'auto', marginBottom: 16 }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#f8fafc' }}>
          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0', minWidth: 340 }}>Item</th>
          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0', minWidth: 200 }}>Remarks</th>
        </tr>
      </thead>
      <tbody>
        {checks.map((c, i) => (
          <tr key={c.key} style={{ borderBottom: '1px solid #f1f5f9', background: i%2===0?'white':'#fafafa' }}>
            <td style={{ padding: '8px 12px', fontSize: 13, color: '#374151' }}>{c.label}</td>
            <td style={{ padding: '6px 8px' }}>
              <input type="text" value={values?.[c.key] ?? 'NA'} onChange={e => setVal(c.key, e.target.value)}
                style={{ padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function Form15FinalReviewReport() {
  return (
    <QMSFormPage
      formType={15}
      formCode="AUD-F-22"
      formTitle="Final Review Report"
      defaultData={DEFAULT}
    >
      {({ data, set }) => {
        const setCheck = (section, key, val) => set(section, { ...(data[section] || {}), [key]: val });
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
                <FSelect value={data.auditType} onChange={v => set('auditType', v)} placeholder="Select"
                  options={['INITIAL AUDIT','Surveillance','Recertification','Special Audit']} />
              </FormField>
              <FormField label="Mode of Audit">
                <FSelect value={data.modeOfAudit} onChange={v => set('modeOfAudit', v)} placeholder="Select"
                  options={['Online','Onsite','Hybrid']} />
              </FormField>
            </FormRow>
            <FormRow cols={1}>
              <FormField label="Online Meeting Link (if applicable)">
                <FInput value={data.onlineMeetingLink} onChange={v => set('onlineMeetingLink', v)} placeholder="https://..." />
              </FormField>
            </FormRow>

            <SectionTitle>Initial Audit — Stage 2 Review</SectionTitle>
            <ChecksTable checks={INITIAL_CHECKS} values={data.initialChecks} setVal={(k,v) => setCheck('initialChecks', k, v)} />

            <SectionTitle>Multi-site Certification</SectionTitle>
            <ChecksTable checks={MULTISITE_CHECKS} values={data.multiSiteChecks} setVal={(k,v) => setCheck('multiSiteChecks', k, v)} />

            <SectionTitle> Surveillance Audit</SectionTitle>
            <ChecksTable checks={SURV1_CHECKS} values={data.surv1Checks} setVal={(k,v) => setCheck('surv1Checks', k, v)} />

            <SectionTitle>Recertification Audit</SectionTitle>
            <ChecksTable checks={RECERT_CHECKS} values={data.recertChecks} setVal={(k,v) => setCheck('recertChecks', k, v)} />

            <SectionTitle>Review Decision</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                { value: 'appropriate', label: 'Appropriate — Sufficient Objective Evidence present. Recommended: Issuance of Certification will be granted.' },
                { value: 'supplement',  label: 'Supplement Required — Insufficient Objective Evidence. Additional evidence required.' },
              ].map(o => (
                <label key={o.value} style={{ display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',borderRadius:8,border:`1.5px solid ${data.reviewDecision===o.value?'var(--primary)':'#e2e8f0'}`,background:data.reviewDecision===o.value?'#fff7ed':'white',cursor:'pointer',fontSize:13 }}>
                  <input type="radio" value={o.value} checked={data.reviewDecision===o.value} onChange={()=>set('reviewDecision',o.value)} style={{marginTop:2}} />
                  {o.label}
                </label>
              ))}
            </div>
            {data.reviewDecision === 'supplement' && (
              <FormRow cols={1}>
                <FormField label="Required Supplement Objective Evidences">
                  <FTextarea value={data.supplementEvidences} onChange={v => set('supplementEvidences', v)} rows={4} />
                </FormField>
              </FormRow>
            )}

            <SectionTitle>Reviewer Details</SectionTitle>
            <FormRow cols={2}>
              <FormField label="Reviewer Name"><FInput value={data.reviewerName} onChange={v => set('reviewerName', v)} placeholder="Reviewer name" /></FormField>
              <FormField label="Review Date"><FInput value={data.reviewDate} onChange={v => set('reviewDate', v)} type="date" /></FormField>
            </FormRow>

            <SectionTitle>HOD Final Decision</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                { value: 'certificate_issue',     label: 'Certificate Issue' },
                { value: 'maintenance',           label: 'Maintenance / Surveillance Audit Successful' },
                { value: 'renewal',               label: 'Renewal' },
                { value: 'reduce',                label: 'Reduce Scope' },
                { value: 'extend',                label: 'Extend Scope' },
              ].map(o => (
                <label key={o.value} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 14px',borderRadius:8,border:`1.5px solid ${data.hodDecision===o.value?'var(--primary)':'#e2e8f0'}`,background:data.hodDecision===o.value?'#fff7ed':'white',cursor:'pointer',fontSize:13 }}>
                  <input type="radio" value={o.value} checked={data.hodDecision===o.value} onChange={()=>set('hodDecision',o.value)} />
                  {o.label}
                </label>
              ))}
            </div>
            <FormRow cols={1}>
              <FormField label="HOD Review Date">
                <FInput value={data.hodReviewDate} onChange={v => set('hodReviewDate', v)} type="date" />
              </FormField>
            </FormRow>
          </div>
        );
      }}
    </QMSFormPage>
  );
}
