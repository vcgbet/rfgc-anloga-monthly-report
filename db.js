const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { INITIAL_BRANCHES, INITIAL_USERS, INITIAL_REPORTS } = require('./seedData');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db = {
  branches: [],
  users: [],
  reports: []
};

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      db = {
        branches: Array.isArray(parsed.branches) && parsed.branches.length > 0 ? parsed.branches : JSON.parse(JSON.stringify(INITIAL_BRANCHES)),
        users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : JSON.parse(JSON.stringify(INITIAL_USERS)),
        reports: Array.isArray(parsed.reports) && parsed.reports.length > 0 ? parsed.reports : JSON.parse(JSON.stringify(INITIAL_REPORTS))
      };
    } else {
      db = {
        branches: JSON.parse(JSON.stringify(INITIAL_BRANCHES)),
        users: JSON.parse(JSON.stringify(INITIAL_USERS)),
        reports: JSON.parse(JSON.stringify(INITIAL_REPORTS))
      };
      saveDb();
    }
  } catch (err) {
    console.error('Error loading DB, initializing defaults:', err);
    db = {
      branches: JSON.parse(JSON.stringify(INITIAL_BRANCHES)),
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      reports: JSON.parse(JSON.stringify(INITIAL_REPORTS))
    };
    saveDb();
  }
}

