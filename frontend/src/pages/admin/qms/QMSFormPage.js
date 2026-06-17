import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Layout from '../../../components/common/Layout';
import toast from 'react-hot-toast';
import {
  FiSearch, FiUser, FiSave, FiFileText, FiList, FiPlusCircle,
  FiEdit2, FiTrash2, FiCheckCircle, FiClock, FiAlertCircle, FiX,
  FiEye, FiPrinter,
} from 'react-icons/fi';

const STATUS_META = {
  draft:     { bg: '#fef3c7', color: '#92400e', Icon: FiClock,       label: 'Draft'     },
  saved:     { bg: '#d1fae5', color: '#065f46', Icon: FiCheckCircle, label: 'Saved'     },
  completed: { bg: '#dbeafe', color: '#1e40af', Icon: FiCheckCircle, label: 'Completed' },
};

// ─── Shared primitive components ─────────────────────────────────────────────

export function FormRow({ children, cols = 2 }) {
  const cls = cols === 1 ? 'qms-form-row-1'
            : cols === 3 ? 'qms-form-row-3'
            : cols === 4 ? 'qms-form-row-4'
            : 'qms-form-row-2';
  return <div className={`qms-form-row ${cls}`}>{children}</div>;
}

export function FormField({ label: lbl, required, children, span }) {
  return (
    <div className="qms-field" style={span ? { gridColumn: `span ${span}` } : undefined}>
      <label className="qms-field-label">
        {lbl}{required && <span className="req"> *</span>}
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
      className="qms-inp"
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
      className="qms-inp"
    />
  );
}

export function FSelect({ value, onChange, options, placeholder, disabled }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="qms-inp"
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
    <div className="qms-radio-group">
      {options.map(o => (
        <label key={o.value} className="qms-radio-label">
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
    <label className="qms-radio-label">
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
  return <div className="qms-section-title">{children}</div>;
}

// Read-only pill display for the standards selected in the Application Form (F01).
// Renders each standard as a non-removable chip (no cross / remove UI).
export function StandardChips({ value }) {
  const list = Array.isArray(value)
    ? value.filter(Boolean)
    : String(value || '').split(',').map(s => s.trim()).filter(Boolean);
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
      minHeight: 44, padding: '8px 12px',
      border: '1.5px solid var(--primary-200)', borderRadius: 10,
      background: 'white',
    }}>
      {list.length === 0
        ? <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>—</span>
        : list.map((s, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '6px 14px', borderRadius: 999,
              background: 'var(--primary-50)', border: '1px solid var(--primary-200)',
              color: 'var(--primary-dark)', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
            }}>{s}</span>
          ))}
    </div>
  );
}

export function DynamicTable({ columns, rows, onAdd, onRemove, onCellChange, disabled, addLabel = 'Add Row' }) {
  const inlineCols   = columns.filter(c => !c.fullRow);
  const fullRowCols  = columns.filter(c => c.fullRow);
  const colCount     = inlineCols.length + (disabled ? 0 : 1);

  const renderField = (c, row, ri, full) => {
    if (c.type === 'select') {
      return (
        <select
          value={row[c.key] || ''}
          onChange={e => onCellChange(ri, c.key, e.target.value)}
          disabled={disabled}
          className="qms-dyn-inp"
          style={{ minWidth: 110 }}
        >
          <option value="">—</option>
          {c.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (c.type === 'textarea') {
      const autoGrow = el => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      };
      return (
        <textarea
          ref={autoGrow}
          value={row[c.key] || ''}
          onChange={e => { autoGrow(e.target); onCellChange(ri, c.key, e.target.value); }}
          disabled={disabled}
          rows={full ? 3 : 2}
          className="qms-dyn-inp"
          style={{ resize: 'vertical', minWidth: 140, width: full ? '100%' : undefined, overflow: 'hidden' }}
        />
      );
    }
    return (
      <input
        type={c.type || 'text'}
        value={row[c.key] || ''}
        onChange={e => onCellChange(ri, c.key, e.target.value)}
        disabled={disabled}
        className="qms-dyn-inp"
        style={{ minWidth: c.minWidth || 100, width: full ? '100%' : undefined }}
      />
    );
  };

  return (
    <div>
      <div className="qms-dyn-table-wrap">
        <table className="qms-dyn-table">
          <thead>
            <tr>
              {inlineCols.map(c => <th key={c.key}>{c.label}</th>)}
              {!disabled && <th style={{ width: 40 }} />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <React.Fragment key={ri}>
                <tr>
                  {inlineCols.map(c => (
                    <td key={c.key}>{renderField(c, row, ri, false)}</td>
                  ))}
                  {!disabled && (
                    <td>
                      <button type="button" onClick={() => onRemove(ri)} className="qms-del-row-btn">
                        <FiX size={13} />
                      </button>
                    </td>
                  )}
                </tr>
                {fullRowCols.length > 0 && (
                  <tr>
                    <td colSpan={colCount} style={{ paddingTop: 0 }}>
                      {fullRowCols.map(c => (
                        <div key={c.key} style={{ marginTop: 4 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>{c.label}</div>
                          {renderField(c, row, ri, true)}
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {!disabled && (
        <button type="button" onClick={onAdd} className="qms-add-row-btn">
          <FiPlusCircle size={13} /> {addLabel}
        </button>
      )}
    </div>
  );
}

// ─── Main page wrapper ────────────────────────────────────────────────────────

export default function QMSFormPage({ formType, formCode, formTitle, defaultData, children }) {
  const [clientIdInput, setClientIdInput] = useState('');
  const [clientInfo,    setClientInfo]    = useState(null);
  const [formData,      setFormData]      = useState(defaultData || {});
  const [existingId,    setExistingId]    = useState(null);
  const [status,        setStatus]        = useState('draft');
  const [view,          setView]          = useState('list');
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
      const { data: client } = await axios.get(`/api/qms-forms/client/${id}`);
      setClientInfo(client);
      try {
        const { data: existing } = await axios.get(`/api/qms-forms/by-client/${id}/${formType}`);
        setFormData(existing.formData || defaultData || {});
        setStatus(existing.status || 'draft');
        setExistingId(existing._id);
        toast.success('Existing form loaded');
      } catch {
        setFormData({
          ...(defaultData || {}),
          orgName:              client.company     || '',
          organizationName:     client.company     || '',
          contactPerson:        client.name        || '',
          emailId:              client.email       || '',
          contactNumbers:       client.phone       || '',
          mobileNumber:         client.phone       || '',
          address:              client.address     || '',
          scopeOfCertification: client.scope       || '',
          auditStandards:       client.isoStandard || '',
          isoStandards:         client.isoStandard || '',
          standard:             client.isoStandard || '',
        });
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
        formType, formCode,
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

  const openExisting = (row) => {
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

  const openNewForm = () => {
    setFormData(defaultData || {});
    setClientInfo(null);
    setClientIdInput('');
    setExistingId(null);
    setStatus('draft');
    setView('form');
  };

  const statusMeta = STATUS_META[status] || STATUS_META.draft;

  return (
    <Layout title={formTitle}>
      <div className="qms-wrap">

        {/* ── Page header ── */}
        <div className="qms-header-card">
          <div className="qms-header-left">
            <div className="qms-header-icon">
              <FiFileText size={20} color="white" />
            </div>
            <div>
              <div className="qms-form-code">{formCode}</div>
              <h2 className="qms-form-title">{formTitle}</h2>
            </div>
          </div>
          <div className="qms-tab-btns">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`qms-tab-btn${view === 'list' ? ' active' : ''}`}
            >
              <FiList size={14} /> List
            </button>
            <button
              type="button"
              onClick={openNewForm}
              className={`qms-tab-btn${view === 'form' ? ' active' : ''}`}
            >
              <FiPlusCircle size={14} /> New Form
            </button>
          </div>
        </div>

        {/* ═══ LIST VIEW ═══ */}
        {view === 'list' && (
          <div className="qms-list-card">
            <div className="qms-list-hdr">
              <div>
                <div className="qms-list-title">All Records — {formCode}</div>
                <div className="qms-list-subtitle">{listData.length} form{listData.length !== 1 ? 's' : ''} found</div>
              </div>
              <button type="button" onClick={openNewForm} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <FiPlusCircle size={12} /> New Form
              </button>
            </div>

            {listLoading ? (
              <div className="loading-box"><div className="spinner" /></div>
            ) : listData.length === 0 ? (
              <div className="qms-list-empty">
                <div className="qms-list-empty-icon">
                  <FiFileText size={26} color="var(--primary)" />
                </div>
                <h3>No forms yet</h3>
                <p>Click "New Form" to create the first {formCode} entry</p>
              </div>
            ) : (
              <div className="qms-tbl-wrap">
                <table className="qms-tbl">
                  <thead>
                    <tr>
                      {['Client ID', 'Client Name', 'Company', 'Status', 'Last Updated', 'Actions'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listData.map(row => {
                      const sm = STATUS_META[row.status] || STATUS_META.draft;
                      const SIcon = sm.Icon;
                      return (
                        <tr key={row._id}>
                          <td><span className="mono">{row.clientId}</span></td>
                          <td style={{ fontWeight: 600 }}>{row.clientRef?.name || '—'}</td>
                          <td style={{ color: 'var(--gray-500)' }}>{row.clientRef?.company || '—'}</td>
                          <td>
                            <span className="qms-status-pill" style={{ background: sm.bg, color: sm.color }}>
                              <SIcon size={11} /> {sm.label}
                            </span>
                          </td>
                          <td style={{ color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                            {new Date(row.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td>
                            <div className="qms-tbl-actions">
                              <button type="button" onClick={() => openExisting(row)} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <FiEdit2 size={11} /> Edit
                              </button>
                              <button type="button" onClick={() => setPreviewRow(row)} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <FiEye size={11} /> View
                              </button>
                              <button type="button" onClick={() => setDeleteId(row._id)} className="btn btn-danger btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
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

        {/* ═══ FORM VIEW ═══ */}
        {view === 'form' && (
          <div className="qms-form-area">

            {/* Client search */}
            {!clientInfo && (
              <div className="qms-client-panel">
                <div className="qms-client-panel-hdr">
                  <div className="qms-client-panel-icon">
                    <FiUser size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <div className="qms-client-panel-title">Find Client</div>
                    <div className="qms-client-panel-sub">Enter the client ID to load or create a form</div>
                  </div>
                </div>
                <form onSubmit={handleClientSearch} className="qms-search-row">
                  <div className="qms-search-box">
                    <FiSearch size={14} className="qms-search-ico" />
                    <input
                      value={clientIdInput}
                      onChange={e => setClientIdInput(e.target.value)}
                      placeholder="e.g. 20261234"
                      className="qms-search-inp"
                      autoFocus
                    />
                  </div>
                  <button type="submit" disabled={searching} className="qms-search-btn">
                    {searching ? 'Searching…' : 'Open Form'}
                  </button>
                </form>
              </div>
            )}

            {/* Client banner */}
            {clientInfo && (
              <div className="qms-client-banner">
                <div className="qms-client-banner-left">
                  <div className="qms-client-banner-ava">
                    <FiUser size={15} color="white" />
                  </div>
                  <div>
                    <div className="qms-client-name">
                      {clientInfo.name || clientInfo.company || 'Client'}
                    </div>
                    <div className="qms-client-id-txt">
                      {clientInfo.company && clientInfo.name ? `${clientInfo.company} · ` : ''}
                      ID: {clientInfo.clientId}
                    </div>
                  </div>
                </div>
                <div className="qms-client-banner-right">
                  <span className="qms-status-pill" style={{ background: statusMeta.bg, color: statusMeta.color }}>
                    <statusMeta.Icon size={11} /> {statusMeta.label}
                  </span>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4, display: 'flex' }}
                  >
                    <FiX size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Form fields */}
            {clientInfo && (
              <div className="qms-form-card">
                {children({ data: formData, set, clientInfo, onSaveDraft: () => handleSave('draft'), onSave: () => handleSave('saved'), saving })}

                {/* Action bar */}
                <div className="qms-save-bar">
                  <button type="button" onClick={resetForm} className="btn btn-ghost">
                    Cancel
                  </button>
                  <div className="qms-save-btns">
                    <button
                      type="button"
                      onClick={() => handleSave('draft')}
                      disabled={saving}
                      className="btn btn-gold"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <FiClock size={14} /> {saving ? 'Saving…' : 'Save as Draft'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave('saved')}
                      disabled={saving}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <FiSave size={14} /> {saving ? 'Saving…' : 'Save Form'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ PREVIEW MODAL ═══ */}
      {previewRow && (
        <div className="qms-preview-backdrop">
          <div className="qms-preview-modal">

            {/* Header */}
            <div className="qms-preview-hdr">
              <div className="qms-preview-hdr-left">
                <div className="qms-preview-hdr-icon">
                  <FiEye size={18} color="var(--primary)" />
                </div>
                <div>
                  <div className="qms-preview-hdr-code">{formCode} · Preview</div>
                  <div className="qms-preview-hdr-title">{formTitle}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <FiPrinter size={13} /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRow(null)}
                  className="btn btn-ghost btn-sm"
                  style={{ width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FiX size={15} />
                </button>
              </div>
            </div>

            {/* Meta strip */}
            <div className="qms-preview-strip">
              {[
                { label: 'Client ID',    value: previewRow.clientId },
                { label: 'Name',         value: previewRow.clientRef?.name    || '—' },
                { label: 'Company',      value: previewRow.clientRef?.company || '—' },
                { label: 'Status',       value: STATUS_META[previewRow.status]?.label || previewRow.status },
                { label: 'Last Updated', value: new Date(previewRow.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
              ].map(item => (
                <div key={item.label} className="qms-preview-meta">
                  <span className="qms-preview-meta-label">{item.label}</span>
                  <span className="qms-preview-meta-value">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Content — read-only */}
            <div className="qms-preview-body">
              <div className="qms-preview-ro-badge">
                <FiEye size={11} /> Read-only preview
              </div>
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
              <div className="qms-preview-footer">
                <button
                  type="button"
                  onClick={() => { setPreviewRow(null); openExisting(previewRow); }}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <FiEdit2 size={13} /> Edit This Form
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRow(null)}
                  className="btn btn-ghost"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRM ═══ */}
      {deleteId && (
        <div className="qms-delete-backdrop">
          <div className="qms-delete-modal">
            <div className="qms-delete-hdr">
              <div className="qms-delete-icon">
                <FiAlertCircle size={22} color="var(--red)" />
              </div>
              <div>
                <div className="qms-delete-title">Delete Form</div>
                <div className="qms-delete-sub">This action cannot be undone.</div>
              </div>
            </div>
            <div className="qms-delete-footer">
              <button type="button" onClick={() => setDeleteId(null)} className="btn btn-ghost">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteId)}
                className="btn"
                style={{ background: 'var(--red)', color: 'white', border: 'none' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
