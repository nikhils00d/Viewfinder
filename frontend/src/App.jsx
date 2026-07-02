import React, { useState, useEffect, useRef } from 'react';

const ViewfinderBrackets = () => (
  <div className="absolute inset-0 pointer-events-none z-10">
    <svg className="absolute top-[10vw] left-[10vw]" width="41.5" height="41.5" viewBox="0 0 41.5 41.5" fill="none">
      <path d="M1.5 41.5L1.5 1.5L41.5 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
    <svg className="absolute top-[10vw] right-[10vw]" width="41.5" height="41.5" viewBox="0 0 41.5 41.5" fill="none">
      <path d="M40 41.5V1.5H0" stroke="white" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
    <svg className="absolute bottom-[10vw] right-[10vw]" width="41.5" height="41.5" viewBox="0 0 41.5 41.5" fill="none">
      <path d="M0 40H40V0" stroke="white" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
    <svg className="absolute bottom-[10vw] left-[10vw]" width="41.5" height="41.5" viewBox="0 0 41.5 41.5" fill="none">
      <path d="M41.5 40H1.5L1.5 0" stroke="white" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  </div>
);

const RedDot = () => (
  <div
    className="absolute z-10 bg-[#E8202A] rounded-full"
    style={{
      width: '6px',
      height: '6px',
      top: 'calc(10vw + 8px)',
      right: 'calc(10vw + 8px)',
      animation: 'redPulse 1.5s ease-in-out infinite'
    }}
  />
);

const HeroText = () => (
  <div
    className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap z-10 flex flex-col items-center"
    style={{ top: 'calc(50% - 290px)' }}
  >
    <div
      className="italic text-white"
      style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(52px, 7.5vw, 96px)', fontWeight: 400, letterSpacing: '0.05em', lineHeight: 1 }}
    >
      ViewFinder
    </div>
    <div
      className="text-white"
      style={{
        color: '#ffffffff', opacity: 0.7
        , fontFamily: '"inter", sans-serif', fontSize: 'clamp(15px, 1.6vw, 22px)', fontWeight: 300, letterSpacing: '0em', marginTop: '5px'
      }}
    >
      By Confluenz.
    </div>
    <div
      className="text-[#888888]"
      style={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', fontWeight: 400, letterSpacing: '0.08em', marginTop: '12px' }}
    >

    </div>
  </div>
);

const Reticle = ({ showFocusBar }) => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="8" stroke="white" strokeWidth="1.5" />
        <line x1="26" y1="7" x2="26" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="square" />
        <line x1="26" y1="39" x2="26" y2="45" stroke="white" strokeWidth="1.5" strokeLinecap="square" />
        <line x1="7" y1="26" x2="13" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="square" />
        <line x1="39" y1="26" x2="45" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
      <div
        className="mt-[10px] bg-[#E8202A]"
        style={{
          width: '120px',
          height: '1.5px',
          opacity: showFocusBar ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }}
      />
    </div>
  );
};

const LeftHUD = () => (
  <div
    className="absolute left-[48px] top-1/2 -translate-y-1/2 flex flex-col gap-[16px] uppercase z-10"
    style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', fontWeight: 400, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em' }}
  >
    <div>ISO 3200</div>
    <div>▲ ▼</div>
    <div>[ • • • ]</div>
    <div>▮▮▮▯</div>
    <div>AF-S</div>
  </div>
);

const RightHUD = () => (
  <div
    className="absolute right-[48px] top-1/2 -translate-y-1/2 flex flex-col gap-[16px] items-end uppercase z-10"
    style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', fontWeight: 400, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em' }}
  >
    <div style={{ color: '#E8202A', fontWeight: 500 }}>F / 1.8</div>
    <div>1/200</div>
    <div>▣</div>
    <div>+0.3 EV</div>
    <svg width="33" height="16" viewBox="0 0 33 16" fill="none">
      <rect x="0" y="14" width="5" height="2" fill="rgba(255,255,255,0.6)" />
      <rect x="7" y="11" width="5" height="5" fill="rgba(255,255,255,0.6)" />
      <rect x="14" y="7" width="5" height="9" fill="rgba(255,255,255,0.6)" />
      <rect x="21" y="9" width="5" height="7" fill="rgba(255,255,255,0.6)" />
      <rect x="28" y="12" width="5" height="4" fill="rgba(255,255,255,0.6)" />
    </svg>
  </div>
);

export default function App() {
  const [scrollData, setScrollData] = useState({
    blurPx: 20,
    overlayOpacity: 0.6,
    showFocusBar: false,
    focusProgress: 0,
  });

  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Focus phase: first 0.5vh of scrolling
      const focusDistance = 0.20 * vh;
      const focusProgress = Math.max(0, Math.min(1, scrollY / focusDistance));

      const blurPx = Math.max(0, 20 * (1 - focusProgress));
      const showFocusBar = focusProgress >= 0.8;

      let overlayOpacity = 0.6 - (0.3 * focusProgress); // 0.6 -> 0.3

      // Darken phase: starts after focus finishes
      if (scrollY > focusDistance) {
        const darkenDistance = 1.0 * vh; // Over the next 1vh of scrolling
        const darkenProgress = Math.max(0, Math.min(1, (scrollY - focusDistance) / darkenDistance));
        overlayOpacity = 0.3 + (0.6 * darkenProgress); // 0.3 -> 0.9 (much darker)
      }

      setScrollData({ blurPx, overlayOpacity, showFocusBar, focusProgress });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full text-white">
      {/* Fixed Background for entire page */}
      <div className="fixed inset-0 -z-10">
        {/* Background Photo */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1766343672890-4a19459a4e8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(${scrollData.blurPx}px)`,
            transform: 'scale(1.06)',
          }}
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${scrollData.overlayOpacity})` }}
        />
      </div>

      {/* Hero section */}
      <div ref={heroRef} style={{ height: '130vh' }}>
        <div className="sticky top-0 h-[100vh] w-full overflow-hidden">

          {/* UI Elements */}
          <ViewfinderBrackets />
          <RedDot />
          <HeroText />
          <Reticle showFocusBar={scrollData.showFocusBar} />
          <LeftHUD />
          <RightHUD />

          {/* Scroll cue */}
          <div
            className="absolute uppercase whitespace-nowrap z-10"
            style={{
              fontFamily: '"DM Mono", monospace',
              bottom: 'calc(10vw + 16px)',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.28)',
              opacity: scrollData.focusProgress > 0.05 ? 0 : 1,
              transition: 'opacity 0.6s ease'
            }}
          >
            scroll to focus
          </div>
        </div>
      </div>

      {/* Below section */}
      <div
        className="h-[100vh] w-full flex items-center justify-center bg-transparent"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="text-white opacity-25 uppercase"
          style={{ fontFamily: '"DM Mono", monospace', fontSize: '14px', letterSpacing: '0.1em' }}
        >
          — next section —
        </div>
      </div>
    </div>
  );
}
