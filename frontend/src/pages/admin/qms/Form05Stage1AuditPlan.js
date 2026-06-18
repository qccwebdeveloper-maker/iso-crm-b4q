import React from 'react';
import QMSFormPage, { FormRow, FormField, FInput, FTextarea, FSelect, SectionTitle, DynamicTable, StandardChips } from './QMSFormPage';

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
const EMPTY_SCHED = { dayTime: '', clauses: '', activity: '', auditorName: '' };

const ROLE_RESPONSIBILITIES = [
  {
    title: 'Lead Auditor / Team Leader – Responsibilities',
    intro: 'The Lead Auditor / Team Leader shall be responsible for the effective planning, management, execution, and reporting of the audit. Responsibilities include:',
    points: [
      'Leading, coordinating, and supervising the audit team throughout the audit process.',
      'Preparing and communicating the audit plan and agenda to the client within the agreed timeframe.',
      'Conducting the Opening Meeting to confirm the audit objectives, scope, criteria, methodology, and audit schedule.',
      'Guiding and supporting audit team members to ensure consistent and effective audit performance.',
      'Managing communication between the audit team and the auditee during the audit.',
      'Identifying, resolving, and communicating issues, concerns, or significant findings arising during the audit.',
      'Reviewing audit evidence and ensuring that audit findings are objective, accurate, and supported by evidence.',
      'Conducting the Closing Meeting and presenting audit conclusions, findings, and recommendations to the auditee.',
      'Ensuring that all audit documentation, reports, and records are completed accurately and submitted within the required timeframe.',
      'Ensuring confidentiality, impartiality, and compliance with certification body requirements throughout the audit process.',
      'Recommending the audit outcome based on objective evidence collected during the audit.',
      'Ensuring effective follow-up and communication regarding any identified nonconformities, opportunities for improvement, or audit-related matters.',
    ],
  },
  {
    title: 'Auditor – Responsibilities',
    intro: 'The Auditor shall be responsible for conducting assigned audit activities in accordance with the audit plan and under the direction of the Lead Auditor / Team Leader. Responsibilities include:',
    points: [
      'Conducting audit activities and collecting objective evidence in accordance with the audit plan and instructions provided by the Lead Auditor / Team Leader.',
      "Assessing compliance of the auditee's management system with applicable standard requirements, legal requirements, and organizational procedures.",
      'Recording audit observations, findings, nonconformities, and opportunities for improvement accurately and objectively.',
      'Preparing and submitting audit notes, findings, and reports to the Lead Auditor within the specified timeframe.',
      'Maintaining impartiality, confidentiality, professionalism, and adherence to the QCC Code of Conduct throughout the audit process.',
      'Communicating audit findings clearly and promptly to the Lead Auditor and relevant audit team members.',
      'Supporting the Lead Auditor in evaluating audit evidence and determining audit conclusions.',
      'Ensuring timely completion of assigned audit activities and contributing to the smooth and effective functioning of the audit process.',
      'Safeguarding all audit records, information, and documents obtained during the audit.',
      'Participating in audit team meetings, including preparation, review of findings, and closing discussions as required.',
    ],
  },
  {
    title: 'Technical Expert – Responsibilities',
    intro: "The Technical Expert shall provide specialized technical knowledge and support to the audit team to facilitate an effective and accurate assessment of the client's management system. The Technical Expert shall not make independent audit decisions unless authorized and competent to do so. Responsibilities include:",
    points: [
      'Assisting the Lead Auditor / Team Leader and auditors during the audit in accordance with the approved audit plan.',
      'Providing technical expertise and guidance on industry-specific processes, products, technologies, equipment, and regulatory requirements relevant to the audit scope.',
      "Advising the audit team on technical matters that may affect the evaluation of the effectiveness, conformity, and performance of the client's management system.",
      'Supporting the audit team in understanding complex technical processes and interpreting technical information and records.',
      'Assisting in the identification and evaluation of technical risks, operational controls, and compliance obligations relevant to the audit.',
      'Advising the audit team on technical issues identified during audit preparation, planning, execution, reporting, and follow-up activities.',
      'Providing objective technical input to support audit findings and conclusions based on factual evidence.',
      'Maintaining confidentiality, impartiality, and professional conduct throughout the audit process.',
      'Complying with all applicable QCC audit procedures, rules, regulations, and code of conduct requirements.',
      'Communicating technical observations and recommendations promptly to the Lead Auditor / Team Leader and supporting the effective functioning of the audit team.',
    ],
  },
  {
    title: 'Observer – Responsibilities',
    intro: 'An Observer may accompany the audit team for training, witnessing, accreditation, regulatory, or monitoring purposes and shall not participate in the audit decision-making process. Responsibilities include:',
    points: [
      'Complying with all applicable QCC audit procedures, rules, regulations, confidentiality requirements, and code of conduct.',
      'Observing the audit process without influencing the audit activities, audit findings, audit conclusions, or audit outcome.',
      'Refraining from interfering with communications between the audit team and the auditee.',
      'Maintaining impartiality, confidentiality, and professionalism throughout the audit process.',
      'Following the instructions of the Lead Auditor / Team Leader while present at the audit site.',
      'Not providing audit judgments, recommendations, or decisions regarding conformity, nonconformity, certification, or audit conclusions.',
      "Respecting the auditee's operational, safety, security, and confidentiality requirements during the audit.",
      'Ensuring that their presence does not disrupt or adversely affect the conduct and effectiveness of the audit.',
    ],
  },
  {
    title: 'Guide – Responsibilities',
    intro: 'A Guide may be appointed by the auditee to assist the audit team during the audit and facilitate effective communication and access to relevant areas, personnel, and information. Responsibilities include:',
    points: [
      'Coordinating and arranging contacts with relevant personnel and scheduling interviews as required by the audit plan.',
      'Facilitating access to specific departments, processes, facilities, and areas of the site as requested by the audit team.',
      'Ensuring that the audit team is informed of and complies with applicable site safety, security, hygiene, and operational requirements.',
      'Accompanying the audit team during site visits and witnessing the audit activities on behalf of the client, where appropriate.',
      'Providing clarification, factual information, and logistical support requested by the auditors to facilitate the audit process.',
      'Assisting in the collection and retrieval of relevant documents, records, and information required during the audit.',
      'Ensuring smooth communication between the auditee and the audit team throughout the audit.',
      'Respecting the independence of the audit process and refraining from influencing audit findings, conclusions, or outcomes.',
      'Maintaining confidentiality of information exchanged during the audit process.',
      'Supporting the efficient and effective conduct of the audit while ensuring minimal disruption to normal business operations.',
    ],
  },
];

