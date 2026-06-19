import React, { useState, useEffect } from 'react';
import QMSFormPage, { SectionTitle } from './QMSFormPage';
import useStandards from './useStandards';
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

/* Short code (e.g. "9001") pulled from a standard name for the accordion mark. */
const stdCode = (name) => {
  const m = String(name || '').match(/(\d{4,5})/);
  return m ? m[1] : String(name || '').slice(0, 6);
};

/* All the standards the client selected in their Application Form (F01).
   The backend (/api/qms-forms/client/:id) returns `standards` as an array and also
   joins them into `isoStandard`; prefer the array, fall back to the joined string.
   `names` is the live catalogue fetched from the Standard schema — only standards
   that exist in the catalogue are kept, in catalogue order. */
function deriveClientStandards(clientInfo, names) {
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
  return names.filter(k => tokens.includes(k));
}

const blankStd = () => ({ open: true, cols: ['initial'], values: {}, notes: {} });

/* ───────────────────────── Inner interactive component ───────────────────────── */
function AuditProgramme({ data, set, clientInfo }) {
  const [openPop, setOpenPop] = useState(null); // `${stdKey}:add` | `${stdKey}:rem`
  const { byName, names, loading } = useStandards();

  const byStd = data.byStd || {};

  // Standards the client picked in their Application Form (F01).
  //  - liveApp:  fetched from the client record loaded into the banner (search / edit).
  //  - savedApp: the same list snapshotted into this form's data the first time it loaded,
  //              so it still works when reopened later from the list view.
  const liveApp  = deriveClientStandards(clientInfo, names);
  const savedApp = Array.isArray(data.appStandards) ? data.appStandards : [];
  const appStandards = names.filter(k => liveApp.includes(k) || savedApp.includes(k));

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
  }, [clientInfo, names.length]); // eslint-disable-line

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

  const orderedSelected = names.filter(k => selected.includes(k));

  // The picker offers the application's standards plus anything already selected/saved.
  const pickerKeys = names.filter(k => appStandards.includes(k) || selected.includes(k));

  return (
    <div>
      <SectionTitle>Audit Programme — Standards in Scope</SectionTitle>

      {loading ? (
        <div className="aud3-picker-empty">Loading standards…</div>
      ) : (
      <>
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
              meta={byName[key]}
              st={getStd(key)}
              setStd={patch => setStd(key, patch)}
              openPop={openPop}
              togglePop={togglePop}
              closePop={() => setOpenPop(null)}
            />
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}

/* ───────────────────────── One standard accordion ───────────────────────── */
function StandardCard({ stdKey, meta, st, setStd, openPop, togglePop, closePop }) {
  const code = stdCode(stdKey);
  const desc = meta?.category || '';
  const catalogueClauses = Array.isArray(meta?.clauses) ? meta.clauses : [];
  const scope = `ISO ${code}`;
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

  // Clause rows come straight from the Standard schema.
  const rows = catalogueClauses.map((c, i) => ({ key: `f${i}`, num: c.no || '', title: c.text || '', desc: '' }));
  const N = rows.length;

  return (
    <section className={`aud3-std${st.open ? ' open' : ''}`}>
      {/* header */}
      <button type="button" className="aud3-head" onClick={() => setStd({ open: !st.open })}>
        <span className="aud3-chev"><FiChevronRight size={18} /></span>
        <span className="aud3-mark">{code}</span>
        <span className="aud3-title">
          <span className="name">{stdKey}</span>
          {desc && <span className="desc">{desc}</span>}
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
                        <div className="aud3-clause">
                          <span className="aud3-cnum">{r.num}</span>
                          <span>
                            <span className="aud3-ct">{r.title}</span>
                            {r.desc && <span className="aud3-cd">{r.desc}</span>}
                          </span>
                        </div>
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
