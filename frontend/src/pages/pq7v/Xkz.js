import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SK = '_sk';

export default function Xkz() {
  const nav  = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(SK);
    if (!token) return;
    axios.get('/api/z9xvq/vrfy', { headers: { Authorization: `Bearer ${token}` } })
      .then(() => nav('/v8xk2p/qr7nzt/bm4j9/z5cn'))
      .catch(() => localStorage.removeItem(SK));
  }, [nav]);

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'login') {
        const { data } = await axios.post(
          '/api/auth/xq7vb/rnk3p/w2nf',
          { email: form.email, password: form.password }
        );
        localStorage.setItem(SK, data.token);
        nav('/v8xk2p/qr7nzt/bm4j9/z5cn');
      } else {
        await axios.post('/api/auth/xq7vb/rnk3p/t8mz', form);
        toast.success('Account initialized. Sign in to continue.');
        setMode('login');
        setForm(p => ({ ...p, name: '' }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={s.bg}>
      <div style={s.card}>
        <div style={s.icon}>⬡</div>
        <h2 style={s.title}>{mode === 'login' ? 'System Access' : 'Initialize Account'}</h2>
        <p style={s.sub}>
          {mode === 'login' ? 'Restricted access area' : 'One-time initialization'}
        </p>

        <form onSubmit={submit} style={s.form}>
          {mode === 'create' && (
            <div style={s.field}>
              <label style={s.label}>Full Name</label>
              <input
                style={s.input}
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={set}
                required
                autoComplete="off"
              />
            </div>
          )}
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              name="email"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={set}
              required
              autoComplete="off"
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              name="password"
              type="password"
              placeholder={mode === 'create' ? 'Min 8 characters' : 'Enter password'}
              value={form.password}
              onChange={set}
              required
            />
          </div>
          <button style={{ ...s.btn, opacity: busy ? 0.6 : 1 }} type="submit" disabled={busy}>
            {busy ? 'Processing...' : mode === 'login' ? 'Authenticate' : 'Initialize'}
          </button>
        </form>

        <p style={s.toggle} onClick={() => setMode(m => m === 'login' ? 'create' : 'login')}>
          {mode === 'login' ? 'First-time setup' : 'Already initialized? Sign in'}
        </p>
      </div>
    </div>
  );
}

const s = {
  bg: {
    minHeight: '100vh',
    background: '#070710',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  card: {
    background: '#0f0f1a',
    border: '1px solid #1c1c2e',
    borderRadius: 18,
    padding: '48px 44px',
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  },
  icon: { fontSize: 40, color: '#6d28d9', marginBottom: 12, lineHeight: 1 },
  title: { color: '#ededf5', fontSize: 22, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.01em' },
  sub: { color: '#4a4a6a', fontSize: 13, margin: '0 0 32px' },
  form: { display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, color: '#6a6a8a', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 },
  input: {
    background: '#16162a',
    border: '1px solid #252540',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#ededf5',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  btn: {
    background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '13px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 6,
    letterSpacing: '0.03em',
    transition: 'opacity 0.15s',
  },
  toggle: {
    color: '#4a4a6a',
    fontSize: 13,
    marginTop: 28,
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationColor: '#2a2a4a',
  },
};
