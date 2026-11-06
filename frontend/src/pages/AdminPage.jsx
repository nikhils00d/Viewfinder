import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { PHOTOWALK_MEMORIES } from '../photowalkDefaults';
import './admin.css';

const emptyEvent = { title: '', date: '', description: '', tags: '', driveUrl: '', published: false, pinned: false, pinOrder: 0, art: 'ember' };

export default function AdminPage({ login = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState([]);
  const [walks, setWalks] = useState(PHOTOWALK_MEMORIES.map((p, slot) => ({ ...p, slot, link: '' })));
  const [editing, setEditing] = useState({ ...emptyEvent });
  const [tab, setTab] = useState('events');
  const [search, setSearch] = useState('');
  async function load() {
    const [e, w] = await Promise.all([api('/admin/events'), api('/photowalks')]);
    setEvents(e);
    setWalks(PHOTOWALK_MEMORIES.map((p, slot) => ({ ...p, slot, link: '', ...w.find(row => row.slot === slot) })));
  }
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api('/admin/me').then(async u => {
      if (!alive) return;
      setUser(u);
      if (login) navigate('/admin', { replace: true });
      else await load();
    }).catch(e => {
      if (!alive) return;
      if ([401, 403].includes(e.status)) { if (!login) navigate('/admin/login', { replace: true }); }
      else setError(e.message);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [login, navigate]);
  async function action(fn, message) {
    setBusy(true); setError(''); setNotice('');
    try { await fn(); setNotice(message); }
    catch (e) { setError(e.message); if (e.status === 401) navigate('/admin/login'); }
    finally { setBusy(false); }
  }
  const field = (label, key, type = 'text') => <label>{label}<input required={['title', 'date', 'driveUrl'].includes(key)} type={type} maxLength={key === 'title' ? 120 : key === 'tags' ? 300 : undefined} value={editing[key]} onChange={e => setEditing({ ...editing, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} /></label>;
  return <main className="admin-shell">
    <header><Link to="/">Confluenz / Viewfinder</Link><Link to="/events">View archive</Link></header>
    <h1>{login ? 'Behind the lens.' : 'Archive studio.'}</h1>
    <p>{login ? 'Administrator sign in' : `Welcome, ${user?.name || 'administrator'}. Curate what comes into view.`}</p>
    {error && <p role="alert" className="admin-error">{error}</p>}
    {notice && <p role="status" className="admin-notice">{notice}</p>}
    {loading ? <p role="status">Loading studio…</p> : login ? <form className="admin-panel login-panel" onSubmit={e => {
      e.preventDefault(); const data = new FormData(e.currentTarget);
      action(async () => { await api('/auth/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(data)) }); navigate('/admin', { replace: true }); }, '');
    }}>
      <label>Email<input name="email" type="email" autoComplete="username" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      <button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form> : user && <>
      <nav><button aria-pressed={tab === 'events'} onClick={() => setTab('events')}>Events</button><button aria-pressed={tab === 'walks'} onClick={() => setTab('walks')}>Photo walks · 8 slots</button><button disabled={busy} onClick={() => action(async () => { await api('/auth/logout', { method: 'POST' }); navigate('/admin/login'); }, '')}>Sign out</button></nav>
      {tab === 'events' ? <div className="admin-columns">
        <section className="admin-panel"><h2>Events · {events.length}</h2><input aria-label="Search admin events" placeholder="Search events, year, tags…" value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => setEditing({ ...emptyEvent })}>+ New event</button>
          {events.filter(e => `${e.title} ${e.date} ${e.tags}`.toLowerCase().includes(search.toLowerCase().trim())).map(event => <article key={event._id}>
            <h3>{event.title}</h3><p>{event.date} · {event.published ? 'Published' : 'Draft'}{event.pinned ? ' · Pinned' : ''}</p>
            <button disabled={busy} onClick={() => { setEditing({ ...event }); setNotice(''); }}>Edit</button>
            <button disabled={busy} onClick={() => action(async () => { await api(`/admin/events/${event._id}`, { method: 'PUT', body: JSON.stringify({ ...event, pinned: !event.pinned }) }); await load(); }, 'Pin updated.')}>{event.pinned ? 'Unpin' : 'Pin'}</button>
            <button disabled={busy} onClick={() => { if (window.confirm(`Delete “${event.title}”? This cannot be undone.`)) action(async () => { await api(`/admin/events/${event._id}`, { method: 'DELETE' }); if (editing._id === event._id) setEditing({ ...emptyEvent }); await load(); }, 'Event deleted.'); }}>Delete</button>
          </article>)}
          {!events.length && <p>Add your first event to start the archive.</p>}
        </section>
        <form className="admin-panel" onSubmit={e => { e.preventDefault(); action(async () => { await api(`/admin/events${editing._id ? `/${editing._id}` : ''}`, { method: editing._id ? 'PUT' : 'POST', body: JSON.stringify(editing) }); setEditing({ ...emptyEvent }); await load(); }, 'Event saved.'); }}>
          <h2>{editing._id ? 'Edit event' : 'New event'}</h2>
          {field('Event title', 'title')}{field('Event date', 'date', 'date')}{field('Google Drive link', 'driveUrl', 'url')}{field('Tags (e.g. campus, festival)', 'tags')}
          <label>Description<textarea maxLength={1500} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
          <label>Folder artwork<select value={editing.art} onChange={e => setEditing({ ...editing, art: e.target.value })}>{['ember', 'dusk', 'aurora', 'glacier', 'verdant'].map(a => <option key={a}>{a}</option>)}</select></label>
          <label className="check"><input type="checkbox" checked={editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} />Published</label>
          <label className="check"><input type="checkbox" checked={editing.pinned} onChange={e => setEditing({ ...editing, pinned: e.target.checked })} />Pinned</label>
          {field('Pinned order (lower first)', 'pinOrder', 'number')}
          <button disabled={busy}>{busy ? 'Saving…' : 'Save event'}</button>
        </form>
      </div> : <section><p>Replace any slot with your latest photo walk. Use a direct HTTPS image URL for the thumbnail and any HTTPS destination for the click.</p><div className="walk-edit-grid">{walks.map((walk, i) => <form className="admin-panel" key={i} onSubmit={e => { e.preventDefault(); action(() => api(`/admin/photowalks/${i}`, { method: 'PUT', body: JSON.stringify(walk) }), `Photo walk slot ${i + 1} saved.`); }}>
        <h2>Frame {i + 1}</h2><img className="walk-preview" src={walk.url} alt={walk.title} referrerPolicy="no-referrer" />
        {[['Title', 'title'], ['Thumbnail image URL', 'url'], ['Destination URL', 'link'], ['Location', 'location'], ['Date label', 'date']].map(([label, key]) => <label key={key}>{label}<input required={['title', 'url', 'link'].includes(key)} type={['url', 'link'].includes(key) ? 'url' : 'text'} maxLength={key === 'title' || key === 'location' ? 120 : key === 'date' ? 80 : undefined} value={walk[key]} onChange={e => setWalks(walks.map((w, n) => n === i ? { ...w, [key]: e.target.value } : w))} /></label>)}
        <button disabled={busy}>{busy ? 'Saving…' : 'Save frame'}</button>
      </form>)}</div></section>}
    </>}
  </main>;
}
