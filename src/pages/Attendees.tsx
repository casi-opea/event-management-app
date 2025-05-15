import React, { useState, useEffect } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import AttendeeCard from '../components/AttendeeCard';
import SearchBar from '../components/SearchBar';
import { Users, Filter, Download } from 'lucide-react';
import { Attendee } from '../types/Attendee';
import Toast from '../components/Toast';

const Attendees: React.FC = () => {
  const { attendees, updateAttendee } = useAttendees();
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>(attendees);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  
  useEffect(() => {
    applyFilters();
  }, [attendees, searchQuery, filterStatus]);
  
  const applyFilters = () => {
    let filtered = [...attendees];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        attendee => 
          attendee.name.toLowerCase().includes(query) || 
          attendee.email.toLowerCase().includes(query) ||
          attendee.uniqueId.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    switch (filterStatus) {
      case 'checked-in':
        filtered = filtered.filter(attendee => attendee.checkedIn);
        break;
      case 'not-checked-in':
        filtered = filtered.filter(attendee => !attendee.checkedIn);
        break;
      case 'lunch-collected':
        filtered = filtered.filter(attendee => attendee.lunchCollected);
        break;
      case 'kit-collected':
        filtered = filtered.filter(attendee => attendee.kitCollected);
        break;
      case 'all':
      default:
        // No filtering needed
        break;
    }
    
    setFilteredAttendees(filtered);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleAction = (action: 'check-in' | 'lunch' | 'kit', attendee: Attendee) => {
    const updatedAttendee = { ...attendee };
    
    switch (action) {
      case 'check-in':
        updatedAttendee.checkedIn = true;
        break;
      case 'lunch':
        if (!attendee.checkedIn) {
          setToast({ 
            message: 'Attendee must check in before collecting lunch', 
            type: 'warning' 
          });
          return;
        }
        updatedAttendee.lunchCollected = true;
        break;
      case 'kit':
        if (!attendee.checkedIn) {
          setToast({ 
            message: 'Attendee must check in before collecting kit', 
            type: 'warning' 
          });
          return;
        }
        updatedAttendee.kitCollected = true;
        break;
    }
    
    updateAttendee(updatedAttendee);
    
    setToast({ 
      message: `Successfully ${
        action === 'check-in' ? 'checked in' : 
        action === 'lunch' ? 'marked lunch collected for' : 
        'marked kit collected for'
      } ${attendee.name}`, 
      type: 'success' 
    });
  };
  
  const exportAttendeesCSV = () => {
    const headers = ['Name', 'Email', 'ID', 'Checked In', 'Lunch Collected', 'Kit Collected'];
    
    const csvRows = [
      headers.join(','),
      ...filteredAttendees.map(attendee => [
        attendee.name.replace(/,/g, ' '),
        attendee.email,
        attendee.uniqueId,
        attendee.checkedIn ? 'Yes' : 'No',
        attendee.lunchCollected ? 'Yes' : 'No',
        attendee.kitCollected ? 'Yes' : 'No'
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendees_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToast({ 
      message: 'Attendees data exported successfully', 
      type: 'success' 
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Attendees</h2>
          <p className="text-sm text-gray-500">
            {filteredAttendees.length} {filteredAttendees.length === 1 ? 'attendee' : 'attendees'} {filterStatus !== 'all' ? 'filtered' : ''}
          </p>
        </div>
        
        <button 
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={exportAttendeesCSV}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:flex-1">
          <SearchBar onSearch={handleSearch} placeholder="Search by name, email or ID..." />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Attendees</option>
            <option value="checked-in">Checked In</option>
            <option value="not-checked-in">Not Checked In</option>
            <option value="lunch-collected">Lunch Collected</option>
            <option value="kit-collected">Kit Collected</option>
          </select>
        </div>
      </div>
      
      {filteredAttendees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttendees.map((attendee) => (
            <AttendeeCard 
              key={attendee.uniqueId} 
              attendee={attendee} 
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No attendees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try changing your search or filter criteria'
              : 'Import attendees from a CSV file to get started'}
          </p>
        </div>
      )}
      
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

export default Attendees;