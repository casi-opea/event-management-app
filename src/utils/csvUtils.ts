import Papa from 'papaparse';
import { Attendee, CSVMappingField } from '../types';

export const parseCSV = (file: File): Promise<Papa.ParseResult<any>> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const getCSVHeaders = (results: Papa.ParseResult<any>): string[] => {
  return results.meta.fields || [];
};

export const mapCSVToAttendees = (
  csvData: any[],
  mapping: CSVMappingField[]
): Partial<Attendee>[] => {
  return csvData.map(row => {
    const attendee: Partial<Attendee> = {};
    
    mapping.forEach(map => {
      if (map.csvHeader && row[map.csvHeader] !== undefined) {
        // @ts-ignore - We're dynamically setting properties
        attendee[map.appField] = row[map.csvHeader];
      }
    });
    
    return attendee;
  });
};

export const validateRequiredFields = (
  csvData: any[],
  mapping: CSVMappingField[]
): { valid: boolean; errors: string[] } => {
  const requiredFields = mapping.filter(field => field.required);
  const errors: string[] = [];
  
  csvData.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field.csvHeader] || row[field.csvHeader].trim() === '') {
        errors.push(`Row ${index + 1}: Missing required field '${field.csvHeader}'`);
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const downloadAttendeesAsCSV = (attendees: Attendee[]): void => {
  // Convert attendees to CSV format
  const csv = Papa.unparse(attendees);
  
  // Create a Blob with the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create a download link and trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'attendees.csv');
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};