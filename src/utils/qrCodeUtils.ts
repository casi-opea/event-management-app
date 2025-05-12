import { v4 as uuidv4 } from 'uuid';

export const generateQRCode = (uniqueId: string): string => {
  // In a real app we might want to add more security/verification data
  // For this demo, we'll just use the unique ID with a prefix
  return `EVT-QR-${uniqueId}`;
};