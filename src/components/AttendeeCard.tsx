import React from 'react';
import { User, Mail, Check, X, Coffee, Gift } from 'lucide-react';
import { Attendee } from '../types/Attendee';

interface AttendeeCardProps {
  attendee: Attendee;
  onAction?: (action: 'check-in' | 'lunch' | 'kit', attendee: Attendee) => void;
  showActions?: boolean;
}

const AttendeeCard: React.FC<AttendeeCardProps> = ({ 
  attendee, 
  onAction,
  showActions = true 
}) => {
  const getStatusBadge = (status: boolean | undefined, label: string) => {
    return (
      <span className={`
        px-2 py-1 text-xs font-medium rounded-full
        ${status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
      `}>
        {status ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1" />}
        {label}
      </span>
    );
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 card-enter">
      <div className="flex items-center mb-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <User className="h-5 w-5 text-blue-600" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">{attendee.name}</h3>
          <div className="flex items-center text-xs text-gray-500">
            <Mail className="h-3 w-3 mr-1" />
            {attendee.email}
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {getStatusBadge(attendee.checkedIn, 'Checked In')}
          {getStatusBadge(attendee.lunchCollected, 'Lunch')}
          {getStatusBadge(attendee.kitCollected, 'Kit')}
        </div>
        
        <div className="text-xs text-gray-500 mb-3">
          ID: {attendee.uniqueId.substring(0, 8)}...
        </div>
        
        {showActions && onAction && (
          <div className="flex flex-wrap gap-2 mt-2">
            {!attendee.checkedIn && (
              <button 
                className="text-xs py-1 px-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                onClick={() => onAction('check-in', attendee)}
              >
                <Check className="w-3 h-3 mr-1" />
                Check-in
              </button>
            )}
            
            {attendee.checkedIn && !attendee.lunchCollected && (
              <button 
                className="text-xs py-1 px-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors flex items-center"
                onClick={() => onAction('lunch', attendee)}
              >
                <Coffee className="w-3 h-3 mr-1" />
                Lunch
              </button>
            )}
            
            {attendee.checkedIn && !attendee.kitCollected && (
              <button 
                className="text-xs py-1 px-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center"
                onClick={() => onAction('kit', attendee)}
              >
                <Gift className="w-3 h-3 mr-1" />
                Kit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeeCard;