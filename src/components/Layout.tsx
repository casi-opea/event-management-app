import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSync } from '../contexts/SyncContext';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { syncStatus } = useSync();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header openSidebar={() => setSidebarOpen(true)} />
        
        {syncStatus.syncing && (
          <div className="bg-primary-50 border-b border-primary-100 px-4 py-2 text-primary-800 text-sm flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary-500 mr-2 animate-pulse"></div>
            Syncing data... Last synced: {syncStatus.lastSynced ? new Date(syncStatus.lastSynced).toLocaleTimeString() : 'Never'}
          </div>
        )}
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;