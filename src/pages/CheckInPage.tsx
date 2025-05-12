import React, { useState, useEffect } from 'react';
import { Search, Camera, UserCheck, AlertTriangle, CheckSquare, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { useAttendees } from '../contexts/AttendeeContext';
import { Attendee } from '../types';
import { formatDate } from '../utils/dateUtils';

const CheckInPage: React.FC = () => {
  const { attendees, registerAttendee } = useAttendees();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Attendee[]>([]);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = attendees.filter(
      (attendee) =>
        attendee.name.toLowerCase().includes(query) ||
        attendee.email.toLowerCase().includes(query) ||
        (attendee.phone && attendee.phone.includes(query)) ||
        attendee.uniqueId.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  }, [searchQuery, attendees]);
  
  // Initialize QR scanner
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    if (isScannerActive) {
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scanner.render(onScanSuccess, onScanFailure);
    }
    
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [isScannerActive]);
  
  const onScanSuccess = async (decodedText: string) => {
    // Stop scanner after successful scan
    setIsScannerActive(false);
    
    // Process the scan result
    try {
      setIsSubmitting(true);
      const result = await registerAttendee(decodedText);
      if (result) {
        setSelectedAttendee(result);
      }
    } catch (error) {
      console.error('Error registering attendee:', error);
      toast.error('Failed to register attendee');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onScanFailure = (error: any) => {
    // Handled silently to avoid too many alerts
    console.error('QR scan error:', error);
  };
  
  const handleManualCheckIn = async (attendee: Attendee) => {
    try {
      setIsSubmitting(true);
      await registerAttendee(attendee.uniqueId);
      // Refresh the attendee data to show the updated status
      setSelectedAttendee(attendee);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error registering attendee:', error);
      toast.error('Failed to register attendee');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const clearSelectedAttendee = () => {
    setSelectedAttendee(null);
  };
  
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Check-In</h1>
        <p className="mt-1 text-sm text-gray-500">
          Scan QR codes or search to check in attendees
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Search & QR Scanner */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Check-In Methods</h2>
            
            {/* Manual Search */}
            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search by name, email, or ID
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Start typing to search..."
                />
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md shadow-sm overflow-hidden max-h-64 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {searchResults.map((attendee) => (
                      <li key={attendee.id}>
                        <button
                          onClick={() => handleManualCheckIn(attendee)}
                          disabled={isSubmitting}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                            attendee.isRegistered ? 'bg-gray-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attendee.name}</p>
                              <p className="text-sm text-gray-500">{attendee.email}</p>
                              {attendee.company && (
                                <p className="text-xs text-gray-500">{attendee.company}</p>
                              )}
                            </div>
                            <div>
                              {attendee.isRegistered ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                                  <CheckSquare className="w-3 h-3 mr-1" />
                                  Checked In
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Not Checked In
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {searchQuery && searchResults.length === 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  No attendees found for "{searchQuery}"
                </div>
              )}
            </div>
            
            {/* QR Scanner */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">QR Code Scanner</h3>
                <button
                  onClick={() => setIsScannerActive(!isScannerActive)}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${
                    isScannerActive
                      ? 'bg-error-100 text-error-700 hover:bg-error-200'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  {isScannerActive ? (
                    <>
                      <X className="w-3.5 h-3.5 mr-1" />
                      Stop Scanner
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5 mr-1" />
                      Start Scanner
                    </>
                  )}
                </button>
              </div>
              
              {isScannerActive ? (
                <div className="border rounded-md p-4 bg-gray-50">
                  <div id="qr-reader" className="w-full max-w-sm mx-auto"></div>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Position the QR code within the box
                  </p>
                </div>
              ) : (
                <div className="border border-dashed rounded-md p-6 bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Click "Start Scanner" to activate the camera
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - Current Check-In / Status */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Check-In Status</h2>
            
            {selectedAttendee ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-900">{selectedAttendee.name}</h3>
                  <button
                    onClick={clearSelectedAttendee}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedAttendee.email}</p>
                  </div>
                  
                  {selectedAttendee.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedAttendee.phone}</p>
                    </div>
                  )}
                  
                  {selectedAttendee.company && (
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">{selectedAttendee.company}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Unique ID</p>
                    <p className="font-mono text-sm">{selectedAttendee.uniqueId}</p>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Registration Status</h4>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedAttendee.isRegistered
                          ? 'bg-success-100 text-success-800'
                          : 'bg-warning-100 text-warning-800'
                      }`}
                    >
                      {selectedAttendee.isRegistered ? 'Checked In' : 'Not Checked In'}
                    </span>
                  </div>
                  
                  {selectedAttendee.isRegistered ? (
                    <div className="mt-2">
                      <div className="flex items-center py-2 text-sm">
                        <UserCheck className="w-5 h-5 text-success-500 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">Successfully checked in</p>
                          <p className="text-gray-500">
                            {formatDate(selectedAttendee.registrationTime)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex space-x-2">
                        <div
                          className={`flex-1 p-3 rounded-md ${
                            selectedAttendee.hasCollectedLunch
                              ? 'bg-accent-50 border border-accent-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">Lunch Status</p>
                          <p
                            className={`text-sm ${
                              selectedAttendee.hasCollectedLunch
                                ? 'text-accent-800'
                                : 'text-gray-500'
                            }`}
                          >
                            {selectedAttendee.hasCollectedLunch
                              ? 'Collected'
                              : 'Not Collected'}
                          </p>
                        </div>
                        
                        <div
                          className={`flex-1 p-3 rounded-md ${
                            selectedAttendee.hasCollectedKit
                              ? 'bg-secondary-50 border border-secondary-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">Kit Status</p>
                          <p
                            className={`text-sm ${
                              selectedAttendee.hasCollectedKit
                                ? 'text-secondary-800'
                                : 'text-gray-500'
                            }`}
                          >
                            {selectedAttendee.hasCollectedKit
                              ? 'Collected'
                              : 'Not Collected'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="flex items-start py-2 text-sm">
                        <AlertTriangle className="w-5 h-5 text-warning-500 mr-2 flex-shrink-0" />
                        <p className="text-gray-700">
                          This attendee has not been checked in yet. Use the QR scanner or click
                          the button below to check them in.
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleManualCheckIn(selectedAttendee)}
                        disabled={isSubmitting}
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Check In Attendee
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <UserCheck className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No attendee selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Search for an attendee or scan a QR code to check them in.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;