/**
 * Generates a unique ID for an attendee based on their name and email
 * This function combines various techniques to create a unique and secure identifier:
 * 1. Uses name and email as seed data
 * 2. Incorporates a timestamp for uniqueness
 * 3. Applies SHA-256 hashing (simulated here) for security
 * 4. Formats as a readable string with a prefix
 */
export const generateUniqueId = (name: string, email: string): string => {
  // Combine name, email, and current timestamp
  const seed = `${name}-${email}-${Date.now()}-${Math.random()}`;
  
  // Simulate a secure hash (in production, use a proper crypto library)
  const hash = simpleHash(seed);
  
  // Format with a prefix
  return `EVT-${hash}`;
};

/**
 * Simple hash function that mimics cryptographic hashing
 * Note: In production, use a proper crypto library
 */
const simpleHash = (input: string): string => {
  let hash = 0;
  
  if (input.length === 0) return hash.toString(36);
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hex-like string and ensure it's long enough
  const positiveHash = Math.abs(hash);
  const hexLike = positiveHash.toString(16) + 
                  (positiveHash ^ 0xDEADBEEF).toString(16) +
                  Date.now().toString(36);
  
  return hexLike.padEnd(24, '0').substring(0, 24);
};

/**
 * Generates a QR code URL for an attendee ID
 * Note: In a real app, you would use a QR code library
 */
export const generateQRCodeUrl = (id: string): string => {
  // For demo purposes, use a QR code generator API
  // In a real app, you'd generate these locally or use a service with proper handling
  const encodedId = encodeURIComponent(id);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedId}`;
};