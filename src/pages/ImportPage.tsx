import React, { useState, useRef, useCallback } from 'react';
import { Upload, AlertCircle, Check, X, FileSpreadsheet } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { useAttendees } from '../contexts/AttendeeContext';
import { 
  parseCSV, 
  getCSVHeaders, 
  mapCSVToAttendees, 
  validateRequiredFields 
} from '../utils/csvUtils';
import { Attendee, CSVMappingField } from '../types';

const ImportPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addAttendees } = useAttendees();
  
  const [importStep, setImportStep] = useState<number>(1);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<CSVMappingField[]>([
    { csvHeader: '', appField: 'name', required: true },
    { csvHeader: '', appField: 'email', required: true },
    { csvHeader: '', appField: 'phone', required: false },
    { csvHeader: '', appField: 'company', required: false },
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setCsvFile(file);
    
    try {
      const results = await parseCSV(file);
      setCsvHeaders(getCSVHeaders(results));
      setCsvData(results.data);
      
      // Try to auto-map common field names
      const newMapping = [...mapping];
      const headerLower = getCSVHeaders(results).map(h => h.toLowerCase());
      
      newMapping.forEach((map, index) => {
        const matchIndex = headerLower.findIndex(h => 
          h === map.appField.toLowerCase() || 
          h.includes(map.appField.toLowerCase())
        );
        
        if (matchIndex !== -1) {
          newMapping[index].csvHeader = getCSVHeaders(results)[matchIndex];
        }
      });
      
      setMapping(newMapping);
      setImportStep(2);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error('Failed to parse CSV file. Please check the format and try again.');
    }
  }, [mapping]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  });
  
  const handleImport = async () => {
    // Validate required fields
    const validation = validateRequiredFields(csvData, mapping);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Map CSV data to attendee objects
      const attendeesToImport = mapCSVToAttendees(csvData, mapping);
      
      // Add attendees to the context
      await addAttendees(attendeesToImport);
      
      toast.success(`Successfully imported ${attendeesToImport.length} attendees!`);
      resetImport();
    } catch (error) {
      console.error('Error importing attendees:', error);
      toast.error('Failed to import attendees. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };
  
  const resetImport = () => {
    setCsvFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setMapping([
      { csvHeader: '', appField: 'name', required: true },
      { csvHeader: '', appField: 'email', required: true },
      { csvHeader: '', appField: 'phone', required: false },
      { csvHeader: '', appField: 'company', required: false },
    ]);
    setErrors([]);
    setImportStep(1);
  };
  
  const handleMappingChange = (index: number, csvHeader: string) => {
    const newMapping = [...mapping];
    newMapping[index].csvHeader = csvHeader;
    setMapping(newMapping);
  };
  
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Import Attendees</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV file with attendee information
        </p>
      </header>
      
      <div className="bg-white shadow rounded-lg">
        {/* Steps */}
        <div className="border-b border-gray-200">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="-mb-px flex">
              <button
                className={`border-b-2 py-4 px-1 text-center text-sm font-medium sm:text-base w-1/2
                  ${importStep === 1 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                disabled={importStep === 1}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full mr-2 text-xs">
                  1
                </span>
                Upload CSV
              </button>
              <button
                className={`border-b-2 py-4 px-1 text-center text-sm font-medium sm:text-base w-1/2
                  ${importStep === 2 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                disabled={importStep === 2}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full mr-2 text-xs">
                  2
                </span>
                Map Fields
              </button>
            </nav>
          </div>
        </div>
        
        <div className="p-6">
          {importStep === 1 && (
            <div>
              <div 
                {...getRootProps()} 
                className={`
                  border-2 border-dashed rounded-lg py-8 px-4 text-center cursor-pointer
                  ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
                  transition-colors duration-150 ease-in-out
                `}
              >
                <input {...getInputProps()} ref={fileInputRef} />
                <div className="flex flex-col items-center justify-center">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-sm text-gray-600">
                    <span className="font-medium text-primary-600 hover:text-primary-500">
                      Click on Select File below to upload file
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">CSV up to 10MB</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700">CSV Format Requirements</h3>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>File must be in CSV format</li>
                  <li>First row should contain column headers</li>
                  <li>Required fields: Name, Email</li>
                  <li>Optional fields: Phone, Company, etc.</li>
                </ul>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Sample Format</h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full text-sm divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-3 py-2 whitespace-nowrap">John Doe</td>
                        <td className="px-3 py-2 whitespace-nowrap">john@example.com</td>
                        <td className="px-3 py-2 whitespace-nowrap">555-123-4567</td>
                        <td className="px-3 py-2 whitespace-nowrap">Acme Corp</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 whitespace-nowrap">Jane Smith</td>
                        <td className="px-3 py-2 whitespace-nowrap">jane@example.com</td>
                        <td className="px-3 py-2 whitespace-nowrap">555-987-6543</td>
                        <td className="px-3 py-2 whitespace-nowrap">XYZ Inc</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {importStep === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Map Fields</h3>
                  <p className="text-sm text-gray-500">
                    Map CSV columns to the appropriate attendee fields
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  <span>{csvFile?.name}</span>
                  <button
                    onClick={resetImport}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    Change File
                  </button>
                </div>
              </div>
              
              {errors.length > 0 && (
                <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-error-500 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-error-800">
                        Please fix the following errors:
                      </h3>
                      <ul className="mt-1 text-sm text-error-700 list-disc list-inside">
                        {errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {errors.length > 5 && (
                          <li>...and {errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {mapping.map((field, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.appField.charAt(0).toUpperCase() + field.appField.slice(1)}
                        {field.required && <span className="text-error-500 ml-1">*</span>}
                      </label>
                    </div>
                    <div className="w-2/3">
                      <select
                        value={field.csvHeader}
                        onChange={(e) => handleMappingChange(index, e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      >
                        <option value="">-- Select a CSV column --</option>
                        {csvHeaders.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                <div className="max-h-64 overflow-y-auto overflow-x-auto border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {mapping.map((field, index) => (
                          <th 
                            key={index}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {field.appField}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {csvData.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {mapping.map((field, colIndex) => (
                            <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-sm">
                              {field.csvHeader ? row[field.csvHeader] : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {csvData.length > 5 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Showing 5 of {csvData.length} rows
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-between">
          {importStep === 1 ? (
            <div></div>
          ) : (
            <button
              onClick={resetImport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          )}
          
          {importStep === 1 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select File
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={isImporting || mapping.some(m => m.required && !m.csvHeader)}
              className={`
                inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white
                ${isImporting || mapping.some(m => m.required && !m.csvHeader)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }
              `}
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Import Attendees
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportPage;