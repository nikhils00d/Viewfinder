import SafeImage from '../components/SafeImage';
import GlassFolder from '../components/GlassFolder';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { PHOTOWALK_MEMORIES } from '../photowalkDefaults';
import './admin.css';

const emptyEvent = { section: 'events', title: '', date: '', description: '', tags: '', driveUrl: '', published: false, pinned: false, pinOrder: 0, art: 'ember' };

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
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const baseline = useRef(JSON.stringify(emptyEvent));
  const [dirtyWalks, setDirtyWalks] = useState([]);
  const eventDirty = JSON.stringify(editing) !== baseline.current;
  const unsaved = eventDirty || dirtyWalks.length > 0;
  function allowLeave(e) { if (unsaved && !window.confirm('You have unsaved changes. Leave without saving?')) { e?.preventDefault(); return false; } return true; }
  function editEvent(value) {
    if (eventDirty && !window.confirm('Discard the unsaved event changes?')) return;
    baseline.current = JSON.stringify(value); setEditing(value); setNotice('');
  }
  useEffect(() => {
    if (!unsaved) return;
    const warn = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unsaved]);
  async function refreshEvents() { setEvents(await api('/admin/events')); }
  async function load() {
    const [e, w] = await Promise.all([api('/admin/events'), api('/photowalks')]);
    setEvents(e);
    setWalks(PHOTOWALK_MEMORIES.map((p, slot) => ({ ...p, slot, link: '', ...w.find(row => row.slot === slot) })));
  }
  useEffect(() => {
    let alive = true;
    setLoading(true); setError(''); setReady(false); setUser(null);
    api('/admin/me').then(async u => {
      if (!alive) return;
      setUser(u);
      if (login) navigate('/admin', { replace: true });
      else { await load(); if (alive) setReady(true); }
    }).catch(e => {
      if (!alive) return;
      if ([401, 403].includes(e.status)) { if (!login) navigate('/admin/login', { replace: true }); }
      else setError(e.message);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [login, navigate, attempt]);
  async function action(fn, message) {
    setBusy(true); setError(''); setNotice('');
    try { await fn(); setNotice(message); }
    catch (e) { setError(e.message); if ([401, 403].includes(e.status)) navigate('/admin/login'); }
    finally { setBusy(false); }
  }
  const field = (label, key, type = 'text') => <label>{label}<input required={['title', 'date', 'driveUrl'].includes(key)} type={type} min={type === 'number' ? -10000 : undefined} max={type === 'number' ? 10000 : undefined} step={type === 'number' ? 1 : undefined} maxLength={key === 'title' ? 120 : key === 'tags' ? 300 : undefined} disabled={busy} value={editing[key]} onChange={e => setEditing({ ...editing, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} /></label>;
  return <main className="admin-shell">
    <header><Link onClick={allowLeave} to="/">Confluenz / Viewfinder</Link><Link onClick={allowLeave} to="/events">View archive</Link></header>
    <h1>{login ? 'Behind the lens.' : 'Archive studio.'}</h1>
    <p>{login ? 'Administrator sign in' : `Welcome, ${user?.name || 'administrator'}. Curate what comes into view.`}</p>
    {error && <p role="alert" className="admin-error">{error}</p>}
    {notice && <p role="status" className="admin-notice">{notice}</p>}
    {!loading && !login && !ready && <button onClick={() => setAttempt(attempt + 1)}>Retry loading studio</button>}
    {loading ? <p role="status">Loading studio…</p> : login ? <form className="admin-panel login-panel" onSubmit={e => {
      e.preventDefault(); const data = new FormData(e.currentTarget);
      action(async () => {
        await api('/auth/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(data)) });
        try { await api('/admin/me'); }
        catch (error) {
          if ([401, 403].includes(error.status)) throw new Error('Sign in succeeded, but the session cookie was not accepted. Check browser cookie settings or use a same-site API domain.');
          throw error;
        }
        navigate('/admin', { replace: true });
      }, '');
    }}>
      <label>Email<input name="email" type="email" autoComplete="username" required /></label>
      <label>Password<input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={200} /></label><button type="button" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide password' : 'Show password'}</button>
      <button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form> : user && ready && <>
      <nav><button aria-pressed={tab === 'events'} onClick={() => setTab('events')}>Events & collections</button><button aria-pressed={tab === 'walks'} onClick={() => setTab('walks')}>Photo walks · 8 slots</button><button disabled={busy} onClick={() => { if (!allowLeave()) return; action(async () => { await api('/auth/logout', { method: 'POST' }); navigate('/admin/login'); }, ''); }}>Sign out</button></nav>
      {tab === 'events' ? <div className="admin-columns">
        <section className="admin-panel"><h2>Events & collections · {events.length}</h2><p className="admin-help">{events.filter(e => e.published).length} published · {events.filter(e => !e.published).length} drafts · {events.filter(e => e.pinned).length} pinned</p><input aria-label="Search admin events" placeholder="Search events, year, tags…" value={search} onChange={e => setSearch(e.target.value)} />
          <button disabled={busy} onClick={() => editEvent({ ...emptyEvent })}>+ New event</button>
          {events.filter(e => `${e.title} ${e.date} ${e.tags}`.toLowerCase().includes(search.toLowerCase().trim())).map(event => <article key={event._id}>
            <h3>{event.title}</h3><span className="admin-help">{event.section === 'chitrakala' ? 'Chitraka' : 'Event archive'}</span><a className="admin-external" href={event.driveUrl} target="_blank" rel="noopener noreferrer">Check Drive link ↗</a><p>{event.date} · {event.published ? 'Published' : 'Draft'}{event.pinned ? ' · Pinned' : ''}</p>
            <button disabled={busy} onClick={() => { editEvent({ ...event }); }}>Edit</button>
            <button disabled={busy} onClick={() => action(async () => { await api(`/admin/events/${event._id}`, { method: 'PUT', body: JSON.stringify({ ...event, pinned: !event.pinned }) }); if (editing._id === event._id && !eventDirty) { const next = { ...editing, pinned: !event.pinned }; baseline.current = JSON.stringify(next); setEditing(next); } await refreshEvents(); }, 'Pin updated.')}>{event.pinned ? 'Unpin' : 'Pin'}</button>
            <button disabled={busy} onClick={() => { if (window.confirm(`Delete “${event.title}”? This cannot be undone.`)) action(async () => { await api(`/admin/events/${event._id}`, { method: 'DELETE' }); if (editing._id === event._id) { baseline.current = JSON.stringify(emptyEvent); setEditing({ ...emptyEvent }); } await refreshEvents(); }, 'Event deleted.'); }}>Delete</button>
          </article>)}
          {!!events.length && !events.some(e => `${e.title} ${e.date} ${e.tags}`.toLowerCase().includes(search.toLowerCase().trim())) && <p>No events match your search.</p>}
          {!events.length && <p>Add your first event to start the archive.</p>}
        </section>
        <form className="admin-panel" aria-busy={busy} onSubmit={e => { e.preventDefault(); action(async () => { const saved = await api(`/admin/events${editing._id ? `/${editing._id}` : ''}`, { method: editing._id ? 'PUT' : 'POST', body: JSON.stringify(editing) }); baseline.current = JSON.stringify(saved); setEditing(saved); await refreshEvents(); }, 'Event saved.'); }}>
          <h2>{editing._id ? 'Edit event' : 'New event'} {eventDirty && <small>· Unsaved</small>}</h2>
          <div className="admin-event-preview"><GlassFolder key={editing.art} label={editing.title || 'Your event'} meta={editing.date || 'Choose a date'} art={editing.art} width={220} files={[]} /></div>
          <p className="admin-help">Save as a draft while you prepare. Publish when the Drive folder is ready to share.</p>
          <label>Publish to<select disabled={busy} value={editing.section || 'events'} onChange={e => setEditing({ ...editing, section: e.target.value })}><option value="events">Event archive</option><option value="chitrakala">Chitraka</option></select></label>
          {field('Title', 'title')}{field('Event date', 'date', 'date')}{field('Google Drive link', 'driveUrl', 'url')}<p className="admin-help">Use a shared Google Drive folder link. Set its access permissions in Drive.</p>{field('Tags (e.g. campus, festival)', 'tags')}
          <label>Description<textarea disabled={busy} maxLength={1500} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
          <label>Folder artwork<select disabled={busy} value={editing.art} onChange={e => setEditing({ ...editing, art: e.target.value })}>{['ember', 'dusk', 'aurora', 'glacier', 'verdant'].map(a => <option key={a}>{a}</option>)}</select></label>
          <label className="check"><input disabled={busy} type="checkbox" checked={editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} />Published</label>
          <label className="check"><input disabled={busy} type="checkbox" checked={editing.pinned} onChange={e => setEditing({ ...editing, pinned: e.target.checked })} />Pinned</label>
          {editing.pinned && field('Pinned order (lower first)', 'pinOrder', 'number')}
          <button className="admin-primary" disabled={busy}>{busy ? 'Saving…' : 'Save event'}</button>
        </form>
      </div> : <section><p>Replace any slot with your latest photo walk. Use a direct HTTPS image URL for the thumbnail and any HTTPS destination for the click.</p><div className="walk-edit-grid">{walks.map((walk, i) => <form className="admin-panel" aria-busy={busy} key={i} onSubmit={e => { e.preventDefault(); action(() => api(`/admin/photowalks/${i}`, { method: 'PUT', body: JSON.stringify(walk) }).then(saved => { setWalks(current => current.map((w, n) => n === i ? { ...w, ...saved } : w)); setDirtyWalks(current => current.filter(n => n !== i)); }), `Photo walk slot ${i + 1} saved.`); }}>
        <h2>Frame {i + 1} {dirtyWalks.includes(i) && <small>· Unsaved</small>}</h2><SafeImage className="walk-preview" src={walk.url} alt={walk.title} referrerPolicy="no-referrer" />
        {[['Title', 'title'], ['Thumbnail image URL', 'url'], ['Destination URL', 'link'], ['Location', 'location'], ['Date label', 'date']].map(([label, key]) => <label key={key}>{label}<input required={['title', 'url', 'link'].includes(key)} type={['url', 'link'].includes(key) ? 'url' : 'text'} maxLength={key === 'title' || key === 'location' ? 120 : key === 'date' ? 80 : undefined} disabled={busy} value={walk[key]} onChange={e => { setWalks(walks.map((w, n) => n === i ? { ...w, [key]: e.target.value } : w)); setDirtyWalks(current => [...new Set([...current, i])]); }} /></label>)}
        <button disabled={busy}>{busy ? 'Saving…' : 'Save frame'}</button>
      </form>)}</div></section>}
    </>}
  </main>;
}
