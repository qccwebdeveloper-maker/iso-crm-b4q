// ============================================================
// MOCK DATA STORE — replaces MongoDB when no DB is connected
// ============================================================
const bcrypt = require('bcryptjs');
const hash = (pw) => bcrypt.hashSync(pw, 10);

// ────────────────────────────────────────────────
// USERS
// ────────────────────────────────────────────────
const USERS = [
  {
    _id: 'u1',
    name: 'Admin User',
    email: 'admin@crm.com',
    password: hash('admin123'),
    role: 'admin',
    company: 'CertifyPro',
    phone: '9000000001',
    isActive: true,
    notifications: [],
    assignedApplications: [],
    clientId: null,
  },
  {
    _id: 'u2',
    name: 'John Client',
    email: 'client@crm.com',
    password: hash('client123'),
    role: 'client',
    company: 'ABC Corp',
    phone: '9000000002',
    isActive: true,
    notifications: [],
    assignedApplications: ['a1', 'a2'],
    clientId: 'CLT-DEMO-001',
    address: '123 Business Park, Mumbai, Maharashtra',
    isoStandard: 'ISO 9001:2015',
    scope: 'Manufacturing of Industrial Components',
    pendingApproval: false,
  },
  {
    _id: 'u3',
    name: 'Sarah Auditor',
    email: 'auditor@crm.com',
    password: hash('auditor123'),
    role: 'auditor',
    company: 'AuditPro',
    phone: '9000000003',
    isActive: true,
    notifications: [{ _id: 'n1', message: 'You have been assigned to application APP1000', type: 'info', read: false, createdAt: new Date() }],
    assignedApplications: ['a1'],
    clientId: null,
  },
  {
    _id: 'u4',
    name: 'Mike Reviewer',
    email: 'reviewer@crm.com',
    password: hash('reviewer123'),
    role: 'reviewer',
    company: 'ReviewPro',
    phone: '9000000004',
    isActive: true,
    notifications: [],
    assignedApplications: [],
    clientId: null,
  },
  {
    _id: 'u5',
    name: 'Sales Manager',
    email: 'sales@crm.com',
    password: hash('sales123'),
    role: 'sales',
    company: 'QC Cert',
    phone: '9000000005',
    isActive: true,
    notifications: [],
    assignedApplications: [],
    clientId: null,
  },
];

