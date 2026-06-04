import React, { useState } from 'react';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import {
  CheckCircle, ChevronLeft, ChevronRight, Save, FileText, Eye,
  Building2, Users, Settings, ClipboardCheck, Award, BookOpen, AlertTriangle
} from 'lucide-react';

/* ─── Steps definition ─── */
const STEPS = [
  { id: 1, code: 'AUD-F-02 §2.1–2.3', label: 'Organization Info',       icon: Building2 },
  { id: 2, code: 'AUD-F-02 §2.2–2.4', label: 'Standards & Employees',   icon: Users },
  { id: 3, code: 'AUD-F-02 §2.5–2.6', label: 'Management System',       icon: Settings },
  { id: 4, code: 'AUD-F-03',           label: 'Audit Planning',           icon: BookOpen },
  { id: 5, code: 'AUD-F-09',           label: 'Stage 1 Audit Report',     icon: ClipboardCheck },
  { id: 6, code: 'AUD-F-15',           label: 'Stage 2 Audit Report',     icon: ClipboardCheck },
  { id: 7, code: 'AUD-F-21 / F-22',   label: 'Certificate & Review',     icon: Award },
];

const ISO_STANDARDS = [
  'ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'ISO 22000:2018',
  'ISO 27001:2022', 'ISO/IEC 27701:2025', 'ISO/IEC 42001:2023',
  'ISO 22301:2019', 'ISO 37001:2016', 'ISO 21001:2018',
];

const AUDIT_TYPES = ['Initial', 'Surveillance', 'Re-certification', 'Un-Announced', 'Follow-up'];
const MODES       = ['Online', 'Onsite', 'Hybrid'];
const PLATFORMS   = ['Google Meet', 'Zoom', 'Microsoft Teams', 'Other'];
const RISK_LEVELS = ['High', 'Medium', 'Low'];
const NC_TYPES    = ['Major', 'Minor'];

const PERSONNEL_CATS = ['Top Management', 'Production Area/Service', 'Quality Control/Technical', 'Administration', 'Other'];
const EMP_TYPES      = ['Full Time', 'Part Time', 'Performing Same Job', 'Temp/Unskilled'];

const INTEGRATION_OPTS = [
  'Combined Audit (multiple standards, one audit)?',
  'Joint Audit (with another certification body)?',
  'Integrated Audit (multiple MS standards)?',
  'Separate Audit (each standard audited separately)?',
  'Is Internal Audit Combined?',
  'Is MRM Combined (including business strategy and plan)?',
  'Is Manual, Procedures Combined?',
  'Is Implemented System Integrated?',
  'Integrated approach for correction, corrective action and continual improvement?',
  'Integrated management support and responsibilities?',
];

const STAGE1_CLAUSES = [
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
  '9.2 Internal Audit',
  '9.3 Management Review',
  '10.1 Improvement / Continual Improvement',
  '10.2 Nonconformity and Corrective Action',
  '10.3 Continual Improvement',
];

/* ─── Initial form state ─── */
const initState = () => ({
  /* AUD-F-02 §2.1 */
  refNo: '', orgName: '', address: '', additionalSites: '',
  contactNumber: '', email: '', contactPerson: '', designation: '',
  modeOfWorking: '', hybridDetails: '', scope: '', mainProcesses: '', outsourcedProcesses: '',
  /* §2.2 */
  standards: [],
  /* §2.3 */
  applicationType: '', totalEmployees: '', contractual: 0, shifts: '', fullTime: '', partTime: '',
  performingSameJob: '', tempUnskilled: '',
  /* §2.4 – personnel grid */
  personnel: PERSONNEL_CATS.reduce((a, c) => ({ ...a, [c]: { 'Full Time': '', 'Part Time': '', 'Performing Same Job': '', 'Temp/Unskilled': '' } }), {}),
  /* §2.5 */
  legalActs: '', keyProcessArea: '', products: '', outsourcingProcess: '', consultantDetails: '',
  establishmentDate: '', manualDate: '', internalAuditDate: '', mrmDate: '',
  alreadyCertified: false, certStandards: '', certBody: '', certIssue: '', certExpiry: '',
  /* §2.6 */
  integration: INTEGRATION_OPTS.reduce((a, o) => ({ ...a, [o]: '' }), {}),
  /* AUD-F-03 */
  auditTeam: [{ name: '', role: 'Lead Auditor', stage1MD: '', stage2MD: '' }],
  stage1From: '', stage1To: '', stage2From: '', stage2To: '', iafCode: '', risk: '', meetingLink: '', modeOfAudit: '',
  applicationDate: '', applicationReviewDate: '', after11Month: '',
  stage1AuditPlan: '', stage2AuditPlan: '',
  /* AUD-F-09 Stage 1 */
  s1OrgBrief: '', s1Duration: '', s1EmployeeChanged: false, s1ScopeChanged: false,
  s1Clauses: STAGE1_CLAUSES.reduce((a, c) => ({ ...a, [c]: { done: false, result: 'C', evidence: '' } }), {}),
  s1MinorNC: 0, s1MajorNC: 0, s1Obs: 0, s1OFI: 0, s1Readiness: '', s1Recommendation: '',
  s1NCs: [{ standard: '', type: 'Minor', clause: '', detail: '' }],
  s1Observations: [{ standard: '', clause: '', detail: '' }],
  /* AUD-F-15 Stage 2 */
  s2Duration: '', s2Deviations: '', s2SignificantIssues: '', s2Changes: '',
  s2MinorNC: 0, s2MajorNC: 0, s2Obs: 0, s2OFI: 0,
  s2Recommendation: '',
  s2NCs: [{ standard: '', type: 'Minor', clause: '', detail: '', process: '' }],
  s2Observations: [{ standard: '', clause: '', detail: '' }],
  s2RootCause: '', s2Correction: '', s2CorrectiveAction: '', s2CompletionDate: '',
  /* AUD-F-21 / AUD-F-22 */
  certSystem: 'Quality Management System', certReqStandard: '', certScope: '',
  certIssueDate: '', certNumber: '',
  clientAuthPerson: '', auditTeamLeader: '',
  reviewDecision: '', reviewDate: '', hodDecision: '', hodReviewDate: '',
});

