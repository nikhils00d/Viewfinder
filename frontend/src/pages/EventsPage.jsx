import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import GlassFolder from '../components/GlassFolder';
import GlassNavbar from '../components/GlassNavbar';
import { api } from '../api';
import './archive.css';

const PAGE_SIZE = 9;
function prettyDate(date) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}
function Description({ text }) {
  const [expanded, setExpanded] = useState(false);
  return <><p className={`event-description${expanded ? ' expanded' : ''}`}>{text}</p>{text.length > 180 && <button className="event-read-more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show less' : 'Read more'}</button>}</>;
}
export default function EventsPage({ collection = false }) {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const year = params.get('year') || '';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [page, setPage] = useState(1);
  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    api(collection ? '/collections' : '/events').then(rows => { if (alive) setEvents(rows); }).catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [retry, collection]);
  const years = [...new Set(events.map(e => e.date.slice(0, 4)))].sort().reverse();
  const filtered = useMemo(() => {
    const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return events.filter(e => (!year || e.date.startsWith(year)) && words.every(word => `${e.title} ${e.date} ${prettyDate(e.date)} ${e.description} ${e.tags}`.toLowerCase().includes(word)));
  }, [events, search, year]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  function filter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true }); setPage(1);
  }
  return <main className="archive-page">
    <GlassNavbar />
    <div className="archive-grid-bg" aria-hidden="true" />
    <header className="archive-intro">
      <p className="archive-kicker"><span /> THE CONFLUENZ COLLECTION</p>
      <h1>{collection ? <>Chitraka.<br /><em>A different perspective.</em></> : <>Moments worth<br /><em>coming back to.</em></>}</h1>
      <p className="archive-subtitle">{collection ? <>Images, experiments, and stories by our community.<br />Discover the collections behind the craft.</> : <>From the first frame to the final celebration.<br />Find your event. Revisit your memories.</>}</p>
      <a className="archive-jump" href="#archive-results">Explore the archive <span aria-hidden="true">↓</span></a>
    </header>
    <section className="archive-content" id="archive-results" aria-label="Find event photos">
      <div className="archive-toolbar">
        <label className="archive-search"><span>Search the archive</span><div><span aria-hidden="true">⌕</span><input type="search" placeholder="Event name, month, year, or tag" value={search} onChange={e => filter('q', e.target.value)} /></div></label>
        <label className="archive-year"><span>Year</span><select value={year} onChange={e => filter('year', e.target.value)}><option value="">All years</option>{year && !years.includes(year) && <option value={year}>{year}</option>}{years.map(y => <option key={y}>{y}</option>)}</select></label>
      </div>
      <div className="archive-result-line"><p role="status">{loading ? 'Finding your frames…' : error ? 'Archive temporarily unavailable' : `${filtered.length} ${collection ? (filtered.length === 1 ? 'collection' : 'collections') : (filtered.length === 1 ? 'event' : 'events')}${search || year ? ' found' : ' in the archive'}`}</p>{(search || year) && <button onClick={() => { setParams({}); setPage(1); }}>Clear filters ×</button>}<span>Pinned first · Newest next</span></div>
      {loading ? <div className="event-grid" aria-label="Loading events">{[0, 1, 2].map(i => <div key={i} className="archive-skeleton" />)}</div> : error ? <div className="archive-empty" role="alert"><span className="empty-symbol">↻</span><h2>A little out of focus.</h2><p>{error}</p><button className="archive-button" onClick={() => setRetry(retry + 1)}>Try again</button></div> : !filtered.length ? <div className="archive-empty"><span className="empty-symbol">⌕</span><h2>{search || year ? 'No frames found.' : 'The next chapter is coming.'}</h2><p>{search || year ? 'Try another event name, year, or keyword.' : 'We’re curating the archive. New collections will appear here.'}</p>{(search || year) && <button className="archive-button" onClick={() => { setParams({}); setPage(1); }}>Show all events</button>}</div> : <div className="event-grid">{visible.map((event, i) => <article className="event-card" key={event._id}>
        <div className="event-card-meta"><time dateTime={event.date}>{prettyDate(event.date)}</time>{event.pinned && <span className="event-pin">↗ PINNED</span>}</div>
        <div className="event-folder"><GlassFolder label={event.title} meta={event.date.slice(0, 4)} art={event.art} seed={event._id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)} width={268} href={event.driveUrl} files={[]} appearDelay={i * 45} /></div>
        <div className="event-copy"><h2><a href={event.driveUrl} target="_blank" rel="noopener noreferrer">{event.title}</a></h2>{event.description && <Description text={event.description} />}{event.tags && <div className="event-tags">{event.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 4).map((tag, n) => <button key={`${tag}-${n}`} onClick={() => filter('q', tag)}>{tag}</button>)}</div>}<a className="event-open" href={event.driveUrl} target="_blank" rel="noopener noreferrer">Explore photos <span aria-hidden="true">↗</span><span className="sr-only"> on Google Drive, opens a new tab</span></a></div>
      </article>)}</div>}
      {!loading && !error && pages > 1 && <nav className="archive-pagination" aria-label="Archive pages"><button disabled={current === 1} onClick={() => { setPage(current - 1); document.getElementById('archive-results')?.scrollIntoView(); }}>← Previous</button><span>{current} / {pages}</span><button disabled={current === pages} onClick={() => { setPage(current + 1); document.getElementById('archive-results')?.scrollIntoView(); }}>Next →</button></nav>}
    </section>
    <footer className="archive-footer"><Link to="/">VIEWFINDER / CONFLUENZ</Link><p>Photos live on Google Drive. Access follows each collection’s sharing settings.</p><span>Made to remember.</span></footer>
  </main>;
}
