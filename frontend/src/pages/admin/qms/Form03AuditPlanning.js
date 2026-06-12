import React from 'react';
import QMSFormPage, { SectionTitle } from './QMSFormPage';

const CLAUSES = [
  '4.1 Understanding the Organization and its Context',
  '4.2 Needs and Expectations of Interested Parties',
  '4.3 Scope of Management System',
  '4.4 Management System and its Processes',
  '5.1 Leadership and Commitment',
  '5.2 Policy',
  '5.3 Roles, Responsibilities and Authorities',
  '6.1 Actions to Address Risks and Opportunities',
  '6.2 Objectives and Planning to Achieve Them',
  '6.3 Planning of Changes',
  '7.1 Resources',
  '7.2 Competence',
  '7.3 Awareness',
  '7.4 Communication',
  '7.5 Documented Information',
  '8.1 Operational Planning and Control',
  '8.2 Requirements for Products and Services',
  '8.3 Design and Development',
  '8.4 Control of Externally Provided Processes, Products and Services',
  '8.5 Production and Service Provision',
  '8.6 Release of Products and Services',
  '8.7 Control of Nonconforming Outputs',
  '9.1 Monitoring, Measurement, Analysis and Evaluation',
  '9.1.2 Customer Satisfaction / Customer Feedback',
  '9.2 Internal Audit',
  '9.3 Management Review',
  '10.1 Improvement / Continual Improvement',
  '10.2 Nonconformity and Corrective Action',
  '10.3 Continual Improvement / Update of FSMS',
];

const COLS = [
  { key: 'initial',     label: 'Initial Audit' },
  { key: 'surv1',       label: 'Surveillance I' },
  { key: 'surv2',       label: 'Surveillance II' },
  { key: 'recert',      label: 'Recertification' },
];

const buildDefault = () => {
  const rows = {};
  CLAUSES.forEach((_, i) => {
    rows[`clause_${i}`] = { initial: false, surv1: false, surv2: false, recert: false, focus: '' };
  });
  return rows;
};

const inp = { padding: '5px 8px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' };

export default function Form03AuditPlanning() {
  return (
    <QMSFormPage
      formType={3}
      formCode="AUD-F-03A"
      formTitle="Audit Planning for 3 Years — 3 Year QMS Surveillance & Recertification Audit Programme"
      defaultData={{ clauses: buildDefault() }}
    >
      {({ data, set }) => {
        const clauses = data.clauses || buildDefault();
        const setClause = (i, key, val) => {
          set('clauses', { ...clauses, [`clause_${i}`]: { ...clauses[`clause_${i}`], [key]: val } });
        };
        return (
          <div>
            <SectionTitle>3-Year Audit Programme — ISO 9001:2015</SectionTitle>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0', minWidth: 280 }}>Sub-Clause / Audit Area</th>
                    {COLS.map(c => (
                      <th key={c.key} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        {c.label}
                      </th>
                    ))}
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0', minWidth: 180 }}>
                      Client-Specific Audit Focus
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CLAUSES.map((clause, i) => {
                    const row = clauses[`clause_${i}`] || {};
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '8px 12px', fontSize: 12, color: '#374151' }}>{clause}</td>
                        {COLS.map(c => (
                          <td key={c.key} style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={!!row[c.key]}
                              onChange={e => setClause(i, c.key, e.target.checked)}
                              style={{ width: 15, height: 15, cursor: 'pointer' }}
                            />
                          </td>
                        ))}
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="text"
                            value={row.focus || ''}
                            onChange={e => setClause(i, 'focus', e.target.value)}
                            placeholder="Audit focus..."
                            style={inp}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      }}
    </QMSFormPage>
  );
}
