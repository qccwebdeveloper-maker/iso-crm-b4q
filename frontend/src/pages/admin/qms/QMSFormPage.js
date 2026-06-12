import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Layout from '../../../components/common/Layout';
import toast from 'react-hot-toast';
import {
  FiSearch, FiUser, FiSave, FiFileText, FiList, FiPlusCircle,
  FiEdit2, FiTrash2, FiCheckCircle, FiClock, FiAlertCircle, FiX,
  FiEye, FiPrinter
} from 'react-icons/fi';

const STATUS_STYLE = {
  draft:     { bg: '#fef3c7', color: '#92400e', icon: FiClock,        label: 'Draft'     },
  saved:     { bg: '#d1fae5', color: '#065f46', icon: FiCheckCircle,  label: 'Saved'     },
  completed: { bg: '#dbeafe', color: '#1e40af', icon: FiCheckCircle,  label: 'Completed' },
};

const inp = {
  padding: '9px 12px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  background: '#fff',
};

const label = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' };

export function FormRow({ children, cols = 2 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 16,
      marginBottom: 16,
    }}
      className="qms-form-row"
    >
      {children}
    </div>
  );
}

export function FormField({ label: lbl, required, children, span }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <label style={label}>
        {lbl} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export function FInput({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{ ...inp, background: disabled ? '#f9fafb' : '#fff' }}
    />
  );
}

export function FTextarea({ value, onChange, placeholder, rows = 3, disabled }) {
  return (
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      style={{ ...inp, resize: 'vertical', background: disabled ? '#f9fafb' : '#fff' }}
    />
  );
}

export function FSelect({ value, onChange, options, placeholder, disabled }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{ ...inp, background: disabled ? '#f9fafb' : '#fff' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );
}

export function FRadioGroup({ value, onChange, options, disabled }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {options.map(o => (
        <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input
            type="radio"
            value={o.value}
            checked={value === o.value}
            onChange={() => !disabled && onChange(o.value)}
            disabled={disabled}
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

export function FCheckbox({ checked, onChange, label: lbl, disabled }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={e => !disabled && onChange(e.target.checked)}
        disabled={disabled}
      />
      {lbl}
    </label>
  );
}

export function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)',
      borderBottom: '2px solid var(--primary)',
      paddingBottom: 6, marginBottom: 16, marginTop: 24,
      textTransform: 'uppercase', letterSpacing: '.06em',
    }}>
      {children}
    </div>
  );
}

export function DynamicTable({ columns, rows, onAdd, onRemove, onCellChange, disabled, addLabel = 'Add Row' }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', borderBottom: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                {c.label}
              </th>
            ))}
            {!disabled && <th style={{ padding: '8px 10px', width: 40 }} />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9' }}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: '6px 8px' }}>
                  {c.type === 'select' ? (
                    <select
                      value={row[c.key] || ''}
                      onChange={e => onCellChange(ri, c.key, e.target.value)}
                      disabled={disabled}
                      style={{ ...inp, padding: '6px 8px' }}
                    >
                      <option value="">—</option>
                      {c.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : c.type === 'textarea' ? (
                    <textarea
                      value={row[c.key] || ''}
                      onChange={e => onCellChange(ri, c.key, e.target.value)}
                      disabled={disabled}
                      rows={2}
                      style={{ ...inp, padding: '6px 8px', resize: 'vertical', minWidth: 140 }}
                    />
                  ) : (
                    <input
                      type={c.type || 'text'}
                      value={row[c.key] || ''}
                      onChange={e => onCellChange(ri, c.key, e.target.value)}
                      disabled={disabled}
                      style={{ ...inp, padding: '6px 8px', minWidth: c.minWidth || 100 }}
                    />
                  )}
                </td>
              ))}
              {!disabled && (
                <td style={{ padding: '6px 8px' }}>
                  <button onClick={() => onRemove(ri)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}>
                    <FiX size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!disabled && (
        <button
          onClick={onAdd}
          style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#f0fdf4', color: '#166534', border: '1.5px solid #bbf7d0' }}
        >
          <FiPlusCircle size={13} /> {addLabel}
        </button>
      )}
    </div>
  );
}

