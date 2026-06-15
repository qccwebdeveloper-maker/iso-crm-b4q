import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, SectionTitle, DynamicTable } from './QMSFormPage';

const ROLES = ['Lead Auditor','Auditor','Technical Expert','Application Reviewer','Report Reviewer','Final Certification Decision by HOD'];
const EMPTY_SIG = { name: '', role: '', date: '', signature: '' };

const DEFAULT = {
  orgName: '', auditStandards: '',
  signatories: [
    { name: '', role: 'Lead Auditor',   date: '', signature: '' },
    { name: '', role: 'Auditor',        date: '', signature: '' },
    { name: '', role: 'Application Reviewer', date: '', signature: '' },
    { name: '', role: 'Final Certification Decision by HOD', date: '', signature: '' },
  ],
};

export default function Form04AuditorDeclaration() {
  return (
    <QMSFormPage
      formType={4}
      formCode="AD-F-03"
      formTitle="Auditor(s) Declaration"
      defaultData={DEFAULT}
    >
      {({ data, set }) => {
        const setSig = (ri, key, val) => {
          const s = [...(data.signatories || [])];
          s[ri] = { ...s[ri], [key]: val };
          set('signatories', s);
        };
        return (
          <div>
            <SectionTitle>Organization Details</SectionTitle>
            <FormRow cols={2}>
              <FormField label="Organization Name" required>
                <FInput value={data.orgName} onChange={v => set('orgName', v)} placeholder="Organization name" />
              </FormField>
              <FormField label="Audit Standard(s)">
                <FInput value={data.auditStandards} onChange={v => set('auditStandards', v)} placeholder="ISO 9001:2015, ISO 14001:2015..." />
              </FormField>
            </FormRow>

            <SectionTitle>Declaration Statement</SectionTitle>
            <div style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', padding: '16px 18px', marginBottom: 20, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
              <p>• I confirm that I don't have any relevant interest as below:</p>
              <ul style={{ marginLeft: 20, marginTop: 4 }}>
                <li>I didn't work with the applied / client organization in recent two years.</li>
                <li>I and QCC didn't supply any consulting, training and internal audit for the applied / client organization in recent two years.</li>
              </ul>
              <p>• I will act in accordance with QCC policy & procedures and won't reveal any secret information without approval of QCC and interested parties, conduct activities in accurate and impartial manner.</p>
              <p>• I will keep all other gained information through audit as confidential.</p>
              <p>• I shall perform my duties in accordance with ISO 19011.</p>
              <p style={{ marginTop: 8 }}><strong>I assure that if different from above, I'll be responsible for all relevant matters.</strong></p>
            </div>

            <SectionTitle>Signatories</SectionTitle>
            <DynamicTable
              columns={[
                { key: 'name',      label: 'Name',      minWidth: 160 },
                { key: 'role',      label: 'Role',      type: 'select', options: ROLES },
                { key: 'date',      label: 'Date',      type: 'date' },
                { key: 'signature', label: 'Signature (Text)', minWidth: 160 },
              ]}
              rows={data.signatories || []}
              onAdd={() => set('signatories', [...(data.signatories || []), { ...EMPTY_SIG }])}
              onRemove={ri => set('signatories', (data.signatories || []).filter((_, i) => i !== ri))}
              onCellChange={setSig}
              addLabel="Add Signatory"
            />
          </div>
        );
      }}
    </QMSFormPage>
  );
}
