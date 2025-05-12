import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { AttendeeProvider } from './contexts/AttendeeContext';
import { SyncProvider } from './contexts/SyncContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SyncProvider>
        <AttendeeProvider>
          <App />
          <ToastContainer position="bottom-right" theme="colored" />
        </AttendeeProvider>
      </SyncProvider>
    </BrowserRouter>
  </StrictMode>
);