function saveDb() {
  try {
    const tempPath = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(tempPath, DB_FILE);
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

loadDb();

// --- Branches ---
function getBranches() {
  return db.branches;
}

function getBranchById(id) {
  return db.branches.find(b => b.id === id);
}

function createBranch(branchData) {
  const newBranch = {
    id: `br-${uuidv4().substring(0, 8)}`,
    name: branchData.name || '',
    location: branchData.location || '',
    pastorName: branchData.pastorName || '',
    secretaryName: branchData.secretaryName || '',
    contactPhone: branchData.contactPhone || '',
    status: branchData.status || 'Active',
    createdAt: new Date().toISOString()
  };
  db.branches.push(newBranch);
  saveDb();
  return newBranch;
}

function updateBranch(id, branchData) {
  const index = db.branches.findIndex(b => b.id === id);
  if (index === -1) return null;
  db.branches[index] = {
    ...db.branches[index],
    ...branchData,
    updatedAt: new Date().toISOString()
  };
  saveDb();
  return db.branches[index];
}

function deleteBranch(id) {
  const index = db.branches.findIndex(b => b.id === id);
  if (index === -1) return false;
  db.branches.splice(index, 1);
  saveDb();
  return true;
}

// --- Users ---
function getUsers() {
  return db.users;
}

function getUserById(id) {
  return db.users.find(u => u.id === id);
}

function getUserByUsername(username) {
  return db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

function createUser(userData) {
  const newUser = {
    id: `user-${uuidv4().substring(0, 8)}`,
    role: userData.role || 'secretary',
    name: userData.name || '',
    username: userData.username || '',
    password: userData.password || 'Rf@' + Math.floor(10000000 + Math.random() * 90000000).toString(16).toUpperCase(),
    branchId: userData.branchId || null,
    branchName: userData.branchName || '',
    phone: userData.phone || '',
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  saveDb();
  return newUser;
}

function updateUser(id, userData) {
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return null;
  db.users[index] = {
    ...db.users[index],
    ...userData,
    updatedAt: new Date().toISOString()
  };
  saveDb();
  return db.users[index];
}

function deleteUser(id) {
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return false;
  db.users.splice(index, 1);
  saveDb();
  return true;
}

function changePassword(userId, newPassword) {
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;
  user.password = newPassword;
  user.updatedAt = new Date().toISOString();
  saveDb();
  return user;
}

// Automatic Unique Login Generator for Pastors & Secretaries
function generateUniqueLogins() {
  const updatedUsers = [];
  db.users.forEach((u, idx) => {
    if (u.role === 'admin') return;
    
    // Clean branch slug
    const cleanBranch = (u.branchName || 'branch')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 8);
    
    // Random 8-char hex for password
    const hex = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
    
    if (u.role === 'pastor') {
      u.username = `pastor.${cleanBranch}.${idx + 1}`;
      u.password = `Rf@${hex}`;
    } else if (u.role === 'secretary') {
      u.username = `sec.${cleanBranch}.${idx + 1}`;
      u.password = `Rf@${hex}`;
    }
    u.updatedAt = new Date().toISOString();
    updatedUsers.push(u);
  });
  saveDb();
  return db.users;
}

// --- Reports ---
function getReports(filters = {}) {
  let reports = [...db.reports];
  if (filters.branchId) {
    reports = reports.filter(r => r.branchId === filters.branchId || r.branchName === filters.branchName);
  }
  if (filters.status) {
    reports = reports.filter(r => r.status === filters.status);
  }
  if (filters.month) {
    reports = reports.filter(r => r.month === filters.month);
  }
  if (filters.year) {
    reports = reports.filter(r => String(r.year) === String(filters.year));
  }
  // Sort by updatedAt descending
  reports.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  return reports;
}

function getReportById(id) {
  return db.reports.find(r => r.id === id);
}

function calculateFinanceTotal(finance) {
  if (!finance) return 0;
  const tithes = parseFloat(finance.tithes) || 0;
  const sundayOfferings = parseFloat(finance.sundayOfferings) || 0;
  const weekdayOfferings = parseFloat(finance.weekdayOfferings) || 0;
  const evangelismOffering = parseFloat(finance.evangelismOffering) || 0;
  const districtLevy = parseFloat(finance.districtLevy) || 0;
  const exchangeOfPulpit = parseFloat(finance.exchangeOfPulpit) || 0;
  return tithes + sundayOfferings + weekdayOfferings + evangelismOffering + districtLevy + exchangeOfPulpit;
}

function sanitizeSundayAttendance(sundays) {
  if (!Array.isArray(sundays)) return [];
  return sundays.map(s => {
    const children = parseInt(s.children) || 0;
    const youth = parseInt(s.youth) || 0;
    const women = parseInt(s.women) || 0;
    const men = parseInt(s.men) || 0;
    return {
      id: s.id || `sun-${uuidv4().substring(0, 6)}`,
      date: s.date || '',
      children,
      youth,
      women,
      men,
      total: children + youth + women + men
    };
  });
}

function sanitizeWeekdayAttendance(weekdays) {
  if (!Array.isArray(weekdays)) return [];
  return weekdays.map(w => {
    const children = parseInt(w.children) || 0;
    const youth = parseInt(w.youth) || 0;
    const women = parseInt(w.women) || 0;
    const men = parseInt(w.men) || 0;
    return {
      id: w.id || `wk-${uuidv4().substring(0, 6)}`,
      day: w.day || 'Monday',
      activity: w.activity || 'Prayer Service',
      customActivity: w.customActivity || '',
      children,
      youth,
      women,
      men
    };
  });
}

function createReport(reportData, user) {
  const finance = reportData.finance || {};
  finance.total = calculateFinanceTotal(finance);

  const newReport = {
    id: reportData.id || `rep-${uuidv4().substring(0, 8)}`,
    branchId: reportData.branchId || '',
    branchName: reportData.branchName || '',
    month: reportData.month || '',
    year: reportData.year || new Date().getFullYear().toString(),
    pastorName: reportData.pastorName || '',
    status: reportData.status || 'draft', // 'draft', 'submitted_to_pastor', 'endorsed', 'approved_admin'
    sundayAttendance: sanitizeSundayAttendance(reportData.sundayAttendance),
    weekdayAttendance: sanitizeWeekdayAttendance(reportData.weekdayAttendance),
    finance: {
      tithes: parseFloat(finance.tithes) || 0,
      sundayOfferings: parseFloat(finance.sundayOfferings) || 0,
      weekdayOfferings: parseFloat(finance.weekdayOfferings) || 0,
      evangelismOffering: parseFloat(finance.evangelismOffering) || 0,
      districtLevy: parseFloat(finance.districtLevy) || 0,
      exchangeOfPulpit: parseFloat(finance.exchangeOfPulpit) || 0,
      total: finance.total
    },
    endorsement: {
      churchSecretary: {
        name: reportData.endorsement?.churchSecretary?.name || (user?.role === 'secretary' ? user.name : ''),
        date: reportData.endorsement?.churchSecretary?.date || '',
        signatureData: reportData.endorsement?.churchSecretary?.signatureData || ''
      },
      branchPastor: {
        name: reportData.endorsement?.branchPastor?.name || (user?.role === 'pastor' ? user.name : ''),
        date: reportData.endorsement?.branchPastor?.date || '',
        signatureData: reportData.endorsement?.branchPastor?.signatureData || '',
        remarks: reportData.endorsement?.branchPastor?.remarks || ''
      }
    },
    createdBy: user?.id || 'anonymous',
    createdAt: reportData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: reportData.history && reportData.history.length > 0 ? reportData.history : [
      {
        timestamp: new Date().toISOString(),
        action: reportData.status === 'submitted_to_pastor' ? 'Submitted to Pastor for Review' : 'Report Created (Draft)',
        actorName: user?.name || 'Secretary',
        actorRole: user?.role || 'Secretary'
      }
    ]
  };

  // Check if report with this ID already exists
  const existingIdx = db.reports.findIndex(r => r.id === newReport.id);
  if (existingIdx !== -1) {
    db.reports[existingIdx] = newReport;
  } else {
    db.reports.push(newReport);
  }

  saveDb();
  return newReport;
}

function updateReport(id, reportData, user) {
  const index = db.reports.findIndex(r => r.id === id);
  if (index === -1) {
    // If not found, create it with this id
    return createReport({ ...reportData, id }, user);
  }

  const current = db.reports[index];
  const finance = reportData.finance || current.finance || {};
  finance.total = calculateFinanceTotal(finance);

  const action = reportData._historyAction || 'Report Updated';

  const updatedReport = {
    ...current,
    ...reportData,
    id: current.id, // preserve id
    sundayAttendance: reportData.sundayAttendance ? sanitizeSundayAttendance(reportData.sundayAttendance) : current.sundayAttendance,
    weekdayAttendance: reportData.weekdayAttendance ? sanitizeWeekdayAttendance(reportData.weekdayAttendance) : current.weekdayAttendance,
    finance: {
      tithes: parseFloat(finance.tithes) || 0,
      sundayOfferings: parseFloat(finance.sundayOfferings) || 0,
      weekdayOfferings: parseFloat(finance.weekdayOfferings) || 0,
      evangelismOffering: parseFloat(finance.evangelismOffering) || 0,
      districtLevy: parseFloat(finance.districtLevy) || 0,
      exchangeOfPulpit: parseFloat(finance.exchangeOfPulpit) || 0,
      total: finance.total
    },
    endorsement: {
      churchSecretary: {
        ...current.endorsement?.churchSecretary,
        ...(reportData.endorsement?.churchSecretary || {})
      },
      branchPastor: {
        ...current.endorsement?.branchPastor,
        ...(reportData.endorsement?.branchPastor || {})
      }
    },
    updatedAt: new Date().toISOString(),
    history: [
      ...(current.history || []),
      {
        timestamp: new Date().toISOString(),
        action: action,
        actorName: user?.name || 'System User',
        actorRole: user?.role || 'User'
      }
    ]
  };

  delete updatedReport._historyAction;

  db.reports[index] = updatedReport;
  saveDb();
  return updatedReport;
}

function deleteReport(id) {
  const index = db.reports.findIndex(r => r.id === id);
  if (index === -1) return false;
  db.reports.splice(index, 1);
  saveDb();
  return true;
}

// Bi-directional Data Reconciliation across browser storage and backend server
function reconcileData(clientData = {}) {
  let hasChanges = false;
  const clientReports = Array.isArray(clientData.reports) ? clientData.reports : [];
  const clientBranches = Array.isArray(clientData.branches) ? clientData.branches : [];
  const clientUsers = Array.isArray(clientData.users) ? clientData.users : [];

  // Merge client reports into db
  clientReports.forEach(cRep => {
    if (!cRep || !cRep.id) return;
    const serverIdx = db.reports.findIndex(r => r.id === cRep.id);
    if (serverIdx === -1) {
      // Server is missing this report (e.g. server restarted on Render free tier!)
      db.reports.push(cRep);
      hasChanges = true;
    } else {
      // Compare updated timestamps
      const serverDate = new Date(db.reports[serverIdx].updatedAt || db.reports[serverIdx].createdAt || 0).getTime();
      const clientDate = new Date(cRep.updatedAt || cRep.createdAt || 0).getTime();
      if (clientDate > serverDate) {
        db.reports[serverIdx] = cRep;
        hasChanges = true;
      }
    }
  });

  // Merge client branches if missing
  clientBranches.forEach(cBranch => {
    if (!cBranch || !cBranch.id) return;
    const serverIdx = db.branches.findIndex(b => b.id === cBranch.id || b.name.toLowerCase() === cBranch.name.toLowerCase());
    if (serverIdx === -1) {
      db.branches.push(cBranch);
      hasChanges = true;
    }
  });

  // Merge client users if missing or updated
  clientUsers.forEach(cUser => {
    if (!cUser || !cUser.id) return;
    const serverIdx = db.users.findIndex(u => u.id === cUser.id || u.username.toLowerCase() === cUser.username.toLowerCase());
    if (serverIdx === -1) {
      db.users.push(cUser);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    saveDb();
  }

  return {
    branches: db.branches,
    users: db.users,
    reports: db.reports,
    hasChanges
  };
}

// Restore entire backup
function restoreBackup(backupData) {
  if (!backupData || typeof backupData !== 'object') {
    throw new Error('Invalid backup data format');
  }

  if (Array.isArray(backupData.branches) && backupData.branches.length > 0) {
    db.branches = backupData.branches;
  }
  if (Array.isArray(backupData.users) && backupData.users.length > 0) {
    db.users = backupData.users;
  }
  if (Array.isArray(backupData.reports)) {
    db.reports = backupData.reports;
  }

  saveDb();
  return {
    branches: db.branches,
    users: db.users,
    reports: db.reports
  };
}

function getFullDatabase() {
  return {
    branches: db.branches,
    users: db.users,
    reports: db.reports,
    exportedAt: new Date().toISOString(),
    system: 'ANLOGA DISTRICT RHEMA FULL GOSPEL CHURCHES'
  };
}

function resetDb() {
  db = {
    branches: JSON.parse(JSON.stringify(INITIAL_BRANCHES)),
    users: JSON.parse(JSON.stringify(INITIAL_USERS)),
    reports: JSON.parse(JSON.stringify(INITIAL_REPORTS))
  };
  saveDb();
  return db;
}

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  generateUniqueLogins,
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  reconcileData,
  restoreBackup,
  getFullDatabase,
  resetDb
};
