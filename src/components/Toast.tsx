import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
    }
  };
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className={`
      fixed bottom-5 right-5 flex items-center p-4 mb-4 rounded-lg shadow-lg
      ${getBackgroundColor()} text-white
      transform transition-transform duration-300 ease-in-out
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
    `}>
      <div className="inline-flex items-center justify-center flex-shrink-0 mr-2">
        {getIcon()}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button 
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-white p-1.5 inline-flex h-8 w-8 hover:bg-opacity-25 hover:bg-black"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast;