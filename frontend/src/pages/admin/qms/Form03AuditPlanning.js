import React, { useState, useEffect } from 'react';
import QMSFormPage, { SectionTitle } from './QMSFormPage';
import { FiChevronRight, FiPlus, FiMinus, FiX, FiColumns, FiTrash2 } from 'react-icons/fi';

/* ============ Column catalogue (canonical display order) ============ */
const COLUMNS = [
  { id: 'initial',     label: 'Initial Audit',               sub: '',                type: 'check', removable: false },
  { id: 'csf_initial', label: 'Client-Specific Audit Focus', sub: 'Initial',         type: 'text',  removable: true  },
  { id: 'surv1',       label: 'Surveillance-I',              sub: '',                type: 'check', removable: true  },
  { id: 'csf_surv1',   label: 'Client-Specific Audit Focus', sub: 'Surveillance-I',  type: 'text',  removable: true  },
  { id: 'surv2',       label: 'Surveillance-II',             sub: '',                type: 'check', removable: true  },
  { id: 'csf_surv2',   label: 'Client-Specific Audit Focus', sub: 'Surveillance-II', type: 'text',  removable: true  },
  { id: 'recert',      label: 'Recertification',             sub: '',                type: 'check', removable: true  },
];
const colOrder = id => COLUMNS.findIndex(c => c.id === id);
const colById  = id => COLUMNS.find(c => c.id === id);

/* ============ Generic Annex-SL (high-level structure) clause set ============ */
/* ============ Full clause set ============
   The complete ISO high-level-structure clause checklist (4.1 → 10.3). Applied to
   EVERY standard so each accordion opens with all clauses; extra clauses can still
   be added per standard via the "Add clause" button.                                */
const FULL_CLAUSES = [
  ['4.1', 'Understanding the Organization and its Context', 'The organization shall determine whether climate change is a relevant issue.'],
  ['4.2', 'Needs and Expectations of Interested Parties', 'NOTE: Relevant interested parties can have requirements related to climate change.'],
  ['4.3', 'Scope of Management System', ''],
  ['4.4', 'Management System and its Processes', ''],
  ['5.1', 'Leadership and Commitment', ''],
  ['5.2', 'Policy', ''],
  ['5.3', 'Roles, Responsibilities and Authorities', ''],
  ['6.1', 'Actions to Address Risks and Opportunities', ''],
  ['6.2', 'Objectives and Planning to Achieve Them', ''],
  ['6.3', 'Planning of Changes', ''],
  ['7.1', 'Resources', ''],
  ['7.2', 'Competence', ''],
  ['7.3', 'Awareness', ''],
  ['7.4', 'Communication', ''],
  ['7.5', 'Documented Information', ''],
  ['8.1', 'Operational Planning and Control', ''],
  ['8.2', 'Requirements for Products and Services', ''],
  ['8.3', 'Design and Development', ''],
  ['8.4', 'Control of Externally Provided Processes, Products and Services', ''],
  ['8.5', 'Production and Service Provision', ''],
  ['8.6', 'Release of Products and Services', ''],
  ['8.7', 'Control of Nonconforming Outputs', ''],
  ['9.1', 'Monitoring, Measurement, Analysis and Evaluation', ''],
  ['9.1.2', 'Customer Satisfaction / Customer Feedback', ''],
  ['9.2', 'Internal Audit', ''],
  ['9.3', 'Management Review', ''],
  ['10.1', 'Improvement / Continual Improvement', ''],
  ['10.2', 'Nonconformity and Corrective Action', ''],
  ['10.3', 'Continual Improvement', ''],
];

/* ============ Standards catalogue ============
   Keys match the ISO standard labels used across the application (NewApplication.js),
   so the standards selected here line up with what the client applied for. Every
   standard uses the full clause set above.                                          */
const STANDARD_META = {
  'ISO 9001:2015':      { code: '9001',  desc: 'Quality Management System' },
  'ISO 14001:2015':     { code: '14001', desc: 'Environmental Management System' },
  'ISO 45001:2018':     { code: '45001', desc: 'Occupational Health & Safety' },
  'ISO 22000:2018':     { code: '22000', desc: 'Food Safety Management' },
  'ISO 27001:2022':     { code: '27001', desc: 'Information Security Management' },
  'ISO/IEC 27701:2025': { code: '27701', desc: 'Privacy Information Management' },
  'ISO/IEC 42001:2023': { code: '42001', desc: 'AI Management System' },
  'ISO 22301:2019':     { code: '22301', desc: 'Business Continuity Management' },
  'ISO 37001:2016':     { code: '37001', desc: 'Anti-Bribery Management' },
  'ISO 21001:2018':     { code: '21001', desc: 'Educational Organizations' },
  'ISO 50001:2018':     { code: '50001', desc: 'Energy Management System' },
};
const STANDARDS = Object.fromEntries(
  Object.entries(STANDARD_META).map(([key, m]) => [key, { ...m, clauses: FULL_CLAUSES }])
);
const STANDARD_KEYS = Object.keys(STANDARDS);

/* All the standards the client selected in their Application Form (F01).
   The backend (/api/qms-forms/client/:id) returns `standards` as an array and also
   joins them into `isoStandard`; prefer the array, fall back to the joined string. */
function deriveClientStandards(clientInfo) {
  if (!clientInfo) return [];
  let tokens = [];
  if (Array.isArray(clientInfo.standards)) {
    tokens = clientInfo.standards;
  } else {
    const raw = [clientInfo.isoStandard, clientInfo.isoStandards, clientInfo.standard]
      .filter(Boolean)
      .join(',');
    tokens = raw.split(',');
  }
  tokens = tokens.map(s => String(s).trim()).filter(Boolean);
  // Keep only standards present in the catalogue, in canonical display order.
  return STANDARD_KEYS.filter(k => tokens.includes(k));
}

const blankStd = () => ({ open: true, cols: ['initial'], values: {}, notes: {}, extra: [] });
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/* ───────────────────────── Inner interactive component ───────────────────────── */
function AuditProgramme({ data, set, clientInfo }) {
  const [openPop, setOpenPop] = useState(null); // `${stdKey}:add` | `${stdKey}:rem`

  const byStd = data.byStd || {};

  // Standards the client picked in their Application Form (F01).
  //  - liveApp:  fetched from the client record loaded into the banner (search / edit).
  //  - savedApp: the same list snapshotted into this form's data the first time it loaded,
  //              so it still works when reopened later from the list view.
  const liveApp  = deriveClientStandards(clientInfo);
  const savedApp = Array.isArray(data.appStandards) ? data.appStandards : [];
  const appStandards = STANDARD_KEYS.filter(k => liveApp.includes(k) || savedApp.includes(k));

  // What is actually shown as accordions. An explicit, non-empty selection wins;
  // otherwise default to every standard from the application.
  const hasSelection = Array.isArray(data.standards) && data.standards.length > 0;
  const selected = hasSelection ? data.standards : appStandards;

  // Snapshot the application standards + default selection into the form data once it
  // becomes available, so the data survives saving and reopening from the list.
  useEffect(() => {
    if (liveApp.length && JSON.stringify(savedApp) !== JSON.stringify(liveApp)) {
      set('appStandards', liveApp);
    }
    if (!hasSelection && appStandards.length) {
      set('standards', appStandards);
    }
  }, [clientInfo]); // eslint-disable-line

  const getStd  = key => byStd[key] || blankStd();
  const setStd  = (key, patch) => set('byStd', { ...byStd, [key]: { ...getStd(key), ...patch } });

  const toggleStandard = (key) => {
    if (selected.includes(key)) {
      set('standards', selected.filter(k => k !== key));
    } else {
      set('standards', [...selected, key]);
      if (!byStd[key]) setStd(key, blankStd());
    }
    setOpenPop(null);
  };

  const togglePop = (id) => setOpenPop(p => (p === id ? null : id));

  // close popover on outside click
  useEffect(() => {
    const onDoc = () => setOpenPop(null);
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const orderedSelected = STANDARD_KEYS.filter(k => selected.includes(k));

  // The picker offers the application's standards plus anything already selected/saved.
  const pickerKeys = STANDARD_KEYS.filter(k => appStandards.includes(k) || selected.includes(k));

  return (
    <div>
      <SectionTitle>Audit Programme — Standards in Scope</SectionTitle>

      {/* Standard picker — fetched from the client's application */}
      <div className="aud3-picker">
        <div className="aud3-picker-hd">
          Standards from the client's application{appStandards.length ? ` (${appStandards.length} selected)` : ''}
        </div>
        {pickerKeys.length === 0 ? (
          <div className="aud3-picker-empty">
            No ISO standards were selected in this client's Application Form (F01).
          </div>
        ) : (
          <div className="aud3-picker-grid">
            {pickerKeys.map(key => {
              const on = selected.includes(key);
              return (
                <label key={key} className={`aud3-chip${on ? ' on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleStandard(key)} />
                  {key}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Accordions */}
      <SectionTitle>3-Year Audit Programme — Initial, Surveillance &amp; Recertification</SectionTitle>
      {orderedSelected.length === 0 ? (
        <div className="aud3-empty">
          No standard selected yet. Tick a standard above to build its clause checklist.
        </div>
      ) : (
        <div className="aud3-stack">
          {orderedSelected.map(key => (
            <StandardCard
              key={key}
              stdKey={key}
              st={getStd(key)}
              setStd={patch => setStd(key, patch)}
              openPop={openPop}
              togglePop={togglePop}
              closePop={() => setOpenPop(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── One standard accordion ───────────────────────── */
function StandardCard({ stdKey, st, setStd, openPop, togglePop, closePop }) {
  const meta = STANDARDS[stdKey];
  const scope = `ISO ${meta.code}`;
  const addable   = COLUMNS.filter(c => c.id !== 'initial' && !st.cols.includes(c.id));
  const removable = st.cols.filter(id => colById(id).removable);

  const addCol = (id) => {
    const cols = [...st.cols, id].sort((a, b) => colOrder(a) - colOrder(b));
    setStd({ cols });
    closePop();
  };
  const removeCol = (id) => { setStd({ cols: st.cols.filter(x => x !== id) }); closePop(); };

  const setCheck = (rowKey, colId, val) => {
    const values = { ...st.values, [rowKey]: { ...(st.values[rowKey] || {}), [colId]: val } };
    setStd({ values });
  };
  const setNote = (colId, field, val) => {
    const notes = { ...st.notes, [colId]: { ...(st.notes[colId] || {}), [field]: val } };
    setStd({ notes });
  };

  // Custom clauses the user adds to this standard (editable + removable).
  const extra = Array.isArray(st.extra) ? st.extra : [];
  const addClause = () => setStd({ extra: [...extra, { id: uid(), num: '', title: '' }] });
  const setExtra = (id, field, val) =>
    setStd({ extra: extra.map(e => (e.id === id ? { ...e, [field]: val } : e)) });
  const removeClause = (id) => {
    const values = { ...st.values };
    delete values[`x_${id}`];
    setStd({ extra: extra.filter(e => e.id !== id), values });
  };

  // Combined row list: fixed catalogue clauses + custom ones.
  const rows = [
    ...meta.clauses.map(([num, title, desc]) => ({ key: num, num, title, desc, fixed: true })),
    ...extra.map(e => ({ key: `x_${e.id}`, id: e.id, num: e.num, title: e.title, desc: '', fixed: false })),
  ];
  const N = rows.length;

  return (
    <section className={`aud3-std${st.open ? ' open' : ''}`}>
      {/* header */}
      <button type="button" className="aud3-head" onClick={() => setStd({ open: !st.open })}>
        <span className="aud3-chev"><FiChevronRight size={18} /></span>
        <span className="aud3-mark">{meta.code}</span>
        <span className="aud3-title">
          <span className="name">{stdKey}</span>
          <span className="desc">{meta.desc}</span>
        </span>
        <span className="aud3-meta">
          <span className="aud3-pill">{N} clauses</span>
          <span className="aud3-pill active">{st.cols.length} column{st.cols.length > 1 ? 's' : ''}</span>
        </span>
      </button>

      {st.open && (
        <div className="aud3-body">
          {/* toolbar */}
          <div className="aud3-toolbar" onClick={e => e.stopPropagation()}>
            <span className="lbl">Columns</span>

            {/* Add */}
            <div className="aud3-pop-wrap">
              <button
                type="button"
                className="aud3-btn add"
                disabled={addable.length === 0}
                onClick={e => { e.stopPropagation(); togglePop(`${stdKey}:add`); }}
              >
                <FiPlus size={14} /> Add column
              </button>
              {openPop === `${stdKey}:add` && (
                <div className="aud3-pop" onClick={e => e.stopPropagation()}>
                  <div className="aud3-pop-hd">Add a column to {scope}</div>
                  {addable.map(c => (
                    <button key={c.id} type="button" className="aud3-opt" onClick={() => addCol(c.id)}>
                      <FiColumns size={15} />
                      <span>{c.label}{c.sub ? <span style={{ color: 'var(--gray-400)' }}> · {c.sub}</span> : ''}</span>
                      <span className="tag">{c.type === 'check' ? 'checkbox' : 'text'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Remove */}
            <div className="aud3-pop-wrap">
              <button
                type="button"
                className="aud3-btn rem"
                disabled={removable.length === 0}
                onClick={e => { e.stopPropagation(); togglePop(`${stdKey}:rem`); }}
              >
                <FiMinus size={14} /> Remove column
              </button>
              {openPop === `${stdKey}:rem` && (
                <div className="aud3-pop" onClick={e => e.stopPropagation()}>
                  <div className="aud3-pop-hd">Remove a column from {scope}</div>
                  {removable.length === 0 ? (
                    <div className="aud3-pop-empty">Only the Initial Audit column is shown.</div>
                  ) : removable.map(id => {
                    const c = colById(id);
                    return (
                      <button key={id} type="button" className="aud3-opt danger" onClick={() => removeCol(id)}>
                        <FiTrash2 size={15} />
                        <span>{c.label}{c.sub ? <span style={{ opacity: .7 }}> · {c.sub}</span> : ''}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button type="button" className="aud3-btn add" onClick={e => { e.stopPropagation(); addClause(); }}>
              <FiPlus size={14} /> Add clause
            </button>

            <span className="aud3-spacer" />
            <span className="aud3-pill">{st.cols.length} of {COLUMNS.length} columns active</span>
          </div>

          {/* table */}
          <div className="aud3-tscroll">
            <table className="aud3-table">
              <thead>
                <tr>
                  <th className="col-area">Sub-Clause / Audit Area</th>
                  {st.cols.map(id => {
                    const c = colById(id);
                    return (
                      <th key={id} className={`aud3-colhead ${c.type === 'check' ? 'col-check' : 'col-focus'}`}>
                        {c.label}{c.sub && <span className="sub">{c.sub}</span>}
                        <span className="scope">{scope}</span>
                        {c.removable && (
                          <button type="button" className="x" title={`Remove ${c.label}`} onClick={() => removeCol(id)}>
                            <FiX size={13} />
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const vals = st.values[r.key] || {};
                  return (
                    <tr key={r.key}>
                      <td className="area">
                        {r.fixed ? (
                          <div className="aud3-clause">
                            <span className="aud3-cnum">{r.num}</span>
                            <span>
                              <span className="aud3-ct">{r.title}</span>
                              {r.desc && <span className="aud3-cd">{r.desc}</span>}
                            </span>
                          </div>
                        ) : (
                          <div className="aud3-clause aud3-clause-edit">
                            <input
                              className="aud3-clause-num-inp"
                              value={r.num}
                              placeholder="No."
                              onChange={e => setExtra(r.id, 'num', e.target.value)}
                              aria-label="Clause number"
                            />
                            <input
                              className="aud3-clause-title-inp"
                              value={r.title}
                              placeholder="Audit area / clause title…"
                              onChange={e => setExtra(r.id, 'title', e.target.value)}
                              aria-label="Clause title"
                            />
                            <button
                              type="button"
                              className="aud3-clause-del"
                              title="Remove this clause"
                              onClick={() => removeClause(r.id)}
                            >
                              <FiX size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                      {st.cols.map(id => {
                        const c = colById(id);
                        if (c.type === 'check') {
                          return (
                            <td key={id} className="col-check">
                              <input
                                type="checkbox"
                                className="aud3-cbx"
                                checked={!!vals[id]}
                                onChange={e => setCheck(r.key, id, e.target.checked)}
                                aria-label={`${r.num} — ${c.label}`}
                              />
                            </td>
                          );
                        }
                        // merged focus column — render one cell on first row, spanning all clauses
                        if (i !== 0) return null;
                        const nv = st.notes[id] || {};
                        return (
                          <td key={id} className="csf-cell" rowSpan={N}>
                            <div className="aud3-csf-inner">
                              <div className="aud3-nf">
                                <div className="aud3-nf-label">Audit Notes</div>
                                <textarea
                                  className="aud3-ta aud3-nf-ta"
                                  value={nv.audit || ''}
                                  placeholder="Audit notes…"
                                  onChange={e => setNote(id, 'audit', e.target.value)}
                                />
                              </div>
                              <div className="aud3-nf">
                                <div className="aud3-nf-label">Seasonality Factors to be Considered</div>
                                <textarea
                                  className="aud3-ta aud3-nf-ta"
                                  value={nv.seasonality || ''}
                                  placeholder="Seasonality factors…"
                                  onChange={e => setNote(id, 'seasonality', e.target.value)}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default function Form03AuditPlanning() {
  return (
    <QMSFormPage
      formType={3}
      formCode="AUD-F-03A"
      formTitle="Audit Planning for 3 Years — Initial, Surveillance & Recertification Audit Programme"
      defaultData={{}}
    >
      {({ data, set, clientInfo }) => (
        <AuditProgramme data={data} set={set} clientInfo={clientInfo} />
      )}
    </QMSFormPage>
  );
}