const DEFAULT = {
  idNo: '', orgName: '', address: '', contactPerson: '', contactDetails: '', email: '',
  auditType: '', auditStandards: '', auditPlanDate: '',
  auditDateFrom: '', auditDateTo: '', modeOfAudit: '', onlineMeetingLink: '',
  scopeOfCertification: '', iafCode: '',
  auditObjectives: 'Judging the availability to 2nd assessment by checking system conformity and performance status regarding policy and objective.\n1. Conformity of documents regarding developed system.\n2. Review internal audit and management review records.\n3. Site-specific conditions, process and equipments used.\n4. Applicable statutory and regulatory requirements.',
  auditLanguage: 'English',
  auditTeam: [{ ...EMPTY_TEAM }],
  schedule: CLAUSES_S1.map(c => ({ dayTime: '', clauses: c, activity: '', auditorName: '' })),
};

export default function Form05Stage1AuditPlan() {
  return (
    <QMSFormPage
      formType={5}
      formCode="AUD-F-05"
      formTitle="Audit Plan — Stage 1"
      defaultData={DEFAULT}
    >
      {({ data, set, clientInfo }) => {
        const selectedStandard = data.auditStandards || clientInfo?.isoStandard || '';
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
            <FormRow cols={3}>
              <FormField label="1.4 Contact Person">
                <FInput value={data.contactPerson} onChange={v => set('contactPerson', v)} placeholder="Contact person" />
              </FormField>
              <FormField label="Contact Details">
                <FInput value={data.contactDetails} onChange={v => set('contactDetails', v)} placeholder="+91 XXXXX" />
              </FormField>
              <FormField label="Email">
                <FInput value={data.email} onChange={v => set('email', v)} type="email" placeholder="name@example.com" />
              </FormField>
            </FormRow>
            <FormRow cols={2}>
              <FormField label="1.5 Type of Audit">
                <FSelect value={data.auditType} onChange={v => set('auditType', v)} placeholder="Select type"
                  options={['Initial','Surveillance','Re-certification','Un-Announced','Follow-up']} />
              </FormField>
              <FormField label="1.6 Audit Standard(s)">
                <StandardChips value={selectedStandard} />
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

            <SectionTitle>Audit Team Roles &amp; Responsibilities</SectionTitle>
            {ROLE_RESPONSIBILITIES.map((role, i) => (
              <div key={i} style={{ marginBottom: 16, border: '1px solid var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: 'var(--primary-50)', padding: '10px 14px', fontWeight: 700, fontSize: 13, color: 'var(--primary-dark)' }}>
                  {role.title}
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--gray-600)', lineHeight: 1.6 }}>{role.intro}</p>
                  <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {role.points.map((pt, j) => (
                      <li key={j} style={{ fontSize: 12.5, color: 'var(--gray-700)', lineHeight: 1.55 }}>{pt}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}

            <SectionTitle>
              Audit Schedule — Stage 1
              {selectedStandard ? (
                <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 6, padding: '2px 8px' }}>
                  {selectedStandard}
                </span>
              ) : null}
            </SectionTitle>
            <DynamicTable
              columns={[
                { key: 'dayTime',    label: 'Day & Time (From–To)', minWidth: 160 },
                { key: 'clauses',    label: 'Clauses',             type: 'textarea', minWidth: 200 },
                { key: 'auditorName',label: 'Auditor Name',        minWidth: 120 },
                { key: 'activity',   label: 'Activity / Key Documents / Records for Verification', type: 'textarea', minWidth: 240 },
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
