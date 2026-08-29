import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socket, api } from '../services/api';
import { useAuth } from './AuthContext';

const SyncContext = createContext(null);

export const SyncProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [branches, setBranches] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [
      ...prev,
      { id, message, type, timestamp: new Date().toLocaleTimeString() },
    ]);
    // Auto remove after 6 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6000);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [bData, uData, rData] = await Promise.all([
        api.getBranches(),
        api.getUsers(),
        api.getReports(),
      ]);
      setBranches(bData);
      setUsersList(uData);
      setReports(rData);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Error fetching synced data:', err);
    } finally {
      setIsLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();

    function onConnect() {
      setIsConnected(true);
      setLastSyncTime(new Date());
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onReportCreated(data) {
      setReports((prev) => [data.report, ...prev.filter((r) => r.id !== data.report.id)]);
      setLastSyncTime(new Date());
      addNotification(
        `New report created for ${data.report.branchName} (${data.report.month} ${data.report.year})`,
        'info'
      );
    }

    function onReportUpdated(data) {
      setReports((prev) =>
        prev.map((r) => (r.id === data.report.id ? data.report : r))
      );
      setLastSyncTime(new Date());
      addNotification(`Report for ${data.report.branchName} was updated`, 'info');
    }

    function onReportSubmittedToPastor(data) {
      setReports((prev) => {
        const exists = prev.some((r) => r.id === data.report.id);
        if (exists) {
          return prev.map((r) => (r.id === data.report.id ? data.report : r));
        }
        return [data.report, ...prev];
      });
      setLastSyncTime(new Date());
      addNotification(
        `🔔 [Real-Time Sync] ${data.report.branchName} submitted a report for Pastor Review!`,
        'success'
      );
    }

    function onReportEndorsed(data) {
      setReports((prev) =>
        prev.map((r) => (r.id === data.report.id ? data.report : r))
      );
      setLastSyncTime(new Date());
      addNotification(
        `✅ [Real-Time Sync] Pastor endorsed report for ${data.report.branchName} (Submitted to Admin)`,
        'success'
      );
    }

    function onReportDeleted(data) {
      setReports((prev) => prev.filter((r) => r.id !== data.reportId));
      setLastSyncTime(new Date());
      addNotification('A report was deleted', 'warning');
    }

    function onBranchCreated(data) {
      setBranches((prev) => [...prev, data.branch]);
      setLastSyncTime(new Date());
      addNotification(`New branch created: ${data.branch.name}`, 'info');
    }

    function onBranchUpdated(data) {
      setBranches((prev) =>
        prev.map((b) => (b.id === data.branch.id ? data.branch : b))
      );
      setLastSyncTime(new Date());
    }

    function onBranchDeleted(data) {
      setBranches((prev) => prev.filter((b) => b.id !== data.branchId));
      setLastSyncTime(new Date());
      addNotification('Branch removed', 'warning');
    }

    function onUserUpdated(data) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === data.user.id ? data.user : u))
      );
      setLastSyncTime(new Date());
    }

    function onLoginsGenerated(data) {
      setUsersList(data.users);
      setLastSyncTime(new Date());
      addNotification('⚡ Unique login credentials generated for all Pastors & Secretaries!', 'success');
    }

    function onSystemReset() {
      refreshAll();
      addNotification('System reset to initial sample state', 'info');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
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
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
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
  }, [refreshAll, addNotification]);

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