// ────────────────────────────────────────────────
// APPLICATIONS
// ────────────────────────────────────────────────
const APPLICATIONS = [
  {
    _id: 'a1', applicationId: 'APP1000',
    client: 'u2', organizationName: 'ABC Manufacturing Ltd', organizationAbbr: 'ABC',
    address1: '123 Industrial Area', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001',
    website: 'www.abcmfg.com', employeeCount: { headOffice: 50, branches: 30, temporary: 20, total: 100 },
    isoStandard: 'ISO 9001:2015', scope: 'Design, Development and Manufacturing of Industrial Components',
    accreditationBody: 'NABCB', status: 'audit_stage1',
    assignedAuditor: 'u3', assignedReviewer: null, auditAcceptanceStatus: 'accepted', auditAcceptedDate: new Date('2024-10-16'),
    applicationForm: null, agreement: null, signedForm: null, uploadedDocuments: [],
    auditReport: null, reviewReport: null, certificate: null,
    progressPercentage: 35, progressStages: ['submitted', 'under_review', 'audit_stage1'],
    paymentStatus: 'received', paymentAmount: 50000, paymentDate: new Date('2024-10-17'),
    feedbacks: [{ _id: 'f1', from: 'u3', role: 'auditor', message: 'Initial documentation looks complete.', rating: 4, createdAt: new Date('2024-11-01') }],
    auditNotes: 'Stage 1 audit in progress.', reviewNotes: '', adminNotes: 'Assigned to Sarah for audit.',
    submittedAt: new Date('2024-10-15'), createdAt: new Date('2024-10-14'), updatedAt: new Date('2024-11-01'),
  },
  {
    _id: 'a2', applicationId: 'APP1001',
    client: 'u2', organizationName: 'XYZ IT Solutions Pvt Ltd', organizationAbbr: 'XYZ',
    address1: '456 Tech Park', city: 'Bangalore', state: 'Karnataka', country: 'India', pincode: '560001',
    website: 'www.xyzit.com', employeeCount: { headOffice: 80, branches: 40, temporary: 10, total: 130 },
    isoStandard: 'ISO 27001:2022', scope: 'Information Security Management for IT Services',
    accreditationBody: 'UKAS', status: 'audit_stage2',
    assignedAuditor: 'u3', assignedReviewer: null, auditAcceptanceStatus: 'accepted', auditAcceptedDate: new Date('2024-10-22'),
    applicationForm: null, agreement: null, signedForm: null, uploadedDocuments: [],
    auditReport: null, reviewReport: null, certificate: null,
    progressPercentage: 50, progressStages: ['submitted', 'under_review', 'audit_stage1', 'audit_stage2'],
    paymentStatus: 'received', paymentAmount: 75000, paymentDate: new Date('2024-10-23'),
    feedbacks: [
      { _id: 'f2', from: 'u3', role: 'auditor', message: 'Stage 1 complete. Moving to Stage 2.', rating: 5, createdAt: new Date('2024-11-10') },
    ],
    auditNotes: 'Stage 1 complete. ISMS policy reviewed.', reviewNotes: '', adminNotes: '',
    submittedAt: new Date('2024-10-20'), createdAt: new Date('2024-10-19'), updatedAt: new Date('2024-11-12'),
  },
  {
    _id: 'a3', applicationId: 'APP1002',
    client: 'u2', organizationName: 'Green Energy Systems', organizationAbbr: 'GES',
    address1: '789 Solar Park', city: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411001',
    website: 'www.greenenergy.com', employeeCount: { headOffice: 40, branches: 20, temporary: 15, total: 75 },
    isoStandard: 'ISO 14001:2015', scope: 'Environmental Management for Renewable Energy Systems',
    accreditationBody: 'NABCB', status: 'certificate_issued',
    assignedAuditor: 'u3', assignedReviewer: 'u4', auditAcceptanceStatus: 'accepted', auditAcceptedDate: new Date('2024-09-30'),
    applicationForm: null, agreement: null, signedForm: null, uploadedDocuments: [],
    auditReport: null, reviewReport: null, certificate: { url: '#', issuedAt: new Date('2024-11-15') },
    progressPercentage: 100, progressStages: ['submitted', 'under_review', 'audit_stage1', 'audit_stage2', 'approved', 'certificate_issued'],
    paymentStatus: 'received', paymentAmount: 60000, paymentDate: new Date('2024-09-28'),
    feedbacks: [], auditNotes: 'All stages complete.', reviewNotes: 'Approved.', adminNotes: 'Certificate issued.',
    submittedAt: new Date('2024-10-01'), createdAt: new Date('2024-09-30'), updatedAt: new Date('2024-11-15'),
  },
  {
    _id: 'a4', applicationId: 'APP1003',
    client: 'u2', organizationName: 'SafeFood Processors', organizationAbbr: 'SFP',
    address1: '321 Food Park', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600001',
    website: '', employeeCount: { headOffice: 25, branches: 10, temporary: 5, total: 40 },
    isoStandard: 'ISO 22000:2018', scope: 'Food Safety Management for Processing',
    accreditationBody: 'FSSAI', status: 'submitted',
    assignedAuditor: null, assignedReviewer: null, auditAcceptanceStatus: null, auditAcceptedDate: null,
    applicationForm: null, agreement: null, signedForm: null, uploadedDocuments: [],
    auditReport: null, reviewReport: null, certificate: null,
    progressPercentage: 10, progressStages: ['submitted'],
    paymentStatus: 'pending', paymentAmount: 0, paymentDate: null,
    feedbacks: [], auditNotes: '', reviewNotes: '', adminNotes: '',
    submittedAt: new Date('2024-11-20'), createdAt: new Date('2024-11-19'), updatedAt: new Date('2024-11-20'),
  },
  {
    _id: 'a5', applicationId: 'APP1004',
    client: 'u2', organizationName: 'WorkSafe Industries', organizationAbbr: 'WSI',
    address1: '654 Industrial Zone', city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110001',
    website: 'www.worksafe.com', employeeCount: { headOffice: 30, branches: 10, temporary: 5, total: 45 },
    isoStandard: 'ISO 45001:2018', scope: 'Occupational Health and Safety Management',
    accreditationBody: 'NABCB', status: 'draft',
    assignedAuditor: null, assignedReviewer: null, auditAcceptanceStatus: null, auditAcceptedDate: null,
    applicationForm: null, agreement: null, signedForm: null, uploadedDocuments: [],
    auditReport: null, reviewReport: null, certificate: null,
    progressPercentage: 0, progressStages: [],
    paymentStatus: 'pending', paymentAmount: 0, paymentDate: null,
    feedbacks: [], auditNotes: '', reviewNotes: '', adminNotes: '',
    submittedAt: null, createdAt: new Date('2024-11-22'), updatedAt: new Date('2024-11-22'),
  },
];

