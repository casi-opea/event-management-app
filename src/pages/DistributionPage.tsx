import React, { useState, useEffect } from 'react';
import { Search, Camera, Package, AlertTriangle, CheckSquare, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { useAttendees } from '../contexts/AttendeeContext';
import { Attendee } from '../types';
import { formatDate } from '../utils/dateUtils';

const DistributionPage: React.FC = () => {
  const { attendees, distributeLunch, distributeKit } = useAttendees();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Attendee[]>([]);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [distributionMode, setDistributionMode] = useState<'lunch' | 'kit'>('lunch');
  
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
      const result = distributionMode === 'lunch' 
        ? await distributeLunch(decodedText)
        : await distributeKit(decodedText);
      
      if (result) {
        setSelectedAttendee(result);
      }
    } catch (error) {
      console.error('Error processing distribution:', error);
      toast.error(`Failed to process ${distributionMode} distribution`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onScanFailure = (error: any) => {
    // Handled silently to avoid too many alerts
    console.error('QR scan error:', error);
  };
  
  const handleDistribution = async (attendee: Attendee) => {
    try {
      setIsSubmitting(true);
      const result = distributionMode === 'lunch' 
        ? await distributeLunch(attendee.uniqueId)
        : await distributeKit(attendee.uniqueId);
      
      // Refresh the attendee data to show the updated status
      if (result) {
        setSelectedAttendee(result);
      }
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error processing distribution:', error);
      toast.error(`Failed to process ${distributionMode} distribution`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const clearSelectedAttendee = () => {
    setSelectedAttendee(null);
  };
  
  const toggleDistributionMode = () => {
    setDistributionMode(prev => prev === 'lunch' ? 'kit' : 'lunch');
  };
  
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Distribution</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage lunch and event kit distribution
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Search & QR Scanner */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Distribution Tool</h2>
              
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Mode:</span>
                <button
                  onClick={toggleDistributionMode}
                  className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  style={{
                    backgroundColor: distributionMode === 'lunch' 
                      ? 'rgb(255, 247, 237)' /* accent-50 */ 
                      : 'rgb(240, 253, 250)' /* secondary-50 */,
                    borderColor: distributionMode === 'lunch' 
                      ? 'rgb(253, 186, 116)' /* accent-300 */ 
                      : 'rgb(94, 234, 212)' /* secondary-300 */,
                    color: distributionMode === 'lunch' 
                      ? 'rgb(194, 65, 12)' /* accent-700 */ 
                      : 'rgb(15, 118, 110)' /* secondary-700 */
                  }}
                >
                  {distributionMode === 'lunch' ? 'Lunch Distribution' : 'Kit Distribution'}
                </button>
              </div>
            </div>
            
            {/* Manual Search */}
            <div className="mb-6">
              <label htmlFor="distribution-search" className="block text-sm font-medium text-gray-700 mb-1">
                Search by name, email, or ID
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="distribution-search"
                  id="distribution-search"
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
                          onClick={() => handleDistribution(attendee)}
                          disabled={isSubmitting || !attendee.isRegistered}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                            !attendee.isRegistered 
                              ? 'bg-gray-100 cursor-not-allowed' 
                              : distributionMode === 'lunch' && attendee.hasCollectedLunch 
                                ? 'bg-accent-50' 
                                : distributionMode === 'kit' && attendee.hasCollectedKit 
                                  ? 'bg-secondary-50' 
                                  : ''
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attendee.name}</p>
                              <p className="text-sm text-gray-500">{attendee.email}</p>
                              
                              {!attendee.isRegistered && (
                                <p className="text-xs text-warning-600 mt-1">
                                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                                  Not checked in
                                </p>
                              )}
                            </div>
                            <div>
                              {distributionMode === 'lunch' ? (
                                <span 
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    attendee.hasCollectedLunch 
                                      ? 'bg-accent-100 text-accent-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {attendee.hasCollectedLunch ? 'Lunch Collected' : 'No Lunch'}
                                </span>
                              ) : (
                                <span 
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    attendee.hasCollectedKit 
                                      ? 'bg-secondary-100 text-secondary-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {attendee.hasCollectedKit ? 'Kit Collected' : 'No Kit'}
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
        
        {/* Right Column - Current Distribution Status */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Distribution Status</h2>
            
            {selectedAttendee ? (
              <div 
                className={`p-4 rounded-lg border ${
                  distributionMode === 'lunch' 
                    ? 'bg-accent-50 border-accent-200' 
                    : 'bg-secondary-50 border-secondary-200'
                }`}
              >
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
                
                {!selectedAttendee.isRegistered && (
                  <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-md flex items-start">
                    <AlertTriangle className="w-5 h-5 text-warning-500 mr-2 flex-shrink-0" />
                    <div className="text-sm text-warning-700">
                      <p className="font-medium">This attendee has not checked in yet</p>
                      <p>The attendee must be checked in before collecting lunch or event kits.</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  {distributionMode === 'lunch' ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Lunch Status</h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedAttendee.hasCollectedLunch
                              ? 'bg-accent-100 text-accent-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {selectedAttendee.hasCollectedLunch ? 'Collected' : 'Not Collected'}
                        </span>
                      </div>
                      
                      {selectedAttendee.hasCollectedLunch ? (
                        <div className="mt-2 flex items-center py-2 text-sm">
                          <CheckSquare className="w-5 h-5 text-accent-500 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">Lunch successfully collected</p>
                            <p className="text-gray-500">
                              {formatDate(selectedAttendee.lunchCollectionTime)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <div className="flex items-start py-2 text-sm">
                            <Package className="w-5 h-5 text-accent-500 mr-2 flex-shrink-0" />
                            <p className="text-gray-700">
                              This attendee has not collected their lunch yet.
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleDistribution(selectedAttendee)}
                            disabled={isSubmitting || !selectedAttendee.isRegistered}
                            className={`mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                              ${
                                !selectedAttendee.isRegistered
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-accent-600 hover:bg-accent-700 focus:ring-accent-500'
                              }
                            `}
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
                                <Package className="w-4 h-4 mr-2" />
                                Provide Lunch
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Event Kit Status</h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedAttendee.hasCollectedKit
                              ? 'bg-secondary-100 text-secondary-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {selectedAttendee.hasCollectedKit ? 'Collected' : 'Not Collected'}
                        </span>
                      </div>
                      
                      {selectedAttendee.hasCollectedKit ? (
                        <div className="mt-2 flex items-center py-2 text-sm">
                          <CheckSquare className="w-5 h-5 text-secondary-500 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">Kit successfully collected</p>
                            <p className="text-gray-500">
                              {formatDate(selectedAttendee.kitCollectionTime)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <div className="flex items-start py-2 text-sm">
                            <Package className="w-5 h-5 text-secondary-500 mr-2 flex-shrink-0" />
                            <p className="text-gray-700">
                              This attendee has not collected their event kit yet.
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleDistribution(selectedAttendee)}
                            disabled={isSubmitting || !selectedAttendee.isRegistered}
                            className={`mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                              ${
                                !selectedAttendee.isRegistered
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-secondary-600 hover:bg-secondary-700 focus:ring-secondary-500'
                              }
                            `}
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
                                <Package className="w-4 h-4 mr-2" />
                                Provide Event Kit
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <Package className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No attendee selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Search for an attendee or scan a QR code to manage distribution.
                </p>
                <div 
                  className={`mt-4 p-3 rounded-md text-sm ${
                    distributionMode === 'lunch' 
                      ? 'bg-accent-50 text-accent-800' 
                      : 'bg-secondary-50 text-secondary-800'
                  }`}
                >
                  <p className="font-medium">
                    {distributionMode === 'lunch' 
                      ? 'Currently in Lunch Distribution mode' 
                      : 'Currently in Kit Distribution mode'
                    }
                  </p>
                  <p className="mt-1 text-xs">
                    Use the toggle at the top to switch modes
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionPage;