import React, { useMemo, useState } from 'react';
import GlassFolder from '../components/GlassFolder';
import GlassNavbar from '../components/GlassNavbar';

const PAGE_SIZE = 6;

const COLLECTIONS = [
  {
    id: 'monsoon-studies',
    title: 'Monsoon Studies',
    year: '2026',
    category: 'Photo essays',
    art: 'glacier',
    seed: 19,
    description: 'Quiet frames from the city after the first rain.',
    works: ['Rain on Residency Road', 'Blue Hour, Cubbon Park', 'The Last Bus Home'],
  },
  {
    id: 'everyday-rituals',
    title: 'Everyday Rituals',
    year: '2026',
    category: 'Portraits',
    art: 'dusk',
    seed: 23,
    description: 'Portraits of the gestures that make a place feel lived in.',
    works: ['Morning Tea', 'The Tailor', 'Sunday Flowers'],
  },
  {
    id: 'red-earth',
    title: 'Red Earth',
    year: '2025',
    category: 'Documentary',
    art: 'ember',
    seed: 31,
    description: 'A study of work, warmth, and the landscape around us.',
    works: ['Kiln Light', 'Hands of Clay', 'After the Harvest'],
  },
  {
    id: 'found-light',
    title: 'Found Light',
    year: '2025',
    category: 'Experiments',
    art: 'aurora',
    seed: 37,
    description: 'Abstracted light collected from ordinary corners.',
    works: ['Window Seat', 'Silver Corridor', 'Untitled No. 04'],
  },
  {
    id: 'still-water',
    title: 'Still Water',
    year: '2024',
    category: 'Photo essays',
    art: 'glacier',
    seed: 41,
    description: 'Reflections and pauses from the edges of the lake.',
    works: ['East Bank', 'Two Boats', 'Low Tide'],
  },
  {
    id: 'city-notes',
    title: 'City Notes',
    year: '2024',
    category: 'Documentary',
    art: 'verdant',
    seed: 47,
    description: 'Small observations from a changing city.',
    works: ['Route 500', 'Corner Shop', 'The Long Walk'],
  },
  {
    id: 'soft-geometry',
    title: 'Soft Geometry',
    year: '2023',
    category: 'Experiments',
    art: 'verdant',
    seed: 53,
    description: 'Lines, shadows, and the rhythm of built spaces.',
    works: ['Concrete Garden', 'Stairwell', 'Three Windows'],
  },
  {
    id: 'first-frames',
    title: 'First Frames',
    year: '2023',
    category: 'Portraits',
    art: 'dusk',
    seed: 59,
    description: 'The first portrait series from the Confluenz archive.',
    works: ['Ananya', 'Arjun', 'Meera'],
  },
];

const CATEGORIES = ['All', ...new Set(COLLECTIONS.map((collection) => collection.category))];

const folderFiles = (collection) => collection.works.map((name, index) => ({
  name,
  meta: `${collection.category} · ${collection.year}`,
  art: index % 2 === 0 ? collection.art : undefined,
}));

