import ChitrakalaPage from './pages/ChitrakalaPage';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EventsPage from './pages/EventsPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chitrakala" element={<ChitrakalaPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/admin/login" element={<AdminPage login />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
