import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Home',       href: '/',            type: 'route'  },
  { label: 'About Us',   href: '/#confluenz',  type: 'anchor' },
  { label: 'Events',     href: '/events',      type: 'route'  },
  { label: 'Works',      href: '/#photowalks', type: 'anchor' },
  { label: 'Chitraka', href: '/chitraka',  type: 'route'  },
  { label: 'Contact Us', href: '/#contact',    type: 'anchor' },
];

// ── Lerp / easing helpers ────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }
function easeOut(t) { return 1 - Math.pow(1 - t, 2.4); }

// ── Scroll range over which the full transition happens ─────────────────────
const SHRINK_DISTANCE = 260;

// ── Expanded ↔ compact design tokens (interpolated by scrollProgress) ───────
const EXPANDED = {
  width:          820,   // px (max, before vw clamp kicks in)
  paddingX:       26,    // px
  paddingY:       10,    // px
  fontSize:       11,    // px
  letterSpacing:  0.10,  // em
  bgAlpha:        0.055,
  borderAlpha:    0.10,
  shadowBlur:     32,
  shadowSpread:   8,
  shadowAlpha:    0.35,
};

const COMPACT = {
  width:          520,
  paddingX:       20,
  paddingY:       7,
  fontSize:       10.5,
  letterSpacing:  0.08,
  bgAlpha:        0.07,
  borderAlpha:    0.08,
  shadowBlur:     44,
  shadowSpread:   14,
  shadowAlpha:    0.50,
};

