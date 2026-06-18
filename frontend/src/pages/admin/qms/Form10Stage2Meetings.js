import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, SectionTitle, DynamicTable, StandardChips } from './QMSFormPage';

const YN_OPTS = ['Yes','No'];
const EMPTY_P = { sNo: '', name: '', position: '', openingMeeting: 'Yes', closingMeeting: 'Yes' };

const DEFAULT = {
  auditDateFrom: '', auditDateTo: '', standard: '',
  participants: Array.from({ length: 5 }, (_, i) => ({
    sNo: String(i + 1), name: '', position: '', openingMeeting: 'Yes', closingMeeting: 'Yes',
  })),
};

export default function Form10Stage2Meetings() {
  return (
    <QMSFormPage
      formType={10}
      formCode="AUD-F-07 S2"
      formTitle="Attendance List — Opening & Closing Meeting (Stage-2)"
      defaultData={DEFAULT}
    >
      {({ data, set }) => {
        const setP = (ri, key, val) => {
          const p = [...(data.participants || [])];
          p[ri] = { ...p[ri], [key]: val };
          set('participants', p);
        };
        return (
          <div>
            <SectionTitle>Meeting Details</SectionTitle>
            <FormRow cols={3}>
              <FormField label="Audit Date — Stage 2 (From)">
                <FInput value={data.auditDateFrom} onChange={v => set('auditDateFrom', v)} type="date" />
              </FormField>
              <FormField label="Audit Date To">
                <FInput value={data.auditDateTo} onChange={v => set('auditDateTo', v)} type="date" />
              </FormField>
              <FormField label="Standard">
                <StandardChips value={data.standard} />
              </FormField>
            </FormRow>

            <SectionTitle>Participants</SectionTitle>
            <DynamicTable
              columns={[
                { key: 'sNo',            label: 'S.No.',               minWidth: 50 },
                { key: 'name',           label: 'Name',                minWidth: 160 },
                { key: 'position',       label: 'Position / Department', minWidth: 180 },
                { key: 'openingMeeting', label: 'Opening Meeting (Y/N)', type: 'select', options: YN_OPTS },
                { key: 'closingMeeting', label: 'Closing Meeting (Y/N)', type: 'select', options: YN_OPTS },
              ]}
              rows={data.participants || []}
              onAdd={() => {
                const cur = data.participants || [];
                set('participants', [...cur, { ...EMPTY_P, sNo: String(cur.length + 1) }]);
              }}
              onRemove={ri => set('participants', (data.participants || []).filter((_, i) => i !== ri))}
              onCellChange={setP}
              addLabel="Add Participant"
            />
          </div>
        );
      }}
    </QMSFormPage>
  );
}
