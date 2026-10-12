import React from 'react';
import GlassFolder from '../components/GlassFolder';

const RedDot = () => (
  <div
    style={{
      width: '6px', height: '6px', borderRadius: '50%', background: '#E8202A',
      display: 'inline-block', marginRight: '10px', verticalAlign: 'middle',
      animation: 'redPulse 1.5s ease-in-out infinite',
    }}
  />
);

const INDEPENDENCE_DAY_FILES = [
  { name: 'Gallery', meta: '48 photos', art: 'ember' },
  { name: 'Highlights', meta: '12 photos', art: 'dusk' },
  { name: 'Candids', meta: '24 photos' },
  { name: 'Portraits', meta: '8 photos', art: 'verdant' },
];

const FDP_FILES = [
  { name: 'Workshop I', meta: '36 photos', art: 'dusk' },
  { name: 'Workshop II', meta: '29 photos', art: 'glacier' },
  { name: 'Sessions', meta: '17 photos' },
  { name: 'Closing', meta: '22 photos', art: 'aurora' },
];

const ORIENTATION_FILES = [
  { name: 'Welcome', meta: '54 photos', art: 'aurora' },
  { name: 'Activities', meta: '40 photos', art: 'ember' },
  { name: 'Club Expo', meta: '31 photos' },
  { name: 'Group Shots', meta: '16 photos', art: 'dusk' },
];

export default function EventsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', position: 'relative', overflow: 'hidden' }}>

      {/* Dot-grid background */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1.4px)',
          backgroundSize: '22px 22px',
          opacity: 0.07,
          zIndex: 0,
        }}
      />

      {/* HUD header */}
      <header style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 48px 0',
        fontFamily: '"DM Mono", monospace',
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.5)' }}>
          <RedDot />
          <span>VF / Events</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em' }}>
          {new Date().getFullYear()} — Archive
        </div>
      </header>

      {/* Page title */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '60px 24px 0' }}>
        <h1
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(38px, 5.5vw, 72px)',
            letterSpacing: '0.02em',
            lineHeight: 1,
            color: '#fff',
            marginBottom: '12px',
          }}
        >
          Event Archive
        </h1>
        <p style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '11px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
        }}>
          Hover to lean · Click to open
        </p>
      </div>

      {/* Folder grid */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '56px 48px',
        padding: '80px 48px 120px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <GlassFolder
            label="Independence Day"
            meta="Aug 2026"
            art="ember"
            seed={7}
            files={INDEPENDENCE_DAY_FILES}
            labelPlacement="bottom-left"
            appearDelay={0}
            width={300}
          />
          <p style={tagStyle}>Independence Day</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <GlassFolder
            label="FDP 26'"
            meta="Feb 2026"
            art="dusk"
            seed={3}
            files={FDP_FILES}
            labelPlacement="bottom-left"
            appearDelay={140}
            width={300}
          />
          <p style={tagStyle}>FDP 26'</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <GlassFolder
            label="Orientation 2026"
            meta="Jul 2026"
            art="aurora"
            seed={11}
            files={ORIENTATION_FILES}
            labelPlacement="bottom-left"
            appearDelay={280}
            width={300}
          />
          <p style={tagStyle}>Orientation 2026</p>
        </div>
      </div>

      {/* Bottom HUD line */}
      <div style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: '"DM Mono", monospace',
        fontSize: '10px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.2)',
      }}>
        <span>Confluenz Photography Club</span>
        <span>VF — 2026</span>
      </div>
    </div>
  );
}

const tagStyle = {
  fontFamily: '"DM Mono", monospace',
  fontSize: '10px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.28)',
  margin: 0,
};
