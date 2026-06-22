 import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import toast from 'react-hot-toast';
import { Plus, CreditCard, Trash2, Edit2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminPayments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apps, setApps] = useState([]);
  const [manualPayments, setManualPayments] = useState([]);
  const [manualPaymentModal, setManualPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [manualPaymentForm, setManualPaymentForm] = useState({
    name: '',
    transactionId: '',
    applicationId: '',
    amount: 0,
    paymentStatus: 'pending',
    paymentDate: '',
  });
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ paymentStatus: 'pending', paymentAmount: 0, paymentDate: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      axios.get('/api/applications'),
      axios.get('/api/payments'),
    ]).then(([appsRes, paymentsRes]) => {
      setApps(appsRes.data || []);
      setManualPayments(paymentsRes.data || []);
    }).catch(err => {
      console.error('Payment tracking load error:', err);
      setError('Unable to load payment tracking data. Please refresh.');
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveManualPayment = async () => {
    if (!manualPaymentForm.name || !manualPaymentForm.transactionId || !manualPaymentForm.amount) {
      return toast.error('Name, transaction ID, and amount are required');
    }
    setSaving(true);
    try {
      if (editingPayment) {
        await axios.put(`/api/payments/${editingPayment._id}`, manualPaymentForm);
        toast.success('Manual payment updated successfully!');
      } else {
        await axios.post('/api/payments', manualPaymentForm);
        toast.success('Manual payment added successfully!');
      }
      setManualPaymentModal(false);
      setEditingPayment(null);
      setManualPaymentForm({ name: '', transactionId: '', applicationId: '', amount: 0, paymentStatus: 'pending', paymentDate: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save manual payment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Delete this payment entry?')) return;
    setSaving(true);
    try {
      await axios.delete(`/api/payments/${paymentId}`);
      toast.success('Payment deleted successfully!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete payment');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateApplicationPayment = async () => {
    if (!paymentForm.paymentAmount && paymentForm.paymentStatus === 'received') {
      return toast.error('Enter payment amount');
    }
    setSaving(true);
    try {
      await axios.post(`/api/applications/${paymentModal._id}/payment`, paymentForm);
      toast.success('Application payment updated successfully!');
      setPaymentModal(null);
      setPaymentForm({ paymentStatus: 'pending', paymentAmount: 0, paymentDate: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payment');
    } finally {
      setSaving(false);
    }
  };

  const applicationPayments = apps.filter(a => a.status !== 'draft');

  return (
    <Layout title="Payment Tracking">
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Payment Tracking</h1>
          <p className="page-subtitle">Manage manual payment entries and update application payment status.</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setManualPaymentModal(true);
          setEditingPayment(null);
          setManualPaymentForm({ name: '', transactionId: '', applicationId: '', amount: 0, paymentStatus: 'pending', paymentDate: '' });
        }}>
          <Plus size={14} /> Add Manual Payment
        </button>
      </div>

      {loading ? (
        <div className="card"><div className="loading-box"><div className="spinner"/></div></div>
      ) : error ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <AlertCircle size={40} style={{ color: 'var(--red)', marginBottom: 14 }} />
          <h3 style={{ color: 'var(--text-1)', marginBottom: 8 }}>Failed to load payments</h3>
          <p style={{ color: 'var(--gray-400)', marginBottom: 18 }}>{error}</p>
          <button className="btn btn-primary" onClick={load}>Retry</button>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="card-hdr">
              <div className="card-title"><CreditCard size={14} style={{ color: 'var(--primary)' }} />Manual Payment Entries</div>
            </div>
            {manualPayments.length === 0 ? (
              <div className="empty-box" style={{ padding:'24px 20px' }}>
                <CreditCard size={28} />
                <h3>No manual payments recorded</h3>
                <p style={{ color: 'var(--gray-500)', marginTop: 8 }}>Use the button above to add a manual payment.</p>
              </div>
            ) : (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Transaction ID</th>
                      <th>Client ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualPayments.map(payment => (
                      <tr key={payment._id}>
                        <td><strong>{payment.name}</strong></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{payment.transactionId}</td>
                        <td>{payment.applicationId ? apps.find(a => a._id === payment.applicationId)?.client?.clientId || 'Linked' : '—'}</td>
                        <td style={{ fontWeight: 600 }}>₹{payment.amount}</td>
                        <td>
                          <span className={`badge ${payment.paymentStatus === 'received' ? 'bdg-approved' : payment.paymentStatus === 'partially_received' ? 'bdg-audit_stage2' : 'bdg-submitted'}`}>
                            {payment.paymentStatus?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ color: 'var(--gray-500)' }}>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '—'}</td>
                        <td>
                          <div className="tbl-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                              setEditingPayment(payment);
                              setManualPaymentForm({
                                name: payment.name,
                                transactionId: payment.transactionId,
                                applicationId: payment.applicationId || '',
                                amount: payment.amount,
                                paymentStatus: payment.paymentStatus,
                                paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().slice(0, 10) : '',
                              });
                              setManualPaymentModal(true);
                            }}>
                              <Edit2 size={13} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeletePayment(payment._id)}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-hdr">
              <div className="card-title"><CreditCard size={14} style={{ color: 'var(--primary)' }} />Application Payments</div>
            </div>
            {applicationPayments.length === 0 ? (
              <div className="empty-box" style={{ padding:'24px 20px' }}>
                <CreditCard size={28} />
                <h3>No applications available</h3>
                <p style={{ color: 'var(--gray-500)', marginTop: 8 }}>No active applications are ready for payment tracking.</p>
              </div>
            ) : (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Client ID</th>
                      <th>Organization</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationPayments.map(app => (
                      <tr key={app._id}>
                        <td><strong>{app.client?.clientId || '—'}</strong></td>
                        <td>{app.organizationName}</td>
                        <td style={{ fontWeight: 600 }}>₹{app.paymentAmount || 0}</td>
                        <td>
                          <span className={`badge ${app.paymentStatus === 'received' ? 'bdg-approved' : app.paymentStatus === 'partially_received' ? 'bdg-audit_stage2' : 'bdg-submitted'}`}>
                            {app.paymentStatus?.replace(/_/g, ' ') || 'pending'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--gray-500)' }}>{app.paymentDate ? new Date(app.paymentDate).toLocaleDateString() : '—'}</td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => {
                            setPaymentModal(app);
                            setPaymentForm({ paymentStatus: app.paymentStatus || 'pending', paymentAmount: app.paymentAmount || 0, paymentDate: app.paymentDate ? new Date(app.paymentDate).toISOString().slice(0, 10) : '' });
                          }}>
                            <CreditCard size={13} /> Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {paymentModal && (
            <div className="modal-bg" onClick={() => setPaymentModal(null)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-head">
                  <div className="modal-title"><CreditCard size={15} style={{ color:'var(--primary)', marginRight:7, verticalAlign:'middle' }}/>Update Payment — {paymentModal.client?.clientId || '—'}</div>
                  <button className="modal-close" onClick={() => setPaymentModal(null)}>✕</button>
                </div>
                <div className="modal-body">
                  <div style={{ background:'var(--primary-50)', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13 }}>
                    <strong>{paymentModal.organizationName}</strong>
                    <div style={{ fontSize:11.5, color:'var(--gray-500)', marginTop:2 }}>{paymentModal.isoStandard}</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Status *</label>
                    <select className="form-control" value={paymentForm.paymentStatus} onChange={e => setPaymentForm(p => ({ ...p, paymentStatus: e.target.value }))}>
                      <option value="pending">Pending</option>
                      <option value="partially_received">Partially Received</option>
                      <option value="received">Received</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter payment amount"
                      value={paymentForm.paymentAmount}
                      onChange={e => setPaymentForm(p => ({ ...p, paymentAmount: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  {(paymentForm.paymentStatus === 'received' || paymentForm.paymentStatus === 'partially_received') && (
                    <div className="form-group">
                      <label className="form-label">Payment Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={paymentForm.paymentDate}
                        onChange={e => setPaymentForm(p => ({ ...p, paymentDate: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-foot">
                  <button className="btn btn-ghost" onClick={() => setPaymentModal(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleUpdateApplicationPayment} disabled={saving}>{saving ? 'Updating…' : <><CreditCard size={13}/> Update Payment</>}</button>
                </div>
              </div>
            </div>
          )}

          {manualPaymentModal && (
            <div className="modal-bg" onClick={() => setManualPaymentModal(false)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-head">
                  <div className="modal-title"><CreditCard size={15} style={{ color:'var(--primary)', marginRight:7, verticalAlign:'middle' }}/> {editingPayment ? 'Edit Manual Payment' : 'Add Manual Payment'}</div>
                  <button className="modal-close" onClick={() => setManualPaymentModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Payment Name / Description *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Initial payment for ABC"
                      value={manualPaymentForm.name}
                      onChange={e => setManualPaymentForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Transaction ID *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., TXN123456"
                      value={manualPaymentForm.transactionId}
                      onChange={e => setManualPaymentForm(p => ({ ...p, transactionId: e.target.value }))}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Amount (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter amount"
                        value={manualPaymentForm.amount}
                        onChange={e => setManualPaymentForm(p => ({ ...p, amount: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-control" value={manualPaymentForm.paymentStatus} onChange={e => setManualPaymentForm(p => ({ ...p, paymentStatus: e.target.value }))}>
                        <option value="pending">Pending</option>
                        <option value="partially_received">Partially Received</option>
                        <option value="received">Received</option>
                      </select>
                    </div>
                  </div>
                  {(manualPaymentForm.paymentStatus === 'received' || manualPaymentForm.paymentStatus === 'partially_received') && (
                    <div className="form-group">
                      <label className="form-label">Payment Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={manualPaymentForm.paymentDate}
                        onChange={e => setManualPaymentForm(p => ({ ...p, paymentDate: e.target.value }))}
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Related Application (Optional)</label>
                    <select className="form-control" value={manualPaymentForm.applicationId} onChange={e => setManualPaymentForm(p => ({ ...p, applicationId: e.target.value }))}>
                      <option value="">— Select Application —</option>
                      {apps.map(app => (
                        <option key={app._id} value={app._id}>{app.applicationId} - {app.organizationName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-foot">
                  <button className="btn btn-ghost" onClick={() => setManualPaymentModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveManualPayment} disabled={saving}>{saving ? 'Saving…' : <><CreditCard size={13}/> {editingPayment ? 'Update Payment' : 'Add Payment'}</>}</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
