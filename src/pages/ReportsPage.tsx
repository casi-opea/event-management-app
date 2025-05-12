import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DownloadCloud, Calendar, Users, Package, FileSpreadsheet } from 'lucide-react';
import { CSVLink } from 'react-csv';
import { useAttendees } from '../contexts/AttendeeContext';
import { calculateStats } from '../utils/statsUtils';
import { formatDate } from '../utils/dateUtils';

const ReportsPage: React.FC = () => {
  const { attendees, eventSettings } = useAttendees();
  const [stats, setStats] = useState({
    totalAttendees: 0,
    registeredAttendees: 0,
    lunchDistributed: 0,
    kitDistributed: 0,
    registrationRate: 0,
    dailyAttendance: {} as Record<string, number>
  });
  
  // Additional metrics
  const [registrationByTime, setRegistrationByTime] = useState<any[]>([]);
  const [lunchDistributionByTime, setLunchDistributionByTime] = useState<any[]>([]);
  const [companyDistribution, setCompanyDistribution] = useState<any[]>([]);
  
  useEffect(() => {
    setStats(calculateStats(attendees));
    
    // Process registration by time of day
    const registrationHours: Record<string, number> = {};
    attendees.forEach(attendee => {
      if (attendee.registrationTime) {
        const hour = new Date(attendee.registrationTime).getHours();
        const timeSlot = `${hour}:00`;
        registrationHours[timeSlot] = (registrationHours[timeSlot] || 0) + 1;
      }
    });
    
    const registrationTimeData = Object.entries(registrationHours)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => {
        const hourA = parseInt(a.time.split(':')[0]);
        const hourB = parseInt(b.time.split(':')[0]);
        return hourA - hourB;
      });
    
    setRegistrationByTime(registrationTimeData);
    
    // Process lunch distribution by time
    const lunchHours: Record<string, number> = {};
    attendees.forEach(attendee => {
      if (attendee.lunchCollectionTime) {
        const hour = new Date(attendee.lunchCollectionTime).getHours();
        const timeSlot = `${hour}:00`;
        lunchHours[timeSlot] = (lunchHours[timeSlot] || 0) + 1;
      }
    });
    
    const lunchTimeData = Object.entries(lunchHours)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => {
        const hourA = parseInt(a.time.split(':')[0]);
        const hourB = parseInt(b.time.split(':')[0]);
        return hourA - hourB;
      });
    
    setLunchDistributionByTime(lunchTimeData);
    
    // Process company distribution
    const companies: Record<string, number> = {};
    attendees.forEach(attendee => {
      const company = attendee.company || 'Not Specified';
      companies[company] = (companies[company] || 0) + 1;
    });
    
    // Convert to array and sort by count
    const companyData = Object.entries(companies)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 companies
    
    setCompanyDistribution(companyData);
  }, [attendees]);
  
  // Prepare CSV data for export
  const csvData = attendees.map(attendee => ({
    Name: attendee.name,
    Email: attendee.email,
    Phone: attendee.phone || '',
    Company: attendee.company || '',
    UniqueID: attendee.uniqueId,
    CheckedIn: attendee.isRegistered ? 'Yes' : 'No',
    CheckInTime: attendee.registrationTime ? formatDate(attendee.registrationTime) : '',
    LunchCollected: attendee.hasCollectedLunch ? 'Yes' : 'No',
    LunchCollectionTime: attendee.lunchCollectionTime ? formatDate(attendee.lunchCollectionTime) : '',
    KitCollected: attendee.hasCollectedKit ? 'Yes' : 'No',
    KitCollectionTime: attendee.kitCollectionTime ? formatDate(attendee.kitCollectionTime) : '',
    ...Object.entries(attendee.attendance).reduce((acc, [date, attended]) => {
      acc[`Attendance_${date}`] = attended ? 'Present' : 'Absent';
      return acc;
    }, {} as Record<string, string>)
  }));
  
  // Colors for charts
  const COLORS = ['#6366f1', '#14b8a6', '#f97316', '#ef4444', '#f59e0b', '#22c55e', '#ec4899', '#8b5cf6'];
  
  // Calculate additional metrics
  const noShowRate = stats.totalAttendees > 0 
    ? ((stats.totalAttendees - stats.registeredAttendees) / stats.totalAttendees) * 100 
    : 0;
    
  const lunchCollectionRate = stats.registeredAttendees > 0 
    ? (stats.lunchDistributed / stats.registeredAttendees) * 100 
    : 0;
    
  const kitCollectionRate = stats.registeredAttendees > 0 
    ? (stats.kitDistributed / stats.registeredAttendees) * 100 
    : 0;
  
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Event Reports</h1>
            <p className="mt-1 text-sm text-gray-500">
              Analytics and insights for {eventSettings.name}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <CSVLink 
              data={csvData}
              filename={`${eventSettings.name.replace(/\s+/g, '_')}_report.csv`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <DownloadCloud className="w-4 h-4 mr-2" />
              Export Full Report
            </CSVLink>
          </div>
        </div>
      </header>
      
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h2>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Check-in Rate</h3>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">
                        {stats.registrationRate.toFixed(1)}%
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({stats.registeredAttendees}/{stats.totalAttendees})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${stats.registrationRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-warning-100 rounded-md p-3">
                    <Users className="h-6 w-6 text-warning-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">No-Show Rate</h3>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">
                        {noShowRate.toFixed(1)}%
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({stats.totalAttendees - stats.registeredAttendees}/{stats.totalAttendees})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-warning-500 h-2 rounded-full"
                      style={{ width: `${noShowRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-accent-100 rounded-md p-3">
                    <Package className="h-6 w-6 text-accent-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Lunch Collection</h3>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">
                        {lunchCollectionRate.toFixed(1)}%
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({stats.lunchDistributed}/{stats.registeredAttendees})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-accent-500 h-2 rounded-full"
                      style={{ width: `${lunchCollectionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                    <Package className="h-6 w-6 text-secondary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Kit Collection</h3>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">
                        {kitCollectionRate.toFixed(1)}%
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({stats.kitDistributed}/{stats.registeredAttendees})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-secondary-500 h-2 rounded-full"
                      style={{ width: `${kitCollectionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Attendance Chart */}
        {eventSettings.isMultiDay && Object.keys(stats.dailyAttendance).length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Attendance</h2>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(stats.dailyAttendance).map(([date, count]) => ({
                      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                      attendees: count,
                      expectedAttendees: stats.totalAttendees,
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Actual Attendance" dataKey="attendees" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar name="Expected Attendance" dataKey="expectedAttendees" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 flex justify-center">
                <div className="inline-flex items-center text-xs text-gray-500">
                  <Calendar className="w-4 h-4 mr-1 text-primary-500" />
                  {eventSettings.isMultiDay 
                    ? `${Object.keys(stats.dailyAttendance).length} days from ${new Date(eventSettings.startDate).toLocaleDateString()} to ${new Date(eventSettings.endDate).toLocaleDateString()}`
                    : `Single-day event on ${new Date(eventSettings.startDate).toLocaleDateString()}`
                  }
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Distribution Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Registration Time Distribution</h2>
              
              {registrationByTime.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={registrationByTime}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar name="Registrations" dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <FileSpreadsheet className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No registration data available yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Lunch Distribution Time</h2>
              
              {lunchDistributionByTime.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={lunchDistributionByTime}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar name="Lunch Collections" dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <FileSpreadsheet className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No lunch distribution data available yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Company Distribution */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Top Companies Representation</h2>
            
            {companyDistribution.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={companyDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {companyDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="overflow-y-auto h-64">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {companyDistribution.map((company, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{company.count}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                            {((company.count / stats.totalAttendees) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <FileSpreadsheet className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No company data available yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Summary */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Event Summary</h2>
            
            <div className="prose prose-sm max-w-none text-gray-500">
              <p>
                <strong className="text-gray-900">{eventSettings.name}</strong> was
                {eventSettings.isMultiDay ? ` a multi-day event from ${new Date(eventSettings.startDate).toLocaleDateString()} to ${new Date(eventSettings.endDate).toLocaleDateString()}` : ` held on ${new Date(eventSettings.startDate).toLocaleDateString()}`} at <strong className="text-gray-900">{eventSettings.venue}</strong>.
              </p>
              
              <p className="mt-2">
                A total of <strong className="text-gray-900">{stats.totalAttendees}</strong> attendees were registered for the event,
                of which <strong className="text-gray-900">{stats.registeredAttendees}</strong> ({stats.registrationRate.toFixed(1)}%) checked in.
                {stats.totalAttendees - stats.registeredAttendees > 0 && (
                  <span> Unfortunately, <strong className="text-gray-900">{stats.totalAttendees - stats.registeredAttendees}</strong> ({noShowRate.toFixed(1)}%) registered attendees did not show up.</span>
                )}
              </p>
              
              <p className="mt-2">
                Of the checked-in attendees, <strong className="text-gray-900">{stats.lunchDistributed}</strong> ({lunchCollectionRate.toFixed(1)}%) collected their lunch and
                <strong className="text-gray-900"> {stats.kitDistributed}</strong> ({kitCollectionRate.toFixed(1)}%) collected their event kit.
              </p>
              
              {companyDistribution.length > 0 && (
                <p className="mt-2">
                  The most represented company was <strong className="text-gray-900">{companyDistribution[0].name}</strong> with <strong className="text-gray-900">{companyDistribution[0].count}</strong> attendees
                  ({((companyDistribution[0].count / stats.totalAttendees) * 100).toFixed(1)}% of total).
                </p>
              )}
              
              {eventSettings.isMultiDay && Object.keys(stats.dailyAttendance).length > 0 && (
                <p className="mt-2">
                  The day with the highest attendance was <strong className="text-gray-900">
                    {Object.entries(stats.dailyAttendance)
                      .sort((a, b) => b[1] - a[1])[0][0]
                      .split('T')[0]
                      .split('-')
                      .reverse()
                      .join('/')}
                  </strong> with <strong className="text-gray-900">
                    {Object.entries(stats.dailyAttendance).sort((a, b) => b[1] - a[1])[0][1]}
                  </strong> attendees.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;