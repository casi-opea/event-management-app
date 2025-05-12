import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useSync } from '../contexts/SyncContext';

const NetworkStatus: React.FC = () => {
  const { isOnline } = useSync();

  return (
    <div className="flex items-center">
      <div className={`
        flex items-center px-2 py-1 rounded-full text-sm
        ${isOnline ? 'text-success-800 bg-success-50' : 'text-error-800 bg-error-50'}
      `}>
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Offline</span>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;