// ────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────
function populateUser(id) {
  if (!id) return null;
  const u = USERS.find(u => u._id === id);
  if (!u) return null;
  const { password, ...safe } = u;
  return safe;
}

function populateApp(app) {
  return {
    ...app,
    client: populateUser(app.client),
    assignedAuditor: populateUser(app.assignedAuditor),
    assignedReviewer: populateUser(app.assignedReviewer),
    feedbacks: (app.feedbacks || []).map(f => ({ ...f, from: populateUser(f.from) })),
  };
}

function getUsers(filter = {}) {
  return USERS
    .filter(u => {
      if (filter.role) return u.role === filter.role;
      return true;
    })
    .map(({ password, ...u }) => u);
}

function getUserById(id) {
  const u = USERS.find(u => u._id === id);
  if (!u) return null;
  const { password, ...safe } = u;
  return safe;
}

function getUserByEmail(email) {
  return USERS.find(u => u.email === email) || null;
}

function createUser(data) {
  const newId = 'u' + (Date.now());
  const newUser = {
    _id: newId,
    notifications: [],
    assignedApplications: [],
    ...data,
    password: bcrypt.hashSync(data.password, 10),
    createdAt: new Date(),
  };
  USERS.push(newUser);
  const { password, ...safe } = newUser;
  return safe;
}

function updateUser(id, data) {
  const idx = USERS.findIndex(u => u._id === id);
  if (idx === -1) return null;
  if (data.password) data.password = bcrypt.hashSync(data.password, 10);
  USERS[idx] = { ...USERS[idx], ...data };
  const { password, ...safe } = USERS[idx];
  return safe;
}

function deleteUser(id) {
  const idx = USERS.findIndex(u => u._id === id);
  if (idx === -1) return false;
  USERS.splice(idx, 1);
  return true;
}

function addNotification(userId, message, type = 'info') {
  const user = USERS.find(u => u._id === userId);
  if (!user) return;
  if (!user.notifications) user.notifications = [];
  user.notifications.unshift({ _id: 'n' + Date.now(), message, type, read: false, createdAt: new Date() });
}

function markNotificationRead(userId, notifId) {
  const user = USERS.find(u => u._id === userId);
  if (!user || !user.notifications) return;
  const n = user.notifications.find(n => n._id === notifId);
  if (n) n.read = true;
}

// ────────────────────────────────────────────────
// APPLICATIONS CRUD
// ────────────────────────────────────────────────
let appCounter = APPLICATIONS.length + 1000;

function getApplications(filter = {}) {
  let apps = APPLICATIONS;
  if (filter.client) apps = apps.filter(a => a.client === filter.client);
  if (filter.assignedAuditor) apps = apps.filter(a => a.assignedAuditor === filter.assignedAuditor);
  if (filter.status) apps = apps.filter(a => a.status === filter.status);
  return apps.map(populateApp).reverse();
}

function getApplicationById(id) {
  const app = APPLICATIONS.find(a => a._id === id || a.applicationId === id);
  if (!app) return null;
  return populateApp(app);
}


