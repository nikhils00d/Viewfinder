import ChitrakalaPage from './pages/ChitrakalaPage';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EventsPage from './pages/EventsPage';
import AdminPage from './pages/AdminPage';

function PagePosition() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = `${pathname.startsWith('/admin') ? 'Archive Studio' : pathname === '/events' ? 'Event Archive' : pathname === '/chitrakala' ? 'Chitrakala' : 'Viewfinder'} · Confluenz`;
    const raf = requestAnimationFrame(() => {
      if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      else window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);
  return null;
}
export default function App() {
  return (
    <Router>
      <PagePosition />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div id="main-content" tabIndex={-1}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chitrakala" element={<ChitrakalaPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/admin/login" element={<AdminPage login />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<main className="not-found"><p>404 / OUT OF FRAME</p><h1>This frame is missing.</h1><p>The page may have moved. Let’s get you back to the collection.</p><Link to="/events">Explore the archive →</Link><Link to="/">Return home</Link></main>} />
      </Routes>
      </div>
    </Router>
  );
}
