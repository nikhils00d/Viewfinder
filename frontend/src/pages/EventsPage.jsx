import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassFolder from '../components/GlassFolder';
import { api } from '../api';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    api('/events').then(rows => { if (alive) setEvents(rows); }).catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [retry]);
  const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered = events.filter(e => words.every(word => `${e.title} ${e.date} ${e.description} ${e.tags}`.toLowerCase().includes(word)));
  return <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '28px 24px 60px' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 1100, margin: 'auto', fontFamily: '"DM Mono", monospace', fontSize: 11, letterSpacing: '.14em' }}>
      <Link to="/">CONFLUENZ / VIEWFINDER</Link><span>EVENT ARCHIVE</span>
    </header>
    <section style={{ textAlign: 'center', padding: '64px 0 20px' }}>
      <h1 style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 400 }}>Every event. Every frame.</h1>
      <p style={{ color: '#999', margin: '18px 0 28px' }}>Find your moments. Open an event to explore its photos on Google Drive.</p>
      <label style={{ display: 'block', maxWidth: 520, margin: 'auto', textAlign: 'left', color: '#aaa', fontSize: 12 }}>Search the archive
        <input type="search" placeholder="Event name, year, or tag..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', display: 'block', padding: '16px 18px', marginTop: 8, borderRadius: 12, border: '1px solid #ffffff30', background: '#151518', color: 'white', fontSize: 16 }} />
      </label>
      {!loading && !error && <p role="status" style={{ color: '#888', marginTop: 16 }}>{filtered.length} {filtered.length === 1 ? 'event' : 'events'}</p>}
    </section>
    {loading ? <p role="status" style={{ textAlign: 'center', padding: 50 }}>Loading the archive...</p> : error ? <div role="alert" style={{ textAlign: 'center', padding: 50 }}><p>The archive could not be loaded. Please try again.</p><button onClick={() => setRetry(retry + 1)} style={{ margin: 20, color: 'white', cursor: 'pointer' }}>Retry</button></div> : !filtered.length ? <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}><p>{search ? 'No matching events. Try a different name, year, or tag.' : 'The archive is being curated. Check back soon.'}</p>{search && <button onClick={() => setSearch('')} style={{ margin: 20, color: 'white', cursor: 'pointer' }}>Clear search</button>}</div> : <section aria-label="Event archives" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '60px 48px', maxWidth: 1200, margin: 'auto', padding: '60px 0' }}>
      {filtered.map((event, i) => <article key={event._id} style={{ width: 300, maxWidth: '100%', textAlign: 'center' }}>
        <p style={{ color: event.pinned ? '#e8202a' : '#888', fontSize: 11, letterSpacing: '.12em', marginBottom: 16 }}>{event.pinned ? 'PINNED / ' : ''}{event.date}</p>
        <GlassFolder label={event.title} meta={event.date} art={event.art} seed={i + 7} width={280} files={[{ name: 'Open photo archive', meta: 'Google Drive', art: event.art }]} onFileSelect={() => window.open(event.driveUrl, '_blank', 'noopener,noreferrer')} />
        <h2 style={{ fontSize: 18, marginTop: 24 }}>{event.title}</h2>
        {event.description && <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.7, margin: '12px 0' }}>{event.description}</p>}
        <a href={event.driveUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', color: '#ddd', fontSize: 12, marginTop: 12, borderBottom: '1px solid #555', paddingBottom: 5 }}>Open on Google Drive</a>
      </article>)}
    </section>}
  </main>;
}
