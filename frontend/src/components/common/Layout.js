import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, Users, ClipboardCheck, BarChart2,
  LogOut, Bell, Menu, X, Star, MessageSquare, Award, FolderOpen,
  Settings, Plus, Camera, Target, TrendingUp, UserCheck,
  ShieldCheck, BookOpen, Send, AlertTriangle, CheckSquare,
  ChevronDown, Activity, Search, CreditCard, ClipboardList
} from 'lucide-react';


const NAV = {
  admin: [
    { sec: 'Overview', items: [
      { to: '/admin',               icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/reports',       icon: BarChart2,       label: 'Analysis & Reports' },
    ]},
    { sec: 'Master', collapsible: true, key: 'master', items: [
      { to: '/admin/standards',     icon: BookOpen,        label: 'Add Standard' },
      { to: '/admin/auditors',      icon: ClipboardCheck,  label: 'Add Auditor' },
      { to: '/admin/auditors',      icon: Users,           label: 'Auditor List' },
      { to: '/admin/users',         icon: Users,           label: 'Users' },
      { to: '/admin/roles',         icon: ShieldCheck,     label: 'Add Role' },
    ]},

    { sec: 'Apps', items: [
      { to: '/admin/applications/new',   icon: Plus,           label: 'Add Application' },
      { to: '/admin/applications',       icon: FileText,       label: 'Application List' },
      { to: '/admin/applications',       icon: FileText,       label: 'App Standard Delete' },
      { to: '/admin/feedback',           icon: MessageSquare,  label: 'Review' },
      { to: '/admin/approval-pending',   icon: CheckSquare,    label: 'Approval Pending' },
      { to: '/admin/dms',                icon: FolderOpen,     label: 'DMS' },
      { to: '/admin/audit-stage1',       icon: ClipboardCheck, label: 'Audit Stage1' },
      { to: '/admin/audit-stage2',       icon: ClipboardCheck, label: 'Audit Stage2' },
      { to: '/admin/observation',        icon: AlertTriangle,  label: 'Observation' },
      { to: '/admin/payments',           icon: CreditCard,     label: 'Payment Tracking' },
      { to: '/admin/reports',            icon: BarChart2,      label: 'Review Report' },
      { to: '/admin/certificates',       icon: Award,          label: 'Certificate Setting' },
      { to: '/admin/send-client',        icon: Send,           label: 'Send Client' },
      { to: '/admin/send-auditor',       icon: Send,           label: 'Send Auditor' },
      { to: '/admin/send-auditor',       icon: Send,           label: 'Send Reviewer' },
      { to: '/admin/reports',            icon: BarChart2,      label: 'Report Auditor-Client Docs' },
      { to: '/admin/reports',            icon: BarChart2,      label: 'Client To Admin' },
    ]},
    { sec: 'Leads', items: [
      { to: '/admin/leads', icon: Target, label: 'Lead Management', badge: 'NEW' },
    ]},
    { sec: 'QMS Forms', items: [
      { to: '/admin/audit-details',    icon: ClipboardList, label: 'View Audit Details', badge: 'QMS' },
      { to: '/admin/audit-report/new', icon: FileText,      label: 'New Audit Report', badge: 'NEW' },
      { to: '/admin/audit-forms',      icon: ClipboardList, label: 'QMS Audit Forms Index' },
    ]},
  ],
  client: [
    { sec: 'Overview', items: [
      { to: '/client',              icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/client/applications', icon: FileText,        label: 'My Applications' },
    ]},
    { sec: 'Reports', items: [
      { to: '/client/team-reports', icon: ClipboardCheck, label: 'Team & Reports' },
    ]},
    { sec: 'Documents', items: [
      { to: '/client/documents',    icon: FolderOpen, label: 'Documents & Forms' },
      { to: '/client/certificates', icon: Award,      label: 'My Certificates' },
    ]},
    { sec: 'Support', items: [
      { to: '/client/feedback', icon: MessageSquare, label: 'Feedback' },
    ]},
  ],
  auditor: [
    { sec: 'Overview', items: [
      { to: '/auditor',              icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/auditor/applications', icon: ClipboardCheck,  label: 'My Audits' },
    ]},
    { sec: 'Review', items: [
      { to: '/auditor/review-queue', icon: Star,         label: 'Review Queue' },
      { to: '/auditor/reports',      icon: BarChart2,    label: 'Reports' },
    ]},
    { sec: 'Audit Forms', items: [
      { to: '/auditor/applications', icon: ClipboardList, label: 'View Audit Forms', badge: 'QMS' },
    ]},
    { sec: 'Documents', items: [
      { to: '/auditor/documents', icon: FolderOpen, label: 'Documents' },
    ]},
    { sec: 'System', items: [
      { to: '/auditor/settings', icon: Settings, label: 'Settings' },
    ]},
  ],
  reviewer: [
    { sec: 'Overview', items: [
      { to: '/auditor',              icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/auditor/applications', icon: ClipboardCheck,  label: 'My Audits' },
    ]},
    { sec: 'Review', items: [
      { to: '/auditor/review-queue', icon: Star,         label: 'Review Queue' },
      { to: '/auditor/reports',      icon: BarChart2,    label: 'Reports' },
    ]},
    { sec: 'Audit Reports', items: [
      { to: '/auditor/applications', icon: ClipboardList, label: 'Review Audit Forms', badge: 'QMS' },
    ]},
    { sec: 'Documents', items: [
      { to: '/auditor/documents', icon: FolderOpen, label: 'Documents' },
    ]},
    { sec: 'System', items: [
      { to: '/auditor/settings', icon: Settings, label: 'Settings' },
    ]},
  ],
  sales: [
    { sec: 'Overview', items: [
      { to: '/sales',          icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/sales/pipeline', icon: Target,          label: 'Sales Pipeline' },
    ]},
    { sec: 'Applications', items: [
      { to: '/sales/new-application',  icon: Plus,          label: 'New Application', badge: 'NEW' },
      { to: '/sales/applications',     icon: ClipboardList, label: 'View Audit Details', badge: 'QMS' },
    ]},
    { sec: 'Team', items: [
      { to: '/sales/team',   icon: Users,     label: 'Sales Team' },
      { to: '/sales/leads',  icon: FileText,  label: 'Lead Management' },
      { to: '/sales/assign', icon: UserCheck, label: 'Assign Leads' },
    ]},
    { sec: 'Performance', items: [
      { to: '/sales/reports',  icon: BarChart2,  label: 'Sales Reports' },
      { to: '/sales/targets',  icon: TrendingUp, label: 'Targets & Quotas' },
    ]},
    { sec: 'System', items: [
      { to: '/sales/settings', icon: Settings, label: 'Settings' },
    ]},
  ],
};

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const [open,       setOpen]       = useState(false);
  const [notifs,     setNotifs]     = useState(false);
  const [profileImg, setProfileImg] = useState(null);
  const [collapsed,  setCollapsed]  = useState({});
  const nRef   = useRef(null);
  const imgRef = useRef(null);

  const secs   = NAV[user?.role] || [];
  const msgs   = user?.notifications || [];
  const unread = msgs.filter(n => !n.read).length;

  const isOn = (to) => {
    if (to === `/${user?.role}` || to === '/auditor') return loc.pathname === to;
    if (to.endsWith('/new')) return loc.pathname === to;
    return loc.pathname.startsWith(to) && !loc.pathname.startsWith(to + '/new');
  };

  useEffect(() => {
    const fn = e => { if (nRef.current && !nRef.current.contains(e.target)) setNotifs(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`profile_img_${user?._id}`);
    if (saved) setProfileImg(saved);
  }, [user?._id]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleProfileImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImg(ev.target.result);
      localStorage.setItem(`profile_img_${user?._id}`, ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const toggleCollapse = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {open && (
        <div
          className="sidebar-overlay show"
          onClick={() => setOpen(false)}
          style={{ display: 'block', opacity: 1 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-top">
          <div className="logo-mark">
            <img src="/QC.png" alt="QC Certification" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </div>
          <div>
            <div className="logo-text-top">QC Certification</div>
            <div className="logo-text-sub">ISO CRM Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {secs.map((s, i) => (
            <div key={i}>
              {s.collapsible ? (
                <>
                  <button
                    className="nav-link"
                    style={{ justifyContent: 'space-between' }}
                    onClick={() => toggleCollapse(s.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Activity className="nav-icon" size={15} />
                      <span style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--primary-dark)' }}>
                        {s.sec}
                      </span>
                    </div>
                    <ChevronDown
                      size={13}
                      className={`nav-chevron ${!collapsed[s.key] ? 'open' : ''}`}
                    />
                  </button>
                  {!collapsed[s.key] && (
                    <div className="nav-sub">
                      {s.items.map(item => (
                        <Link
                          key={item.to + item.label}
                          to={item.to}
                          className={`nav-sub-item ${isOn(item.to) ? 'active' : ''}`}
                          onClick={() => setOpen(false)}
                        >
                          <span className="nav-sub-dot" />
                          <span style={{ flex: 1 }}>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="nav-group-label">{s.sec}</div>
                  {s.items.map(item => (
                    <Link
                      key={item.to + item.label}
                      to={item.to}
                      className={`nav-link ${isOn(item.to) ? 'active' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon className="nav-icon" size={15} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                      {isOn(item.to) && <span className="nav-dot" />}
                    </Link>
                  ))}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="sidebar-user">
          <div className="user-row">
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div className="u-avatar">
                {profileImg ? <img src={profileImg} alt="profile" /> : user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <label style={{ position: 'absolute', bottom: -2, right: -2, width: 15, height: 15, borderRadius: '50%', background: 'var(--primary)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={7} color="white" />
                <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfileImg} />
              </label>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="u-name">{user?.name}</div>
              <div className="u-email">{user?.email}</div>
            </div>
          </div>
          <button className="u-logout" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Header */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="hdr-btn mob-menu-btn" onClick={() => setOpen(v => !v)}>
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
            <h1 className="page-heading">{title || 'Dashboard'}</h1>
          </div>
          <div className="top-bar-right">
            <div className="hdr-pill"><span className="hdr-dot" />System Online</div>
            <span className="hdr-role">{user?.role}</span>

            {/* Bell */}
            <div style={{ position: 'relative' }} ref={nRef}>
              <button className="hdr-btn" onClick={() => setNotifs(v => !v)}>
                <Bell size={15} />
                {unread > 0 && <span className="notif-badge">{unread}</span>}
              </button>
              {notifs && (
                <div className="notif-panel">
                  <div className="notif-hdr">
                    <span className="notif-hdr-title">Notifications</span>
                    {unread > 0 && <span className="badge bdg-info">{unread} new</span>}
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {msgs.length === 0
                      ? <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>All caught up 🎉</div>
                      : [...msgs].reverse().slice(0, 15).map((n, i) => (
                          <div key={i} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                            <div className="notif-msg">{n.message}</div>
                            <div className="notif-time">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div
              style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary-200)', flexShrink: 0, cursor: 'pointer' }}
              onClick={() => imgRef.current?.click()}
            >
              {profileImg
                ? <img src={profileImg} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 11 }}>
                    {user?.name?.slice(0, 2).toUpperCase()}
                  </div>
              }
            </div>
          </div>
        </header>

        <main className="page">{children}</main>
      </div>
    </div>
  );
}
