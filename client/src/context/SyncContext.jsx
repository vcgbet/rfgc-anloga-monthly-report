import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socket, api } from '../services/api';
import { useAuth } from './AuthContext';

const SyncContext = createContext(null);

const STORAGE_KEYS = {
  REPORTS: 'rfgc_district_reports_v3',
  BRANCHES: 'rfgc_district_branches_v3',
  USERS: 'rfgc_district_users_v3',
  LAST_SYNC: 'rfgc_district_last_sync_v3'
};

const crossTabChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('rfgc_cross_tab_sync') : null;

export const SyncProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // Initialize state from local persistent storage
  const [branches, setBranches] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRANCHES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const isReconcilingRef = useRef(false);

  // Helper to persist to localStorage and broadcast cross-tab
  const persistAndBroadcast = useCallback((newReports, newBranches, newUsers) => {
    try {
      if (newReports !== undefined) {
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(newReports));
      }
      if (newBranches !== undefined) {
        localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(newBranches));
      }
      if (newUsers !== undefined) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
      }
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

      if (crossTabChannel) {
        crossTabChannel.postMessage({
          type: 'STORAGE_UPDATE',
          timestamp: Date.now()
        });
      }
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  }, []);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [
      ...prev,
      { id, message, type, timestamp: new Date().toLocaleTimeString() },
    ]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6000);
  }, []);

  // Bi-directional server reconciliation
  const reconcileWithServer = useCallback(async () => {
    if (isReconcilingRef.current) return;
    isReconcilingRef.current = true;

    try {
      // Get current stored local records
      let localReps = [];
      let localBranches = [];
      let localUsers = [];

      try {
        const sr = localStorage.getItem(STORAGE_KEYS.REPORTS);
        if (sr) localReps = JSON.parse(sr);
        const sb = localStorage.getItem(STORAGE_KEYS.BRANCHES);
        if (sb) localBranches = JSON.parse(sb);
        const su = localStorage.getItem(STORAGE_KEYS.USERS);
        if (su) localUsers = JSON.parse(su);
      } catch (e) {}

      // Call server reconcile endpoint
      const result = await api.reconcile({
        reports: localReps,
        branches: localBranches,
        users: localUsers
      });

      if (result && result.success) {
        if (Array.isArray(result.branches) && result.branches.length > 0) {
          setBranches(result.branches);
          localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(result.branches));
        }
        if (Array.isArray(result.users) && result.users.length > 0) {
          setUsersList(result.users);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(result.users));
        }
        if (Array.isArray(result.reports) && result.reports.length > 0) {
          setReports(result.reports);
          localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(result.reports));
        }
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('Reconciliation with server notice (using local offline cache):', err.message);
    } finally {
      isReconcilingRef.current = false;
      setIsLoadingInitial(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await reconcileWithServer();
  }, [reconcileWithServer]);

  // Initial load and event listeners
  useEffect(() => {
    reconcileWithServer();

    // Auto reconcile on tab focus
    const handleFocus = () => {
      reconcileWithServer();
    };
    window.addEventListener('focus', handleFocus);

    // Cross-tab message receiver
    if (crossTabChannel) {
      crossTabChannel.onmessage = (event) => {
        if (event.data?.type === 'STORAGE_UPDATE') {
          try {
            const sr = localStorage.getItem(STORAGE_KEYS.REPORTS);
            if (sr) setReports(JSON.parse(sr));
            const sb = localStorage.getItem(STORAGE_KEYS.BRANCHES);
            if (sb) setBranches(JSON.parse(sb));
            const su = localStorage.getItem(STORAGE_KEYS.USERS);
            if (su) setUsersList(JSON.parse(su));
          } catch (e) {}
        }
      };
    }

    // Periodic background sync every 45 seconds
    const interval = setInterval(() => {
      reconcileWithServer();
    }, 45000);

    function onConnect() {
      setIsConnected(true);
      setLastSyncTime(new Date());
      reconcileWithServer();
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onSyncDataUpdated(data) {
      if (data.reports) {
        setReports(data.reports);
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(data.reports));
      }
      if (data.branches) {
        setBranches(data.branches);
        localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(data.branches));
      }
      if (data.users) {
        setUsersList(data.users);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      }
      setLastSyncTime(new Date());
    }

    function onReportCreated(data) {
      setReports((prev) => {
        const updated = [data.report, ...prev.filter((r) => r.id !== data.report.id)];
        persistAndBroadcast(updated);
        return updated;
      });
      setLastSyncTime(new Date());
      addNotification(
        `New report created for ${data.report.branchName} (${data.report.month} ${data.report.year})`,
        'info'
      );
    }

    function onReportUpdated(data) {
      setReports((prev) => {
        const updated = prev.map((r) => (r.id === data.report.id ? data.report : r));
        persistAndBroadcast(updated);
        return updated;
      });
      setLastSyncTime(new Date());
      addNotification(`Report for ${data.report.branchName} was updated`, 'info');
    }

    function onReportSubmittedToPastor(data) {
      setReports((prev) => {
        const exists = prev.some((r) => r.id === data.report.id);
        const updated = exists
          ? prev.map((r) => (r.id === data.report.id ? data.report : r))
          : [data.report, ...prev];
        persistAndBroadcast(updated);
        return updated;
      });
      setLastSyncTime(new Date());
      addNotification(
        `🔔 [Real-Time Sync] ${data.report.branchName} submitted a report for Pastor Review!`,
        'success'
      );
    }

    function onReportEndorsed(data) {
      setReports((prev) => {
        const updated = prev.map((r) => (r.id === data.report.id ? data.report : r));
        persistAndBroadcast(updated);
        return updated;
      });
      setLastSyncTime(new Date());
      addNotification(
        `✅ [Real-Time Sync] Pastor endorsed report for ${data.report.branchName} (Submitted to Admin)`,
        'success'
      );
    }

    function onReportDeleted(data) {
      setReports((prev) => {
        const updated = prev.filter((r) => r.id !== data.reportId);
        persistAndBroadcast(updated);
        return updated;
      });
      setLastSyncTime(new Date());
      addNotification('A report was deleted', 'warning');
    }

    function onBranchCreated(data) {
      setBranches((prev) => {
        const updated = [...prev, data.branch];
        persistAndBroadcast(undefined, updated);
        return updated;
      });
      setLastSyncTime(new Date());
      addNotification(`New branch created: ${data.branch.name}`, 'info');
    }

    function onBranchUpdated(data) {
      setBranches((prev) => {
        const updated = prev.map((b) => (b.id === data.branch.id ? data.branch : b));
        persistAndBroadcast(undefined, updated);
        return updated;
      });
      setLastSyncTime(new Date());
    }

    function onBranchDeleted(data) {
      setBranches((prev) => {
        const updated = prev.filter((b) => b.id !== data.branchId);
        persistAndBroadcast(undefined, updated);
        return updated;
      });
      setLastSyncTime(new Date());
      addNotification('Branch removed', 'warning');
    }

    function onUserUpdated(data) {
      setUsersList((prev) => {
        const updated = prev.map((u) => (u.id === data.user.id ? data.user : u));
        persistAndBroadcast(undefined, undefined, updated);
        return updated;
      });
      setLastSyncTime(new Date());
    }

    function onLoginsGenerated(data) {
      setUsersList(data.users);
      persistAndBroadcast(undefined, undefined, data.users);
      setLastSyncTime(new Date());
      addNotification('⚡ Unique login credentials generated for all Pastors & Secretaries!', 'success');
    }

    function onSystemReset() {
      reconcileWithServer();
      addNotification('System state synchronized', 'info');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('sync_data_updated', onSyncDataUpdated);
    socket.on('report_created', onReportCreated);
    socket.on('report_updated', onReportUpdated);
    socket.on('report_submitted_to_pastor', onReportSubmittedToPastor);
    socket.on('report_endorsed', onReportEndorsed);
    socket.on('report_deleted', onReportDeleted);
    socket.on('branch_created', onBranchCreated);
    socket.on('branch_updated', onBranchUpdated);
    socket.on('branch_deleted', onBranchDeleted);
    socket.on('user_updated', onUserUpdated);
    socket.on('logins_generated', onLoginsGenerated);
    socket.on('system_reset', onSystemReset);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('sync_data_updated', onSyncDataUpdated);
      socket.off('report_created', onReportCreated);
      socket.off('report_updated', onReportUpdated);
      socket.off('report_submitted_to_pastor', onReportSubmittedToPastor);
      socket.off('report_endorsed', onReportEndorsed);
      socket.off('report_deleted', onReportDeleted);
      socket.off('branch_created', onBranchCreated);
      socket.off('branch_updated', onBranchUpdated);
      socket.off('branch_deleted', onBranchDeleted);
      socket.off('user_updated', onUserUpdated);
      socket.off('logins_generated', onLoginsGenerated);
      socket.off('system_reset', onSystemReset);
    };
  }, [reconcileWithServer, addNotification, persistAndBroadcast]);

  return (
    <SyncContext.Provider
      value={{
        isConnected,
        lastSyncTime,
        branches,
        usersList,
        reports,
        notifications,
        removeNotification: (id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id)),
        refreshAll,
        reconcileWithServer,
        addNotification,
        isLoadingInitial,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
