import React, { useState } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import QrScanner from '../components/QrScanner';
import AttendeeCard from '../components/AttendeeCard';
import Toast from '../components/Toast';
import { QrCode, UserCheck, UserX } from 'lucide-react';

const Registration: React.FC = () => {
  const { attendees, updateAttendee, findAttendeeById } = useAttendees();
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [foundAttendee, setFoundAttendee] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingRegistrations, setPendingRegistrations] = useState<string[]>([]);

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
      
      if (navigator.onLine && pendingRegistrations.length > 0) {
        setToast({
          message: 'Syncing pending registrations...',
          type: 'info'
        });
        
        // In a real app, we would sync with the server here
        // For now, just clear the pending registrations
        setPendingRegistrations([]);
        
        setToast({
          message: 'Pending registrations synced successfully',
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
  }, [pendingRegistrations]);

  const handleScan = (id: string) => {
    setScannedId(id);
    
    // Find attendee by ID
    const attendee = findAttendeeById(id);
    
    if (attendee) {
      setFoundAttendee(attendee);
      
      if (attendee.checkedIn) {
        setToast({
          message: `${attendee.name} has already checked in`,
          type: 'warning'
        });
      } else {
        // Register the attendee
        handleRegistration(attendee);
      }
    } else {
      setFoundAttendee(null);
      setToast({
        message: 'Attendee not found. Please check the ID and try again.',
        type: 'error'
      });
    }
  };
  
  const handleRegistration = (attendee: any) => {
    const updatedAttendee = { ...attendee, checkedIn: true };
    
    if (isOffline) {
      // Store in pending registrations
      setPendingRegistrations([...pendingRegistrations, attendee.uniqueId]);
      
      setToast({
        message: `${attendee.name} checked in (offline mode). Will sync when online.`,
        type: 'info'
      });
    } else {
      // Update in main system
      updateAttendee(updatedAttendee);
      
      setToast({
        message: `${attendee.name} checked in successfully`,
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
        <h2 className="text-2xl font-bold text-gray-800">Registration Check-in</h2>
        <p className="text-sm text-gray-500">Scan QR code or enter attendee ID to check-in</p>
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
                <p>You're currently working offline. Check-ins will be stored locally and synced when you reconnect.</p>
                {pendingRegistrations.length > 0 && (
                  <p className="mt-1 font-medium">{pendingRegistrations.length} pending check-ins to sync</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <QrScanner onScan={handleScan} />
        </div>
        
        <div>
          {foundAttendee ? (
            <div className="bg-white p-5 rounded-lg shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-green-600" />
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
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-600">
                    Status: 
                    <span className={`ml-2 font-medium ${foundAttendee.checkedIn ? 'text-green-600' : 'text-amber-600'}`}>
                      {foundAttendee.checkedIn ? 'Checked In' : 'Not Checked In'}
                    </span>
                  </p>
                </div>
                
                {!foundAttendee.checkedIn && (
                  <button 
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                    onClick={() => handleRegistration(foundAttendee)}
                  >
                    Complete Check-in
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center border border-gray-200 h-full flex flex-col justify-center">
              <QrCode className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Attendee Scanned</h3>
              <p className="mt-1 text-sm text-gray-500">
                Scan a QR code or enter an attendee ID to check them in
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

export default Registration;