import React, { useEffect } from 'react';
import QMSFormPage, { SectionTitle } from './QMSFormPage';
import useStandards from './useStandards';
import { FiChevronRight } from 'react-icons/fi';

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

const blankStd = () => ({ open: true, cols: COLUMNS.map(c => c.id), values: {}, notes: {} });

/* ───────────────────────── Inner interactive component ───────────────────────── */
function AuditProgramme({ data, set, clientInfo }) {
  const { byName, names, loading } = useStandards();

  const byStd = data.byStd || {};

  // Standards the client picked in their Application Form (F01).
  //  - liveApp:  fetched from the client record loaded into the banner (search / edit).
  //  - savedApp: the same list snapshotted into this form's data the first time it loaded,
  //              so it still works when reopened later from the list view.
  const liveApp  = deriveClientStandards(clientInfo, names);
  const savedApp = Array.isArray(data.appStandards) ? data.appStandards : [];
  const appStandards = names.filter(k => liveApp.includes(k) || savedApp.includes(k));

  // Accordions mirror exactly the standards selected in the client's Application
  // Form (F01): one standard → one accordion, two standards → two, and so on.
  const orderedSelected = appStandards;

  // Snapshot the application standards into the form data once available, so the
  // list still shows the right standards when the form is reopened later.
  useEffect(() => {
    if (liveApp.length && JSON.stringify(savedApp) !== JSON.stringify(liveApp)) {
      set('appStandards', liveApp);
    }
  }, [clientInfo, names.length]); // eslint-disable-line

  const getStd  = key => ({ ...blankStd(), ...(byStd[key] || {}) });
  const setStd  = (key, patch) => set('byStd', { ...byStd, [key]: { ...getStd(key), ...patch } });

  return (
    <div>
      <SectionTitle>Audit Programme — Standards in Scope</SectionTitle>

      {loading ? (
        <div className="aud3-picker-empty">Loading standards…</div>
      ) : (
      <>
      {/* Standards in scope — taken straight from the client's application */}
      <div className="aud3-picker">
        <div className="aud3-picker-hd">
          Standards from the client's application{appStandards.length ? ` (${appStandards.length} selected)` : ''}
        </div>
        {appStandards.length === 0 ? (
          <div className="aud3-picker-empty">
            No ISO standards were selected in this client's Application Form (F01).
          </div>
        ) : (
          <div className="aud3-picker-grid">
            {appStandards.map(key => (
              <span key={key} className="aud3-chip on">{key}</span>
            ))}
          </div>
        )}
      </div>

      {/* Accordions */}
      <SectionTitle>3-Year Audit Programme — Initial, Surveillance &amp; Recertification</SectionTitle>
      {orderedSelected.length === 0 ? (
        <div className="aud3-empty">
          No standard selected in the Application Form (F01) yet.
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
function StandardCard({ stdKey, meta, st, setStd }) {
  const code = stdCode(stdKey);
  const desc = meta?.category || '';
  const catalogueClauses = Array.isArray(meta?.clauses) ? meta.clauses : [];

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
          <span className="aud3-pill active">{COLUMNS.length} columns</span>
        </span>
      </button>

      {st.open && (
        <div className="aud3-body">
          {/* table */}
          <div className="aud3-tscroll">
            <table className="aud3-table">
              <thead>
                <tr>
                  <th className="col-area">Sub-Clause / Audit Area</th>
                  {COLUMNS.map(c => (
                    <th key={c.id} className={`aud3-colhead ${c.type === 'check' ? 'col-check' : 'col-focus'}`}>
                      {c.label}{c.sub && <span className="sub">{c.sub}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const vals = (st.values || {})[r.key] || {};
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
                      {COLUMNS.map(c => {
                        const id = c.id;
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
                        const nv = (st.notes || {})[id] || {};
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
