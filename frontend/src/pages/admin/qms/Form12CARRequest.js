import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, SectionTitle, DynamicTable, StandardChips } from './QMSFormPage';

const EMPTY_CAR = { ncrNo: '', clauseRef: '', minorMajor: 'Minor', ncrDetail: '', writingDate: '', processDept: '', acceptedBy: '', leadAuditorName: '' };

const DEFAULT = {
  idNo: '', orgName: '', standard: '',
  carEntries: [{ ...EMPTY_CAR, ncrNo: '1' }],
};

export default function Form12CARRequest() {
  return (
    <QMSFormPage
      formType={12}
      formCode="AUD-F-16"
      formTitle="Request for Corrective Action (CAR)"
      defaultData={DEFAULT}
    >
      {({ data, set }) => {
        const setCar = (ri, k, v) => {
          const t = [...(data.carEntries || [])];
          t[ri] = { ...t[ri], [k]: v };
          set('carEntries', t);
        };
        return (
          <div>
            <SectionTitle>Organization Details</SectionTitle>
            <FormRow cols={3}>
              <FormField label="ID No.">
                <FInput value={data.idNo} onChange={v => set('idNo', v)} placeholder="Client / Application ID" />
              </FormField>
              <FormField label="Organization Name" required>
                <FInput value={data.orgName} onChange={v => set('orgName', v)} />
              </FormField>
              <FormField label="Standard">
                <StandardChips value={data.standard} />
              </FormField>
            </FormRow>

            <SectionTitle>Corrective Action Requests</SectionTitle>
            <div style={{ background: '#fef3c7', borderRadius: 8, border: '1px solid #fde68a', padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#92400e' }}>
              <strong>Note:</strong> Minor NCR — Please take action including reason analysis and prevention within 1 month. | Major NCR — Please conduct confirmation audit between 1–3 months.
            </div>
            <DynamicTable
              columns={[
                { key: 'ncrNo',          label: 'NCR No.',        minWidth: 60 },
                { key: 'clauseRef',      label: 'Clause Ref.',    minWidth: 100 },
                { key: 'minorMajor',     label: 'Minor / Major',  type: 'select', options: ['Minor','Major'] },
                { key: 'ncrDetail',      label: 'NCR Detail',     type: 'textarea', fullRow: true },
                { key: 'writingDate',    label: 'Writing Date',   type: 'date' },
                { key: 'processDept',    label: 'Process / Dept.', minWidth: 120 },
                { key: 'acceptedBy',     label: 'Accepted By',    minWidth: 140 },
                { key: 'leadAuditorName',label: 'Lead Auditor',   minWidth: 140 },
              ]}
              rows={data.carEntries || []}
              onAdd={() => {
                const cur = data.carEntries || [];
                set('carEntries', [...cur, { ...EMPTY_CAR, ncrNo: String(cur.length + 1) }]);
              }}
              onRemove={ri => set('carEntries', (data.carEntries || []).filter((_, i) => i !== ri))}
              onCellChange={setCar}
              addLabel="Add NCR Entry"
            />
          </div>
        );
      }}
    </QMSFormPage>
  );
}
