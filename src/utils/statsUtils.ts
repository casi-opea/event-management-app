import { Attendee } from '../types';

export const calculateStats = (attendees: Attendee[]) => {
  const totalAttendees = attendees.length;
  const registeredAttendees = attendees.filter(a => a.isRegistered).length;
  const lunchDistributed = attendees.filter(a => a.hasCollectedLunch).length;
  const kitDistributed = attendees.filter(a => a.hasCollectedKit).length;
  
  // Calculate daily attendance for multi-day events
  const dailyAttendance: Record<string, number> = {};
  
  attendees.forEach(attendee => {
    Object.entries(attendee.attendance).forEach(([day, attended]) => {
      if (attended) {
        dailyAttendance[day] = (dailyAttendance[day] || 0) + 1;
      } else {
        // Initialize the day if it doesn't exist
        dailyAttendance[day] = dailyAttendance[day] || 0;
      }
    });
  });
  
  return {
    totalAttendees,
    registeredAttendees,
    lunchDistributed,
    kitDistributed,
    registrationRate: totalAttendees > 0 ? (registeredAttendees / totalAttendees) * 100 : 0,
    dailyAttendance
  };
};