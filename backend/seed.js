// ============================================================
// SEED SCRIPT — run: node seed.js
// Seeds all collections with realistic dummy data
// ============================================================
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose    = require('mongoose');
const bcrypt      = require('bcryptjs');
const User        = require('./models/User');
const Application = require('./models/Application');
const Lead        = require('./models/Lead');
const Payment     = require('./models/Payment');
const Certificate = require('./models/Certificate');
const Observation = require('./models/Observation');
const Standard    = require('./models/Standard');
const Role        = require('./models/Role');
const CertSetting = require('./models/CertSetting');

// const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iso-crm';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://qccwebdeveloper_db:iso_crm_qcc_101@cluster0.nhou9fq.mongodb.net/?appName=Cluster0';

// insertMany skips pre-save hooks — hash passwords manually
const h = (pw) => bcrypt.hashSync(pw, 10);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── Wipe existing data
  await Promise.all([
    User.deleteMany(), Application.deleteMany(), Lead.deleteMany(),
    Payment.deleteMany(), Certificate.deleteMany(), Observation.deleteMany(),
    Standard.deleteMany(), Role.deleteMany(), CertSetting.deleteMany(),
  ]);
  console.log('🗑️  Cleared all collections');

  // ─────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────
  const users = await User.insertMany([
    // ── Admin
    {
      name: 'Admin User', email: 'admin@crm.com', password: h('admin123'),
      role: 'admin', company: 'QC Certification', phone: '9000000001',
      isActive: true, pendingApproval: false,
    },

    // ── Clients (6)
    {
      name: 'John Client', email: 'client@crm.com', password: h('client123'),
      role: 'client', company: 'ABC Manufacturing Ltd', phone: '9000000002',
      isActive: true, clientId: 'CLT-DEMO-001',
      address: '123 Industrial Area, Mumbai, Maharashtra',
      isoStandard: 'ISO 9001:2015', scope: 'Manufacturing of Industrial Components',
    },
    {
      name: 'Priya Sharma', email: 'priya@xyzit.com', password: h('client123'),
      role: 'client', company: 'XYZ IT Solutions Pvt Ltd', phone: '9811223344',
      isActive: true, clientId: 'CLT-DEMO-002',
      address: '456 Tech Park, Bangalore, Karnataka',
      isoStandard: 'ISO 27001:2022', scope: 'Information Security Management for IT Services',
    },
    {
      name: 'Ravi Kumar', email: 'ravi@greenenergy.com', password: h('client123'),
      role: 'client', company: 'Green Energy Systems', phone: '9922334455',
      isActive: true, clientId: 'CLT-DEMO-003',
      address: '789 Solar Park, Pune, Maharashtra',
      isoStandard: 'ISO 14001:2015', scope: 'Environmental Management for Renewable Energy Systems',
    },
    {
      name: 'Meena Nair', email: 'meena@safefood.com', password: h('client123'),
      role: 'client', company: 'SafeFood Processors Ltd', phone: '9933445566',
      isActive: true, clientId: 'CLT-DEMO-004',
      address: '321 Food Park, Chennai, Tamil Nadu',
      isoStandard: 'ISO 22000:2018', scope: 'Food Safety Management for Processing',
    },
    {
      name: 'Arun Singh', email: 'arun@worksafe.com', password: h('client123'),
      role: 'client', company: 'WorkSafe Industries', phone: '9944556677',
      isActive: true, clientId: 'CLT-DEMO-005',
      address: '654 Industrial Zone, Delhi',
      isoStandard: 'ISO 45001:2018', scope: 'Occupational Health and Safety Management',
    },
    {
      name: 'Sunita Joshi', email: 'sunita@medicare.com', password: h('client123'),
      role: 'client', company: 'MediCare Devices Pvt Ltd', phone: '9955667788',
      isActive: true, clientId: 'CLT-DEMO-006',
      address: '22 Pharma Hub, Hyderabad, Telangana',
      isoStandard: 'ISO 13485:2016', scope: 'Medical Device Quality Management System',
    },

    // ── Pending Client (needs admin approval)
    {
      name: 'Deepak Roy', email: 'deepak@powergen.com', password: h('client123'),
      role: 'client', company: 'PowerGen Industries', phone: '9966778899',
      isActive: false, pendingApproval: true, clientId: 'CLT-DEMO-007',
      address: '88 Energy Park, Kolkata, West Bengal',
      isoStandard: 'ISO 50001:2018', scope: 'Energy Management System',
    },

    // ── Auditors (3)
    {
      name: 'Sarah Auditor', email: 'auditor@crm.com', password: h('auditor123'),
      role: 'auditor', company: 'AuditPro', phone: '9000000003', isActive: true,
    },
    {
      name: 'Ramesh Verma', email: 'ramesh@auditpro.com', password: h('auditor123'),
      role: 'auditor', company: 'AuditPro', phone: '9877665544', isActive: true,
    },
    {
      name: 'Anita Desai', email: 'anita@auditpro.com', password: h('auditor123'),
      role: 'auditor', company: 'AuditPro', phone: '9866554433', isActive: true,
    },

    // ── Reviewers (2)
    {
      name: 'Mike Reviewer', email: 'reviewer@crm.com', password: h('reviewer123'),
      role: 'reviewer', company: 'ReviewPro', phone: '9000000004', isActive: true,
    },
    {
      name: 'Kavita Menon', email: 'kavita@reviewpro.com', password: h('reviewer123'),
      role: 'reviewer', company: 'ReviewPro', phone: '9855443322', isActive: true,
    },

    // ── Sales (2)
    {
      name: 'Sales Manager', email: 'sales@crm.com', password: h('sales123'),
      role: 'sales', company: 'QC Cert', phone: '9000000005', isActive: true,
    },
    {
      name: 'Vikram Patel', email: 'vikram@qccert.com', password: h('sales123'),
      role: 'sales', company: 'QC Cert', phone: '9844332211', isActive: true,
    },
  ]);

  // map by email for easy reference
  const u = {};
  users.forEach(u_ => { u[u_.email] = u_; });

  console.log(`👤 Seeded ${users.length} users`);

  // ─────────────────────────────────────────────
  // APPLICATIONS
  // ─────────────────────────────────────────────
  const apps = await Application.insertMany([
    {
      applicationId: 'APP1000',
      client: u['client@crm.com']._id,
      organizationName: 'ABC Manufacturing Ltd', organizationAbbr: 'ABC',
      address1: '123 Industrial Area', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001',
      website: 'www.abcmfg.com',
      contactPerson: 'John Client', contactNumbers: '9000000002', emailId: 'client@crm.com', designation: 'MD',
      isoStandard: 'ISO 9001:2015', standards: ['ISO 9001:2015'],
      scope: 'Design, Development and Manufacturing of Industrial Components',
      scopeOfCertification: 'Design, Development and Manufacturing of Industrial Components',
      accreditationBody: 'NABCB', applicationType: 'Initial', modeOfWorking: 'Onsite',
      employeeCount: { headOffice: 50, branches: 30, temporary: 20, total: 100 },
      totalEmployees: 100,
      status: 'audit_stage1',
      assignedAuditor: u['auditor@crm.com']._id,
      assignedReviewer: null,
      auditAcceptanceStatus: 'accepted',
      auditAcceptedDate: new Date('2024-10-16'),
      progressPercentage: 35,
      progressStages: ['submitted', 'under_review', 'audit_stage1'],
      paymentStatus: 'received', paymentAmount: 50000, paymentDate: new Date('2024-10-17'),
      feedbacks: [{ from: u['auditor@crm.com']._id, role: 'auditor', message: 'Initial documentation looks complete. Quality manual reviewed.', rating: 4, createdAt: new Date('2024-11-01') }],
      auditNotes: 'Stage 1 audit in progress. Documentation is satisfactory.',
      adminNotes: 'Assigned to Sarah for audit. Priority client.',
      submittedAt: new Date('2024-10-15'), createdAt: new Date('2024-10-14'),
    },
    {
      applicationId: 'APP1001',
      client: u['priya@xyzit.com']._id,
      organizationName: 'XYZ IT Solutions Pvt Ltd', organizationAbbr: 'XYZ',
      address1: '456 Tech Park', city: 'Bangalore', state: 'Karnataka', country: 'India', pincode: '560001',
      website: 'www.xyzit.com',
      contactPerson: 'Priya Sharma', contactNumbers: '9811223344', emailId: 'priya@xyzit.com', designation: 'CTO',
      isoStandard: 'ISO 27001:2022', standards: ['ISO 27001:2022'],
      scope: 'Information Security Management for IT Services',
      scopeOfCertification: 'Information Security Management for IT Services',
      accreditationBody: 'UKAS', applicationType: 'Initial', modeOfWorking: 'Hybrid',
      employeeCount: { headOffice: 80, branches: 40, temporary: 10, total: 130 },
      totalEmployees: 130,
      status: 'audit_stage2',
      assignedAuditor: u['ramesh@auditpro.com']._id,
      assignedReviewer: u['reviewer@crm.com']._id,
      auditAcceptanceStatus: 'accepted',
      auditAcceptedDate: new Date('2024-10-22'),
      progressPercentage: 60,
      progressStages: ['submitted', 'under_review', 'audit_stage1', 'audit_stage2'],
      paymentStatus: 'received', paymentAmount: 75000, paymentDate: new Date('2024-10-23'),
      feedbacks: [
        { from: u['ramesh@auditpro.com']._id, role: 'auditor', message: 'Stage 1 complete. ISMS policies are well documented. Moving to Stage 2.', rating: 5, createdAt: new Date('2024-11-10') },
      ],
      auditNotes: 'Stage 1 complete. ISMS policy reviewed. Risk register adequate.',
      reviewNotes: 'Under review by HOD.',
      submittedAt: new Date('2024-10-20'), createdAt: new Date('2024-10-19'),
    },
    {
      applicationId: 'APP1002',
      client: u['ravi@greenenergy.com']._id,
      organizationName: 'Green Energy Systems', organizationAbbr: 'GES',
      address1: '789 Solar Park', city: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411001',
      website: 'www.greenenergy.com',
      contactPerson: 'Ravi Kumar', contactNumbers: '9922334455', emailId: 'ravi@greenenergy.com', designation: 'CEO',
      isoStandard: 'ISO 14001:2015', standards: ['ISO 14001:2015'],
      scope: 'Environmental Management for Renewable Energy Systems',
      scopeOfCertification: 'Environmental Management for Renewable Energy Systems',
      accreditationBody: 'NABCB', applicationType: 'Initial', modeOfWorking: 'Onsite',
      employeeCount: { headOffice: 40, branches: 20, temporary: 15, total: 75 },
      totalEmployees: 75,
      status: 'certified',
      assignedAuditor: u['auditor@crm.com']._id,
      assignedReviewer: u['kavita@reviewpro.com']._id,
      auditAcceptanceStatus: 'accepted',
      auditAcceptedDate: new Date('2024-09-30'),
      certificate: { url: 'https://res.cloudinary.com/demo/image/upload/sample.pdf', issuedAt: new Date('2024-11-15') },
      progressPercentage: 100,
      progressStages: ['submitted', 'under_review', 'audit_stage1', 'audit_stage2', 'approved', 'certified'],
      paymentStatus: 'received', paymentAmount: 60000, paymentDate: new Date('2024-09-28'),
      feedbacks: [
        { from: u['ravi@greenenergy.com']._id, role: 'client', message: 'Excellent service! The audit team was professional and thorough. Highly recommend QCC.', rating: 5, createdAt: new Date('2024-11-16') },
      ],
      auditNotes: 'All stages complete. Environmental aspects properly managed.',
      reviewNotes: 'Approved by HOD. All requirements met.',
      adminNotes: 'Certificate issued on 15 Nov 2024.',
      submittedAt: new Date('2024-10-01'), createdAt: new Date('2024-09-30'),
    },
    {
      applicationId: 'APP1003',
      client: u['meena@safefood.com']._id,
      organizationName: 'SafeFood Processors Ltd', organizationAbbr: 'SFP',
      address1: '321 Food Park', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600001',
      contactPerson: 'Meena Nair', contactNumbers: '9933445566', emailId: 'meena@safefood.com', designation: 'QA Manager',
      isoStandard: 'ISO 22000:2018', standards: ['ISO 22000:2018'],
      scope: 'Food Safety Management for Processing and Packaging of Organic Products',
      scopeOfCertification: 'Food Safety Management for Processing and Packaging of Organic Products',
      accreditationBody: 'FSSAI', applicationType: 'Initial', modeOfWorking: 'Onsite',
      employeeCount: { headOffice: 25, branches: 10, temporary: 5, total: 40 },
      totalEmployees: 40,
      status: 'submitted',
      assignedAuditor: null, assignedReviewer: null,
      progressPercentage: 10,
      progressStages: ['submitted'],
      paymentStatus: 'pending', paymentAmount: 0,
      feedbacks: [],
      adminNotes: 'Received. Pending auditor assignment.',
      submittedAt: new Date('2024-11-20'), createdAt: new Date('2024-11-19'),
    },
    {
      applicationId: 'APP1004',
      client: u['arun@worksafe.com']._id,
      organizationName: 'WorkSafe Industries', organizationAbbr: 'WSI',
      address1: '654 Industrial Zone', city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110001',
      website: 'www.worksafe.com',
      contactPerson: 'Arun Singh', contactNumbers: '9944556677', emailId: 'arun@worksafe.com', designation: 'HSE Head',
      isoStandard: 'ISO 45001:2018', standards: ['ISO 45001:2018'],
      scope: 'Occupational Health and Safety Management System for Manufacturing',
      scopeOfCertification: 'Occupational Health and Safety Management System for Manufacturing',
      accreditationBody: 'NABCB', applicationType: 'Initial', modeOfWorking: 'Onsite',
      employeeCount: { headOffice: 30, branches: 10, temporary: 5, total: 45 },
      totalEmployees: 45,
      status: 'draft',
      progressPercentage: 0,
      progressStages: [],
      paymentStatus: 'pending', paymentAmount: 0,
      feedbacks: [],
      createdAt: new Date('2024-11-22'),
    },
    {
      applicationId: 'APP1005',
      client: u['sunita@medicare.com']._id,
      organizationName: 'MediCare Devices Pvt Ltd', organizationAbbr: 'MDL',
      address1: '22 Pharma Hub', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500001',
      website: 'www.medicaredevices.com',
      contactPerson: 'Sunita Joshi', contactNumbers: '9955667788', emailId: 'sunita@medicare.com', designation: 'RA Head',
      isoStandard: 'ISO 13485:2016', standards: ['ISO 13485:2016'],
      scope: 'Quality Management System for Design and Manufacture of Medical Devices',
      scopeOfCertification: 'Quality Management System for Design and Manufacture of Medical Devices',
      accreditationBody: 'NABCB', applicationType: 'Initial', modeOfWorking: 'Onsite',
      employeeCount: { headOffice: 60, branches: 0, temporary: 10, total: 70 },
      totalEmployees: 70,
      status: 'under_review',
      assignedAuditor: u['anita@auditpro.com']._id,
      assignedReviewer: null,
      auditAcceptanceStatus: 'accepted',
      auditAcceptedDate: new Date('2024-11-25'),
      progressPercentage: 20,
      progressStages: ['submitted', 'under_review'],
      paymentStatus: 'partially_received', paymentAmount: 35000, paymentDate: new Date('2024-11-24'),
      feedbacks: [],
      auditNotes: 'Document review started. QMS procedures being assessed.',
      adminNotes: 'Assigned to Anita. Medical device specialist.',
      submittedAt: new Date('2024-11-23'), createdAt: new Date('2024-11-22'),
    },
    {
      applicationId: 'APP1006',
      client: u['client@crm.com']._id,
      organizationName: 'ABC Manufacturing Ltd — Unit 2', organizationAbbr: 'ABCU2',
      address1: '45 Industrial Estate', city: 'Navi Mumbai', state: 'Maharashtra', country: 'India', pincode: '400706',
      contactPerson: 'John Client', contactNumbers: '9000000002', emailId: 'client@crm.com', designation: 'MD',
      isoStandard: 'ISO 14001:2015', standards: ['ISO 14001:2015', 'ISO 45001:2018'],
      scope: 'Environmental and OH&S Management for Manufacturing Unit 2',
      scopeOfCertification: 'Environmental and OH&S Management for Manufacturing Unit 2',
      accreditationBody: 'NABCB', applicationType: 'Initial', modeOfWorking: 'Onsite',
      employeeCount: { headOffice: 35, branches: 0, temporary: 15, total: 50 },
      totalEmployees: 50,
      status: 'approved',
      assignedAuditor: u['auditor@crm.com']._id,
      assignedReviewer: u['reviewer@crm.com']._id,
      auditAcceptanceStatus: 'accepted',
      progressPercentage: 90,
      progressStages: ['submitted', 'under_review', 'audit_stage1', 'audit_stage2', 'approved'],
      paymentStatus: 'received', paymentAmount: 65000, paymentDate: new Date('2024-10-10'),
      feedbacks: [
        { from: u['auditor@crm.com']._id, role: 'auditor', message: 'Both EMS and OHSMS requirements are well implemented.', rating: 4, createdAt: new Date('2024-11-28') },
        { from: u['client@crm.com']._id, role: 'client', message: 'Smooth process. Team was helpful throughout.', rating: 5, createdAt: new Date('2024-11-30') },
      ],
      auditNotes: 'Combined audit for EMS and OHSMS completed successfully.',
      reviewNotes: 'All requirements met. Recommended for certification.',
      submittedAt: new Date('2024-10-05'), createdAt: new Date('2024-10-04'),
    },
    {
      applicationId: 'APP1007',
      client: u['priya@xyzit.com']._id,
      organizationName: 'XYZ IT Solutions — GDPR Compliance', organizationAbbr: 'XYZG',
      address1: '456 Tech Park', city: 'Bangalore', state: 'Karnataka', country: 'India', pincode: '560001',
      contactPerson: 'Priya Sharma', contactNumbers: '9811223344', emailId: 'priya@xyzit.com', designation: 'CTO',
      isoStandard: 'ISO 27001:2022', standards: ['ISO 27001:2022', 'ISO/IEC 27701:2025'],
      scope: 'Privacy Information Management for Cloud Services and Customer Data Processing',
      scopeOfCertification: 'Privacy Information Management for Cloud Services and Customer Data Processing',
      accreditationBody: 'UKAS', applicationType: 'Surveillance', modeOfWorking: 'Online',
      employeeCount: { headOffice: 80, branches: 40, temporary: 10, total: 130 },
      totalEmployees: 130,
      status: 'rejected',
      assignedAuditor: u['ramesh@auditpro.com']._id,
      progressPercentage: 15,
      progressStages: ['submitted', 'under_review'],
      paymentStatus: 'pending', paymentAmount: 0,
      feedbacks: [],
      adminNotes: 'Rejected — Scope definition unclear. Client needs to resubmit.',
      submittedAt: new Date('2024-12-01'), createdAt: new Date('2024-11-30'),
    },
  ]);

  const appMap = {};
  apps.forEach(a => { appMap[a.applicationId] = a; });

  // Update assignedApplications on users
  await User.findByIdAndUpdate(u['auditor@crm.com']._id,  { assignedApplications: [appMap['APP1000']._id, appMap['APP1002']._id, appMap['APP1006']._id] });
  await User.findByIdAndUpdate(u['ramesh@auditpro.com']._id, { assignedApplications: [appMap['APP1001']._id, appMap['APP1007']._id] });
  await User.findByIdAndUpdate(u['anita@auditpro.com']._id,  { assignedApplications: [appMap['APP1005']._id] });
  await User.findByIdAndUpdate(u['reviewer@crm.com']._id, { assignedApplications: [appMap['APP1001']._id, appMap['APP1006']._id] });
  await User.findByIdAndUpdate(u['kavita@reviewpro.com']._id, { assignedApplications: [appMap['APP1002']._id] });

  console.log(`📋 Seeded ${apps.length} applications`);

  // ─────────────────────────────────────────────
  // LEADS
  // ─────────────────────────────────────────────
  const leads = await Lead.insertMany([
    {
      leadId: 'LEAD-001', companyName: 'Trinetra Enterprises', contactPerson: 'Vikas Mani',
      email: 'vikas@trinetra.com', mobile: '9911069754', city: 'New Delhi', state: 'Delhi', country: 'India',
      isoStandard: 'ISO 9001:2015', source: 'Website', status: 'new', priority: 'high',
      notes: 'Interested in QMS certification for manufacturing unit. Follow up next week.',
      assignedTo: u['sales@crm.com']._id,
    },
    {
      leadId: 'LEAD-002', companyName: 'Workforce India Services', contactPerson: 'Ravi Sharma',
      email: 'ravi@workforceindia.com', mobile: '9911069755', city: 'Bangalore', state: 'Karnataka', country: 'India',
      isoStandard: 'ISO 45001:2018', source: 'Referral', status: 'contacted', priority: 'medium',
      notes: 'Looking for OHSMS certification. Demo done. Waiting for quotation.',
      assignedTo: u['sales@crm.com']._id,
    },
    {
      leadId: 'LEAD-003', companyName: 'FreshFarm Organics', contactPerson: 'Meena Pillai',
      email: 'meena@freshfarm.com', mobile: '9445566778', city: 'Coimbatore', state: 'Tamil Nadu', country: 'India',
      isoStandard: 'ISO 22000:2018', source: 'Referral', status: 'qualified', priority: 'high',
      notes: 'Food safety for organic products. Very positive response. Ready to sign agreement.',
      assignedTo: u['vikram@qccert.com']._id,
    },
    {
      leadId: 'LEAD-004', companyName: 'GreenTech Solutions', contactPerson: 'Anil Verma',
      email: 'anil@greentech.com', mobile: '9876543210', city: 'Pune', state: 'Maharashtra', country: 'India',
      isoStandard: 'ISO 14001:2015', source: 'Cold Call', status: 'qualified', priority: 'medium',
      notes: 'EMS certification for IT company. Board approval pending from their side.',
      assignedTo: null,
    },
    {
      leadId: 'LEAD-005', companyName: 'SecureIT Systems', contactPerson: 'Karan Mehta',
      email: 'karan@secureit.com', mobile: '9988776655', city: 'Mumbai', state: 'Maharashtra', country: 'India',
      isoStandard: 'ISO 27001:2022', source: 'LinkedIn', status: 'new', priority: 'high',
      notes: 'ISMS for fintech company. Very promising lead. CTO directly reached out.',
      assignedTo: u['sales@crm.com']._id,
    },
    {
      leadId: 'LEAD-006', companyName: 'PowerGen Industries', contactPerson: 'Deepak Roy',
      email: 'deepak@powergen.com', mobile: '9001122334', city: 'Kolkata', state: 'West Bengal', country: 'India',
      isoStandard: 'ISO 50001:2018', source: 'Email Campaign', status: 'lost', priority: 'low',
      notes: 'Budget constraints cited. Follow up in Q2 next year.',
      assignedTo: u['vikram@qccert.com']._id,
    },
    {
      leadId: 'LEAD-007', companyName: 'Apex Auto Components', contactPerson: 'Suresh Babu',
      email: 'suresh@apexauto.com', mobile: '9123456780', city: 'Chennai', state: 'Tamil Nadu', country: 'India',
      isoStandard: 'ISO 9001:2015', source: 'Trade Show', status: 'contacted', priority: 'medium',
      notes: 'Met at Auto Expo 2024. Interested in IATF 16949 / ISO 9001 for automotive.',
      assignedTo: u['vikram@qccert.com']._id,
    },
    {
      leadId: 'LEAD-008', companyName: 'BioPharm Research Ltd', contactPerson: 'Dr. Anjali Shah',
      email: 'anjali@biopharm.com', mobile: '9234567890', city: 'Ahmedabad', state: 'Gujarat', country: 'India',
      isoStandard: 'ISO 13485:2016', source: 'Website', status: 'qualified', priority: 'high',
      notes: 'Medical device manufacturer. Urgent — regulatory requirement. Ready to proceed.',
      assignedTo: u['sales@crm.com']._id,
    },
    {
      leadId: 'LEAD-009', companyName: 'TechBridge Consultants', contactPerson: 'Nitin Jain',
      email: 'nitin@techbridge.com', mobile: '9345678901', city: 'Jaipur', state: 'Rajasthan', country: 'India',
      isoStandard: 'ISO 9001:2015', source: 'LinkedIn', status: 'new', priority: 'medium',
      notes: 'IT consulting firm. Looking for QMS to win government tenders.',
      assignedTo: null,
    },
    {
      leadId: 'LEAD-010', companyName: 'MediCare Devices Pvt Ltd', contactPerson: 'Sunita Joshi',
      email: 'sunita@medicare.com', mobile: '9123456780', city: 'Hyderabad', state: 'Telangana', country: 'India',
      isoStandard: 'ISO 13485:2016', source: 'Trade Show', status: 'converted', priority: 'high',
      notes: 'Converted to application APP1005.',
      assignedTo: u['sales@crm.com']._id,
      convertedToApplication: appMap['APP1005']._id,
    },
  ]);

  console.log(`🎯 Seeded ${leads.length} leads`);

  // ─────────────────────────────────────────────
  // PAYMENTS
  // ─────────────────────────────────────────────
  const payments = await Payment.insertMany([
    {
      name: 'ABC Manufacturing — Initial Payment', transactionId: 'TXN20241017001',
      applicationId: appMap['APP1000']._id, amount: 25000,
      paymentStatus: 'received', paymentDate: new Date('2024-10-17'),
    },
    {
      name: 'ABC Manufacturing — Balance Payment', transactionId: 'TXN20241101001',
      applicationId: appMap['APP1000']._id, amount: 25000,
      paymentStatus: 'received', paymentDate: new Date('2024-11-01'),
    },
    {
      name: 'XYZ IT Solutions — Full Payment', transactionId: 'TXN20241023001',
      applicationId: appMap['APP1001']._id, amount: 75000,
      paymentStatus: 'received', paymentDate: new Date('2024-10-23'),
    },
    {
      name: 'Green Energy Systems — Full Payment', transactionId: 'TXN20240928001',
      applicationId: appMap['APP1002']._id, amount: 60000,
      paymentStatus: 'received', paymentDate: new Date('2024-09-28'),
    },
    {
      name: 'MediCare Devices — Advance Payment', transactionId: 'TXN20241124001',
      applicationId: appMap['APP1005']._id, amount: 35000,
      paymentStatus: 'received', paymentDate: new Date('2024-11-24'),
    },
    {
      name: 'MediCare Devices — Balance Due', transactionId: 'TXN-PENDING-001',
      applicationId: appMap['APP1005']._id, amount: 35000,
      paymentStatus: 'pending',
    },
    {
      name: 'ABC Unit 2 — Full Payment', transactionId: 'TXN20241010001',
      applicationId: appMap['APP1006']._id, amount: 65000,
      paymentStatus: 'received', paymentDate: new Date('2024-10-10'),
    },
    {
      name: 'SafeFood Processors — Advance (Direct)', transactionId: 'TXN20241122001',
      applicationId: null, amount: 15000,
      paymentStatus: 'received', paymentDate: new Date('2024-11-22'),
    },
  ]);

  console.log(`💰 Seeded ${payments.length} payments`);

  // ─────────────────────────────────────────────
  // CERTIFICATES
  // ─────────────────────────────────────────────
  const certs = await Certificate.insertMany([
    {
      orgName: 'Green Energy Systems', standard: 'ISO 14001:2015',
      scope: 'Environmental Management for Renewable Energy Systems',
      address: '789 Solar Park, Pune, Maharashtra - 411001',
      contactPerson: 'Ravi Kumar', designation: 'CEO',
      contactNumber: '9922334455', email: 'ravi@greenenergy.com',
      auditorName: 'Sarah Auditor', auditorRole: 'Lead Auditor',
      iafCode: '39', accreditation: 'NABCB', certNumber: 'QCC-EMS-2024-001',
      issueDate: new Date('2024-11-15'),
      expiryDate: new Date('2027-11-14'),
      surveillanceDate: new Date('2025-11-15'),
      originalCertDate: new Date('2024-11-15'),
      notes: 'First certification. All requirements met. Excellent implementation.',
      linkedApplication: appMap['APP1002']._id,
    },
    {
      orgName: 'ABC Manufacturing Ltd', standard: 'ISO 9001:2015',
      scope: 'Design, Development and Manufacturing of Industrial Components',
      address: '123 Industrial Area, Mumbai, Maharashtra - 400001',
      contactPerson: 'John Client', designation: 'MD',
      contactNumber: '9000000002', email: 'client@crm.com',
      auditorName: 'Ramesh Verma', auditorRole: 'Lead Auditor',
      iafCode: '17', accreditation: 'NABCB', certNumber: 'QCC-QMS-2023-088',
      issueDate: new Date('2023-06-10'),
      expiryDate: new Date('2026-06-09'),
      surveillanceDate: new Date('2025-06-10'),
      originalCertDate: new Date('2023-06-10'),
      notes: 'Re-certification from previous body. Transition audit completed.',
    },
    {
      orgName: 'XYZ IT Solutions Pvt Ltd', standard: 'ISO 27001:2022',
      scope: 'Information Security Management for IT Services',
      address: '456 Tech Park, Bangalore, Karnataka - 560001',
      contactPerson: 'Priya Sharma', designation: 'CTO',
      contactNumber: '9811223344', email: 'priya@xyzit.com',
      auditorName: 'Ramesh Verma', auditorRole: 'Lead Auditor',
      iafCode: '33', accreditation: 'UKAS', certNumber: 'QCC-ISMS-2024-012',
      issueDate: new Date('2024-08-20'),
      expiryDate: new Date('2027-08-19'),
      surveillanceDate: new Date('2025-08-20'),
      originalCertDate: new Date('2024-08-20'),
      notes: 'Transition to ISO 27001:2022 from 2013 version.',
    },
    {
      orgName: 'TechBridge Solutions Pvt Ltd', standard: 'ISO 9001:2015',
      scope: 'Software Development and IT Consulting Services',
      address: '10 Cyber Park, Noida, Uttar Pradesh - 201301',
      contactPerson: 'Rohit Malhotra', designation: 'Director',
      contactNumber: '9112233445', email: 'rohit@techbridge.com',
      auditorName: 'Anita Desai', auditorRole: 'Lead Auditor',
      iafCode: '33', accreditation: 'NABCB', certNumber: 'QCC-QMS-2024-056',
      issueDate: new Date('2024-03-15'),
      expiryDate: new Date('2027-03-14'),
      surveillanceDate: new Date('2025-03-15'),
      originalCertDate: new Date('2024-03-15'),
    },
    {
      orgName: 'Sunrise Pharma Ltd', standard: 'ISO 9001:2015',
      scope: 'Manufacturing of Pharmaceutical Formulations',
      address: '5 Pharma Zone, Vadodara, Gujarat - 390001',
      contactPerson: 'Sunil Gupta', designation: 'QA Director',
      contactNumber: '9223344556', email: 'sunil@sunrisepharma.com',
      auditorName: 'Sarah Auditor', auditorRole: 'Lead Auditor',
      iafCode: '30', accreditation: 'NABCB', certNumber: 'QCC-QMS-2022-034',
      issueDate: new Date('2022-09-01'),
      expiryDate: new Date('2025-08-31'),
      surveillanceDate: new Date('2025-03-01'),
      originalCertDate: new Date('2022-09-01'),
      notes: 'Expiring in Aug 2025 — re-certification audit due.',
    },
  ]);

  console.log(`🏆 Seeded ${certs.length} certificates`);

  // ─────────────────────────────────────────────
  // OBSERVATIONS
  // ─────────────────────────────────────────────
  const obs = await Observation.insertMany([
    {
      applicationId: 'APP1000', application: appMap['APP1000']._id,
      type: 'Minor NC', description: 'Clause 7.5 — Document control procedure does not include version history tracking for quality records.',
      corrective_action: 'Update document control procedure to include version history. Update all quality records with revision history column.',
      raisedBy: u['auditor@crm.com']._id, raisedByName: 'Sarah Auditor', status: 'Open',
    },
    {
      applicationId: 'APP1000', application: appMap['APP1000']._id,
      type: 'OFI', description: 'Clause 9.1 — Customer satisfaction survey frequency could be increased from annual to quarterly for better feedback loop.',
      raisedBy: u['auditor@crm.com']._id, raisedByName: 'Sarah Auditor', status: 'Open',
    },
    {
      applicationId: 'APP1001', application: appMap['APP1001']._id,
      type: 'Major NC', description: 'Clause A.12.6 — Vulnerability management process does not include regular penetration testing schedule. Critical for ISMS compliance.',
      corrective_action: 'Establish quarterly penetration testing schedule. Hire certified ethical hacker or outsource to security firm. Document results and remediation.',
      raisedBy: u['ramesh@auditpro.com']._id, raisedByName: 'Ramesh Verma', status: 'Open',
    },
    {
      applicationId: 'APP1001', application: appMap['APP1001']._id,
      type: 'Minor NC', description: 'Clause A.8.1 — Asset inventory is not fully updated. 3 servers found without classification labels.',
      corrective_action: 'Complete asset inventory within 30 days. Tag all servers with classification labels. Assign asset owners.',
      raisedBy: u['ramesh@auditpro.com']._id, raisedByName: 'Ramesh Verma', status: 'Closed',
      closedAt: new Date('2024-11-20'),
    },
    {
      applicationId: 'APP1005', application: appMap['APP1005']._id,
      type: 'Minor NC', description: 'Clause 4.2.3 — Design History File (DHF) for product MD-201 is missing risk management documentation as required by ISO 14971.',
      corrective_action: 'Complete risk analysis for MD-201 per ISO 14971. Update DHF with risk management file.',
      raisedBy: u['anita@auditpro.com']._id, raisedByName: 'Anita Desai', status: 'Open',
    },
    {
      applicationId: 'APP1006', application: appMap['APP1006']._id,
      type: 'Observation', description: 'Clause 8.2 — Emergency response drill records are older than 12 months. Annual drill should be conducted.',
      raisedBy: u['auditor@crm.com']._id, raisedByName: 'Sarah Auditor', status: 'Closed',
      closedAt: new Date('2024-11-28'),
    },
  ]);

  console.log(`⚠️  Seeded ${obs.length} observations`);

  // ─────────────────────────────────────────────
  // STANDARDS
  // ─────────────────────────────────────────────
  const standards = await Standard.insertMany([
    { name: 'ISO 9001:2015',       category: 'Quality Management',              active: true,  description: 'Quality Management System requirements for organizations to demonstrate consistent product/service quality.' },
    { name: 'ISO 14001:2015',      category: 'Environmental Management',        active: true,  description: 'Environmental Management System for reducing environmental footprint and ensuring legal compliance.' },
    { name: 'ISO 45001:2018',      category: 'Occupational Health & Safety',    active: true,  description: 'Occupational Health and Safety Management System to prevent work-related injuries and illnesses.' },
    { name: 'ISO 27001:2022',      category: 'Information Security',            active: true,  description: 'Information Security Management System for protecting confidentiality, integrity, and availability of information.' },
    { name: 'ISO 22000:2018',      category: 'Food Safety',                     active: true,  description: 'Food Safety Management System for organizations in the food chain.' },
    { name: 'ISO 13485:2016',      category: 'Medical Devices',                 active: true,  description: 'Quality Management System for medical device manufacturers and suppliers.' },
    { name: 'ISO 50001:2018',      category: 'Energy Management',               active: true,  description: 'Energy Management System to improve energy performance and reduce energy costs.' },
    { name: 'ISO/IEC 27701:2025',  category: 'Privacy Information Management', active: true,  description: 'Extension to ISO 27001/27002 for privacy information management (PIMS/GDPR alignment).' },
    { name: 'ISO/IEC 42001:2023',  category: 'AI Management',                   active: true,  description: 'Artificial Intelligence Management System standard for responsible AI development.' },
    { name: 'ISO 22301:2019',      category: 'Business Continuity',             active: true,  description: 'Business Continuity Management System for organizational resilience.' },
    { name: 'ISO 37001:2016',      category: 'Anti-Bribery Management',         active: false, description: 'Anti-Bribery Management System to prevent, detect and address bribery.' },
    { name: 'ISO 21001:2018',      category: 'Educational Organizations',       active: false, description: 'Management System for Educational Organizations (EOMS).' },
  ]);

  console.log(`📚 Seeded ${standards.length} standards`);

  // ─────────────────────────────────────────────
  // ROLES
  // ─────────────────────────────────────────────
  await Role.insertMany([
    { name: 'Admin',    permissions: ['all'],                                                                                  description: 'Full system administrator access' },
    { name: 'Client',  permissions: ['view_dashboard','view_applications','submit_application','view_documents','feedback'],   description: 'Client portal access' },
    { name: 'Auditor', permissions: ['view_dashboard','view_assigned_applications','submit_audit_report','add_observations'],  description: 'Audit team member access' },
    { name: 'Reviewer',permissions: ['view_dashboard','view_assigned_applications','submit_review','approve_application'],     description: 'Review and approval access' },
    { name: 'Sales',   permissions: ['view_dashboard','manage_leads','create_applications','view_reports'],                   description: 'Sales team access' },
  ]);

  // ─────────────────────────────────────────────
  // CERTIFICATE SETTINGS
  // ─────────────────────────────────────────────
  await CertSetting.create({
    title: 'Certificate of Registration',
    authority: 'Quality Control Certification (QCC)',
    validityYears: 3,
    footerText: '"Quality Control Certification (QCC)" accredited by the respective accreditation body. This certificate remains the property of QCC to whom it must be returned on request.',
    accreditation: 'NABCB',
  });

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('Login credentials:');
  console.log('  admin@crm.com        / admin123');
  console.log('  client@crm.com       / client123   (John Client — ABC Corp)');
  console.log('  priya@xyzit.com      / client123   (Priya Sharma — XYZ IT)');
  console.log('  ravi@greenenergy.com / client123   (Ravi Kumar — Green Energy)');
  console.log('  meena@safefood.com   / client123   (Meena Nair — SafeFood)');
  console.log('  arun@worksafe.com    / client123   (Arun Singh — WorkSafe)');
  console.log('  sunita@medicare.com  / client123   (Sunita Joshi — MediCare)');
  console.log('  auditor@crm.com      / auditor123  (Sarah Auditor)');
  console.log('  ramesh@auditpro.com  / auditor123  (Ramesh Verma)');
  console.log('  anita@auditpro.com   / auditor123  (Anita Desai)');
  console.log('  reviewer@crm.com     / reviewer123 (Mike Reviewer)');
  console.log('  kavita@reviewpro.com / reviewer123 (Kavita Menon)');
  console.log('  sales@crm.com        / sales123    (Sales Manager)');
  console.log('  vikram@qccert.com    / sales123    (Vikram Patel)');
  console.log('─────────────────────────────────────────');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
