import React, { useState } from 'react';
import { QrCode, Camera, X } from 'lucide-react';

interface QrScannerProps {
  onScan: (data: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  
  // Mock QR scanning - In a real app, we'd use a library like react-qr-reader
  const simulateScan = () => {
    setScanning(true);
    
    // Simulating a scan delay
    setTimeout(() => {
      setScanning(false);
      
      // Generate a mock ID and pass it to the parent component
      const mockId = 'QR' + Math.random().toString(36).substring(2, 10).toUpperCase();
      onScan(mockId);
    }, 2000);
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      onScan(manualId);
      setManualId('');
    }
  };
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <QrCode className="w-5 h-5 mr-2" />
        Attendee Verification
      </h3>
      
      <div className="space-y-4">
        <div 
          className={`
            relative aspect-square max-w-xs mx-auto border-2 border-dashed border-gray-300 rounded-lg
            flex items-center justify-center overflow-hidden
            ${scanning ? 'qr-scanner' : ''}
          `}
        >
          {scanning ? (
            <div className="text-center">
              <Camera className="w-10 h-10 text-blue-500 mx-auto animate-pulse" />
              <p className="mt-2 text-sm text-gray-600">Scanning...</p>
            </div>
          ) : (
            <button 
              className="text-center p-4 w-full h-full"
              onClick={simulateScan}
            >
              <div className="bg-gray-100 h-14 w-14 rounded-full flex items-center justify-center mx-auto">
                <QrCode className="w-8 h-8 text-blue-600" />
              </div>
              <p className="mt-2 text-sm text-gray-800 font-medium">Tap to scan QR code</p>
              <p className="text-xs text-gray-500">Position the QR code within the frame</p>
            </button>
          )}
        </div>
        
        <div className="text-center">
          <p className="inline-block border-t border-gray-200 px-4 pt-2 text-sm text-gray-500">
            Or enter ID manually
          </p>
        </div>
        
        <form onSubmit={handleManualSubmit} className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter attendee ID"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default QrScanner;