import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ImportPage from './pages/ImportPage';
import AttendeesPage from './pages/AttendeesPage';
import CheckInPage from './pages/CheckInPage';
import DistributionPage from './pages/DistributionPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ArchivedEventsPage from './pages/ArchivedEventsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="attendees" element={<AttendeesPage />} />
        <Route path="checkin" element={<CheckInPage />} />
        <Route path="distribution" element={<DistributionPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="archived" element={<ArchivedEventsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;