export default function GlassNavbar({ scrollStartRef }) {
  const [progress, setProgress]       = useState(0);  // 0 = expanded, 1 = compact
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [activeHref, setActiveHref]   = useState('/');
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafRef   = useRef(null);
  const curRef   = useRef(0);   // current smoothed progress
  const rawRef   = useRef(0);   // raw target progress from scroll
  const navigate = useNavigate();
  const location = useLocation();
  const mobileRef = useRef(null);

  // ── reduced-motion ────────────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const h = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // ── continuous scroll → progress ─────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      // The landing hero stays pinned while the photo comes into focus.
      // Begin shrinking only once that sticky section starts leaving the viewport.
      const hero = scrollStartRef?.current;
      const start = hero ? Math.max(0, hero.getBoundingClientRect().bottom + window.scrollY - window.innerHeight) : 0;
      const raw = clamp01((window.scrollY - start) / SHRINK_DISTANCE);
      rawRef.current = easeOut(raw);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const observer = scrollStartRef?.current && new ResizeObserver(onScroll);
    if (observer) observer.observe(scrollStartRef.current);
    onScroll();

    // RAF loop: smoothly chase rawRef.current
    const tick = () => {
      const target = rawRef.current;
      const current = curRef.current;
      const delta = target - current;

      // Only update state when the change is visible
      if (Math.abs(delta) > 0.001) {
        const next = current + delta * 0.12; // damping factor
        curRef.current = next;
        setProgress(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      observer?.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollStartRef]);

  // ── active route sync ─────────────────────────────────────────────────────
  useEffect(() => {
    setActiveHref(location.pathname + location.hash);
  }, [location]);

  // ── outside click closes mobile menu ─────────────────────────────────────
  useEffect(() => {
    if (!mobileOpen) return;
    const h = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) setMobileOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const close = e => { if (e.key === 'Escape') { setMobileOpen(false); mobileRef.current?.querySelector('.gnav-hamburger')?.focus(); } };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [mobileOpen]);

  // ── resize closes mobile menu ─────────────────────────────────────────────
  useEffect(() => {
    const h = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // ── navigation ────────────────────────────────────────────────────────────
  const handleNav = useCallback((e, item) => {
    e.preventDefault();
    setMobileOpen(false);

    navigate(item.href);
    if (item.href === '/' && location.pathname === '/') window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    setActiveHref(item.href);
  }, [navigate, location.pathname, reducedMotion]);

  // ── interpolated style values ─────────────────────────────────────────────
  const p = reducedMotion ? Math.round(progress) : progress;

  const iWidth      = lerp(EXPANDED.width,         COMPACT.width,         p);
  const iPadX       = lerp(EXPANDED.paddingX,      COMPACT.paddingX,      p);
  const iPadY       = lerp(EXPANDED.paddingY,      COMPACT.paddingY,      p);
  const iFontSize   = lerp(EXPANDED.fontSize,      COMPACT.fontSize,      p);
  const iLetterSp   = lerp(EXPANDED.letterSpacing, COMPACT.letterSpacing, p);
  const iBgAlpha    = lerp(EXPANDED.bgAlpha,       COMPACT.bgAlpha,       p);
  const iBorderAlpha= lerp(EXPANDED.borderAlpha,   COMPACT.borderAlpha,   p);
  const iShadBlur   = lerp(EXPANDED.shadowBlur,    COMPACT.shadowBlur,    p);
  const iShadSpread = lerp(EXPANDED.shadowSpread,  COMPACT.shadowSpread,  p);
  const iShadAlpha  = lerp(EXPANDED.shadowAlpha,   COMPACT.shadowAlpha,   p);

  const pillStyle = {
    width:      `min(${iWidth}px, calc(100vw - 32px))`,
    padding:    `${iPadY}px ${iPadX}px`,
    background: `rgba(255,255,255,${iBgAlpha})`,
    borderColor:`rgba(255,255,255,${iBorderAlpha})`,
    boxShadow: [
      `0 1px 0 0 rgba(255,255,255,${lerp(0.08, 0.06, p)}) inset`,
      `0 ${iShadSpread}px ${iShadBlur}px rgba(0,0,0,${iShadAlpha})`,
      `0 2px 8px rgba(0,0,0,${lerp(0.20, 0.28, p)})`,
    ].join(', '),
    backdropFilter: `blur(${lerp(18, 20, p)}px) saturate(${lerp(160, 170, p)}%)`,
    WebkitBackdropFilter: `blur(${lerp(18, 20, p)}px) saturate(${lerp(160, 170, p)}%)`,
  };

  const linkStyle = {
    fontSize: `${iFontSize}px`,
    letterSpacing: `${iLetterSp}em`,
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .gnav-root {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          display: flex;
          justify-content: center;
          padding-top: 20px;
          pointer-events: none;
        }

        .gnav-pill {
          pointer-events: all;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
          border-radius: 9999px;
          /* No CSS transition — size is driven frame-by-frame by JS */
          will-change: width, padding, background, box-shadow;
        }

        .gnav-links {
          display: flex;
          align-items: center;
          list-style: none;
          width: 100%;
          justify-content: space-between;
          gap: 0;
        }
        .gnav-mobile-brand { display: none; font: 10px 'DM Mono', monospace; letter-spacing: .12em; color: rgba(255,255,255,.7); }

        .gnav-link {
          font-family: 'DM Mono', monospace;
          font-weight: 400;
          text-transform: uppercase;
          color: rgba(255,255,255,0.50);
          text-decoration: none;
          padding: 5px 9px;
          border-radius: 9999px;
          background: transparent;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: color 220ms ease, background 220ms ease;
          position: relative;
        }

        .gnav-link:hover {
          color: rgba(255,255,255,0.92);
          background: rgba(255,255,255,0.06);
        }

        .gnav-link:focus-visible {
          outline: 1.5px solid rgba(255,255,255,0.55);
          outline-offset: 2px;
        }

        .gnav-link.is-active {
          color: rgba(255,255,255,0.92);
        }

        .gnav-link.is-active::after {
          content: '';
          display: block;
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 1px;
          background: rgba(255,255,255,0.32);
          border-radius: 9999px;
        }

        /* ── hamburger ── */
        .gnav-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 4.5px;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-left: auto;
          flex-shrink: 0;
        }

        .gnav-hamburger-line {
          display: block;
          width: 20px;
          height: 1px;
          background: rgba(255,255,255,0.6);
          border-radius: 9999px;
          transition: transform 220ms ease, opacity 220ms ease, width 220ms ease;
          transform-origin: center;
        }

        .gnav-hamburger.is-open .gnav-hamburger-line:nth-child(1) {
          transform: translateY(5.5px) rotate(45deg);
        }
        .gnav-hamburger.is-open .gnav-hamburger-line:nth-child(2) {
          opacity: 0; width: 0;
        }
        .gnav-hamburger.is-open .gnav-hamburger-line:nth-child(3) {
          transform: translateY(-5.5px) rotate(-45deg);
        }

        /* ── mobile panel ── */
        .gnav-mobile-menu {
          position: fixed;
          top: 82px;
          left: 50%;
          transform: translateX(-50%) translateY(-6px);
          width: min(340px, calc(100vw - 32px));
          background: rgba(12,12,12,0.90);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 22px;
          box-shadow: 0 16px 60px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.06) inset;
          padding: 12px 0;
          max-height: calc(100dvh - 98px);
          overflow-y: auto;
          z-index: 9998;
          pointer-events: none;
          transition: opacity 230ms ease, transform 230ms ease;
          opacity: 0;
        }

        .gnav-mobile-menu.is-visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          pointer-events: all;
        }

        .gnav-mobile-link {
          display: block;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.50);
          text-decoration: none;
          padding: 12px 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: color 180ms ease, background 180ms ease;
          border-radius: 8px;
          margin: 0 8px;
          width: calc(100% - 16px);
        }

        .gnav-mobile-link:hover,
        .gnav-mobile-link.is-active {
          color: rgba(255,255,255,0.92);
          background: rgba(255,255,255,0.05);
        }

        .gnav-mobile-link:focus-visible {
          outline: 1.5px solid rgba(255,255,255,0.45);
          outline-offset: 1px;
        }

        .gnav-mobile-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 4px 20px;
        }

        @media (max-width: 767px) {
          .gnav-root { justify-content: flex-start; padding-left: 16px; padding-right: 16px; }
          .gnav-mobile-brand { display: none; }
          .gnav-links     { display: none; }
          .gnav-hamburger { display: flex; width: 48px; height: 48px; margin: 0; border-radius: 50%; }
          .gnav-pill { width: 50px !important; height: 50px; padding: 0 !important; border-radius: 50%; flex-shrink: 0; }
          .gnav-mobile-menu { left: 16px; transform: translateY(-6px); }
          .gnav-mobile-menu.is-visible { transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .gnav-mobile-menu,
          .gnav-hamburger-line,
          .gnav-mobile-link { transition: none !important; }
        }
      `}</style>

      <nav className="gnav-root" aria-label="Main navigation" ref={mobileRef}>
        <div className="gnav-pill" style={pillStyle}>
          <a className="gnav-mobile-brand" href="/" onClick={e => handleNav(e, NAV_ITEMS[0])}>VIEWFINDER</a>

          {/* Desktop links */}
          <ul className="gnav-links" role="list">
            {NAV_ITEMS.map((item) => {
              const isActive =
                activeHref === item.href;

              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={`gnav-link${isActive ? ' is-active' : ''}`}
                    style={linkStyle}
                    onClick={(e) => handleNav(e, item)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Mobile hamburger */}
          <button
            className={`gnav-hamburger${mobileOpen ? ' is-open' : ''}`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="gnav-mobile-panel"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="gnav-hamburger-line" aria-hidden="true" />
            <span className="gnav-hamburger-line" aria-hidden="true" />
            <span className="gnav-hamburger-line" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          id="gnav-mobile-panel"
          className={`gnav-mobile-menu${mobileOpen ? ' is-visible' : ''}`}
          aria-hidden={!mobileOpen}
          role="dialog"
          aria-label="Navigation menu"
        >
          {NAV_ITEMS.map((item, i) => {
            const isActive =
              activeHref === item.href ||
              (item.href === '/' && location.pathname === '/' && !location.hash);

            return (
              <React.Fragment key={item.label}>
                {i > 0 && <div className="gnav-mobile-divider" aria-hidden="true" />}
                <a
                  href={item.href}
                  className={`gnav-mobile-link${isActive ? ' is-active' : ''}`}
                  onClick={(e) => handleNav(e, item)}
                  aria-current={isActive ? 'page' : undefined}
                  tabIndex={mobileOpen ? 0 : -1}
                >
                  {item.label}
                </a>
              </React.Fragment>
            );
          })}
        </div>
      </nav>
    </>
  );
}
