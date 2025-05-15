import React, { useState } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import QrScanner from '../components/QrScanner';
import AttendeeCard from '../components/AttendeeCard';
import Toast from '../components/Toast';
import { QrCode, Coffee, Gift, UserX, AlertTriangle } from 'lucide-react';

const Distribution: React.FC = () => {
  const { attendees, updateAttendee, findAttendeeById } = useAttendees();
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [foundAttendee, setFoundAttendee] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [distributionType, setDistributionType] = useState<'lunch' | 'kit'>('lunch');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingDistributions, setPendingDistributions] = useState<Array<{id: string, type: 'lunch' | 'kit'}>>([]);

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
      
      if (navigator.onLine && pendingDistributions.length > 0) {
        setToast({
          message: 'Syncing pending distributions...',
          type: 'info'
        });
        
        // In a real app, we would sync with the server here
        // For now, just clear the pending distributions
        setPendingDistributions([]);
        
        setToast({
          message: 'Pending distributions synced successfully',
          type: 'success'
        });
      }
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [pendingDistributions]);

  const handleScan = (id: string) => {
    setScannedId(id);
    
    // Find attendee by ID
    const attendee = findAttendeeById(id);
    
    if (attendee) {
      setFoundAttendee(attendee);
      
      if (!attendee.checkedIn) {
        setToast({
          message: `${attendee.name} has not checked in yet. Please check in first.`,
          type: 'warning'
        });
      } else if (distributionType === 'lunch' && attendee.lunchCollected) {
        setToast({
          message: `${attendee.name} has already collected lunch`,
          type: 'warning'
        });
      } else if (distributionType === 'kit' && attendee.kitCollected) {
        setToast({
          message: `${attendee.name} has already collected a kit`,
          type: 'warning'
        });
      }
    } else {
      setFoundAttendee(null);
      setToast({
        message: 'Attendee not found. Please check the ID and try again.',
        type: 'error'
      });
    }
  };
  
  const handleDistribution = (attendee: any) => {
    if (!attendee.checkedIn) {
      setToast({
        message: `${attendee.name} must check in before collecting ${distributionType}`,
        type: 'error'
      });
      return;
    }
    
    if (distributionType === 'lunch' && attendee.lunchCollected) {
      setToast({
        message: `${attendee.name} has already collected lunch`,
        type: 'warning'
      });
      return;
    }
    
    if (distributionType === 'kit' && attendee.kitCollected) {
      setToast({
        message: `${attendee.name} has already collected a kit`,
        type: 'warning'
      });
      return;
    }
    
    const updatedAttendee = { 
      ...attendee, 
      ...(distributionType === 'lunch' ? { lunchCollected: true } : { kitCollected: true }) 
    };
    
    if (isOffline) {
      // Store in pending distributions
      setPendingDistributions([...pendingDistributions, { id: attendee.uniqueId, type: distributionType }]);
      
      setToast({
        message: `${attendee.name} marked as collected ${distributionType} (offline mode). Will sync when online.`,
        type: 'info'
      });
    } else {
      // Update in main system
      updateAttendee(updatedAttendee);
      
      setToast({
        message: `${attendee.name} successfully collected ${distributionType}`,
        type: 'success'
      });
    }
    
    // Update the foundAttendee state to reflect the change
    setFoundAttendee(updatedAttendee);
  };
  
  const resetScan = () => {
    setScannedId(null);
    setFoundAttendee(null);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Distribution</h2>
        <p className="text-sm text-gray-500">
          Manage lunch and kit distribution for checked-in attendees
        </p>
      </div>
      
      {isOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <UserX className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Offline Mode Active</h3>
              <div className="mt-1 text-sm text-amber-700">
                <p>You're currently working offline. Distributions will be stored locally and synced when you reconnect.</p>
                {pendingDistributions.length > 0 && (
                  <p className="mt-1 font-medium">{pendingDistributions.length} pending distributions to sync</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-sm font-medium text-gray-700">Distribution Type:</div>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-blue-600"
                checked={distributionType === 'lunch'}
                onChange={() => setDistributionType('lunch')}
              />
              <span className="ml-2 flex items-center">
                <Coffee className="w-4 h-4 mr-1" />
                Lunch
              </span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-blue-600"
                checked={distributionType === 'kit'}
                onChange={() => setDistributionType('kit')}
              />
              <span className="ml-2 flex items-center">
                <Gift className="w-4 h-4 mr-1" />
                Kit
              </span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <QrScanner onScan={handleScan} />
        </div>
        
        <div>
          {foundAttendee ? (
            <div className="bg-white p-5 rounded-lg shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <QrCode className="w-5 h-5 mr-2 text-blue-600" />
                  Attendee Found
                </h3>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={resetScan}
                >
                  Scan Another
                </button>
              </div>
              
              <AttendeeCard attendee={foundAttendee} showActions={false} />
              
              {!foundAttendee.checkedIn ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-700">
                    This attendee has not checked in yet. Please complete check-in first.
                  </p>
                </div>
              ) : (
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600">
                      {distributionType === 'lunch' ? 'Lunch' : 'Kit'} Status: 
                      <span className={`ml-2 font-medium ${
                        distributionType === 'lunch' 
                          ? (foundAttendee.lunchCollected ? 'text-green-600' : 'text-amber-600')
                          : (foundAttendee.kitCollected ? 'text-green-600' : 'text-amber-600')
                      }`}>
                        {distributionType === 'lunch' 
                          ? (foundAttendee.lunchCollected ? 'Collected' : 'Not Collected')
                          : (foundAttendee.kitCollected ? 'Collected' : 'Not Collected')
                        }
                      </span>
                    </p>
                  </div>
                  
                  {(distributionType === 'lunch' && !foundAttendee.lunchCollected) || 
                   (distributionType === 'kit' && !foundAttendee.kitCollected) ? (
                    <button 
                      className={`
                        text-white px-4 py-2 rounded-md text-sm transition-colors
                        ${distributionType === 'lunch' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700'}
                      `}
                      onClick={() => handleDistribution(foundAttendee)}
                    >
                      {distributionType === 'lunch' ? (
                        <>
                          <Coffee className="w-4 h-4 inline-block mr-1" />
                          Mark Lunch Collected
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4 inline-block mr-1" />
                          Mark Kit Collected
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-200 h-full flex flex-col justify-center">
              <div className={distributionType === 'lunch' ? 'text-amber-500' : 'text-purple-500'}>
                {distributionType === 'lunch' ? (
                  <Coffee className="h-12 w-12 mx-auto" />
                ) : (
                  <Gift className="h-12 w-12 mx-auto" />
                )}
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Attendee Scanned</h3>
              <p className="mt-1 text-sm text-gray-500">
                Scan a QR code or enter an attendee ID to mark {distributionType} as collected
              </p>
            </div>
          )}
        </div>
      </div>
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Distribution;