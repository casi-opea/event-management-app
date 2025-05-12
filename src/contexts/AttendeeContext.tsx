import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';
import { toast } from 'react-toastify';
import { Attendee, EventSettings } from '../types';
import { useSync } from './SyncContext';
import { generateQRCode } from '../utils/qrCodeUtils';
import { getCurrentDay } from '../utils/dateUtils';

interface AttendeeContextProps {
  attendees: Attendee[];
  isLoading: boolean;
  eventSettings: EventSettings;
  addAttendees: (newAttendees: Partial<Attendee>[]) => Promise<void>;
  updateAttendee: (id: string, data: Partial<Attendee>) => Promise<void>;
  registerAttendee: (uniqueIdOrQrCode: string) => Promise<Attendee | null>;
  distributeLunch: (uniqueIdOrQrCode: string) => Promise<Attendee | null>;
  distributeKit: (uniqueIdOrQrCode: string) => Promise<Attendee | null>;
  searchAttendees: (query: string) => Attendee[];
  getAttendeeById: (id: string) => Attendee | undefined;
  getAttendeeByUniqueId: (uniqueId: string) => Attendee | undefined;
  getAttendeeByQrCode: (qrCode: string) => Attendee | undefined;
  updateEventSettings: (settings: Partial<EventSettings>) => Promise<void>;
}

const AttendeeContext = createContext<AttendeeContextProps | undefined>(undefined);

const defaultEventSettings: EventSettings = {
  name: 'My Event',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  isMultiDay: false,
  days: [new Date().toISOString().split('T')[0]],
  venue: 'Virtual',
  organizerName: '',
  organizerEmail: '',
  organizerPhone: '',
};

export const AttendeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventSettings, setEventSettings] = useState<EventSettings>(defaultEventSettings);
  const { triggerSync, isOnline } = useSync();

  // Load data from local storage on initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load attendees
        const storedAttendees = await localforage.getItem<Attendee[]>('attendees');
        if (storedAttendees) {
          setAttendees(storedAttendees);
        }
        
        // Load event settings
        const storedSettings = await localforage.getItem<EventSettings>('eventSettings');
        if (storedSettings) {
          setEventSettings(storedSettings);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data from storage');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save attendees to local storage whenever they change
  useEffect(() => {
    if (!isLoading && attendees.length > 0) {
      localforage.setItem('attendees', attendees);
      triggerSync();
    }
  }, [attendees, isLoading, triggerSync]);

  // Save event settings to local storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localforage.setItem('eventSettings', eventSettings);
    }
  }, [eventSettings, isLoading]);

  const addAttendees = useCallback(async (newAttendees: Partial<Attendee>[]) => {
    const attendeesToAdd = newAttendees.map(attendee => {
      // Generate a unique identifier for each attendee
      const uniqueId = attendee.uniqueId || generateUniqueId();
      // Generate QR code data based on the unique ID
      const qrCodeData = attendee.qrCodeData || generateQRCode(uniqueId);
      
      // Initialize attendance tracking for multi-day events
      const attendance: Record<string, boolean> = {};
      if (eventSettings.isMultiDay) {
        eventSettings.days.forEach(day => {
          attendance[day] = false;
        });
      } else {
        attendance[getCurrentDay()] = false;
      }
      
      return {
        id: uuidv4(),
        uniqueId,
        qrCodeData,
        isRegistered: false,
        hasCollectedLunch: false,
        hasCollectedKit: false,
        attendance,
        ...attendee,
      } as Attendee;
    });

    setAttendees(prev => [...prev, ...attendeesToAdd]);
    
    if (attendeesToAdd.length > 0) {
      toast.success(`Added ${attendeesToAdd.length} attendees successfully`);
    }
    
    return Promise.resolve();
  }, [eventSettings]);

  const updateAttendee = useCallback(async (id: string, data: Partial<Attendee>) => {
    setAttendees(prev => 
      prev.map(attendee => 
        attendee.id === id ? { ...attendee, ...data } : attendee
      )
    );
    return Promise.resolve();
  }, []);

  const registerAttendee = useCallback(async (uniqueIdOrQrCode: string): Promise<Attendee | null> => {
    let foundAttendee: Attendee | undefined;
    
    // Search by both unique ID and QR code
    setAttendees(prev => {
      const updated = prev.map(attendee => {
        if (
          attendee.uniqueId === uniqueIdOrQrCode || 
          attendee.qrCodeData === uniqueIdOrQrCode
        ) {
          foundAttendee = attendee;
          
          // If already registered, return unchanged
          if (attendee.isRegistered) {
            return attendee;
          }
          
          // Update attendance for the current day
          const currentDay = getCurrentDay();
          const updatedAttendance = { ...attendee.attendance };
          updatedAttendance[currentDay] = true;
          
          // Mark as registered with timestamp
          return {
            ...attendee,
            isRegistered: true,
            registrationTime: new Date().toISOString(),
            attendance: updatedAttendance
          };
        }
        return attendee;
      });
      
      return updated;
    });
    
    if (foundAttendee) {
      if (foundAttendee.isRegistered) {
        toast.warning(`${foundAttendee.name} is already checked in`);
      } else {
        toast.success(`${foundAttendee.name} checked in successfully`);
      }
      return foundAttendee;
    }
    
    toast.error('Attendee not found');
    return null;
  }, []);

  const distributeLunch = useCallback(async (uniqueIdOrQrCode: string): Promise<Attendee | null> => {
    let foundAttendee: Attendee | undefined;
    
    setAttendees(prev => {
      const updated = prev.map(attendee => {
        if (
          attendee.uniqueId === uniqueIdOrQrCode || 
          attendee.qrCodeData === uniqueIdOrQrCode
        ) {
          foundAttendee = attendee;
          
          // If already collected lunch, return unchanged
          if (attendee.hasCollectedLunch) {
            return attendee;
          }
          
          // Mark lunch as collected with timestamp
          return {
            ...attendee,
            hasCollectedLunch: true,
            lunchCollectionTime: new Date().toISOString()
          };
        }
        return attendee;
      });
      
      return updated;
    });
    
    if (foundAttendee) {
      if (foundAttendee.hasCollectedLunch) {
        toast.warning(`${foundAttendee.name} has already collected lunch`);
      } else {
        toast.success(`${foundAttendee.name} collected lunch successfully`);
      }
      return foundAttendee;
    }
    
    toast.error('Attendee not found');
    return null;
  }, []);

  const distributeKit = useCallback(async (uniqueIdOrQrCode: string): Promise<Attendee | null> => {
    let foundAttendee: Attendee | undefined;
    
    setAttendees(prev => {
      const updated = prev.map(attendee => {
        if (
          attendee.uniqueId === uniqueIdOrQrCode || 
          attendee.qrCodeData === uniqueIdOrQrCode
        ) {
          foundAttendee = attendee;
          
          // If already collected kit, return unchanged
          if (attendee.hasCollectedKit) {
            return attendee;
          }
          
          // Mark kit as collected with timestamp
          return {
            ...attendee,
            hasCollectedKit: true,
            kitCollectionTime: new Date().toISOString()
          };
        }
        return attendee;
      });
      
      return updated;
    });
    
    if (foundAttendee) {
      if (foundAttendee.hasCollectedKit) {
        toast.warning(`${foundAttendee.name} has already collected the event kit`);
      } else {
        toast.success(`${foundAttendee.name} collected event kit successfully`);
      }
      return foundAttendee;
    }
    
    toast.error('Attendee not found');
    return null;
  }, []);

  const searchAttendees = useCallback((query: string): Attendee[] => {
    if (!query.trim()) return attendees;
    
    const lowercaseQuery = query.toLowerCase().trim();
    
    return attendees.filter(attendee => {
      return (
        attendee.name?.toLowerCase().includes(lowercaseQuery) ||
        attendee.email?.toLowerCase().includes(lowercaseQuery) ||
        attendee.phone?.includes(lowercaseQuery) ||
        attendee.uniqueId?.toLowerCase().includes(lowercaseQuery) ||
        attendee.company?.toLowerCase().includes(lowercaseQuery)
      );
    });
  }, [attendees]);

  const getAttendeeById = useCallback((id: string): Attendee | undefined => {
    return attendees.find(attendee => attendee.id === id);
  }, [attendees]);

  const getAttendeeByUniqueId = useCallback((uniqueId: string): Attendee | undefined => {
    return attendees.find(attendee => attendee.uniqueId === uniqueId);
  }, [attendees]);

  const getAttendeeByQrCode = useCallback((qrCode: string): Attendee | undefined => {
    return attendees.find(attendee => attendee.qrCodeData === qrCode);
  }, [attendees]);

  const updateEventSettings = useCallback(async (settings: Partial<EventSettings>) => {
    setEventSettings(prev => ({
      ...prev,
      ...settings
    }));
    
    // If multi-day status changes, update the days array
    if (settings.isMultiDay !== undefined) {
      if (settings.isMultiDay) {
        // Create an array of days between start and end date
        if (eventSettings.startDate && eventSettings.endDate) {
          const startDate = new Date(eventSettings.startDate);
          const endDate = new Date(eventSettings.endDate);
          const daysArray: string[] = [];
          
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            daysArray.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          setEventSettings(prev => ({
            ...prev,
            days: daysArray
          }));
        }
      } else {
        // Single day event
        setEventSettings(prev => ({
          ...prev,
          days: [prev.startDate]
        }));
      }
    }
    
    return Promise.resolve();
  }, [eventSettings.startDate, eventSettings.endDate]);

  const value = {
    attendees,
    isLoading,
    eventSettings,
    addAttendees,
    updateAttendee,
    registerAttendee,
    distributeLunch,
    distributeKit,
    searchAttendees,
    getAttendeeById,
    getAttendeeByUniqueId,
    getAttendeeByQrCode,
    updateEventSettings,
  };

  return (
    <AttendeeContext.Provider value={value}>
      {children}
    </AttendeeContext.Provider>
  );
};

// Helper function to generate a unique ID for attendees
function generateUniqueId(): string {
  // Create a unique ID with format EVT-XXXX-XXXX
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 4;
  let result1 = '';
  let result2 = '';
  
  for (let i = 0; i < length; i++) {
    result1 += characters.charAt(Math.floor(Math.random() * characters.length));
    result2 += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return `EVT-${result1}-${result2}`;
}

export const useAttendees = () => {
  const context = useContext(AttendeeContext);
  if (context === undefined) {
    throw new Error('useAttendees must be used within an AttendeeProvider');
  }
  return context;
};