// ── Main QMSFormPage wrapper ────────────────────────────────────────────────
export default function QMSFormPage({ formType, formCode, formTitle, defaultData, children }) {
  const [clientIdInput, setClientIdInput] = useState('');
  const [clientInfo,    setClientInfo]    = useState(null);
  const [formData,      setFormData]      = useState(defaultData || {});
  const [existingId,    setExistingId]    = useState(null);
  const [status,        setStatus]        = useState('draft');
  const [view,          setView]          = useState('list');   // 'list' | 'form'
  const [listData,      setListData]      = useState([]);
  const [searching,     setSearching]     = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [listLoading,   setListLoading]   = useState(true);
  const [deleteId,      setDeleteId]      = useState(null);
  const [previewRow,    setPreviewRow]    = useState(null);

  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const { data } = await axios.get(`/api/qms-forms?formType=${formType}`);
      setListData(data);
    } catch { setListData([]); }
    finally { setListLoading(false); }
  }, [formType]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleClientSearch = async (e) => {
    e.preventDefault();
    const id = clientIdInput.trim();
    if (!id) return;
    setSearching(true);
    try {
      // 1. fetch client details
      const { data: client } = await axios.get(`/api/qms-forms/client/${id}`);
      setClientInfo(client);

      // 2. check if form already exists for this client
      try {
        const { data: existing } = await axios.get(`/api/qms-forms/by-client/${id}/${formType}`);
        setFormData(existing.formData || defaultData || {});
        setStatus(existing.status || 'draft');
        setExistingId(existing._id);
        toast.success('Existing form loaded');
      } catch {
        // No existing form — pre-fill from client info
        const prefill = {
          ...(defaultData || {}),
          orgName:              client.company || '',
          organizationName:     client.company || '',
          contactPerson:        client.name    || '',
          emailId:              client.email   || '',
          contactNumbers:       client.phone   || '',
          mobileNumber:         client.phone   || '',
          address:              client.address || '',
          scopeOfCertification: client.scope   || '',
          auditStandards:       client.isoStandard || '',
        };
        setFormData(prefill);
        setStatus('draft');
        setExistingId(null);
        toast.success('Client found — new form opened with pre-filled details');
      }
      setView('form');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Client not found');
    } finally { setSearching(false); }
  };

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const handleSave = async (saveStatus) => {
    if (!clientInfo) return;
    setSaving(true);
    try {
      await axios.post('/api/qms-forms', {
        clientId: clientInfo.clientId,
        formType,
        formCode,
        formName: formTitle,
        status:   saveStatus,
        formData,
      });
      setStatus(saveStatus);
      toast.success(saveStatus === 'draft' ? 'Saved as draft' : 'Form saved successfully');
      fetchList();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/qms-forms/${id}`);
      toast.success('Form deleted');
      setDeleteId(null);
      fetchList();
    } catch { toast.error('Delete failed'); }
  };

  const openExisting = async (row) => {
    setClientIdInput(row.clientRef?.clientId || row.clientId || '');
    setClientInfo(row.clientRef || { clientId: row.clientId });
    setFormData(row.formData || {});
    setStatus(row.status);
    setExistingId(row._id);
    setView('form');
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setView('list');
    setClientIdInput('');
    setClientInfo(null);
    setFormData(defaultData || {});
    setExistingId(null);
    setStatus('draft');
  };

  return (
    <Layout title={formTitle}>
      <style>{`
        /* ─── QMS Form rows ─── */
        @media (max-width: 768px) {
          .qms-form-row { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .qms-form-row > [style*="span 3"],
          .qms-form-row > [style*="span 4"] { grid-column: span 2 !important; }
        }
        @media (max-width: 560px) {
          .qms-form-row { grid-template-columns: 1fr !important; gap: 8px !important; }
          .qms-form-row > * { grid-column: 1 / -1 !important; }
        }

        /* ─── Page header ─── */
        @media (max-width: 600px) {
          .qms-header-actions { flex-direction: column !important; align-items: stretch !important; }
          .qms-header-actions > div:first-child { flex: 1; }
          .qms-header-actions > .qms-hdr-btns { display: flex; gap: 6px; }
          .qms-header-actions > .qms-hdr-btns button { flex: 1; justify-content: center; }
        }
        @media (max-width: 400px) {
          .qms-header-actions > div:first-child h2 { font-size: 14px !important; }
        }

        /* ─── Save button bar ─── */
        .qms-save-bar { display:flex; gap:12px; justify-content:flex-end; margin-top:28px; padding-top:20px; border-top:1px solid #f1f5f9; flex-wrap:wrap; }
        @media (max-width: 520px) {
          .qms-save-bar { flex-direction: column; gap: 8px; }
          .qms-save-bar button { width: 100% !important; justify-content: center !important; }
        }

        /* ─── Client ID search ─── */
        .qms-client-search-form { display:flex; gap:10px; max-width:460px; }
        @media (max-width: 520px) {
          .qms-client-search-form { flex-direction: column; max-width: 100%; }
          .qms-client-search-form button { width: 100%; }
        }

        /* ─── Client banner ─── */
        @media (max-width: 500px) {
          .qms-client-banner { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
        }

        /* ─── List table ─── */
        .qms-list-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .qms-list-table th, .qms-list-table td { white-space: nowrap; }
        @media (max-width: 640px) {
          .qms-list-table { font-size: 11px; }
          .qms-list-table th, .qms-list-table td { padding: 8px 10px !important; }
        }
        @media (max-width: 480px) {
          .qms-list-table { font-size: 10.5px; }
          .qms-list-table th, .qms-list-table td { padding: 7px 8px !important; }
        }

        /* ─── Preview modal ─── */
        .qms-preview-outer { padding: 24px 16px; }
        .qms-preview-box { width:100%; max-width:900px; box-shadow:0 24px 80px rgba(0,0,0,.25); position:relative; background:white; border-radius:16px; }
        @media (max-width: 640px) {
          .qms-preview-outer { padding: 8px; align-items: flex-end !important; }
          .qms-preview-box { border-radius: 16px 16px 8px 8px !important; }
          .qms-preview-hdr { padding: 14px 16px !important; }
          .qms-preview-strip { padding: 10px 16px !important; flex-wrap: wrap; gap: 12px !important; }
          .qms-preview-content { padding: 16px !important; }
        }
        @media (max-width: 400px) {
          .qms-preview-outer { padding: 0; align-items: flex-end !important; }
          .qms-preview-box { border-radius: 14px 14px 0 0 !important; }
        }

        /* ─── Delete confirm modal ─── */
        @media (max-width: 520px) {
          .qms-delete-modal { padding: 8px !important; align-items: flex-end !important; }
          .qms-delete-box { border-radius: 16px 16px 8px 8px !important; }
        }

        /* ─── General input/select inside QMS ─── */
        @media (max-width: 480px) {
          .qms-form-row input,
          .qms-form-row select,
          .qms-form-row textarea { font-size: 14px; }
        }
      `}</style>

      <div style={{ padding: '20px 24px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }} className="qms-header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiFileText size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{formCode}</div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b' }}>{formTitle}</h2>
              </div>
            </div>
            <div className="qms-hdr-btns" style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setView('list')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: view === 'list' ? 'var(--primary)' : '#f1f5f9', color: view === 'list' ? 'white' : '#374151', border: 'none' }}
              >
                <FiList size={14} /> List
              </button>
              <button
                onClick={() => { setFormData(defaultData || {}); setClientInfo(null); setClientIdInput(''); setExistingId(null); setStatus('draft'); setView('form'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: view === 'form' ? 'var(--primary)' : '#f1f5f9', color: view === 'form' ? 'white' : '#374151', border: 'none' }}
              >
                <FiPlusCircle size={14} /> New Form
              </button>
            </div>
          </div>
        </div>

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>All Forms ({listData.length})</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Sorted by last updated</span>
            </div>
            {listLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
            ) : listData.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <FiFileText size={36} style={{ color: '#cbd5e1', marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>No forms yet</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Click "New Form" to create the first entry</div>
              </div>
            ) : (
              <div className="qms-list-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }} className="qms-list-table">
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Client ID', 'Client Name', 'Company', 'Status', 'Last Updated', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listData.map((row, i) => {
                      const s = STATUS_STYLE[row.status] || STATUS_STYLE.draft;
                      const SIcon = s.icon;
                      return (
                        <tr key={row._id} style={{ background: i % 2 === 0 ? 'white' : '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '11px 16px', fontSize: 13, fontFamily: 'monospace', color: 'var(--primary-dark)', fontWeight: 600 }}>{row.clientId}</td>
                          <td style={{ padding: '11px 16px', fontSize: 13, color: '#1e293b' }}>{row.clientRef?.name || '—'}</td>
                          <td style={{ padding: '11px 16px', fontSize: 13, color: '#64748b' }}>{row.clientRef?.company || '—'}</td>
                          <td style={{ padding: '11px 16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
                              <SIcon size={11} /> {s.label}
                            </span>
                          </td>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {new Date(row.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '11px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => openExisting(row)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'var(--primary)', color: 'white', border: 'none' }}>
                                <FiEdit2 size={11} /> Edit
                              </button>
                              <button onClick={() => setPreviewRow(row)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                                <FiEye size={11} /> Preview
                              </button>
                              <button onClick={() => setDeleteId(row._id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#fee2e2', color: '#991b1b', border: 'none' }}>
                                <FiTrash2 size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── FORM VIEW ── */}
        {view === 'form' && (
          <>
            {/* Client ID lookup */}
            {!clientInfo && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 28, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiUser size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Enter Client ID</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Enter the client ID to load or create a form</div>
                  </div>
                </div>
                <form onSubmit={handleClientSearch} className="qms-client-search-form">
                  <div style={{ flex: 1, position: 'relative' }}>
                    <FiSearch size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      value={clientIdInput}
                      onChange={e => setClientIdInput(e.target.value)}
                      placeholder="e.g. 20261234"
                      style={{ ...inp, paddingLeft: 34, fontFamily: 'monospace' }}
                      autoFocus
                    />
                  </div>
                  <button type="submit" disabled={searching} style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--primary)', color: 'white', border: 'none', whiteSpace: 'nowrap' }}>
                    {searching ? 'Searching…' : 'Open Form'}
                  </button>
                </form>
              </div>
            )}

            {/* Client info banner */}
            {clientInfo && (
              <div className="qms-client-banner" style={{ background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FiUser size={15} color="#166534" />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>{clientInfo.name || clientInfo.company || 'Client'}</span>
                    {clientInfo.company && clientInfo.name && (
                      <span style={{ fontSize: 12, color: '#4ade80', marginLeft: 8 }}>{clientInfo.company}</span>
                    )}
                    <span style={{ fontSize: 12, color: '#4ade80', marginLeft: 8, fontFamily: 'monospace' }}>ID: {clientInfo.clientId}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: STATUS_STYLE[status]?.bg, color: STATUS_STYLE[status]?.color }}>
                    {STATUS_STYLE[status]?.label}
                  </span>
                  <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex' }}>
                    <FiX size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Form content */}
            {clientInfo && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                {children({ data: formData, set, clientInfo, onSaveDraft: () => handleSave('draft'), onSave: () => handleSave('saved'), saving })}

                {/* Save buttons */}
                <div className="qms-save-bar">
                  <button onClick={resetForm} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#f1f5f9', color: '#374151', border: '1.5px solid #e2e8f0' }}>
                    Cancel
                  </button>
                  <button onClick={() => handleSave('draft')} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fef3c7', color: '#92400e', border: '1.5px solid #fde68a' }}>
                    <FiClock size={14} /> {saving ? 'Saving…' : 'Save as Draft'}
                  </button>
                  <button onClick={() => handleSave('saved')} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--primary)', color: 'white', border: 'none' }}>
                    <FiSave size={14} /> {saving ? 'Saving…' : 'Save Form'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── PREVIEW MODAL ── */}
      {previewRow && (
        <div className="qms-preview-outer" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9998, overflowY: 'auto' }}>
          <div className="qms-preview-box">

            {/* Modal header */}
            <div className="qms-preview-hdr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: 'white', zIndex: 2, borderRadius: '16px 16px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiEye size={18} color="#1d4ed8" />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.07em' }}>{formCode} · Preview</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{formTitle}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => window.print()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#f1f5f9', color: '#374151', border: '1.5px solid #e2e8f0' }}
                >
                  <FiPrinter size={13} /> Print
                </button>
                <button onClick={() => setPreviewRow(null)} style={{ width: 34, height: 34, borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Client info strip */}
            <div className="qms-preview-strip" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20, padding: '12px 24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              {[
                { label: 'Client ID',   value: previewRow.clientId },
                { label: 'Name',        value: previewRow.clientRef?.name    || '—' },
                { label: 'Company',     value: previewRow.clientRef?.company || '—' },
                { label: 'Status',      value: STATUS_STYLE[previewRow.status]?.label || previewRow.status },
                { label: 'Last Updated',value: new Date(previewRow.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Form content — read-only via pointer-events:none */}
            <div className="qms-preview-content" style={{ padding: '24px', position: 'relative' }}>
              {/* Read-only overlay label */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 600, color: '#1d4ed8', marginBottom: 16 }}>
                <FiEye size={11} /> Read-only preview
              </div>

              {/* Render form fields — pointer-events disabled so nothing is editable */}
              <div style={{ pointerEvents: 'none', userSelect: 'text', opacity: 0.92 }}>
                {children({
                  data:        previewRow.formData || {},
                  set:         () => {},
                  clientInfo:  previewRow.clientRef || { clientId: previewRow.clientId },
                  onSaveDraft: () => {},
                  onSave:      () => {},
                  saving:      false,
                })}
              </div>

              {/* Bottom close button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9', gap: 10 }}>
                <button
                  onClick={() => { setPreviewRow(null); openExisting(previewRow); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--primary)', color: 'white', border: 'none' }}
                >
                  <FiEdit2 size={13} /> Edit This Form
                </button>
                <button onClick={() => setPreviewRow(null)} style={{ padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#f1f5f9', color: '#374151', border: '1.5px solid #e2e8f0' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="qms-delete-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div className="qms-delete-box" style={{ background: 'white', borderRadius: 14, padding: 28, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiAlertCircle size={20} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Delete Form</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>This cannot be undone.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#f1f5f9', color: '#374151', border: '1.5px solid #e2e8f0' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
