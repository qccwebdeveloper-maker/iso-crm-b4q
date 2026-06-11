import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SK  = '_sk';
const MGT = '/api/z9xvq';

const hdrs = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem(SK)}` } });

export default function Bvq() {
  const nav         = useNavigate();
  const [self, setSelf]           = useState(null);
  const [users, setUsers]         = useState([]);
  const [tab, setTab]             = useState('accounts');
  const [busy, setBusy]           = useState(false);
  const [booting, setBooting]     = useState(true);
  const [form, setForm]           = useState({ name: '', email: '', password: '', role: 'admin' });
  const [confirmTxt, setConfirmTxt] = useState('');
  const [modal, setModal]         = useState(null);

  const loadAccounts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${MGT}/mrk`, hdrs());
      setUsers(data);
    } catch { toast.error('Failed to load accounts'); }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(SK);
    if (!token) { nav('/v8xk2p/qr7nzt/bm4j9/w3fx'); return; }
    axios.get(`${MGT}/vrfy`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        setSelf(r.data.user);
        loadAccounts();
      })
      .catch(() => { localStorage.removeItem(SK); nav('/v8xk2p/qr7nzt/bm4j9/w3fx'); })
      .finally(() => setBooting(false));
  }, [nav, loadAccounts]);

  const signOut = () => { localStorage.removeItem(SK); nav('/v8xk2p/qr7nzt/bm4j9/w3fx'); };

  const removeAccount = async (id, name) => {
    if (!window.confirm(`Remove account for "${name}"?`)) return;
    try {
      await axios.delete(`${MGT}/mrk/${id}`, hdrs());
      toast.success('Account removed');
      loadAccounts();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const createAccount = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await axios.post(`${MGT}/mrk`, form, hdrs());
      toast.success('Account created');
      setForm({ name: '', email: '', password: '', role: 'admin' });
      setTab('accounts');
      loadAccounts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setBusy(false); }
  };

  const execQzr = async () => {
    if (confirmTxt !== 'CONFIRM') { toast.error('Type CONFIRM exactly'); return; }
    setBusy(true);
    try {
      await axios.post(`${MGT}/qzr`, { key: confirmTxt }, hdrs());
      toast.success('Operation complete');
      localStorage.removeItem(SK);
      nav('/v8xk2p/qr7nzt/bm4j9/w3fx');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Operation failed');
    } finally { setBusy(false); }
  };

  const removeSelf = async () => {
    setBusy(true);
    try {
      await axios.delete(`${MGT}/self`, hdrs());
      localStorage.removeItem(SK);
      nav('/v8xk2p/qr7nzt/bm4j9/w3fx');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setBusy(false); }
  };

  if (booting) return (
    <div style={s.boot}>
      <span style={s.bootIcon}>⬡</span>
      <p style={s.bootText}>Initializing...</p>
    </div>
  );

  const tabs = [
    { id: 'accounts', label: 'Accounts' },
    { id: 'new',      label: 'New Account' },
    { id: 'system',   label: 'System' },
    { id: 'mine',     label: 'My Account' },
  ];

  return (
    <div style={s.root}>
      <aside style={s.aside}>
        <div style={s.brand}>⬡ Control</div>
        <nav style={s.navList}>
          {tabs.map(t => (
            <button
              key={t.id}
              style={{ ...s.navBtn, ...(tab === t.id ? s.navActive : {}) }}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <button style={s.signOutBtn} onClick={signOut}>Sign Out</button>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
          <h1 style={s.headerTitle}>
            {tab === 'accounts' ? 'Account Management' :
             tab === 'new'      ? 'New Account'        :
             tab === 'system'   ? 'System Operations'  : 'My Account'}
          </h1>
          <span style={s.headerMeta}>{self?.name}</span>
        </header>

        <div style={s.body}>

          {tab === 'accounts' && (
            <div>
              <p style={s.note}>{users.length} account{users.length !== 1 ? 's' : ''} registered</p>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['Name', 'Email', 'Role', 'Status', 'Action'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={s.tr}>
                        <td style={s.td}>
                          <span style={s.tdName}>{u.name}</span>
                          {u._s === 1 && <span style={s.badge}>◆</span>}
                        </td>
                        <td style={s.td}><span style={s.tdEmail}>{u.email}</span></td>
                        <td style={s.td}>
                          <span style={{ ...s.chip, ...roleChip(u.role) }}>{u.role}</span>
                        </td>
                        <td style={s.td}>
                          <span style={u.isActive ? s.statusOn : s.statusOff}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={s.td}>
                          {u._id !== self?._id && (
                            <button style={s.removeBtn} onClick={() => removeAccount(u._id, u.name)}>
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'new' && (
            <form onSubmit={createAccount} style={s.form}>
              <Row label="Full Name">
                <input style={s.input} placeholder="Enter full name"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </Row>
              <Row label="Email">
                <input style={s.input} type="email" placeholder="Enter email address"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </Row>
              <Row label="Password">
                <input style={s.input} type="password" placeholder="Set a password"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              </Row>
              <Row label="Role">
                <select style={s.select} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="admin">Admin</option>
                  <option value="auditor">Auditor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="sales">Sales</option>
                  <option value="client">Client</option>
                </select>
              </Row>
              <button style={{ ...s.primaryBtn, opacity: busy ? 0.6 : 1 }} type="submit" disabled={busy}>
                {busy ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          )}

          {tab === 'system' && (
            <div style={s.dangerCard}>
              <h3 style={s.dangerTitle}>Data Reset</h3>
              <p style={s.dangerDesc}>
                Permanently removes every record from all collections. Once executed, this
                operation cannot be reversed and all data will be lost.
              </p>
              <button style={s.dangerBtn} onClick={() => { setConfirmTxt(''); setModal('qzr'); }}>
                Execute Operation
              </button>
            </div>
          )}

          {tab === 'mine' && (
            <div>
              <div style={s.profileCard}>
                <h3 style={s.profileTitle}>Account Details</h3>
                <dl style={s.dl}>
                  <dt style={s.dt}>Name</dt><dd style={s.dd}>{self?.name}</dd>
                  <dt style={s.dt}>Email</dt><dd style={s.dd}>{self?.email}</dd>
                  <dt style={s.dt}>Role</dt><dd style={s.dd}>Admin</dd>
                </dl>
              </div>
              <div style={{ ...s.dangerCard, marginTop: 20 }}>
                <h3 style={s.dangerTitle}>Remove My Account</h3>
                <p style={s.dangerDesc}>
                  Permanently deletes your account. You will be signed out immediately and
                  will need to initialize a new account to regain access.
                </p>
                <button style={s.dangerBtn} onClick={() => setModal('self')}>
                  Remove My Account
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {modal === 'qzr' && (
        <Overlay onClose={() => setModal(null)}>
          <h3 style={s.modalTitle}>Confirm Operation</h3>
          <p style={s.modalDesc}>
            Type <strong style={{ color: '#fca5a5' }}>CONFIRM</strong> to proceed.
            All stored data will be permanently removed.
          </p>
          <input
            style={s.input}
            placeholder="Type CONFIRM"
            value={confirmTxt}
            onChange={e => setConfirmTxt(e.target.value)}
            autoFocus
          />
          <div style={s.modalActions}>
            <button style={s.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
            <button style={{ ...s.dangerBtn, opacity: busy ? 0.6 : 1 }} onClick={execQzr} disabled={busy}>
              {busy ? 'Processing...' : 'Execute'}
            </button>
          </div>
        </Overlay>
      )}

      {modal === 'self' && (
        <Overlay onClose={() => setModal(null)}>
          <h3 style={s.modalTitle}>Remove Your Account?</h3>
          <p style={s.modalDesc}>
            This permanently deletes your account and signs you out. A new account
            must be initialized to restore access.
          </p>
          <div style={s.modalActions}>
            <button style={s.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
            <button style={{ ...s.dangerBtn, opacity: busy ? 0.6 : 1 }} onClick={removeSelf} disabled={busy}>
              {busy ? 'Processing...' : 'Remove Account'}
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, color: '#6a6a8a', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>{children}</div>
    </div>
  );
}

const roleChip = (role) => {
  const map = {
    admin:    { background: '#1e1640', color: '#a78bfa' },
    auditor:  { background: '#0e2218', color: '#4ade80' },
    reviewer: { background: '#1e1e0e', color: '#facc15' },
    sales:    { background: '#200e0e', color: '#f87171' },
    client:   { background: '#0e1a2e', color: '#60a5fa' },
  };
  return map[role] || {};
};

const s = {
  boot: { minHeight: '100vh', background: '#070710', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 },
  bootIcon: { fontSize: 40, color: '#6d28d9' },
  bootText: { color: '#4a4a6a', fontSize: 14, fontFamily: 'sans-serif' },
  root: { display: 'flex', minHeight: '100vh', background: '#070710', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#ededf5' },

  aside: { width: 220, minWidth: 220, background: '#0c0c18', borderRight: '1px solid #181828', display: 'flex', flexDirection: 'column', padding: '28px 0 20px' },
  brand: { color: '#6d28d9', fontSize: 17, fontWeight: 800, padding: '0 24px 28px', letterSpacing: '0.04em' },
  navList: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3, padding: '0 12px' },
  navBtn: { background: 'transparent', border: 'none', color: '#6a6a8a', padding: '10px 14px', borderRadius: 9, cursor: 'pointer', textAlign: 'left', fontSize: 14, transition: 'background 0.1s, color 0.1s' },
  navActive: { background: '#18182e', color: '#ededf5' },
  signOutBtn: { margin: '16px 12px 0', background: 'transparent', border: '1px solid #1e1e30', color: '#4a4a6a', borderRadius: 9, padding: '9px 14px', cursor: 'pointer', fontSize: 13, textAlign: 'left' },

  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  header: { padding: '22px 36px', borderBottom: '1px solid #181828', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 700, color: '#ededf5', margin: 0 },
  headerMeta: { color: '#4a4a6a', fontSize: 13 },
  body: { padding: 36, flex: 1, overflowY: 'auto' },

  note: { color: '#4a4a6a', fontSize: 13, marginBottom: 18 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', padding: '10px 16px', color: '#4a4a6a', fontWeight: 600, borderBottom: '1px solid #181828', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' },
  tr: { borderBottom: '1px solid #101020' },
  td: { padding: '13px 16px' },
  tdName: { color: '#ededf5', fontWeight: 500 },
  tdEmail: { color: '#8a8aaa', fontSize: 13 },
  badge: { marginLeft: 8, background: '#2a1060', color: '#a78bfa', fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 700, verticalAlign: 'middle' },
  chip: { padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500 },
  statusOn:  { color: '#4ade80', fontSize: 12 },
  statusOff: { color: '#f87171', fontSize: 12 },
  removeBtn: { background: 'transparent', border: '1px solid #3a1010', color: '#f87171', borderRadius: 7, padding: '5px 13px', cursor: 'pointer', fontSize: 12 },

  form: { maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 20 },
  input:  { background: '#13132a', border: '1px solid #222238', borderRadius: 10, padding: '12px 14px', color: '#ededf5', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  select: { background: '#13132a', border: '1px solid #222238', borderRadius: 10, padding: '12px 14px', color: '#ededf5', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  primaryBtn: { background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em' },

  dangerCard: { background: '#100808', border: '1px solid #2e1010', borderRadius: 14, padding: 28, maxWidth: 520 },
  dangerTitle: { color: '#f87171', fontSize: 15, fontWeight: 700, margin: '0 0 10px' },
  dangerDesc: { color: '#7a4a4a', fontSize: 14, margin: '0 0 22px', lineHeight: 1.65 },
  dangerBtn: { background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b', borderRadius: 9, padding: '10px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },

  profileCard: { background: '#0f0f1e', border: '1px solid #181828', borderRadius: 14, padding: 28, maxWidth: 520 },
  profileTitle: { color: '#ededf5', fontSize: 15, fontWeight: 700, margin: '0 0 18px' },
  dl: { margin: 0, display: 'grid', gridTemplateColumns: '80px 1fr', rowGap: 12 },
  dt: { color: '#4a4a6a', fontSize: 13 },
  dd: { margin: 0, color: '#ededf5', fontSize: 14, fontWeight: 500 },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#0f0f1e', border: '1px solid #1e1e34', borderRadius: 18, padding: '36px 36px 32px', maxWidth: 460, width: '90%' },
  modalTitle: { color: '#ededf5', fontSize: 18, fontWeight: 700, margin: '0 0 12px' },
  modalDesc: { color: '#6a6a8a', fontSize: 14, margin: '0 0 22px', lineHeight: 1.65 },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 },
  cancelBtn: { background: 'transparent', border: '1px solid #222238', color: '#6a6a8a', borderRadius: 9, padding: '10px 20px', cursor: 'pointer', fontSize: 14 },
};
