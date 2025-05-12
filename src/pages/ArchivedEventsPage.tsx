import React from 'react';
import { FileSpreadsheet, Download, Calendar } from 'lucide-react';
import { useAttendees } from '../contexts/AttendeeContext';
import { ArchivedEvent } from '../types';
import localforage from 'localforage';

const ArchivedEventsPage: React.FC = () => {
  const [archivedEvents, setArchivedEvents] = React.useState<ArchivedEvent[]>([]);

  React.useEffect(() => {
    const loadArchivedEvents = async () => {
      const events = await localforage.getItem<ArchivedEvent[]>('archivedEvents') || [];
      setArchivedEvents(events);
    };
    loadArchivedEvents();
  }, []);

  const downloadCSV = (event: ArchivedEvent) => {
    const blob = new Blob([event.csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.settings.name.replace(/\s+/g, '_')}_final_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Archived Events</h1>
        <p className="mt-1 text-sm text-gray-500">
          View past events and download their final reports
        </p>
      </header>

      {archivedEvents.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No archived events</h3>
          <p className="mt-1 text-sm text-gray-500">
            When you end an event, it will appear here for future reference.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {archivedEvents.map((event) => (
            <div key={event.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{event.settings.name}</h2>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    Venue: <span className="text-gray-900">{event.settings.venue}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: <span className="text-gray-900">
                      {new Date(event.settings.startDate).toLocaleDateString()}
                      {event.settings.isMultiDay && ` - ${new Date(event.settings.endDate).toLocaleDateString()}`}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Total Attendees: <span className="text-gray-900">{event.stats.totalAttendees}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Check-in Rate: <span className="text-gray-900">{event.stats.registrationRate.toFixed(1)}%</span>
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => downloadCSV(event)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Final Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedEventsPage;