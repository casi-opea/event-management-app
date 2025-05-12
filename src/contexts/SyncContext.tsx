import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SyncStatus } from '../types';

interface SyncContextProps {
  isOnline: boolean;
  syncStatus: SyncStatus;
  triggerSync: () => void;
  setSyncComplete: () => void;
}

const SyncContext = createContext<SyncContextProps | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    syncing: false,
    lastSynced: null,
    pendingChanges: 0,
  });

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate sync process
  const triggerSync = useCallback(() => {
    if (!isOnline) {
      setSyncStatus(prev => ({
        ...prev,
        pendingChanges: prev.pendingChanges + 1,
      }));
      return;
    }

    setSyncStatus(prev => ({
      ...prev,
      syncing: true,
    }));

    // Simulate sync delay - in real app this would be an API call
    setTimeout(() => {
      setSyncStatus({
        syncing: false,
        lastSynced: new Date().toISOString(),
        pendingChanges: 0,
      });
    }, 1500);
  }, [isOnline]);

  // Attempt to sync when coming back online
  useEffect(() => {
    if (isOnline && syncStatus.pendingChanges > 0) {
      triggerSync();
    }
  }, [isOnline, syncStatus.pendingChanges, triggerSync]);

  const setSyncComplete = useCallback(() => {
    setSyncStatus(prev => ({
      ...prev,
      syncing: false,
      lastSynced: new Date().toISOString(),
    }));
  }, []);

  const value = {
    isOnline,
    syncStatus,
    triggerSync,
    setSyncComplete,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};