import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ISO_STANDARDS = [
  'ISO 9001:2015',
  'ISO 14001:2015',
  'ISO 22000:2018',
  'ISO 27001:2022',
  'ISO 45001:2018',
];

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fef3c7 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  blob1: { position: 'fixed', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'rgba(249,115,22,0.07)', pointerEvents: 'none' },
  blob2: { position: 'fixed', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(234,88,12,0.05)', pointerEvents: 'none' },
  card: { background: 'white', borderRadius: 24, padding: '34px 32px 28px', boxShadow: '0 20px 60px rgba(249,115,22,0.12)', border: '1.5px solid #fde68a' },
  logoWrap: { textAlign: 'center', marginBottom: 24 },
  logoIcon: { width: 50, height: 50, borderRadius: 15, background: 'linear-gradient(135deg,#f97316,#ea580c)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(249,115,22,0.3)' },
  h1: { fontSize: 19, fontWeight: 800, color: '#1c0a00', margin: '0 0 3px' },
  sub: { fontSize: 11.5, color: '#f97316', margin: 0, fontWeight: 600 },
  tabs: { display: 'flex', background: '#fff7ed', borderRadius: 11, padding: 3, marginBottom: 22, border: '1px solid #fde68a' },
  label: { display: 'block', fontSize: 10.5, fontWeight: 700, color: '#92400e', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em' },
  btnMain: { width: '100%', padding: '12px 0', border: 'none', borderRadius: 11, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.28)', transition: 'opacity .15s' },
};

function inp(focused) {
  return { width: '100%', padding: '10px 13px', border: `1.5px solid ${focused ? '#f97316' : '#fde68a'}`, borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", boxSizing: 'border-box', background: '#fffbeb', color: '#1c0a00', transition: 'border .15s' };
}

function FInput({ type = 'text', placeholder, value, onChange, required = true, name, onEnter }) {
  const [f, setF] = useState(false);
  return (
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      required={required} name={name}
      style={inp(f)}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      onKeyDown={onEnter ? e => e.key === 'Enter' && onEnter() : undefined}
    />
  );
}

function Field({ label, required, children, half }) {
  return (
    <div style={{ marginBottom: 13, ...(half ? {} : {}) }}>
      <label style={S.label}>{label}{required && <span style={{ color: '#f97316' }}> *</span>}</label>
      {children}
    </div>
  );
}

function Alert({ type, msg }) {
  if (!msg) return null;
  const styles = type === 'error'
    ? { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }
    : { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' };
  return <div style={{ ...styles, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12.5 }}>{type === 'error' ? '⚠️ ' : '✅ '}{msg}</div>;
}

// ── 6-box OTP input ──
function OtpInput({ value, onChange }) {
  const refs = useRef([]);
  const boxes = Array.from({ length: 6 });

  const handleChange = (e, i) => {
    const v = e.target.value.replace(/\D/, '').slice(-1);
    const arr = (value || '      ').split('');
    arr[i] = v || ' ';
    onChange(arr.join(''));
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      const arr = (value || '      ').split('');
      if (!arr[i] || arr[i] === ' ') { if (i > 0) { refs.current[i - 1]?.focus(); } }
      else { arr[i] = ' '; onChange(arr.join('')); }
    }
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length) { onChange(paste.padEnd(6, ' ')); refs.current[Math.min(paste.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '14px 0' }}>
      {boxes.map((_, i) => {
        const digit = (value || '      ')[i]?.trim() || '';
        return (
          <input key={i} ref={el => (refs.current[i] = el)}
            type="text" inputMode="numeric" maxLength={1} value={digit}
            onChange={e => handleChange(e, i)} onKeyDown={e => handleKey(e, i)} onPaste={handlePaste}
            style={{ width: 42, height: 50, textAlign: 'center', fontSize: 22, fontWeight: 800, border: `2px solid ${digit ? '#f97316' : '#fde68a'}`, borderRadius: 11, outline: 'none', background: digit ? '#fff7ed' : '#fffbeb', color: '#ea580c', fontFamily: 'monospace', transition: 'all .15s' }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════
export default function Login() {
  const [tab, setTab] = useState('login');            // 'login' | 'register' | 'success'
  const [loginMode, setLoginMode] = useState('client'); // 'client' | 'auditor' | 'admin'

  // email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // admin OTP state
  const [adminPhone, setAdminPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('      ');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const [demoOtp, setDemoOtp] = useState('');

  // registration state
  const [reg, setReg] = useState({ companyName: '', email: '', password: '', mobile: '', address: '', standard: '', scope: '' });
  const [clientId, setClientId] = useState('');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const { login, loginWithToken } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startTimer = (sec = 60) => {
    setTimer(sec);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
  };

  const clear = () => { setErr(''); setMsg(''); };

  // ── Smart error message — detects server down vs real error ──
  const getErrMsg = (ex, fallback) => {
    if (!ex.response) {
      // No response = network error / server not running
      if (ex.code === 'ERR_NETWORK' || ex.message?.includes('Network Error') || ex.message?.includes('ECONNREFUSED')) {
        return '🔌 Cannot connect to server. Make sure the backend is running on port 5000.';
      }
      return '🔌 Server is not responding. Please start the backend server and try again.';
    }
    return ex.response?.data?.message || fallback;
  };

  // ── Email login ──
  const handleLogin = async (e) => {
    e.preventDefault(); clear(); setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'reviewer' ? '/auditor' : `/${user.role}`);
    } catch (ex) {
      setErr(getErrMsg(ex, 'Invalid email or password.'));
    } finally { setLoading(false); }
  };

  // ── Send OTP ──
  const handleSendOtp = async () => {
    if (!adminPhone || adminPhone.replace(/\D/g,'').length < 10) { setErr('Enter a valid 10-digit mobile number.'); return; }
    clear(); setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/send-otp', { phone: adminPhone.replace(/\D/g,'') });
      setOtpSent(true);
      setDemoOtp(data.demo_otp || '');
      setMsg(`OTP sent to +91 ${adminPhone}${data.demo_otp ? ` (demo OTP: ${data.demo_otp})` : ''}`);
      startTimer(60);
    } catch (ex) {
      setErr(getErrMsg(ex, 'Failed to send OTP. Please check the phone number.'));
    } finally { setLoading(false); }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async () => {
    const otpVal = otp.replace(/\s/g, '');
    if (otpVal.length < 6) { setErr('Enter the complete 6-digit OTP.'); return; }
    clear(); setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/verify-otp', { phone: adminPhone.replace(/\D/g,''), otp: otpVal });
      loginWithToken(data, data.token);
      navigate('/admin');
    } catch (ex) {
      setErr(getErrMsg(ex, 'Invalid OTP. Please try again.'));
    } finally { setLoading(false); }
  };

  // ── Register ──
  const handleRegister = async (e) => {
    e.preventDefault(); clear();
    const { companyName, email: re, password: rp, mobile, address, standard, scope } = reg;
    if (!companyName || !re || !rp || !mobile || !address || !standard || !scope) { setErr('All fields are required.'); return; }
    if (rp.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register-client', reg);
      setClientId(data.clientId);
      setTab('success');
    } catch (ex) {
      setErr(getErrMsg(ex, 'Registration failed. Please try again.'));
    } finally { setLoading(false); }
  };

  const tabBtn = (id, label) => (
    <button onClick={() => { setTab(id); clear(); }}
      style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 9, background: tab === id ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'transparent', color: tab === id ? 'white' : '#9ca3af', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
      {label}
    </button>
  );

  const modePill = (id, label) => (
    <button onClick={() => { setLoginMode(id); clear(); setOtpSent(false); setOtp('      '); }}
      style={{ flex: 1, padding: '7px 4px', border: `1.5px solid ${loginMode === id ? '#f97316' : '#fde68a'}`, borderRadius: 9, background: loginMode === id ? '#fff7ed' : 'transparent', color: loginMode === id ? '#f97316' : '#9ca3af', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', whiteSpace: 'nowrap' }}>
      {label}
    </button>
  );

  return (
    <div style={S.page}>
      <div style={S.blob1} /><div style={S.blob2} />

      <div style={{ width: '100%', maxWidth: tab === 'register' ? 520 : 428, position: 'relative' }}>
        <div style={S.card}>

          {/* Logo */}
          <div style={S.logoWrap}>
            <div style={S.logoIcon}>
              <img src="/logo.png" alt="Q" style={{ width: 30, height: 30, objectFit: 'contain', filter: 'brightness(10)' }}
                onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="color:white;font-size:20px;font-weight:800">Q</span>'; }} />
            </div>
            <h1 style={S.h1}>QC Certification CRM</h1>
            <p style={S.sub}>ISO Certification Management Platform</p>
          </div>

          {/* Tabs */}
          {tab !== 'success' && (
            <div style={S.tabs}>
              {tabBtn('login', 'Sign In')}
              {tabBtn('register', 'Create Account')}
            </div>
          )}

          <Alert type="error" msg={err} />
          <Alert type="success" msg={msg} />

          {/* ────── LOGIN TAB ────── */}
          {tab === 'login' && (
            <>
              {/* Mode pills */}
              <div style={{ display: 'flex', gap: 7, marginBottom: 18 }}>
                {modePill('client',  '👤 Client')}
                {modePill('auditor', '🔍 Auditor')}
                {modePill('admin',   '🔐 Admin OTP')}
              </div>

              {/* Admin OTP login */}
              {loginMode === 'admin' && (
                <div>
                  <div style={{ background: '#fff7ed', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 13px', marginBottom: 16, fontSize: 11.5, color: '#92400e' }}>
                    🛡️ <strong>Admin access only</strong> — OTP will be sent to your registered mobile number.
                  </div>
                  {!otpSent ? (
                    <>
                      <Field label="Admin Mobile Number" required>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <div style={{ flex: 1, position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>+91</span>
                            <input type="tel" placeholder="9000000001" value={adminPhone}
                              onChange={e => setAdminPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                              style={{ ...inp(false), paddingLeft: 44 }}
                              onKeyDown={e => e.key === 'Enter' && handleSendOtp()} />
                          </div>
                          <button onClick={handleSendOtp} disabled={loading}
                            style={{ ...S.btnMain, width: 'auto', padding: '0 18px', flexShrink: 0, boxShadow: 'none', opacity: loading ? 0.7 : 1 }}>
                            {loading ? '...' : 'Send OTP'}
                          </button>
                        </div>
                      </Field>
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, padding: '9px 12px', fontSize: 11, color: '#b45309' }}>
                        💡 Demo: Admin phone is <strong>9000000001</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ textAlign: 'center', fontSize: 12.5, color: '#6b7280', margin: '0 0 4px' }}>
                        OTP sent to <strong style={{ color: '#1c0a00' }}>+91 {adminPhone}</strong>
                      </p>
                      <p style={{ textAlign: 'center', fontSize: 11.5, color: '#9ca3af', margin: '0 0 2px' }}>Enter the 6-digit code</p>
                      <OtpInput value={otp} onChange={setOtp} />
                      <button onClick={handleVerifyOtp} disabled={loading || otp.replace(/\s/g,'').length < 6}
                        style={{ ...S.btnMain, opacity: (loading || otp.replace(/\s/g,'').length < 6) ? 0.55 : 1, marginBottom: 12 }}>
                        {loading ? '⏳ Verifying…' : '→ Open Admin Dashboard'}
                      </button>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={() => { setOtpSent(false); setOtp('      '); clear(); }}
                          style={{ background: 'none', border: 'none', fontSize: 11.5, color: '#f97316', cursor: 'pointer', fontFamily: 'inherit' }}>← Change number</button>
                        {timer > 0
                          ? <span style={{ fontSize: 11.5, color: '#9ca3af' }}>Resend in {timer}s</span>
                          : <button onClick={handleSendOtp} style={{ background: 'none', border: 'none', fontSize: 11.5, color: '#f97316', cursor: 'pointer', fontFamily: 'inherit' }}>Resend OTP</button>}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Client / Auditor email login */}
              {loginMode !== 'admin' && (
                <form onSubmit={handleLogin}>
                  <Field label="Email Address" required>
                    <FInput type="email" placeholder={loginMode === 'auditor' ? 'auditor@crm.com' : 'client@crm.com'}
                      value={email} onChange={e => setEmail(e.target.value)} />
                  </Field>
                  <Field label="Password" required>
                    <div style={{ position: 'relative' }}>
                      <input type={showPw ? 'text' : 'password'} placeholder="Enter your password"
                        value={password} onChange={e => setPassword(e.target.value)} required
                        style={{ ...inp(false), paddingRight: 40 }} />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 15, lineHeight: 1 }}>
                        {showPw ? '🙈' : '👁'}
                      </button>
                    </div>
                  </Field>
                  <button type="submit" disabled={loading} style={{ ...S.btnMain, marginTop: 6, opacity: loading ? 0.7 : 1 }}>
                    {loading ? '⏳ Signing in…' : `→ ${loginMode === 'auditor' ? 'Auditor' : 'Client'} Login`}
                  </button>

                  {/* Demo creds */}
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #ffedd5' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#fb923c', marginBottom: 9, textAlign: 'center' }}>Demo Credentials</div>
                    {loginMode === 'client' && (
                      <button type="button" onClick={() => { setEmail('client@crm.com'); setPassword('client123'); }}
                        style={{ width: '100%', padding: '8px 14px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6' }}>Client</div>
                        <div style={{ fontSize: 10.5, color: '#9ca3af' }}>client@crm.com / client123</div>
                      </button>
                    )}
                    {loginMode === 'auditor' && (
                      <button type="button" onClick={() => { setEmail('auditor@crm.com'); setPassword('auditor123'); }}
                        style={{ width: '100%', padding: '8px 14px', background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#8b5cf6' }}>Auditor</div>
                        <div style={{ fontSize: 10.5, color: '#9ca3af' }}>auditor@crm.com / auditor123</div>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}

          {/* ────── REGISTER TAB ────── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ background: '#fff7ed', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 13px', marginBottom: 18, fontSize: 11.5, color: '#92400e' }}>
                📋 <strong>New Client Registration</strong> — fill all fields to create your account. Admin will activate it shortly.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <Field label="Company Name" required>
                    <FInput placeholder="ABC Manufacturing Ltd" value={reg.companyName} onChange={e => setReg(r => ({ ...r, companyName: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Email" required>
                  <FInput type="email" placeholder="info@company.com" value={reg.email} onChange={e => setReg(r => ({ ...r, email: e.target.value }))} />
                </Field>
                <Field label="Password" required>
                  <FInput type="password" placeholder="Min 6 characters" value={reg.password} onChange={e => setReg(r => ({ ...r, password: e.target.value }))} />
                </Field>
                <Field label="Mobile" required>
                  <FInput type="tel" placeholder="9XXXXXXXXX" value={reg.mobile} onChange={e => setReg(r => ({ ...r, mobile: e.target.value.replace(/\D/g,'').slice(0,10) }))} />
                </Field>
                <div style={{ gridColumn: '1/-1' }}>
                  <Field label="Address" required>
                    <FInput placeholder="Full address with city & state" value={reg.address} onChange={e => setReg(r => ({ ...r, address: e.target.value }))} />
                  </Field>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <Field label="ISO Standard" required>
                    <select value={reg.standard} onChange={e => setReg(r => ({ ...r, standard: e.target.value }))} required
                      style={{ ...inp(false), cursor: 'pointer' }}>
                      <option value="">Select ISO Standard</option>
                      {ISO_STANDARDS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <Field label="Organization Activity / Scope" required>
                    <textarea value={reg.scope} onChange={e => setReg(r => ({ ...r, scope: e.target.value }))} required rows={3}
                      placeholder="Describe your organization's main activities and certification scope…"
                      style={{ ...inp(false), resize: 'vertical', lineHeight: 1.5 }} />
                  </Field>
                </div>
              </div>

              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '0 0 14px' }}>
                <span style={{ color: '#f97316' }}>*</span> Required Field
              </p>
              <button type="submit" disabled={loading} style={{ ...S.btnMain, opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ Creating Account…' : '→ Create My Account'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 14, marginBottom: 0 }}>
                Already have an account?{' '}
                <button type="button" onClick={() => { setTab('login'); clear(); }}
                  style={{ background: 'none', border: 'none', color: '#f97316', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>Sign In</button>
              </p>
            </form>
          )}

          {/* ────── SUCCESS TAB ────── */}
          {tab === 'success' && (
            <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1c0a00', margin: '0 0 8px' }}>Account Created!</h2>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 18px', lineHeight: 1.5 }}>
                Your client account has been created and is <strong>pending admin approval</strong>. You will be able to log in once the admin activates your account.
              </p>

              <div style={{ background: 'linear-gradient(135deg,#fff7ed,#ffedd5)', border: '2px solid #f97316', borderRadius: 14, padding: '18px 20px', marginBottom: 18 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#f97316', marginBottom: 6 }}>Your Client ID</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1c0a00', letterSpacing: '.04em', fontFamily: 'monospace', wordBreak: 'break-all' }}>{clientId}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Save this ID — needed when contacting support</div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: '#166534', textAlign: 'left' }}>
                ✅ Registration submitted successfully.<br />
                📞 Admin will review and activate your account.<br />
                📧 Use your email &amp; password to log in after activation.
              </div>

              <button onClick={() => { setTab('login'); setLoginMode('client'); clear(); }}
                style={S.btnMain}>
                → Go to Login
              </button>
            </div>
          )}
        </div>

        {tab !== 'success' && (
          <p style={{ textAlign: 'center', fontSize: 11, color: '#d97706', marginTop: 13, marginBottom: 0 }}>
            🔒 Secure platform · ISO Certification Management
          </p>
        )}
      </div>
    </div>
  );
}
