import React,{useState,useEffect}from'react';import axios from'axios';import Layout from'../../components/common/Layout';
import toast from'react-hot-toast';import{Plus,Search,Edit,Trash2,CheckCircle,XCircle}from'lucide-react';

export default function AdminUsers(){
  const[users,setUsers]=useState([]);const[loading,setLoading]=useState(true);
  const[search,setSearch]=useState('');const[rf,setRf]=useState('');const[statusF,setStatusF]=useState('');
  const[modal,setModal]=useState(null);const[saving,setSaving]=useState(false);
  const[form,setForm]=useState({name:'',email:'',password:'',role:'client',phone:'',company:''});
  const[activeTab,setActiveTab]=useState('all'); // 'all' | 'pending'

  const load=()=>{setLoading(true);axios.get('/api/users').then(r=>setUsers(r.data||[])).finally(()=>setLoading(false));};
  useEffect(load,[]);

  const pending=users.filter(u=>u.pendingApproval&&!u.isActive);
  const filtered=users.filter(u=>{
    if(activeTab==='pending') return u.pendingApproval&&!u.isActive;
    const q=search.toLowerCase();
    const matchSearch=!q||u.name?.toLowerCase().includes(q)||u.email?.toLowerCase().includes(q)||u.clientId?.toLowerCase().includes(q);
    const matchRole=!rf||u.role===rf;
    const matchStatus=!statusF||(statusF==='active'?u.isActive:!u.isActive);
    return matchSearch&&matchRole&&matchStatus;
  });

  const save=async()=>{
    if(!form.name||!form.email||!form.role)return toast.error('Name, email, role required');
    if(modal==='add'&&!form.password)return toast.error('Password required');
    setSaving(true);
    try{
      if(modal==='add'){await axios.post('/api/users',form);toast.success('User created');}
      else{const d={...form};if(!d.password)delete d.password;await axios.put(`/api/users/${modal._id}`,d);toast.success('Updated');}
      setModal(null);load();
    }catch(e){toast.error(e.response?.data?.message||'Error');}finally{setSaving(false);}
  };

  const del=async id=>{if(!window.confirm('Delete this user?'))return;try{await axios.delete(`/api/users/${id}`);toast.success('Deleted');load();}catch{toast.error('Failed');}};

  const approve=async(user)=>{
    try{
      await axios.put(`/api/users/${user._id}`,{isActive:true,pendingApproval:false});
      toast.success(`✅ ${user.name} activated`);load();
    }catch{toast.error('Failed to activate');}
  };

  const reject=async(user)=>{
    if(!window.confirm(`Reject and delete ${user.name}'s registration?`))return;
    try{await axios.delete(`/api/users/${user._id}`);toast.success('Registration rejected');load();}catch{toast.error('Failed');}
  };

  const roleColor={admin:'var(--primary)',client:'#3b82f6',auditor:'#8b5cf6',reviewer:'#8b5cf6',sales:'#16a34a'};

  return(
    <Layout title="User Management">
      <div className="page-hdr">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{filtered.length} users{pending.length>0&&<span style={{marginLeft:8,background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:700}}>{pending.length} Pending Approval</span>}</p>
        </div>
        <button className="btn btn-primary" onClick={()=>{setForm({name:'',email:'',password:'',role:'client',phone:'',company:''});setModal('add');}}><Plus size={14}/>Add User</button>
      </div>

      {/* Pending approvals banner */}
      {pending.length>0&&activeTab!=='pending'&&(
        <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div style={{fontSize:13,color:'#92400e'}}>🔔 <strong>{pending.length} new client registration{pending.length>1?'s':''}</strong> pending your approval.</div>
          <button onClick={()=>setActiveTab('pending')} className="btn btn-primary" style={{padding:'6px 14px',fontSize:12}}>Review</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{display:'flex',gap:0,background:'#fff7ed',borderRadius:10,padding:3,marginBottom:16,border:'1px solid #fde68a',width:'fit-content'}}>
        {[['all','All Users'],['pending',`Pending Approval${pending.length?` (${pending.length})`:''}`]].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)}
            style={{padding:'7px 16px',border:'none',borderRadius:8,background:activeTab===id?'linear-gradient(135deg,#f97316,#ea580c)':'transparent',color:activeTab===id?'white':'#9ca3af',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all .15s',whiteSpace:'nowrap'}}>
            {label}
          </button>
        ))}
      </div>

      {/* Filters (all tab only) */}
      {activeTab==='all'&&(
        <div className="card" style={{marginBottom:16}}><div className="card-body" style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <div className="search-wrap" style={{flex:1,minWidth:180}}><Search size={15} className="search-ico"/><input className="search-input" placeholder="Search name, email, client ID…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <select className="form-control" style={{width:'auto'}} value={rf} onChange={e=>setRf(e.target.value)}><option value="">All Roles</option>{['admin','client','auditor','sales'].map(r=><option key={r} value={r}>{r}</option>)}</select>
          <select className="form-control" style={{width:'auto'}} value={statusF} onChange={e=>setStatusF(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
        </div></div>
      )}

      <div className="card">
        {loading?<div className="loading-box"><div className="spinner"/></div>:(
          filtered.length===0?(
            <div style={{padding:'40px 20px',textAlign:'center',color:'var(--gray-400)',fontSize:13}}>
              {activeTab==='pending'?'✅ No pending registrations':'No users found'}
            </div>
          ):(
            <div className="tbl-wrap"><table className="tbl">
              <thead><tr>
                <th>User</th>
                {activeTab==='pending'&&<th>Client ID</th>}
                <th>Role</th>
                <th>Company</th>
                <th>Phone</th>
                {activeTab==='pending'&&<th>ISO Standard</th>}
                <th>Status</th>
                <th>Actions</th>
              </tr></thead>
              <tbody>{filtered.map(u=>(
                <tr key={u._id} style={u.pendingApproval&&!u.isActive?{background:'#fffbeb'}:{}}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div className="avatar" style={{background:roleColor[u.role]+'22',color:roleColor[u.role]}}>{u.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{fontWeight:600,color:'var(--text-1)'}}>{u.name}</div>
                        <div style={{fontSize:11,color:'var(--gray-400)'}}>{u.email}</div>
                        {u.clientId&&<div style={{fontSize:10,color:'#f97316',fontWeight:600}}>{u.clientId}</div>}
                      </div>
                    </div>
                  </td>
                  {activeTab==='pending'&&<td style={{fontSize:12,fontFamily:'monospace',fontWeight:600,color:'#f97316'}}>{u.clientId||'—'}</td>}
                  <td><span className={`badge bdg-${u.role}`}>{u.role}</span></td>
                  <td style={{fontSize:13}}>{u.company||'—'}</td>
                  <td style={{fontSize:13}}>{u.phone||'—'}</td>
                  {activeTab==='pending'&&<td style={{fontSize:12}}>{u.isoStandard||'—'}</td>}
                  <td>
                    {u.pendingApproval&&!u.isActive
                      ?<span style={{background:'#fef3c7',color:'#92400e',border:'1px solid #fde68a',borderRadius:6,padding:'3px 8px',fontSize:11,fontWeight:700}}>⏳ Pending</span>
                      :<span className={`badge bdg-${u.isActive?'active':'inactive'}`}>{u.isActive?'Active':'Inactive'}</span>
                    }
                  </td>
                  <td>
                    <div className="tbl-actions">
                      {u.pendingApproval&&!u.isActive?(
                        <>
                          <button className="btn btn-primary btn-sm" onClick={()=>approve(u)} style={{background:'#16a34a',borderColor:'#16a34a'}}><CheckCircle size={13}/>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>reject(u)}><XCircle size={13}/>Reject</button>
                        </>
                      ):(
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={()=>{setForm({name:u.name,email:u.email,password:'',role:u.role,phone:u.phone||'',company:u.company||''});setModal(u);}}><Edit size={13}/>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>del(u._id)}><Trash2 size={13}/>Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          )
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal&&(
        <div className="modal-bg" onClick={()=>setModal(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">{modal==='add'?'Add New User':'Edit User'}</div>
              <button className="modal-close" onClick={()=>setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="John Doe"/></div>
                <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="john@co.com"/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Password{modal!=='add'?' (blank = keep)':' *'}</label><input type="password" className="form-control" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder={modal==='add'?'Required':'••••••••'}/></div>
                <div className="form-group"><label className="form-label">Role *</label>
                  <select className="form-control" value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
                    {['admin','client','auditor','reviewer','sales'].map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+91 9000000000"/></div>
                <div className="form-group"><label className="form-label">Company</label><input className="form-control" value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))} placeholder="Company Ltd"/></div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':modal==='add'?<><Plus size={14}/>Create</>:<><Edit size={14}/>Save</>}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
