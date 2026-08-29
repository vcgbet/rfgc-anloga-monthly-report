const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const db = require('./db');
const { analyzeBranchReports, analyzeDistrictWide } = require('./aiAnalytics');

const app = express();
const server = http.createServer(app);

// Enable Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static frontend in production
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Real-Time Socket.IO Synchronization
io.on('connection', (socket) => {
  console.log('Client connected to real-time sync channel:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('request_full_sync', () => {
    socket.emit('full_sync_data', {
      branches: db.getBranches(),
      reports: db.getReports(),
      timestamp: new Date().toISOString()
    });
  });
});

// Broadcast helper
function broadcastEvent(eventName, payload) {
  io.emit(eventName, {
    ...payload,
    timestamp: new Date().toISOString()
  });
}

// --- AUTH ROUTES ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.getUserByUsername(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Return user info (safe copy)
  const safeUser = { ...user };
  res.json({ success: true, user: safeUser });
});

app.post('/api/auth/change-password', (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'User ID and new password are required' });
  }

  const updatedUser = db.changePassword(userId, newPassword);
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  broadcastEvent('user_updated', { user: updatedUser });
  res.json({ success: true, message: 'Password updated successfully' });
});

// --- BRANCHES ROUTES ---
app.get('/api/branches', (req, res) => {
  res.json(db.getBranches());
});

app.post('/api/branches', (req, res) => {
  const newBranch = db.createBranch(req.body);
  broadcastEvent('branch_created', { branch: newBranch });
  res.status(201).json(newBranch);
});

app.put('/api/branches/:id', (req, res) => {
  const updated = db.updateBranch(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Branch not found' });
  broadcastEvent('branch_updated', { branch: updated });
  res.json(updated);
});

app.delete('/api/branches/:id', (req, res) => {
  const success = db.deleteBranch(req.params.id);
  if (!success) return res.status(404).json({ error: 'Branch not found' });
  broadcastEvent('branch_deleted', { branchId: req.params.id });
  res.json({ success: true });
});

// --- USERS / CREDENTIALS ROUTES ---
app.get('/api/users', (req, res) => {
  res.json(db.getUsers());
});

app.post('/api/users', (req, res) => {
  const newUser = db.createUser(req.body);
  broadcastEvent('user_created', { user: newUser });
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const updated = db.updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  broadcastEvent('user_updated', { user: updated });
  res.json(updated);
});

app.delete('/api/users/:id', (req, res) => {
  const success = db.deleteUser(req.params.id);
  if (!success) return res.status(404).json({ error: 'User not found' });
  broadcastEvent('user_deleted', { userId: req.params.id });
  res.json({ success: true });
});

app.post('/api/users/generate-logins', (req, res) => {
  const users = db.generateUniqueLogins();
  broadcastEvent('logins_generated', { users });
  res.json({ success: true, users });
});

// --- REPORTS ROUTES ---
app.get('/api/reports', (req, res) => {
  const { branchId, branchName, status, month, year } = req.query;
  const reports = db.getReports({ branchId, branchName, status, month, year });
  res.json(reports);
});

app.get('/api/reports/:id', (req, res) => {
  const report = db.getReportById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json(report);
});

app.post('/api/reports', (req, res) => {
  const user = req.body._user;
  const newReport = db.createReport(req.body, user);
  broadcastEvent('report_created', { report: newReport });
  res.status(201).json(newReport);
});

app.put('/api/reports/:id', (req, res) => {
  const user = req.body._user;
  const updated = db.updateReport(req.params.id, req.body, user);
  if (!updated) return res.status(404).json({ error: 'Report not found' });
  broadcastEvent('report_updated', { report: updated });
  res.json(updated);
});

app.delete('/api/reports/:id', (req, res) => {
  const success = db.deleteReport(req.params.id);
  if (!success) return res.status(404).json({ error: 'Report not found' });
  broadcastEvent('report_deleted', { reportId: req.params.id });
  res.json({ success: true });
});

// Specific action: Secretary submits to Pastor
app.post('/api/reports/:id/submit-to-pastor', (req, res) => {
  const user = req.body._user;
  const reportData = {
    ...req.body,
    status: 'submitted_to_pastor',
    _historyAction: 'Submitted to Pastor for Review & Endorsement'
  };
  const updated = db.updateReport(req.params.id, reportData, user);
  if (!updated) return res.status(404).json({ error: 'Report not found' });
  broadcastEvent('report_submitted_to_pastor', { report: updated });
  res.json(updated);
});

// Specific action: Pastor endorses report & submits to Admin
app.post('/api/reports/:id/endorse', (req, res) => {
  const user = req.body._user;
  const reportData = {
    ...req.body,
    status: 'endorsed',
    _historyAction: 'Report Endorsed by Pastor and Transmitted to District Admin'
  };
  const updated = db.updateReport(req.params.id, reportData, user);
  if (!updated) return res.status(404).json({ error: 'Report not found' });
  broadcastEvent('report_endorsed', { report: updated });
  res.json(updated);
});

// --- AI ANALYTICS ROUTES ---
app.get('/api/analytics/branch/:branchIdentifier', (req, res) => {
  const branchIdOrName = req.params.branchIdentifier;
  const branches = db.getBranches();
  const branch = branches.find(b => b.id === branchIdOrName || b.name.toLowerCase() === branchIdOrName.toLowerCase());
  const branchName = branch ? branch.name : branchIdOrName;
  const branchId = branch ? branch.id : null;
  const reports = db.getReports();

  const analytics = analyzeBranchReports(branchId, branchName, reports);
  res.json(analytics);
});

app.get('/api/analytics/district', (req, res) => {
  const branches = db.getBranches();
  const reports = db.getReports();
  const analytics = analyzeDistrictWide(branches, reports);
  res.json(analytics);
});

// System reset
app.post('/api/system/reset', (req, res) => {
  const newDb = db.resetDb();
  broadcastEvent('system_reset', {});
  res.json({ success: true, message: 'Database reset to initial seed state', data: newDb });
});

// Fallback for SPA frontend routing
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Anloga District RFGC Monthly Report</title></head>
          <body>
            <h2>Anloga District RFGC App Server Running</h2>
            <p>Building client assets...</p>
          </body>
        </html>
      `);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
