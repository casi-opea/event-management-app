import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Filter, CheckSquare, X } from 'lucide-react';
import { useAttendees } from '../contexts/AttendeeContext';
import { downloadAttendeesAsCSV } from '../utils/csvUtils';
import { formatDate } from '../utils/dateUtils';
import QRCode from 'qrcode.react';

const AttendeesPage: React.FC = () => {
  const { attendees, searchAttendees } = useAttendees();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAttendees, setFilteredAttendees] = useState(attendees);
  const [filters, setFilters] = useState({
    registered: false,
    notRegistered: false,
    collectedLunch: false,
    notCollectedLunch: false,
    collectedKit: false,
    notCollectedKit: false,
  });
  const [showQR, setShowQR] = useState<string | null>(null);
  
  useEffect(() => {
    // First apply text search
    let results = searchAttendees(searchQuery);
    
    // Then apply filters
    if (filters.registered) {
      results = results.filter(a => a.isRegistered);
    }
    if (filters.notRegistered) {
      results = results.filter(a => !a.isRegistered);
    }
    if (filters.collectedLunch) {
      results = results.filter(a => a.hasCollectedLunch);
    }
    if (filters.notCollectedLunch) {
      results = results.filter(a => !a.hasCollectedLunch);
    }
    if (filters.collectedKit) {
      results = results.filter(a => a.hasCollectedKit);
    }
    if (filters.notCollectedKit) {
      results = results.filter(a => !a.hasCollectedKit);
    }
    
    setFilteredAttendees(results);
  }, [searchQuery, attendees, filters, searchAttendees]);
  
  const handleFilterChange = (filter: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      registered: false,
      notRegistered: false,
      collectedLunch: false,
      notCollectedLunch: false,
      collectedKit: false,
      notCollectedKit: false,
    });
    setSearchQuery('');
  };
  
  const exportAttendees = () => {
    downloadAttendeesAsCSV(filteredAttendees);
  };
  
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Attendees</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and view attendee information
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <button
              onClick={exportAttendees}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <Link
              to="/import"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Attendees
            </Link>
          </div>
        </div>
      </header>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <div className="relative max-w-lg w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search attendees..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 hidden sm:inline">Filters:</span>
              
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="ml-2 text-sm text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </button>
              )}
              
              <div className="ml-2 flex items-center space-x-2">
                <button
                  onClick={() => handleFilterChange('registered')}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    filters.registered
                      ? 'bg-success-100 text-success-800 hover:bg-success-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Registered
                </button>
                <button
                  onClick={() => handleFilterChange('notRegistered')}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    filters.notRegistered
                      ? 'bg-warning-100 text-warning-800 hover:bg-warning-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Not Registered
                </button>
                <button
                  onClick={() => handleFilterChange('collectedLunch')}
                  className={`px-2 py-1 rounded-md text-xs font-medium hidden md:inline-block ${
                    filters.collectedLunch
                      ? 'bg-success-100 text-success-800 hover:bg-success-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Collected Lunch
                </button>
                <button
                  onClick={() => handleFilterChange('collectedKit')}
                  className={`px-2 py-1 rounded-md text-xs font-medium hidden md:inline-block ${
                    filters.collectedKit
                      ? 'bg-success-100 text-success-800 hover:bg-success-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Collected Kit
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Attendees Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Attendee
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                >
                  Registration
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                >
                  Unique ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  QR Code
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {attendees.length === 0 ? (
                      <div className="flex flex-col items-center">
                        <CheckSquare className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-600 text-lg font-medium mb-1">No attendees yet</p>
                        <p className="text-gray-500 text-sm mb-4">Import attendees to get started</p>
                        <Link
                          to="/import"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                          Import Attendees
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Search className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-600 text-lg font-medium mb-1">No results found</p>
                        <p className="text-gray-500 text-sm mb-4">Try changing your search or filters</p>
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((attendee) => (
                  <tr key={attendee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                          <div className="text-sm text-gray-500">{attendee.email}</div>
                          {attendee.company && (
                            <div className="text-sm text-gray-500">{attendee.company}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            attendee.isRegistered
                              ? 'bg-success-100 text-success-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {attendee.isRegistered ? 'Checked In' : 'Not Checked In'}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            attendee.hasCollectedLunch
                              ? 'bg-accent-100 text-accent-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {attendee.hasCollectedLunch ? 'Lunch Collected' : 'No Lunch'}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            attendee.hasCollectedKit
                              ? 'bg-secondary-100 text-secondary-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {attendee.hasCollectedKit ? 'Kit Collected' : 'No Kit'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {attendee.isRegistered ? formatDate(attendee.registrationTime) : 'Not registered'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      <span className="font-mono">{attendee.uniqueId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setShowQR(attendee.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View QR
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination can be added here if needed */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredAttendees.length}</span> attendees
              {activeFiltersCount > 0 && (
                <span> (filtered from <span className="font-medium">{attendees.length}</span>)</span>
              )}
            </p>
          </div>
        </div>
      </div>
      
      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
                  <CheckSquare className="h-6 w-6 text-primary-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Attendee QR Code
                  </h3>
                  
                  {attendees.find(a => a.id === showQR) && (
                    <div className="mt-4">
                      <div className="mx-auto w-48 h-48 flex items-center justify-center bg-white p-2 rounded-lg shadow-inner">
                        <QRCode 
                          value={attendees.find(a => a.id === showQR)?.qrCodeData || ''}
                          size={172}
                          bgColor={"#ffffff"}
                          fgColor={"#000000"}
                          level={"L"}
                          includeMargin={false}
                        />
                      </div>
                      <p className="mt-3 text-sm text-gray-500">
                        ID: <span className="font-mono">{attendees.find(a => a.id === showQR)?.uniqueId}</span>
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {attendees.find(a => a.id === showQR)?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={() => setShowQR(null)}
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeesPage;