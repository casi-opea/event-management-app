export interface Attendee {
  id: string;
  uniqueId: string;
  qrCodeData: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  // Check-in status
  isRegistered: boolean;
  registrationTime?: string;
  // Lunch tracking
  hasCollectedLunch: boolean;
  lunchCollectionTime?: string;
  // Kit tracking
  hasCollectedKit: boolean;
  kitCollectionTime?: string;
  // For multi-day events
  attendance: Record<string, boolean>;
  // Other fields from CSV
  [key: string]: any;
}

export interface SyncStatus {
  syncing: boolean;
  lastSynced: string | null;
  pendingChanges: number;
}

export interface EventSettings {
  name: string;
  startDate: string;
  endDate: string;
  isMultiDay: boolean;
  days: string[];
  venue: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
}

export interface DashboardStats {
  totalAttendees: number;
  registeredAttendees: number;
  lunchDistributed: number;
  kitDistributed: number;
  registrationRate: number;
  dailyAttendance: Record<string, number>;
}

export interface CSVMappingField {
  csvHeader: string;
  appField: string;
  required: boolean;
}

export interface ArchivedEvent {
  id: string;
  settings: EventSettings;
  stats: DashboardStats;
  endDate: string;
  csvData: string;
}