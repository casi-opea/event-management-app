import React, { useState, useCallback } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import { Upload, FileText, Check, X, AlertTriangle } from 'lucide-react';
import Toast from '../components/Toast';
import { generateUniqueId } from '../utils/idGenerator';
import { Attendee } from '../types/Attendee';

const ImportCSV: React.FC = () => {
  const { addAttendees } = useAttendees();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [importing, setImporting] = useState(false);
  
  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileChange(droppedFile);
    }
  }, []);
  
  // Handle file selection via input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };
  
  // Process the selected file
  const handleFileChange = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setParseError('Please upload a CSV file');
      setFile(null);
      setParsedData(null);
      return;
    }
    
    setFile(file);
    setParseError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const result = parseCSV(csv);
        setParsedData(result);
      } catch (error) {
        setParseError(`Error parsing CSV: ${error instanceof Error ? error.message : String(error)}`);
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  };
  
  // Parse CSV content
  const parseCSV = (csvContent: string) => {
    const lines = csvContent.split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least headers and one data row');
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Verify required headers
    const requiredHeaders = ['name', 'email'];
    const missingHeaders = requiredHeaders.filter(header => 
      !headers.map(h => h.toLowerCase()).includes(header.toLowerCase())
    );
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    // Parse data rows
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(value => value.trim());
      
      if (values.length !== headers.length) {
        throw new Error(`Line ${i + 1} has ${values.length} values, but ${headers.length} were expected`);
      }
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header.toLowerCase()] = values[index];
      });
      
      result.push(row);
    }
    
    return result;
  };
  
  // Import attendees
  const handleImport = () => {
    if (!parsedData) return;
    
    setImporting(true);
    
    try {
      // Process the parsed data and generate unique IDs
      const newAttendees: Attendee[] = parsedData.map(row => ({
        name: row.name,
        email: row.email,
        uniqueId: generateUniqueId(row.name, row.email),
        checkedIn: false,
        lunchCollected: false,
        kitCollected: false
      }));
      
      // Add to the context
      addAttendees(newAttendees);
      
      setToast({
        message: `Successfully imported ${newAttendees.length} attendees`,
        type: 'success'
      });
      
      // Reset the form
      setFile(null);
      setParsedData(null);
    } catch (error) {
      setToast({
        message: `Error importing attendees: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error'
      });
    } finally {
      setImporting(false);
    }
  };
  
  // Clear the selected file
  const handleClear = () => {
    setFile(null);
    setParsedData(null);
    setParseError(null);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Import Attendees</h2>
        <p className="text-sm text-gray-500">Upload a CSV file with attendee details</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div 
          className={`
            border-2 border-dashed rounded-lg p-8 text-center
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${parseError ? 'border-red-300 bg-red-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-800">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse files
                </p>
              </div>
              
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                Select CSV File
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
              </button>
              
              <p className="text-xs text-gray-500 mt-2">
                CSV must include name and email columns
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-800">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {parsedData ? `${parsedData.length} attendees found` : 'Analyzing file...'}
                </p>
              </div>
              
              {parseError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-left">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{parseError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center space-x-3">
                <button 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleClear}
                >
                  <X className="h-5 w-5 mr-2 text-gray-500" />
                  Clear
                </button>
                
                {parsedData && !parseError && (
                  <button 
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleImport}
                    disabled={importing}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    {importing ? 'Importing...' : 'Import Attendees'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {parsedData && !parseError && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Preview ({Math.min(5, parsedData.length)} of {parsedData.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {parsedData.length > 0 && 
                      Object.keys(parsedData[0]).map((header, idx) => (
                        <th 
                          key={idx}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))
                    }
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedData.slice(0, 5).map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {Object.values(row).map((value: any, colIdx) => (
                        <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {value}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {generateUniqueId(row.name, row.email).substring(0, 8)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">CSV File Format</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Your CSV file should include the following columns:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li><b>name</b> - Full name of the attendee</li>
                <li><b>email</b> - Email address of the attendee</li>
                <li>Additional columns are allowed but will be ignored</li>
              </ul>
            </div>
            <div className="mt-2">
              <p className="text-sm text-blue-800">Example:</p>
              <code className="text-xs bg-blue-100 p-1 rounded">
                name,email<br/>
                John Doe,john@example.com<br/>
                Jane Smith,jane@example.com
              </code>
            </div>
          </div>
        </div>
      </div>
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ImportCSV;