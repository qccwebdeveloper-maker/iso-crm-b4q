import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import { CheckCircle, ChevronLeft, ChevronRight, Save, FileText, Eye, UserCheck, UserX, ArrowLeft } from 'lucide-react';
import {
  STEPS, initState, PreviewModal, StepIndicator,
  Step1, Step2, Step3, Step4, Step5, Step6, Step7,
  inp, sel,
} from './AuditStepComponents';

export default function AuditReportForm() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [step,          setStep]          = useState(1);
  const [data,          setData]          = useState(initState());
  const [saving,        setSaving]        = useState(false);
  const [loading,       setLoading]       = useState(!!id);
  const [showPreview,   setShowPreview]   = useState(false);
  const [reportId,      setReportId]      = useState(id || null);

  // Client ID linking
  const [clientId,      setClientId]      = useState('');
  const [clientInfo,    setClientInfo]    = useState(null);

  // Auditor assignment
  const [assignedAuditor,   setAssignedAuditor]   = useState(null);
  const [auditors,           setAuditors]           = useState([]);
  const [selectedAuditorId,  setSelectedAuditorId]  = useState('');
  const [assigning,          setAssigning]          = useState(false);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  // Load report when editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`/api/audit-reports/${id}`)
        .then(res => {
          const r = res.data;
          setData({ ...initState(), ...r });
          setClientId(r.clientId || '');
          setClientInfo(r.client || null);
          setAssignedAuditor(r.assignedAuditor || null);
          setReportId(r._id);
        })
        .catch(() => toast.error('Failed to load report'))
        .finally(() => setLoading(false));
    }
    // Fetch auditor list for assignment dropdown
    axios.get('/api/auditors').then(res => setAuditors(res.data || [])).catch(() => {});
  }, [id]);

  const handleSave = async (asDraft = false) => {
    setSaving(true);
    try {
      const payload = { ...data, clientId, status: asDraft ? 'draft' : 'in_progress' };

      if (reportId) {
        const res = await axios.put(`/api/audit-reports/${reportId}`, payload);
        setClientInfo(res.data.client || null);
        setAssignedAuditor(res.data.assignedAuditor || null);
        toast.success(asDraft ? 'Draft saved!' : 'Report saved!');
      } else {
        const res = await axios.post('/api/audit-reports', payload);
        const newId = res.data._id;
        setReportId(newId);
        setClientInfo(res.data.client || null);
        setAssignedAuditor(res.data.assignedAuditor || null);
        navigate(`/admin/audit-reports/${newId}`, { replace: true });
        toast.success('Report created!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!reportId) { toast.error('Save report first before assigning auditor'); return; }
    if (!selectedAuditorId) { toast.error('Please select an auditor'); return; }
    setAssigning(true);
    try {
      const res = await axios.post(`/api/audit-reports/${reportId}/assign`, { auditorId: selectedAuditorId });
      setAssignedAuditor(res.data.assignedAuditor);
      toast.success('Auditor assigned successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign auditor');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!reportId) return;
    setAssigning(true);
    try {
      await axios.post(`/api/audit-reports/${reportId}/unassign`);
      setAssignedAuditor(null);
      setSelectedAuditorId('');
      toast.success('Auditor unassigned');
    } catch {
      toast.error('Failed to unassign auditor');
    } finally {
      setAssigning(false);
    }
  };

  const stepComponents = [
    <Step1 d={data} set={set} />,
    <Step2 d={data} set={set} />,
    <Step3 d={data} set={set} />,
    <Step4 d={data} set={set} />,
    <Step5 d={data} set={set} />,
    <Step6 d={data} set={set} />,
    <Step7 d={data} set={set} />,
  ];

  if (loading) {
    return (
      <Layout title="Audit Report">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={reportId ? 'Edit Audit Report' : 'New QMS Audit Report'}>
      <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => navigate('/admin/audit-reports')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', color: 'var(--gray-600)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              <ArrowLeft size={13} /> Back to List
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--gray-800)' }}>
                {reportId ? 'Edit Audit Report' : 'New QMS Audit Report'}
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--gray-500)' }}>Quality Control Certification — Complete Audit Documentation Package</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowPreview(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--primary)', background: '#fff7ed', color: 'var(--primary-dark)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              <Eye size={14} /> Preview
            </button>
            <button onClick={() => handleSave(true)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', color: 'var(--gray-700)', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>

        {/* ── Client ID Linking ── */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>
                Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                placeholder="Enter client ID to link report..."
                style={{ ...inp, flex: 1 }}
              />
            </div>
            {clientInfo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 12 }}>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
                <span style={{ color: '#15803d', fontWeight: 600 }}>{clientInfo.name}</span>
                <span style={{ color: '#86efac' }}>·</span>
                <span style={{ color: '#15803d' }}>{clientInfo.email}</span>
              </div>
            )}
            {!clientInfo && clientId && (
              <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 500 }}>Client not resolved yet — save to link</span>
            )}
          </div>
        </div>

        {/* ── Step Indicator ── */}
        <StepIndicator steps={STEPS} currentStep={step} onStepClick={setStep} />

        {/* ── Step Content ── */}
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
          {stepComponents[step - 1]}
        </div>

        {/* ── Assign Auditor Panel (shown on Step 4) ── */}
        {step === 4 && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', padding: '20px 24px', marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <UserCheck size={16} color="var(--primary)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>Assign Auditor to This Report</span>
            </div>

            {assignedAuditor ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>
                    ✓ Assigned: {assignedAuditor.name}
                  </span>
                  <span style={{ fontSize: 12, color: '#86efac' }}>·</span>
                  <span style={{ fontSize: 12, color: '#15803d' }}>{assignedAuditor.email}</span>
                </div>
                <button
                  onClick={handleUnassign}
                  disabled={assigning}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: assigning ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: assigning ? 0.6 : 1 }}
                >
                  <UserX size={14} /> {assigning ? 'Removing...' : 'Unassign'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <select
                  value={selectedAuditorId}
                  onChange={e => setSelectedAuditorId(e.target.value)}
                  style={{ ...sel, flex: 1, minWidth: 220 }}
                >
                  <option value="">Select auditor to assign...</option>
                  {auditors.map(a => (
                    <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  disabled={assigning || !selectedAuditorId}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: selectedAuditorId ? 'var(--primary)' : '#e2e8f0', color: selectedAuditorId ? 'white' : 'var(--gray-400)', cursor: (assigning || !selectedAuditorId) ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                  <UserCheck size={14} /> {assigning ? 'Assigning...' : 'Assign Auditor'}
                </button>
                {!reportId && (
                  <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Save report first to enable assignment</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
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
            : <button onClick={() => handleSave(false)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#10b981', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
                <CheckCircle size={16} /> {saving ? 'Saving...' : 'Save & Complete'}
              </button>
          }
        </div>
      </div>

      {showPreview && <PreviewModal data={data} onClose={() => setShowPreview(false)} />}
    </Layout>
  );
}