export default function ChitrakalaPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedWork, setSelectedWork] = useState(null);

  const filteredCollections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return COLLECTIONS.filter((collection) => {
      const searchable = [
        collection.title,
        collection.category,
        collection.year,
        collection.description,
        ...collection.works,
      ].join(' ').toLowerCase();
      return (category === 'All' || collection.category === category)
        && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, query]);

  const pageCount = Math.max(1, Math.ceil(filteredCollections.length / PAGE_SIZE));
  const visibleCollections = filteredCollections.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateQuery = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  const updateCategory = (nextCategory) => {
    setCategory(nextCategory);
    setPage(1);
  };

  return (
    <main style={styles.page}>
      <GlassNavbar />
      <div aria-hidden="true" style={styles.dotGrid} />

      <header style={styles.header}>
        <div style={styles.eyebrow}><span style={styles.redDot} /> VF / Chitrakala</div>
        <div style={styles.archiveCode}>A-03 / {COLLECTIONS.length.toString().padStart(2, '0')} collections</div>
      </header>

      <section style={styles.intro} aria-labelledby="chitrakala-title">
        <p style={styles.kicker}>Confluenz visual archive</p>
        <h1 id="chitrakala-title" style={styles.title}>Chitrakala</h1>
        <p style={styles.subtitle}>
          A living record of images, experiments, and stories made by the community.
        </p>
      </section>

      <section style={styles.controls} aria-label="Filter archive">
        <label style={styles.searchLabel} htmlFor="archive-search">Search archive</label>
        <input
          id="archive-search"
          type="search"
          value={query}
          onChange={updateQuery}
          placeholder="Title, year, or keyword"
          style={styles.search}
        />
        <div style={styles.filters} role="group" aria-label="Filter by category">
          {CATEGORIES.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => updateCategory(item)}
              aria-pressed={category === item}
              style={{ ...styles.filterButton, ...(category === item ? styles.filterButtonActive : {}) }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div style={styles.resultLine} aria-live="polite">
        <span>{filteredCollections.length} {filteredCollections.length === 1 ? 'collection' : 'collections'}</span>
        <span>{filteredCollections.length ? `Page ${page} of ${pageCount}` : 'No matches'}</span>
      </div>

      <section style={styles.grid} aria-label="Chitrakala collections">
        {visibleCollections.map((collection, index) => (
          <article key={collection.id} style={styles.collection}>
            <GlassFolder
              label={collection.title}
              meta={`${collection.year} · ${collection.category}`}
              art={collection.art}
              seed={collection.seed}
              files={folderFiles(collection)}
              labelPlacement="bottom-left"
              appearDelay={index * 70}
              width={300}
              onFileSelect={(file) => setSelectedWork({
                name: file.name,
                collection: collection.title,
                year: collection.year,
                category: collection.category,
              })}
            />
            <div style={styles.collectionCopy}>
              <div>
                <h2 style={styles.collectionTitle}>{collection.title}</h2>
                <p style={styles.description}>{collection.description}</p>
              </div>
              <span style={styles.collectionCount}>{collection.works.length} works</span>
            </div>
          </article>
        ))}
      </section>

      {visibleCollections.length === 0 && (
        <div style={styles.emptyState}>
          <p>No work matches “{query || category}”.</p>
          <button type="button" onClick={() => { setQuery(''); updateCategory('All'); }} style={styles.resetButton}>
            Clear filters
          </button>
        </div>
      )}

      {pageCount > 1 && (
        <nav style={styles.pagination} aria-label="Archive pages">
          <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} style={styles.pageButton}>
            Previous
          </button>
          <span style={styles.pageNumber}>{page.toString().padStart(2, '0')} / {pageCount.toString().padStart(2, '0')}</span>
          <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} style={styles.pageButton}>
            Next
          </button>
        </nav>
      )}

      {selectedWork && (
        <div style={styles.detailBar} role="status">
          <span><strong>{selectedWork.name}</strong> · {selectedWork.collection} · {selectedWork.year}</span>
          <button type="button" onClick={() => setSelectedWork(null)} style={styles.closeButton} aria-label="Close selected work">×</button>
        </div>
      )}

      <footer style={styles.footer}>
        <span>Confluenz Photography Club</span>
        <span>Chitrakala / 2026</span>
      </footer>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0A0A0A', color: '#fff', position: 'relative', overflow: 'hidden', paddingBottom: '1px' },
  dotGrid: { position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1.4px)', backgroundSize: '22px 22px', opacity: 0.07 },
  header: { position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', padding: '28px 48px 0', fontFamily: '"DM Mono", monospace', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' },
  eyebrow: { display: 'flex', alignItems: 'center' },
  redDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#E8202A', display: 'inline-block', marginRight: '10px', animation: 'redPulse 1.5s ease-in-out infinite' },
  archiveCode: { color: 'rgba(255,255,255,0.25)' },
  intro: { position: 'relative', zIndex: 1, textAlign: 'center', padding: '68px 24px 44px' },
  kicker: { fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' },
  title: { fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(52px, 8vw, 96px)', lineHeight: 0.95, letterSpacing: '0.02em', margin: 0 },
  subtitle: { maxWidth: '430px', margin: '20px auto 0', fontFamily: '"Inter", sans-serif', fontSize: '14px', lineHeight: 1.7, fontWeight: 300, color: 'rgba(255,255,255,0.48)' },
  controls: { position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '0 48px 24px', display: 'flex', alignItems: 'end', gap: '24px', flexWrap: 'wrap' },
  searchLabel: { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)' },
  search: { flex: '1 1 220px', minWidth: '220px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: '#fff', padding: '13px 15px', fontFamily: '"DM Mono", monospace', fontSize: '11px', letterSpacing: '0.05em', outline: 'none' },
  filters: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterButton: { border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.45)', borderRadius: '999px', padding: '10px 13px', fontFamily: '"DM Mono", monospace', fontSize: '10px', cursor: 'pointer' },
  filterButtonActive: { background: 'rgba(255,255,255,0.9)', color: '#0A0A0A', border: '1px solid #fff' },
  resultLine: { position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '0 48px 10px', display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' },
  grid: { position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '25px 48px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '72px 36px' },
  collection: { minWidth: 0 },
  collectionCopy: { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start', marginTop: '18px', padding: '0 4px' },
  collectionTitle: { fontFamily: '"Playfair Display", serif', fontSize: '21px', fontWeight: 400, margin: 0 },
  description: { fontFamily: '"Inter", sans-serif', fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.35)', margin: '7px 0 0', maxWidth: '220px' },
  collectionCount: { flexShrink: 0, fontFamily: '"DM Mono", monospace', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', paddingTop: '4px' },
  emptyState: { position: 'relative', zIndex: 1, textAlign: 'center', padding: '80px 24px 140px', fontFamily: '"DM Mono", monospace', color: 'rgba(255,255,255,0.4)' },
  resetButton: { marginTop: '20px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', padding: '10px 15px', fontFamily: '"DM Mono", monospace', fontSize: '10px', cursor: 'pointer' },
  pagination: { position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', padding: '0 48px 80px', fontFamily: '"DM Mono", monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' },
  pageButton: { border: 0, background: 'transparent', color: 'rgba(255,255,255,0.55)', padding: '10px', cursor: 'pointer', font: 'inherit' },
  pageNumber: { color: 'rgba(255,255,255,0.25)' },
  detailBar: { position: 'fixed', zIndex: 20, left: '50%', bottom: '24px', transform: 'translateX(-50%)', width: 'min(540px, calc(100vw - 32px))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '4px', background: 'rgba(16,16,16,0.85)', backdropFilter: 'blur(18px)', fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'rgba(255,255,255,0.55)' },
  closeButton: { border: 0, background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '20px', lineHeight: 1 },
  footer: { position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 48px', display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' },
};
