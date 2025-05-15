import React, { createContext, useContext, useState, useEffect } from 'react';
import { Attendee } from '../types/Attendee';

interface AttendeeContextType {
  attendees: Attendee[];
  addAttendee: (attendee: Attendee) => void;
  addAttendees: (attendees: Attendee[]) => void;
  updateAttendee: (updatedAttendee: Attendee) => void;
  findAttendeeById: (id: string) => Attendee | undefined;
}

const AttendeeContext = createContext<AttendeeContextType>({
  attendees: [],
  addAttendee: () => {},
  addAttendees: () => {},
  updateAttendee: () => {},
  findAttendeeById: () => undefined
});

export const useAttendees = () => useContext(AttendeeContext);

export const AttendeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  
  // Load from localStorage on mount
  useEffect(() => {
    const savedAttendees = localStorage.getItem('eventManagerAttendees');
    if (savedAttendees) {
      try {
        setAttendees(JSON.parse(savedAttendees));
      } catch (error) {
        console.error('Error loading attendees from localStorage:', error);
      }
    }
  }, []);
  
  // Save to localStorage whenever attendees change
  useEffect(() => {
    localStorage.setItem('eventManagerAttendees', JSON.stringify(attendees));
  }, [attendees]);
  
  const addAttendee = (attendee: Attendee) => {
    setAttendees(prev => [...prev, attendee]);
  };
  
  const addAttendees = (newAttendees: Attendee[]) => {
    // Check for duplicates based on email
    const existingEmails = new Set(attendees.map(a => a.email.toLowerCase()));
    
    const uniqueNewAttendees = newAttendees.filter(
      attendee => !existingEmails.has(attendee.email.toLowerCase())
    );
    
    setAttendees(prev => [...prev, ...uniqueNewAttendees]);
  };
  
  const updateAttendee = (updatedAttendee: Attendee) => {
    setAttendees(prev => 
      prev.map(attendee => 
        attendee.uniqueId === updatedAttendee.uniqueId ? updatedAttendee : attendee
      )
    );
  };
  
  const findAttendeeById = (id: string) => {
    return attendees.find(attendee => attendee.uniqueId === id);
  };
  
  return (
    <AttendeeContext.Provider value={{ 
      attendees, 
      addAttendee, 
      addAttendees, 
      updateAttendee,
      findAttendeeById
    }}>
      {children}
    </AttendeeContext.Provider>
  );
};