function createApplication(data) {
  const id = 'a' + (APPLICATIONS.length + 10);
  appCounter++;
  const newApp = {
    _id: id,
    applicationId: `APP${String(appCounter).padStart(4, '0')}`,
    ...data,
    status: data.status || 'draft',
    uploadedDocuments: [],
    feedbacks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  APPLICATIONS.push(newApp);
  return populateApp(newApp);
}

function updateApplication(id, data) {
  const idx = APPLICATIONS.findIndex(a => a._id === id);
  if (idx === -1) return null;
  APPLICATIONS[idx] = { ...APPLICATIONS[idx], ...data, updatedAt: new Date() };
  return populateApp(APPLICATIONS[idx]);
}

module.exports = {
  // Users & Auth
  USERS, getUsers, getUserById, getUserByEmail, createUser, updateUser, deleteUser,
  addNotification, markNotificationRead,
  // Applications
  APPLICATIONS, getApplications, getApplicationById, createApplication, updateApplication,
  populateUser, populateApp,
  // Leads (will be added after LEADS is defined)
  // Payments (will be added after PAYMENTS is defined)
};

// ────────────────────────────────────────────────
// LEADS
// ────────────────────────────────────────────────
const LEADS = [
  {
    _id: 'l1', leadId: 'LEAD-001', companyName: 'Trinetra Enterprises', contactPerson: 'Vikas Mani',
    email: 'vikas@trinetra.com', mobile: '9911069754', city: 'New Delhi', state: 'Delhi', country: 'India',
    isoStandard: 'ISO 9001:2015', source: 'Website', status: 'new', priority: 'high',
    notes: 'Interested in QMS certification for manufacturing unit.',
    assignedTo: 'u5', convertedToApplication: null,
    createdAt: new Date('2024-11-01'), updatedAt: new Date('2024-11-01'),
  },
  {
    _id: 'l2', leadId: 'LEAD-002', companyName: 'Workforce India Services', contactPerson: 'Ravi Sharma',
    email: 'ravi@workforceindia.com', mobile: '9911069755', city: 'Bangalore', state: 'Karnataka', country: 'India',
    isoStandard: 'ISO 45001:2018', source: 'Referral', status: 'contacted', priority: 'medium',
    notes: 'Looking for OHSMS certification. Demo done.',
    assignedTo: 'u5', convertedToApplication: null,
    createdAt: new Date('2024-11-05'), updatedAt: new Date('2024-11-08'),
  },
  {
    _id: 'l3', leadId: 'LEAD-003', companyName: 'SafeFood Processors Ltd', contactPerson: 'Priya Nair',
    email: 'priya@safefood.com', mobile: '8989879239', city: 'Chennai', state: 'Tamil Nadu', country: 'India',
    isoStandard: 'ISO 22000:2018', source: 'LinkedIn', status: 'qualified', priority: 'high',
    notes: 'Very interested. Waiting for quotation approval.',
    assignedTo: 'u5', convertedToApplication: null,
    createdAt: new Date('2024-11-10'), updatedAt: new Date('2024-11-12'),
  },
  {
    _id: 'l4', leadId: 'LEAD-004', companyName: 'GreenTech Solutions', contactPerson: 'Anil Verma',
    email: 'anil@greentech.com', mobile: '9876543210', city: 'Pune', state: 'Maharashtra', country: 'India',
    isoStandard: 'ISO 14001:2015', source: 'Cold Call', status: 'qualified', priority: 'medium',
    notes: 'EMS certification for IT company. Board approval pending.',
    assignedTo: null, convertedToApplication: null,
    createdAt: new Date('2024-11-15'), updatedAt: new Date('2024-11-16'),
  },
  {
    _id: 'l5', leadId: 'LEAD-005', companyName: 'MediCare Devices Pvt Ltd', contactPerson: 'Sunita Joshi',
    email: 'sunita@medicare.com', mobile: '9123456780', city: 'Hyderabad', state: 'Telangana', country: 'India',
    isoStandard: 'ISO 13485:2016', source: 'Trade Show', status: 'converted', priority: 'high',
    notes: 'Medical device QMS. Converted to application.',
    assignedTo: 'u5', convertedToApplication: 'app1',
    createdAt: new Date('2024-10-20'), updatedAt: new Date('2024-11-01'),
  },
  {
    _id: 'l6', leadId: 'LEAD-006', companyName: 'SecureIT Systems', contactPerson: 'Karan Mehta',
    email: 'karan@secureit.com', mobile: '9988776655', city: 'Mumbai', state: 'Maharashtra', country: 'India',
    isoStandard: 'ISO 27001:2022', source: 'LinkedIn', status: 'new', priority: 'high',
    notes: 'ISMS for fintech company. Very promising lead.',
    assignedTo: null, convertedToApplication: null,
    createdAt: new Date('2024-11-20'), updatedAt: new Date('2024-11-20'),
  },
  {
    _id: 'l7', leadId: 'LEAD-007', companyName: 'PowerGen Industries', contactPerson: 'Deepak Roy',
    email: 'deepak@powergen.com', mobile: '9001122334', city: 'Kolkata', state: 'West Bengal', country: 'India',
    isoStandard: 'ISO 50001:2018', source: 'Email Campaign', status: 'lost', priority: 'low',
    notes: 'Budget constraints. Follow up in Q2.',
    assignedTo: 'u5', convertedToApplication: null,
    createdAt: new Date('2024-10-10'), updatedAt: new Date('2024-11-05'),
  },
  {
    _id: 'l8', leadId: 'LEAD-008', companyName: 'FreshFarm Organics', contactPerson: 'Meena Pillai',
    email: 'meena@freshfarm.com', mobile: '9445566778', city: 'Coimbatore', state: 'Tamil Nadu', country: 'India',
    isoStandard: 'ISO 22000:2018', source: 'Referral', status: 'contacted', priority: 'medium',
    notes: 'Food safety for organic products. Positive response.',
    assignedTo: null, convertedToApplication: null,
    createdAt: new Date('2024-11-18'), updatedAt: new Date('2024-11-19'),
  },
];

let leadCounter = 4;

function getLeads(filter = {}) {
  let leads = LEADS;
  if (filter.status) leads = leads.filter(l => l.status === filter.status);
  if (filter.assignedTo) leads = leads.filter(l => l.assignedTo === filter.assignedTo);
  return leads.map(l => ({
    ...l,
    assignedTo: l.assignedTo ? populateUser(l.assignedTo) : null,
  })).reverse();
}

function getLeadById(id) {
  const lead = LEADS.find(l => l._id === id);
  if (!lead) return null;
  return {
    ...lead,
    assignedTo: lead.assignedTo ? populateUser(lead.assignedTo) : null,
  };
}

function createLead(data) {
  const id = 'l' + (LEADS.length + 10);
  const num = String(leadCounter++).padStart(3, '0');
  const lead = {
    _id: id, leadId: `LEAD-${num}`,
    ...data,
    status: data.status || 'new',
    assignedAuditor: data.assignedAuditor || null,
    assignedReviewer: data.assignedReviewer || null,
    convertedToApplication: null,
    createdAt: new Date(), updatedAt: new Date(),
  };
  LEADS.push(lead);
  return getLeadById(id);
}

function updateLead(id, data) {
  const idx = LEADS.findIndex(l => l._id === id);
  if (idx === -1) return null;
  LEADS[idx] = { ...LEADS[idx], ...data, updatedAt: new Date() };
  return getLeadById(id);
}

function deleteLead(id) {
  const idx = LEADS.findIndex(l => l._id === id);
  if (idx === -1) return false;
  LEADS.splice(idx, 1);
  return true;
}



// ────────────────────────────────────────────────
// MANUAL PAYMENTS
// ────────────────────────────────────────────────
const PAYMENTS = [
  {
    _id: 'p1', name: 'ABC Manufacturing - Initial', transactionId: 'TXN20241101001', applicationId: 'a1',
    amount: 25000, paymentStatus: 'received', paymentDate: new Date('2024-11-01'), createdAt: new Date('2024-11-01'),
  },
  {
    _id: 'p2', name: 'XYZ IT Solutions - Full Payment', transactionId: 'TXN20241023001', applicationId: 'a2',
    amount: 75000, paymentStatus: 'received', paymentDate: new Date('2024-10-23'), createdAt: new Date('2024-10-23'),
  },
];

let paymentCounter = 3;

function getPayments(filter = {}) {
  let payments = PAYMENTS;
  if (filter.status) payments = payments.filter(p => p.paymentStatus === filter.status);
  if (filter.applicationId) payments = payments.filter(p => p.applicationId === filter.applicationId);
  return payments.reverse();
}

function getPaymentById(id) {
  return PAYMENTS.find(p => p._id === id) || null;
}

function createPayment(data) {
  const id = 'p' + paymentCounter++;
  const payment = {
    _id: id,
    ...data,
    paymentStatus: data.paymentStatus || 'pending',
    createdAt: new Date(),
  };
  PAYMENTS.push(payment);
  return payment;
}

function updatePayment(id, data) {
  const idx = PAYMENTS.findIndex(p => p._id === id);
  if (idx === -1) return null;
  PAYMENTS[idx] = { ...PAYMENTS[idx], ...data };
  return PAYMENTS[idx];
}

function deletePayment(id) {
  const idx = PAYMENTS.findIndex(p => p._id === id);
  if (idx === -1) return false;
  PAYMENTS.splice(idx, 1);
  return true;
}

// Export all functions at the end
Object.assign(module.exports, {
  LEADS, getLeads, getLeadById, createLead, updateLead, deleteLead,
  PAYMENTS, getPayments, getPaymentById, createPayment, updatePayment, deletePayment,
});
