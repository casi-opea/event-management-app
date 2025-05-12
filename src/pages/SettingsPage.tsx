import React, { useState, useEffect } from 'react';
import { Save, Calendar, MapPin, Users, Building, AlertTriangle, Archive } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAttendees } from '../contexts/AttendeeContext';
import { EventSettings, ArchivedEvent } from '../types';
import { getDaysBetweenDates } from '../utils/dateUtils';
import { calculateStats } from '../utils/statsUtils';
import { downloadAttendeesAsCSV } from '../utils/csvUtils';
import localforage from 'localforage';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventSettings, updateEventSettings, attendees } = useAttendees();
  const [tempSettings, setTempSettings] = useState<EventSettings>(eventSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEndingEvent, setIsEndingEvent] = useState(false);
  
  useEffect(() => {
    setTempSettings(eventSettings);
  }, [eventSettings]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTempSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tempSettings.isMultiDay && new Date(tempSettings.endDate) < new Date(tempSettings.startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let updatedSettings = { ...tempSettings };
      
      if (tempSettings.isMultiDay) {
        updatedSettings.days = getDaysBetweenDates(tempSettings.startDate, tempSettings.endDate);
      } else {
        updatedSettings.days = [tempSettings.startDate];
        updatedSettings.endDate = tempSettings.startDate;
      }
      
      await updateEventSettings(updatedSettings);
      toast.success('Event settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndEvent = async () => {
    setIsEndingEvent(true);
    try {
      // Generate final CSV data
      const csvData = await downloadAttendeesAsCSV(attendees, false);
      
      // Create archive entry
      const archivedEvent: ArchivedEvent = {
        id: crypto.randomUUID(),
        settings: eventSettings,
        stats: calculateStats(attendees),
        endDate: new Date().toISOString(),
        csvData
      };

      // Load existing archived events
      const existingEvents = await localforage.getItem<ArchivedEvent[]>('archivedEvents') || [];
      
      // Add new event to archive
      await localforage.setItem('archivedEvents', [...existingEvents, archivedEvent]);
      
      // Clear current event data
      await localforage.setItem('attendees', []);
      await localforage.setItem('eventSettings', {
        name: 'New Event',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        isMultiDay: false,
        days: [new Date().toISOString().split('T')[0]],
        venue: '',
        organizerName: '',
        organizerEmail: '',
        organizerPhone: '',
      });

      toast.success('Event archived successfully');
      navigate('/archived');
    } catch (error) {
      console.error('Error ending event:', error);
      toast.error('Failed to end event');
    } finally {
      setIsEndingEvent(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure your event details and preferences
            </p>
          </div>
          <button
            onClick={handleEndEvent}
            disabled={isEndingEvent}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-error-600 hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
          >
            {isEndingEvent ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ending Event...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 mr-2" />
                End Event
              </>
            )}
          </button>
        </div>
      </header>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Event Configuration</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Event Name */}
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Event Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={tempSettings.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              {/* Multi-day Event Toggle */}
              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    id="isMultiDay"
                    name="isMultiDay"
                    type="checkbox"
                    checked={tempSettings.isMultiDay}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isMultiDay" className="ml-2 block text-sm text-gray-900">
                    Multi-day event
                  </label>
                </div>
              </div>
              
              {/* Event Dates */}
              <div className="sm:col-span-3">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={tempSettings.startDate}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              {tempSettings.isMultiDay && (
                <div className="sm:col-span-3">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      value={tempSettings.endDate}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* Venue */}
              <div className="sm:col-span-6">
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                  Venue
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="venue"
                    id="venue"
                    value={tempSettings.venue}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Organizer Information</h3>
              </div>
              
              {/* Organizer Name */}
              <div className="sm:col-span-4">
                <label htmlFor="organizerName" className="block text-sm font-medium text-gray-700">
                  Organizer Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="organizerName"
                    id="organizerName"
                    value={tempSettings.organizerName}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Organizer Email */}
              <div className="sm:col-span-4">
                <label htmlFor="organizerEmail" className="block text-sm font-medium text-gray-700">
                  Organizer Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="organizerEmail"
                    id="organizerEmail"
                    value={tempSettings.organizerEmail}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Organizer Phone */}
              <div className="sm:col-span-4">
                <label htmlFor="organizerPhone" className="block text-sm font-medium text-gray-700">
                  Organizer Phone
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="organizerPhone"
                    id="organizerPhone"
                    value={tempSettings.organizerPhone}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            
            {/* Warning about multi-day events */}
            {tempSettings.isMultiDay && (
              <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-warning-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-warning-800">Attention for multi-day events</h3>
                    <div className="mt-2 text-sm text-warning-700">
                      <p>
                        Changing the event from single-day to multi-day will set up attendance tracking for each day.
                        The system will create daily records for each attendee across all event days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Event Summary */}
        <div className="bg-white shadow rounded-lg overflow-hidden p-5">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary-500" />
            <h3 className="ml-2 text-lg font-medium text-gray-900">Event Date</h3>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {tempSettings.isMultiDay ? (
              <p>
                Multi-day event from{' '}
                <span className="font-medium text-gray-900">
                  {new Date(tempSettings.startDate).toLocaleDateString()}
                </span>{' '}
                to{' '}
                <span className="font-medium text-gray-900">
                  {new Date(tempSettings.endDate).toLocaleDateString()}
                </span>
              </p>
            ) : (
              <p>
                Single-day event on{' '}
                <span className="font-medium text-gray-900">
                  {new Date(tempSettings.startDate).toLocaleDateString()}
                </span>
              </p>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden p-5">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-primary-500" />
            <h3 className="ml-2 text-lg font-medium text-gray-900">Venue</h3>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <p>
              {tempSettings.venue || 'No venue specified'}
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden p-5">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary-500" />
            <h3 className="ml-2 text-lg font-medium text-gray-900">Organizer</h3>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <p>
              {tempSettings.organizerName || 'No organizer specified'}
            </p>
            {tempSettings.organizerEmail && (
              <p className="mt-1">{tempSettings.organizerEmail}</p>
            )}
            {tempSettings.organizerPhone && (
              <p className="mt-1">{tempSettings.organizerPhone}</p>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden p-5">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-primary-500" />
            <h3 className="ml-2 text-lg font-medium text-gray-900">Event Name</h3>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <p>
              {tempSettings.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;