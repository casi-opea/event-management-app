import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, CheckSquare, Package, Calendar, ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAttendees } from '../contexts/AttendeeContext';
import { calculateStats } from '../utils/statsUtils';
import StatCard from '../components/StatCard';

const Dashboard: React.FC = () => {
  const { attendees, eventSettings } = useAttendees();
  const [stats, setStats] = useState({
    totalAttendees: 0,
    registeredAttendees: 0,
    lunchDistributed: 0,
    kitDistributed: 0,
    registrationRate: 0,
    dailyAttendance: {} as Record<string, number>
  });
  
  useEffect(() => {
    setStats(calculateStats(attendees));
  }, [attendees]);
  
  // Convert attendance data to chart format
  const attendanceData = Object.entries(stats.dailyAttendance).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    attendees: count
  }));
  
  // Calculate remaining tasks
  const remainingRegistrations = stats.totalAttendees - stats.registeredAttendees;
  const remainingLunch = stats.registeredAttendees - stats.lunchDistributed;
  const remainingKits = stats.registeredAttendees - stats.kitDistributed;
  
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview and statistics for {eventSettings.name}
        </p>
      </header>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Attendees" 
          value={stats.totalAttendees} 
          icon={Users} 
          color="primary" 
        />
        <StatCard 
          title="Checked In" 
          value={stats.registeredAttendees} 
          icon={CheckSquare} 
          color="success" 
          percentage={stats.registrationRate}
        />
        <StatCard 
          title="Lunch Collected" 
          value={stats.lunchDistributed} 
          icon={Package} 
          color="accent" 
          percentage={stats.totalAttendees > 0 ? (stats.lunchDistributed / stats.totalAttendees) * 100 : 0}
        />
        <StatCard 
          title="Kits Distributed" 
          value={stats.kitDistributed} 
          icon={Package} 
          color="secondary" 
          percentage={stats.totalAttendees > 0 ? (stats.kitDistributed / stats.totalAttendees) * 100 : 0}
        />
      </div>
      
      {eventSettings.isMultiDay && attendanceData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendees" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/checkin" 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-primary-600" />
                </div>
                <span className="ml-3 font-medium">Check In Attendees</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link 
              to="/distribution" 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-accent-600" />
                </div>
                <span className="ml-3 font-medium">Distribute Lunch & Kits</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link 
              to="/import" 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-secondary-600" />
                </div>
                <span className="ml-3 font-medium">Import Attendees</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
        
        {/* Remaining Tasks */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Remaining Tasks</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Registrations</span>
                <span className="text-sm text-gray-500">{stats.registeredAttendees}/{stats.totalAttendees}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full" 
                  style={{ width: `${stats.totalAttendees > 0 ? (stats.registeredAttendees / stats.totalAttendees) * 100 : 0}%` }}
                ></div>
              </div>
              {remainingRegistrations > 0 && (
                <p className="text-xs text-gray-500 mt-1">{remainingRegistrations} attendees still need to check in</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Lunch Distribution</span>
                <span className="text-sm text-gray-500">{stats.lunchDistributed}/{stats.registeredAttendees}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-accent-500 h-2 rounded-full" 
                  style={{ width: `${stats.registeredAttendees > 0 ? (stats.lunchDistributed / stats.registeredAttendees) * 100 : 0}%` }}
                ></div>
              </div>
              {remainingLunch > 0 && (
                <p className="text-xs text-gray-500 mt-1">{remainingLunch} attendees haven't collected lunch</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Kit Distribution</span>
                <span className="text-sm text-gray-500">{stats.kitDistributed}/{stats.registeredAttendees}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-secondary-500 h-2 rounded-full" 
                  style={{ width: `${stats.registeredAttendees > 0 ? (stats.kitDistributed / stats.registeredAttendees) * 100 : 0}%` }}
                ></div>
              </div>
              {remainingKits > 0 && (
                <p className="text-xs text-gray-500 mt-1">{remainingKits} attendees haven't collected kits</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Event Information */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h2>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Event Name</h3>
              <p className="font-medium">{eventSettings.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p className="font-medium">
                {new Date(eventSettings.startDate).toLocaleDateString()}
                {eventSettings.isMultiDay && ` - ${new Date(eventSettings.endDate).toLocaleDateString()}`}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Venue</h3>
              <p className="font-medium">{eventSettings.venue}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Organizer</h3>
              <p className="font-medium">{eventSettings.organizerName || 'Not set'}</p>
              {eventSettings.organizerEmail && (
                <p className="text-sm text-gray-500">{eventSettings.organizerEmail}</p>
              )}
            </div>
            
            <Link 
              to="/settings" 
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 mt-2"
            >
              <span>Edit event details</span>
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;