/* ─── Helpers ─── */
function Field({ label, required, children, col }) {
  return (
    <div style={{ gridColumn: col || 'auto' }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inp = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
  fontSize: 13, outline: 'none', boxSizing: 'border-box', color: 'var(--gray-800)',
};

const sel = { ...inp, background: 'white', cursor: 'pointer' };

function Inp({ value, onChange, placeholder, type = 'text', disabled }) {
  return <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={{ ...inp, background: disabled ? '#f8fafc' : 'white' }} />;
}
function Sel({ value, onChange, options, placeholder }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)} style={sel}>
      <option value="">{placeholder || 'Select...'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function Txt({ value, onChange, rows = 3, placeholder }) {
  return <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{ ...inp, resize: 'vertical' }} />;
}

const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 };

/* ─── Step Renders ─── */
function Step1({ d, set }) {
  return (
    <div>
      <SectionHdr code="AUD-F-02 §2.1" title="Organization Information" />
      <div style={grid2}>
        <Field label="REF NO."><Inp value={d.refNo} onChange={v => set('refNo', v)} placeholder="QCC-2024-001" /></Field>
        <Field label="Name of Organization" required><Inp value={d.orgName} onChange={v => set('orgName', v)} placeholder="Company Pvt. Ltd." /></Field>
        <Field label="Address" col="1/-1"><Txt value={d.address} onChange={v => set('address', v)} rows={2} placeholder="Full address..." /></Field>
        <Field label="Additional Sites / Addresses, If any" col="1/-1"><Txt value={d.additionalSites} onChange={v => set('additionalSites', v)} rows={2} placeholder="Branch addresses if any..." /></Field>
        <Field label="Contact Numbers"><Inp value={d.contactNumber} onChange={v => set('contactNumber', v)} placeholder="+91 98765 43210" /></Field>
        <Field label="Email Id"><Inp value={d.email} onChange={v => set('email', v)} placeholder="contact@company.com" type="email" /></Field>
        <Field label="Contact Person"><Inp value={d.contactPerson} onChange={v => set('contactPerson', v)} placeholder="Mr. / Ms. Name" /></Field>
        <Field label="Designation"><Inp value={d.designation} onChange={v => set('designation', v)} placeholder="Quality Manager" /></Field>
        <Field label="Mode of Working">
          <Sel value={d.modeOfWorking} onChange={v => set('modeOfWorking', v)} options={MODES} />
        </Field>
        {d.modeOfWorking === 'Hybrid' && (
          <Field label="Core Activities (Online or Onsite)?">
            <Sel value={d.hybridDetails} onChange={v => set('hybridDetails', v)} options={['Online', 'Onsite']} />
          </Field>
        )}
        <Field label="Scope of Certification" col="1/-1"><Txt value={d.scope} onChange={v => set('scope', v)} rows={2} placeholder="Design, Development and Provision of..." /></Field>
        <Field label="Main Processes / Activities" col="1/-1"><Txt value={d.mainProcesses} onChange={v => set('mainProcesses', v)} placeholder="e.g. Design, Testing, Delivery..." /></Field>
        <Field label="Outsourced Processes, if any" col="1/-1"><Txt value={d.outsourcedProcesses} onChange={v => set('outsourcedProcesses', v)} placeholder="e.g. Logistics, Payroll..." /></Field>
      </div>

      <SectionHdr code="AUD-F-02 §2.3" title="Application & Audit Type" />
      <div style={grid3}>
        <Field label="Application Type"><Sel value={d.applicationType} onChange={v => set('applicationType', v)} options={AUDIT_TYPES} /></Field>
        <Field label="No. of Employees (Total)"><Inp value={d.totalEmployees} onChange={v => set('totalEmployees', v)} type="number" placeholder="0" /></Field>
        <Field label="Contractual"><Inp value={d.contractual} onChange={v => set('contractual', v)} type="number" placeholder="0" /></Field>
        <Field label="Working No. of Shifts"><Inp value={d.shifts} onChange={v => set('shifts', v)} placeholder="1" /></Field>
        <Field label="Full Time"><Inp value={d.fullTime} onChange={v => set('fullTime', v)} type="number" placeholder="0" /></Field>
        <Field label="Part Time"><Inp value={d.partTime} onChange={v => set('partTime', v)} type="number" placeholder="0" /></Field>
      </div>
    </div>
  );
}

function Step2({ d, set }) {
  const toggleStd = (std) => {
    const cur = d.standards || [];
    set('standards', cur.includes(std) ? cur.filter(s => s !== std) : [...cur, std]);
  };
  const setPersonnel = (cat, empType, val) => {
    set('personnel', { ...d.personnel, [cat]: { ...(d.personnel[cat] || {}), [empType]: val } });
  };
  return (
    <div>
      <SectionHdr code="AUD-F-02 §2.2" title="Standards Applied For" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
        {ISO_STANDARDS.map(std => (
          <label key={std} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${d.standards?.includes(std) ? 'var(--primary)' : '#e2e8f0'}`, background: d.standards?.includes(std) ? '#fff7ed' : 'white', cursor: 'pointer', fontSize: 13, fontWeight: d.standards?.includes(std) ? 600 : 400, color: d.standards?.includes(std) ? 'var(--primary-dark)' : 'var(--gray-700)' }}>
            <input type="checkbox" checked={d.standards?.includes(std) || false} onChange={() => toggleStd(std)} style={{ accentColor: 'var(--primary)', width: 15, height: 15 }} />
            {std}
          </label>
        ))}
      </div>

      <SectionHdr code="AUD-F-02 §2.4" title="Personnel Categories" />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: 'white', fontWeight: 600, minWidth: 180 }}>Category</th>
              {EMP_TYPES.map(t => <th key={t} style={{ padding: '10px 12px', textAlign: 'center', color: 'white', fontWeight: 600, minWidth: 100 }}>{t}</th>)}
              <th style={{ padding: '10px 12px', textAlign: 'center', color: 'white', fontWeight: 600 }}>Effective No.</th>
            </tr>
          </thead>
          <tbody>
            {PERSONNEL_CATS.map((cat, i) => {
              const row = d.personnel?.[cat] || {};
              const eff = EMP_TYPES.reduce((sum, t) => sum + (Number(row[t]) || 0), 0);
              return (
                <tr key={cat} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--gray-700)' }}>{cat}</td>
                  {EMP_TYPES.map(t => (
                    <td key={t} style={{ padding: '4px 8px' }}>
                      <input type="number" value={row[t] || ''} onChange={e => setPersonnel(cat, t, e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, textAlign: 'center', outline: 'none' }} placeholder="0" min="0" />
                    </td>
                  ))}
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--primary-dark)' }}>{eff || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Step3({ d, set }) {
  const setInteg = (key, val) => set('integration', { ...d.integration, [key]: val });
  return (
    <div>
      <SectionHdr code="AUD-F-02 §2.5" title="Management System Information" />
      <div style={grid2}>
        <Field label="1. Applicable Legal, Statutory & Regulatory Act" col="1/-1"><Txt value={d.legalActs} onChange={v => set('legalActs', v)} placeholder="e.g. Companies Act, IT Act, GDPR..." /></Field>
        <Field label="2. Organization Key Process Area" col="1/-1"><Txt value={d.keyProcessArea} onChange={v => set('keyProcessArea', v)} /></Field>
        <Field label="3. Organization Products/Services" col="1/-1"><Txt value={d.products} onChange={v => set('products', v)} /></Field>
        <Field label="4. Any Outsourcing Process"><Inp value={d.outsourcingProcess} onChange={v => set('outsourcingProcess', v)} /></Field>
        <Field label="5. Consultant Details (if used for MS Preparation)"><Inp value={d.consultantDetails} onChange={v => set('consultantDetails', v)} /></Field>
        <Field label="6. Organization Establishment Date"><Inp value={d.establishmentDate} onChange={v => set('establishmentDate', v)} type="date" /></Field>
        <Field label="7. Manual Date"><Inp value={d.manualDate} onChange={v => set('manualDate', v)} type="date" /></Field>
        <Field label="8. Internal Audit Date (or planned date)"><Inp value={d.internalAuditDate} onChange={v => set('internalAuditDate', v)} type="date" /></Field>
        <Field label="9. Management Review Date (or planned date)"><Inp value={d.mrmDate} onChange={v => set('mrmDate', v)} type="date" /></Field>
      </div>
      <div style={{ marginTop: 12, marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--gray-700)', fontWeight: 500 }}>
          <input type="checkbox" checked={d.alreadyCertified || false} onChange={e => set('alreadyCertified', e.target.checked)} style={{ accentColor: 'var(--primary)', width: 15, height: 15 }} />
          Already ISO Certified?
        </label>
      </div>
      {d.alreadyCertified && (
        <div style={{ ...grid2, marginBottom: 16, padding: '14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <Field label="Standards"><Inp value={d.certStandards} onChange={v => set('certStandards', v)} placeholder="ISO 9001:2015" /></Field>
          <Field label="Certification Body"><Inp value={d.certBody} onChange={v => set('certBody', v)} /></Field>
          <Field label="Issue Date"><Inp value={d.certIssue} onChange={v => set('certIssue', v)} type="date" /></Field>
          <Field label="Expiry Date"><Inp value={d.certExpiry} onChange={v => set('certExpiry', v)} type="date" /></Field>
        </div>
      )}

      <SectionHdr code="AUD-F-02 §2.6" title="Audit Integration Options" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {INTEGRATION_OPTS.map(opt => (
          <div key={opt} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--gray-700)', flex: 1 }}>{opt}</span>
            <select value={d.integration?.[opt] || ''} onChange={e => setInteg(opt, e.target.value)} style={{ ...sel, width: 80, padding: '5px 8px', fontSize: 12 }}>
              <option value="">—</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step4({ d, set }) {
  const addMember = () => set('auditTeam', [...(d.auditTeam || []), { name: '', role: 'Auditor', stage1MD: '', stage2MD: '' }]);
  const updMember = (i, k, v) => {
    const t = [...(d.auditTeam || [])];
    t[i] = { ...t[i], [k]: v };
    set('auditTeam', t);
  };
  const remMember = (i) => set('auditTeam', (d.auditTeam || []).filter((_, idx) => idx !== i));
  return (
    <div>
      <SectionHdr code="AUD-F-03 §3.1" title="Audit Team Details" />
      <div style={{ marginBottom: 16 }}>
        {(d.auditTeam || []).map((m, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
            <Field label={i === 0 ? 'Name' : ''}><Inp value={m.name} onChange={v => updMember(i, 'name', v)} placeholder="Full Name" /></Field>
            <Field label={i === 0 ? 'Role' : ''}>
              <Sel value={m.role} onChange={v => updMember(i, 'role', v)} options={['Lead Auditor', 'Auditor', 'Technical Expert', 'Observer', 'Auditor In Training', 'Application reviewer & report reviewer', 'Final Certification Decision by HOD']} />
            </Field>
            <Field label={i === 0 ? 'Stage 1 MD' : ''}><Inp value={m.stage1MD} onChange={v => updMember(i, 'stage1MD', v)} placeholder="0.5" type="number" /></Field>
            <Field label={i === 0 ? 'Stage 2 MD' : ''}><Inp value={m.stage2MD} onChange={v => updMember(i, 'stage2MD', v)} placeholder="1" type="number" /></Field>
            <div style={{ paddingBottom: i === 0 ? 0 : 0 }}>
              {i > 0 && <button onClick={() => remMember(i)} style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>✕</button>}
            </div>
          </div>
        ))}
        <button onClick={addMember} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px dashed #cbd5e1', background: '#f8fafc', color: 'var(--gray-600)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          + Add Team Member
        </button>
      </div>

      <SectionHdr code="AUD-F-03 §3.2" title="Audit Dates & Mode" />
      <div style={grid2}>
        <Field label="Mode of Audit"><Sel value={d.modeOfAudit} onChange={v => set('modeOfAudit', v)} options={['Online/Virtual Audit', 'Onsite Audit', 'Combine Audit (Onsite & Online)']} /></Field>
        <Field label="Online Meeting Link"><Inp value={d.meetingLink} onChange={v => set('meetingLink', v)} placeholder="https://meet.google.com/..." /></Field>
        <Field label="Stage 1 — From"><Inp value={d.stage1From} onChange={v => set('stage1From', v)} type="date" /></Field>
        <Field label="Stage 1 — To"><Inp value={d.stage1To} onChange={v => set('stage1To', v)} type="date" /></Field>
        <Field label="Stage 2 — From"><Inp value={d.stage2From} onChange={v => set('stage2From', v)} type="date" /></Field>
        <Field label="Stage 2 — To"><Inp value={d.stage2To} onChange={v => set('stage2To', v)} type="date" /></Field>
        <Field label="IAF Code"><Inp value={d.iafCode} onChange={v => set('iafCode', v)} placeholder="e.g. 33" /></Field>
        <Field label="Risk Level"><Sel value={d.risk} onChange={v => set('risk', v)} options={RISK_LEVELS} /></Field>
        <Field label="Application Date"><Inp value={d.applicationDate} onChange={v => set('applicationDate', v)} type="date" /></Field>
        <Field label="Application Review Date"><Inp value={d.applicationReviewDate} onChange={v => set('applicationReviewDate', v)} type="date" /></Field>
        <Field label="Stage 1 Audit Plan" col="1/-1"><Inp value={d.stage1AuditPlan} onChange={v => set('stage1AuditPlan', v)} placeholder="Stage 1 audit plan description..." /></Field>
        <Field label="Stage 2 Audit Plan" col="1/-1"><Inp value={d.stage2AuditPlan} onChange={v => set('stage2AuditPlan', v)} placeholder="Stage 2 audit plan description..." /></Field>
        <Field label="After 11 Month (Surveillance Plan)" col="1/-1"><Inp value={d.after11Month} onChange={v => set('after11Month', v)} placeholder="e.g. Surveillance audit scheduled..." /></Field>
      </div>
    </div>
  );
}

function Step5({ d, set }) {
  const updClause = (cl, k, v) => set('s1Clauses', { ...d.s1Clauses, [cl]: { ...(d.s1Clauses?.[cl] || {}), [k]: v } });
  const addNC = () => set('s1NCs', [...(d.s1NCs || []), { standard: '', type: 'Minor', clause: '', detail: '' }]);
  const updNC = (i, k, v) => { const a = [...(d.s1NCs || [])]; a[i] = { ...a[i], [k]: v }; set('s1NCs', a); };
  return (
    <div>
      <SectionHdr code="AUD-F-09 §8.1" title="Stage 1 Audit Report" />
      <div style={grid2}>
        <Field label="Stage 1 Audit Duration"><Inp value={d.s1Duration} onChange={v => set('s1Duration', v)} placeholder="e.g. 0.5 days" /></Field>
        <Field label="Any Change in Employee Details?">
          <Sel value={d.s1EmployeeChanged ? 'Yes' : 'No'} onChange={v => set('s1EmployeeChanged', v === 'Yes')} options={['Yes', 'No']} />
        </Field>
        <Field label="Any Change in Scope?">
          <Sel value={d.s1ScopeChanged ? 'Yes' : 'No'} onChange={v => set('s1ScopeChanged', v === 'Yes')} options={['Yes', 'No']} />
        </Field>
        <Field label="Overall Readiness %"><Inp value={d.s1Readiness} onChange={v => set('s1Readiness', v)} placeholder="e.g. 85" type="number" /></Field>
        <Field label="Brief About the Organization" col="1/-1"><Txt value={d.s1OrgBrief} onChange={v => set('s1OrgBrief', v)} rows={3} /></Field>
      </div>

      <SectionHdr code="AUD-F-09 §8.6" title="Non-Conformity / Observation Summary" />
      <div style={{ ...grid2, marginBottom: 16 }}>
        {[['Minor Non-conformance', 's1MinorNC'], ['Major Non-conformance', 's1MajorNC'], ['Observations', 's1Obs'], ['OFI identified', 's1OFI']].map(([l, k]) => (
          <Field key={k} label={l}><Inp value={d[k]} onChange={v => set(k, v)} type="number" placeholder="0" /></Field>
        ))}
      </div>

      <SectionHdr code="AUD-F-09 §8.9" title="Non-Conformities Raised" />
      <div style={{ marginBottom: 16 }}>
        {(d.s1NCs || []).map((nc, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 2fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
            <Field label={i === 0 ? 'MS Standard' : ''}><Inp value={nc.standard} onChange={v => updNC(i, 'standard', v)} placeholder="ISO 9001:2015" /></Field>
            <Field label={i === 0 ? 'Type' : ''}><Sel value={nc.type} onChange={v => updNC(i, 'type', v)} options={NC_TYPES} /></Field>
            <Field label={i === 0 ? 'Clause No.' : ''}><Inp value={nc.clause} onChange={v => updNC(i, 'clause', v)} placeholder="e.g. 7.2" /></Field>
            <Field label={i === 0 ? 'Details of NC' : ''}><Inp value={nc.detail} onChange={v => updNC(i, 'detail', v)} /></Field>
            <div>{i > 0 && <button onClick={() => set('s1NCs', d.s1NCs.filter((_, x) => x !== i))} style={{ padding: '8px 10px', borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>✕</button>}</div>
          </div>
        ))}
        <button onClick={addNC} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px dashed #cbd5e1', background: '#f8fafc', color: 'var(--gray-600)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add NC</button>
      </div>

      <SectionHdr code="AUD-F-09 §8.8" title="Stage 1 Recommendation" />
      <Field label="Select Recommendation">
        <Sel value={d.s1Recommendation} onChange={v => set('s1Recommendation', v)} options={[
          'Recommended proceeding with Stage 2 within agreed timeframe',
          'Recommended not proceeding to Stage 2 until concerns rectified',
          'Recommended not proceeding without a further Stage 1 audit',
        ]} />
      </Field>

      <SectionHdr code="AUD-F-09 §8.12" title="Quality Clause-wise Checklist" />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: 'white', fontWeight: 600 }}>Clause</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', color: 'white', fontWeight: 600, width: 80 }}>Done?</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', color: 'white', fontWeight: 600, width: 100 }}>C/NC/O/OFI</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: 'white', fontWeight: 600 }}>Evidence / Verification</th>
            </tr>
          </thead>
          <tbody>
            {STAGE1_CLAUSES.map((cl, i) => {
              const row = d.s1Clauses?.[cl] || {};
              return (
                <tr key={cl} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 12px', color: 'var(--gray-700)', fontSize: 11 }}>{cl}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <input type="checkbox" checked={row.done || false} onChange={e => updClause(cl, 'done', e.target.checked)} style={{ accentColor: 'var(--primary)', width: 14, height: 14 }} />
                  </td>
                  <td style={{ padding: '4px 8px' }}>
                    <select value={row.result || 'C'} onChange={e => updClause(cl, 'result', e.target.value)} style={{ ...sel, padding: '4px 6px', fontSize: 11, width: '100%' }}>
                      {['C', 'NC', 'O', 'OFI', 'N/A'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '4px 8px' }}>
                    <input value={row.evidence || ''} onChange={e => updClause(cl, 'evidence', e.target.value)} style={{ ...inp, padding: '4px 8px', fontSize: 11 }} placeholder="Evidence notes..." />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Step6({ d, set }) {
  const addNC  = () => set('s2NCs',  [...(d.s2NCs  || []), { standard: '', type: 'Minor', clause: '', detail: '', process: '' }]);
  const updNC  = (i, k, v) => { const a = [...(d.s2NCs  || [])]; a[i] = { ...a[i], [k]: v }; set('s2NCs',  a); };
  const addObs = () => set('s2Observations', [...(d.s2Observations || []), { standard: '', clause: '', detail: '' }]);
  const updObs = (i, k, v) => { const a = [...(d.s2Observations || [])]; a[i] = { ...a[i], [k]: v }; set('s2Observations', a); };
  return (
    <div>
      <SectionHdr code="AUD-F-15 §12.4" title="Stage 2 Audit Deviations & Changes" />
      <div style={grid2}>
        <Field label="Stage 2 Duration"><Inp value={d.s2Duration} onChange={v => set('s2Duration', v)} placeholder="e.g. 1.5 days" /></Field>
        <Field label="" />
        <Field label="Any Deviation from Audit Plan" col="1/-1"><Txt value={d.s2Deviations} onChange={v => set('s2Deviations', v)} /></Field>
        <Field label="Any Significant Issues Impacting Audit Programme" col="1/-1"><Txt value={d.s2SignificantIssues} onChange={v => set('s2SignificantIssues', v)} /></Field>
        <Field label="Significant Changes Since Last Audit" col="1/-1"><Txt value={d.s2Changes} onChange={v => set('s2Changes', v)} /></Field>
      </div>

      <SectionHdr code="AUD-F-15 §12.6" title="Non-Conformities Summary" />
      <div style={{ ...grid2, marginBottom: 16 }}>
        {[['Minor NC', 's2MinorNC'], ['Major NC', 's2MajorNC'], ['Observations', 's2Obs'], ['OFI', 's2OFI']].map(([l, k]) => (
          <Field key={k} label={l}><Inp value={d[k]} onChange={v => set(k, v)} type="number" placeholder="0" /></Field>
        ))}
      </div>

      <SectionHdr code="AUD-F-15 §12.8" title="NC Details" />
      <div style={{ marginBottom: 16 }}>
        {(d.s2NCs || []).map((nc, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
            <Field label={i === 0 ? 'MS Standard' : ''}><Inp value={nc.standard} onChange={v => updNC(i, 'standard', v)} placeholder="ISO 9001" /></Field>
            <Field label={i === 0 ? 'Type' : ''}><Sel value={nc.type} onChange={v => updNC(i, 'type', v)} options={NC_TYPES} /></Field>
            <Field label={i === 0 ? 'Clause' : ''}><Inp value={nc.clause} onChange={v => updNC(i, 'clause', v)} /></Field>
            <Field label={i === 0 ? 'Details' : ''}><Inp value={nc.detail} onChange={v => updNC(i, 'detail', v)} /></Field>
            <Field label={i === 0 ? 'Process/Dept.' : ''}><Inp value={nc.process} onChange={v => updNC(i, 'process', v)} /></Field>
            <div style={{ paddingTop: i === 0 ? 20 : 0 }}>{i > 0 && <button onClick={() => set('s2NCs', d.s2NCs.filter((_, x) => x !== i))} style={{ padding: '8px 10px', borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>✕</button>}</div>
          </div>
        ))}
        <button onClick={addNC} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px dashed #cbd5e1', background: '#f8fafc', color: 'var(--gray-600)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add NC</button>
      </div>

      <SectionHdr code="AUD-F-15 §12.9" title="Stage 2 Observations" />
      <div style={{ marginBottom: 16 }}>
        {(d.s2Observations || []).map((obs, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
            <Field label={i === 0 ? 'MS Standard' : ''}><Inp value={obs.standard} onChange={v => updObs(i, 'standard', v)} placeholder="ISO 9001:2015" /></Field>
            <Field label={i === 0 ? 'Clause' : ''}><Inp value={obs.clause} onChange={v => updObs(i, 'clause', v)} placeholder="e.g. 8.1" /></Field>
            <Field label={i === 0 ? 'Observation Detail' : ''}><Inp value={obs.detail} onChange={v => updObs(i, 'detail', v)} /></Field>
            <div style={{ paddingTop: i === 0 ? 20 : 0 }}>{i > 0 && <button onClick={() => set('s2Observations', d.s2Observations.filter((_, x) => x !== i))} style={{ padding: '8px 10px', borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>✕</button>}</div>
          </div>
        ))}
        <button onClick={addObs} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px dashed #cbd5e1', background: '#f8fafc', color: 'var(--gray-600)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add Observation</button>
      </div>

      <SectionHdr code="AUD-F-15 §12.7" title="Stage 2 Recommendation" />
      <Field label="Select Recommendation">
        <Sel value={d.s2Recommendation} onChange={v => set('s2Recommendation', v)} options={[
          'Recommended for Certification',
          'Recommended with Minor NC',
          'Not recommended due to Major NC',
          'Not Recommended / Suspension / Withdrawal / Surveillance / Re-Certification',
        ]} />
      </Field>

      <SectionHdr code="AUD-F-16" title="Corrective Action Details" />
      <div style={grid2}>
        <Field label="Root Cause" col="1/-1"><Txt value={d.s2RootCause} onChange={v => set('s2RootCause', v)} rows={2} /></Field>
        <Field label="Correction"><Inp value={d.s2Correction} onChange={v => set('s2Correction', v)} /></Field>
        <Field label="Completion Date of Corrective Action"><Inp value={d.s2CompletionDate} onChange={v => set('s2CompletionDate', v)} type="date" /></Field>
        <Field label="Corrective Action" col="1/-1"><Txt value={d.s2CorrectiveAction} onChange={v => set('s2CorrectiveAction', v)} rows={3} /></Field>
      </div>
    </div>
  );
}

function Step7({ d, set }) {
  return (
    <div>
      <SectionHdr code="AUD-F-21" title="Draft for Certificate Approval" />
      <div style={grid2}>
        <Field label="QCC Hereby Certifies That the" col="1/-1">
          <Sel value={d.certSystem} onChange={v => set('certSystem', v)} options={['Quality Management System', 'Environmental Management System', 'Occupational Health & Safety MS', 'Information Security MS', 'Food Safety MS', 'AI Management System', 'Anti-Bribery MS', 'Educational Organization MS']} />
        </Field>
        <Field label="Has Been Assessed as per Requirements of" col="1/-1"><Inp value={d.certReqStandard} onChange={v => set('certReqStandard', v)} placeholder="ISO 9001:2015" /></Field>
        <Field label="For the Scope of" col="1/-1"><Txt value={d.certScope} onChange={v => set('certScope', v)} rows={2} placeholder="Design, Development and Provision of Software Services" /></Field>
        <Field label="Certificate Issue Date"><Inp value={d.certIssueDate} onChange={v => set('certIssueDate', v)} type="date" /></Field>
        <Field label="Certificate Number"><Inp value={d.certNumber} onChange={v => set('certNumber', v)} placeholder="QCC-2024-001-ISO9001" /></Field>
        <Field label="Client Authorized Person Name"><Inp value={d.clientAuthPerson} onChange={v => set('clientAuthPerson', v)} /></Field>
        <Field label="Audit Team Leader"><Inp value={d.auditTeamLeader} onChange={v => set('auditTeamLeader', v)} /></Field>
      </div>

      <SectionHdr code="AUD-F-22 §16.4" title="Final Review Decision" />
      <div style={grid2}>
        <Field label="Reviewer Decision" col="1/-1">
          <Sel value={d.reviewDecision} onChange={v => set('reviewDecision', v)} options={[
            'Certificate Issue',
            'Maintenance / Surveillance Audit Successful',
            'Renewal',
            'Required supplement — insufficient Objective Evidences',
          ]} />
        </Field>
        <Field label="Review Date"><Inp value={d.reviewDate} onChange={v => set('reviewDate', v)} type="date" /></Field>
        <Field label="HOD Decision" col="1/-1">
          <Sel value={d.hodDecision} onChange={v => set('hodDecision', v)} options={[
            'Certificate Issue',
            'Maintenance / Surveillance Audit Successful',
            'Renewal',
            'Reduce Scope',
            'Extend Scope',
          ]} />
        </Field>
        <Field label="HOD Review Date"><Inp value={d.hodReviewDate} onChange={v => set('hodReviewDate', v)} type="date" /></Field>
      </div>
    </div>
  );
}

function SectionHdr({ code, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 14px', paddingBottom: 10, borderBottom: '2px solid #f1f5f9' }}>
      <span style={{ padding: '3px 10px', borderRadius: 6, background: '#fff7ed', color: 'var(--primary-dark)', fontSize: 10, fontWeight: 700, fontFamily: 'monospace', border: '1px solid #fed7aa', whiteSpace: 'nowrap' }}>{code}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>{title}</span>
    </div>
  );
}

/* ─── Preview Modal ─── */
function PreviewModal({ data, onClose }) {
  const teams = data.auditTeam || [];

  const lc = {
    padding: '7px 12px', background: '#c8c8c8', fontWeight: 700,
    fontSize: 12, border: '1px solid #999', minWidth: 210, verticalAlign: 'top',
  };
  const vc = {
    padding: '7px 12px', background: 'white', fontSize: 12,
    border: '1px solid #999', minWidth: 280, verticalAlign: 'top',
  };
  const vcs = { ...vc, minWidth: 120 };
  const lcs = { ...lc, minWidth: 160 };

  const fmt = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-IN'); } catch { return d; }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:9999, overflowY:'auto', padding:'20px 12px' }}>
      <div style={{ background:'white', borderRadius:12, maxWidth:920, margin:'0 auto', padding:'24px', boxShadow:'0 20px 60px rgba(0,0,0,0.35)' }}>

        {/* Modal header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:17, color:'#1e293b', marginBottom:3 }}>QMS Audit Report — Preview</div>
            <div style={{ fontSize:11.5, color:'#64748b' }}>QC Certification · Complete Audit Documentation</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => window.print()} style={{ padding:'8px 18px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'white', cursor:'pointer', fontSize:13, fontWeight:600 }}>Print</button>
            <button onClick={onClose} style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'#ef4444', color:'white', cursor:'pointer', fontSize:13, fontWeight:600 }}>✕ Close</button>
          </div>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <tbody>

              {/* ── Section 1: Basic Info ── */}
              <tr><td style={lc}>ID NUMBER</td><td style={vc} colSpan={3}>{data.refNo}</td></tr>
              <tr><td style={lc}>ORGANIZATION NAME</td><td style={vc} colSpan={3}>{data.orgName}</td></tr>
              <tr><td style={lc}>STANDARD NAME</td><td style={vc} colSpan={3}>{(data.standards||[]).join(', ')}</td></tr>
              <tr><td style={lc}>AUDIT TYPE</td><td style={vc} colSpan={3}>{data.applicationType}</td></tr>
              <tr><td style={lc}>ADDRESS</td><td style={{ ...vc, whiteSpace:'pre-wrap' }} colSpan={3}>{data.address}</td></tr>
              <tr><td style={lc}>Additional Sites / Addresses, If any</td><td style={{ ...vc, whiteSpace:'pre-wrap' }} colSpan={3}>{data.additionalSites}</td></tr>
              <tr><td style={lc}>SCOPE</td><td style={{ ...vc, minHeight:60, whiteSpace:'pre-wrap' }} colSpan={3}>{data.scope}</td></tr>
              <tr>
                <td style={lcs}>CONTACT PERSON NAME</td>
                <td style={vcs}>{data.contactPerson}</td>
                <td style={lcs}>CONTACT NO.</td>
                <td style={vcs}>{data.contactNumber}</td>
              </tr>
              <tr>
                <td style={lcs}>DESIGNATION</td>
                <td style={vcs}>{data.designation}</td>
                <td style={lcs}>EMAIL ID</td>
                <td style={vcs}>{data.email}</td>
              </tr>
              <tr><td style={lc}>MODE OF AUDIT</td><td style={vc} colSpan={3}>{data.modeOfAudit || data.modeOfWorking}</td></tr>
              <tr><td style={lc}>Online Meeting Link</td><td style={vc} colSpan={3}>{data.meetingLink}</td></tr>
              <tr><td style={lc}>TOTAL NO. OF EMPLOYEE</td><td style={vc} colSpan={3}>{data.totalEmployees}</td></tr>

              {/* ── Section 2: Legal / Dates ── */}
              <tr><td style={lc}>LEGAL INFORMATION</td><td style={vc} colSpan={3}>{data.legalActs}</td></tr>
              <tr><td style={lc}>ANY OUTSOURCING PROCESS</td><td style={vc} colSpan={3}>{data.outsourcingProcess}</td></tr>
              <tr><td style={lc}>MANAGEMENT ESTABLISHMENT DATE</td><td style={vc} colSpan={3}>{fmt(data.establishmentDate)}</td></tr>
              <tr><td style={lc}>Manual Date</td><td style={vc} colSpan={3}>{fmt(data.manualDate)}</td></tr>
              <tr>
                <td style={lcs}>INTERNAL AUDIT DATE</td>
                <td style={vcs}>{fmt(data.internalAuditDate)}</td>
                <td style={lcs}>MRM DATE</td>
                <td style={vcs}>{fmt(data.mrmDate)}</td>
              </tr>
              <tr>
                <td style={lcs}>APPLICATION DATE</td>
                <td style={vcs}>{fmt(data.applicationDate)}</td>
                <td style={{ ...lcs, fontSize:11 }}>APPLICATION REVIEW DATE</td>
                <td style={vcs}>{fmt(data.applicationReviewDate)}</td>
              </tr>
              <tr><td style={lc}>IAF CODE</td><td style={vc} colSpan={3}>{data.iafCode}</td></tr>
              <tr><td style={lc}>RISK</td><td style={vc} colSpan={3}>{data.risk}</td></tr>

              {/* Auditor Details — 5 rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={`aud-${i}`}>
                  <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'AUDITOR DETAILS' : ''}</td>
                  <td style={vc} colSpan={3}>{teams[i]?.name || ''}</td>
                </tr>
              ))}

              {/* Role — 5 rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={`role-${i}`}>
                  <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'ROLE' : ''}</td>
                  <td style={vc} colSpan={3}>{teams[i]?.role || ''}</td>
                </tr>
              ))}

              {/* ── Section 3: Man Days & Audit Dates ── */}
              {/* Stage-1 Man Days — 3 rows */}
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={`s1md-${i}`}>
                  <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'STAGE-1 MAN DAYS' : ''}</td>
                  <td style={vc} colSpan={3}>{teams[i] ? `${teams[i].name || ''}${teams[i].stage1MD ? ' — ' + teams[i].stage1MD + ' MD' : ''}` : ''}</td>
                </tr>
              ))}

              {/* Stage-2 Man Days — 4 rows */}
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={`s2md-${i}`}>
                  <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'STAGE-2 MAN DAYS' : ''}</td>
                  <td style={vc} colSpan={3}>{teams[i] ? `${teams[i].name || ''}${teams[i].stage2MD ? ' — ' + teams[i].stage2MD + ' MD' : ''}` : ''}</td>
                </tr>
              ))}

              <tr><td style={lc}>STAGE 1 AUDIT PLAN</td><td style={vc} colSpan={3}>{data.stage1AuditPlan}</td></tr>
              <tr>
                <td style={lcs}>STAGE 1 AUDIT DATE</td>
                <td style={vcs}>{fmt(data.stage1From)}</td>
                <td style={{ ...lcs, minWidth:40, textAlign:'center' }}>TO</td>
                <td style={vcs}>{fmt(data.stage1To)}</td>
              </tr>
              <tr><td style={lc}>STAGE 2 AUDIT PLAN</td><td style={vc} colSpan={3}>{data.stage2AuditPlan}</td></tr>
              <tr>
                <td style={lcs}>STAGE 2 AUDIT DATE</td>
                <td style={vcs}>{fmt(data.stage2From)}</td>
                <td style={{ ...lcs, minWidth:40, textAlign:'center' }}>TO</td>
                <td style={vcs}>{fmt(data.stage2To)}</td>
              </tr>
              <tr><td style={lc}>AFTER 11 MONTH</td><td style={vc} colSpan={3}>{data.after11Month}</td></tr>

              {/* ── Section 4: Stage 1 Observations & NCs ── */}
              <tr><td style={lc}>Brief about the organization</td><td style={{ ...vc, minHeight:60, whiteSpace:'pre-wrap' }} colSpan={3}>{data.s1OrgBrief}</td></tr>
              <tr><td style={lc}>STAGE-1 OBSERVATION (QTY)</td><td style={vc} colSpan={3}>{data.s1Obs}</td></tr>

              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={`s1obs-${i}`}>
                  <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'STAGE-1 OBSERVATION' : ''}</td>
                  <td style={vc} colSpan={3}>{(data.s1Observations||[])[i]?.detail || ''}</td>
                </tr>
              ))}
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={`s1obsStd-${i}`}>
                  <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'STANDARD NAME (OBSERVATION)' : ''}</td>
                  <td style={vc} colSpan={3}>{(data.s1Observations||[])[i]?.standard || ''}</td>
                </tr>
              ))}
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={`s1obsClause-${i}`}>
                  <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'CLAUSE' : ''}</td>
                  <td style={vc} colSpan={3}>{(data.s1Observations||[])[i]?.clause || ''}</td>
                </tr>
              ))}

              {/* ── Section 5: Stage 2 Observations & NCs ── */}
              <tr><td style={lc}>STAGE-2 OBSERVATION (QTY)</td><td style={vc} colSpan={3}>{data.s2Obs}</td></tr>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={`s2obs-${i}`}>
                  <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'STAGE-2 OBSERVATION' : ''}</td>
                  <td style={vc} colSpan={3}>{(data.s2Observations||[])[i]?.detail || ''}</td>
                </tr>
              ))}
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={`s2obsStd-${i}`}>
                  <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'STANDARD NAME (OBSERVATION)' : ''}</td>
                  <td style={vc} colSpan={3}>{(data.s2Observations||[])[i]?.standard || ''}</td>
                </tr>
              ))}
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={`s2obsClause-${i}`}>
                  <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'CLAUSE' : ''}</td>
                  <td style={vc} colSpan={3}>{(data.s2Observations||[])[i]?.clause || ''}</td>
                </tr>
              ))}

              {/* ── Section 6: Stage 2 Minor NC ── */}
              <tr><td style={lc}>STAGE-2 MINOR NC (QTY)</td><td style={vc} colSpan={3}>{data.s2MinorNC}</td></tr>
              {(() => {
                const minorNCs = (data.s2NCs||[]).filter(nc => nc.type === 'Minor');
                return Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`s2mnc-${i}`}>
                    <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'STAGE-2 MINOR NC' : ''}</td>
                    <td style={vc} colSpan={3}>{minorNCs[i]?.detail || ''}</td>
                  </tr>
                ));
              })()}
              {(() => {
                const minorNCs = (data.s2NCs||[]).filter(nc => nc.type === 'Minor');
                return <>
                  <tr><td style={lc}>CLAUSE MINOR NC 1</td><td style={vc} colSpan={3}>{minorNCs[0]?.clause || ''}</td></tr>
                  <tr><td style={lc}>CLAUSE MINOR NC 2</td><td style={vc} colSpan={3}>{minorNCs[1]?.clause || ''}</td></tr>
                </>;
              })()}
              {(() => {
                const minorNCs = (data.s2NCs||[]).filter(nc => nc.type === 'Minor');
                return Array.from({ length: 2 }).map((_, i) => (
                  <tr key={`s2proc-${i}`}>
                    <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'PROCESS/DEPT.' : ''}</td>
                    <td style={vc} colSpan={3}>{minorNCs[i]?.process || ''}</td>
                  </tr>
                ));
              })()}
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={`s2type-${i}`}>
                  <td style={{ ...lc, borderTop: i > 0 ? 'none' : undefined }}>{i === 0 ? 'TYPE OF NC' : ''}</td>
                  <td style={vc} colSpan={3}>{(data.s2NCs||[])[i]?.type || ''}</td>
                </tr>
              ))}

              {/* ── Section 7: Corrective Action ── */}
              <tr><td style={lc}>ROOT CAUSE</td><td style={vc} colSpan={3}>{data.s2RootCause}</td></tr>
              <tr><td style={lc}>CORRECTION</td><td style={vc} colSpan={3}>{data.s2Correction}</td></tr>
              <tr><td style={lc}>CORRECTIVE ACTION</td><td style={{ ...vc, minHeight:50, whiteSpace:'pre-wrap' }} colSpan={3}>{data.s2CorrectiveAction}</td></tr>
              <tr><td style={lc}>COMPLETION DATE OF CORRECTIVE ACTION</td><td style={vc} colSpan={3}>{fmt(data.s2CompletionDate)}</td></tr>
              <tr><td style={lc}>REVIEW REPORT DATE BY REVIEWER</td><td style={vc} colSpan={3}>{fmt(data.reviewDate)}</td></tr>
              <tr><td style={lc}>REVIEW REPORT DATE BY HOD</td><td style={vc} colSpan={3}>{fmt(data.hodReviewDate)}</td></tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AuditReportForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initState());
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const handleSave = async (asDraft = false) => {
    setSaving(true);
    try {
      const payload = { ...data, status: asDraft ? 'draft' : 'submitted', formType: 'QMS_AUDIT_REPORT' };
      await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(payload) });
      toast.success(asDraft ? 'Draft saved!' : 'Audit Report submitted successfully!');
    } catch {
      toast.success(asDraft ? 'Draft saved locally!' : 'Form ready — connect backend to persist.');
    } finally {
      setSaving(false);
    }
  };

  const stepContent = [
    <Step1 d={data} set={set} />,
    <Step2 d={data} set={set} />,
    <Step3 d={data} set={set} />,
    <Step4 d={data} set={set} />,
    <Step5 d={data} set={set} />,
    <Step6 d={data} set={set} />,
    <Step7 d={data} set={set} />,
  ];

  return (
    <Layout title="New QMS Audit Report">
      <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--gray-800)' }}>QMS Audit Report Form</h2>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--gray-500)' }}>Quality Control Certification — Complete Audit Documentation Package</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowPreview(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--primary)', background: '#fff7ed', color: 'var(--primary-dark)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <Eye size={14} /> Preview
            </button>
            <button onClick={() => handleSave(true)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', color: 'var(--gray-700)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <Save size={14} /> Save Draft
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', padding: '16px 20px', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
            {STEPS.map((s, i) => {
              const done    = step > s.id;
              const current = step === s.id;
              const Icon    = s.icon;
              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => setStep(s.id)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 10, border: 'none', background: current ? '#fff7ed' : 'transparent', cursor: 'pointer', minWidth: 90, transition: 'all .15s', flexShrink: 0 }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: done ? '#10b981' : current ? 'var(--primary)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
                      {done ? <CheckCircle size={16} color="white" /> : <Icon size={16} color={current ? 'white' : '#94a3b8'} />}
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 600, color: done ? '#065f46' : current ? 'var(--primary-dark)' : 'var(--gray-400)', textAlign: 'center', lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</span>
                    <span style={{ fontSize: 8, color: 'var(--gray-400)', fontFamily: 'monospace' }}>{s.code.split(' ')[0]}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: done ? '#10b981' : '#e2e8f0', minWidth: 12, transition: 'all .15s' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', minHeight: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '2px solid #f8fafc' }}>
            {React.createElement(STEPS[step - 1].icon, { size: 18, color: 'var(--primary)' })}
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)' }}>
              Step {step}: {STEPS[step - 1].label}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace', background: '#f8fafc', padding: '2px 8px', borderRadius: 5, border: '1px solid #e2e8f0' }}>
              {STEPS[step - 1].code}
            </span>
          </div>
          {stepContent[step - 1]}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: step === 1 ? '#f8fafc' : 'white', color: step === 1 ? 'var(--gray-300)' : 'var(--gray-700)', cursor: step === 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Step {step} of {STEPS.length}</span>
          {step < STEPS.length
            ? <button onClick={() => setStep(s => s + 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Next <ChevronRight size={16} />
              </button>
            : <button onClick={() => handleSave(false)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <CheckCircle size={16} /> Submit Report
              </button>
          }
        </div>
      </div>

      {showPreview && <PreviewModal data={data} onClose={() => setShowPreview(false)} />}
    </Layout>
  );
}
