import GlassNavbar from '../components/GlassNavbar';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { PHOTOWALK_MEMORIES } from '../photowalkDefaults';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PhotoCarousel from '../components/PhotoCarousel';
import HangingPolaroidGallery from '../components/HangingPolaroidGallery';
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
    className="hero-title absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap z-10 flex flex-col items-center"
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function isValidIndianMobile(num) {
  const cleaned = String(num).replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Shared field style ────────────────────────────────────────────────────────
const FIELD_BASE = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '10px',
  padding: '13px 16px',
  fontFamily: '"Inter", sans-serif',
  fontSize: '14px',
  fontWeight: 300,
  color: '#fff',
  outline: 'none',
  transition: 'border-color 200ms ease, background 200ms ease',
  boxSizing: 'border-box',
};

const FIELD_ERR = {
  ...FIELD_BASE,
  borderColor: 'rgba(232,32,42,0.55)',
  background: 'rgba(232,32,42,0.05)',
};

function Field({ label, required, error, id, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px',
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.40)',
        }}
      >
        {label}
        {required && (
          <span style={{ color: 'rgba(232,32,42,0.80)', marginLeft: '4px' }} aria-label="required">*</span>
        )}
      </label>
      {children}
      {error && (
        <p
          role="alert"
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '10px',
            letterSpacing: '0.08em',
            color: 'rgba(232,32,42,0.85)',
            margin: 0,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ── Contact Section ───────────────────────────────────────────────────────────
function ContactSection() {
  const EMPTY = { name: '', mobile: '', purpose: '', institute: '', email: '' };
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [serverMsg, setServerMsg] = useState('');

  const set = useCallback((key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  }, []);

  const validate = () => {
    const errs = {};
    if (!fields.name.trim()) errs.name = 'Name is required.';
    else if (fields.name.trim().length > 120) errs.name = 'Name is too long.';

    if (!fields.mobile.trim()) {
      errs.mobile = 'Mobile number is required.';
    } else if (!isValidIndianMobile(fields.mobile.trim())) {
      errs.mobile = 'Enter a valid 10-digit Indian mobile number.';
    }

    if (fields.email.trim() && !isValidEmail(fields.email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStatus('submitting');
    setServerMsg('');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let res;
      try { res = await fetch(
        '/api/contact',
        {
          method: 'POST',
          credentials: 'include',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fields),
        }
      ); } finally { clearTimeout(timeout); }
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setFields(EMPTY);
        setErrors({});
        setServerMsg(data.message || 'Enquiry sent successfully.');
      } else {
        setStatus('error');
        setServerMsg(data.message || 'Something went wrong. Please try again.');
        if (data.errors) setErrors(data.errors);
      }
    } catch {
      setStatus('error');
      setServerMsg('Could not reach the server. Please check your connection.');
    }
  };

  const inputStyle  = (key) => errors[key] ? FIELD_ERR : FIELD_BASE;
  const isLoading   = status === 'submitting';

  return (
    <section
      id="contact"
      style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        padding: '120px 24px 100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <style>{`
        .cf-input::placeholder { color: rgba(255,255,255,0.22); }
        .cf-input:focus { border-color: rgba(255,255,255,0.28) !important; background: rgba(255,255,255,0.06) !important; }
        .cf-submit { position: relative; overflow: hidden; }
        .cf-submit::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.06);
          opacity: 0;
          transition: opacity 200ms ease;
        }
        .cf-submit:hover::after  { opacity: 1; }
        .cf-submit:active::after { opacity: 0.5; }
        .cf-submit:focus-visible { outline: 1.5px solid rgba(255,255,255,0.45); outline-offset: 3px; }
        @media (min-width: 640px) {
          .cf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: '640px', width: '100%', marginBottom: '48px', textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px',
            fontFamily: '"DM Mono", monospace',
            fontSize: '11px',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          <span
            style={{
              width: '6px', height: '6px', borderRadius: '50%', background: '#E8202A',
              animation: 'redPulse 1.5s ease-in-out infinite', flexShrink: 0,
            }}
          />
          Confluenz · ADGIPS · New Delhi
        </div>
        <h2
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(38px, 5vw, 62px)',
            lineHeight: 1.1,
            letterSpacing: '0.02em',
            color: '#fff',
            margin: '0 0 16px',
          }}
        >
          Get in Touch.
        </h2>
        <p
          style={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(14px, 1.2vw, 16px)',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.50)',
            margin: 0,
          }}
        >
          Whether you want to collaborate, feature your work, or simply say hello —
          we would love to hear from you.
        </p>
      </div>

      {/* Form panel */}
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'rgba(255,255,255,0.035)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px',
          padding: '36px 32px 32px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.40)',
        }}
      >
        {status === 'success' ? (
          /* ── Success state ─────────────────────────────────────────── */
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path d="M1 7L6.5 12.5L17 1" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p
              style={{
                fontFamily: '"Playfair Display", serif',
                fontStyle: 'italic',
                fontSize: '22px',
                color: '#fff',
                margin: '0 0 10px',
              }}
            >
              Enquiry Sent.
            </p>
            <p
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '14px',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.50)',
                lineHeight: 1.7,
                margin: '0 0 28px',
              }}
            >
              {serverMsg}
            </p>
            <button
              onClick={() => { setStatus('idle'); setServerMsg(''); }}
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.38)',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '9999px',
                padding: '8px 20px',
                cursor: 'pointer',
              }}
            >
              Send another
            </button>
          </div>
        ) : (
          /* ── Form ─────────────────────────────────────────────────── */
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Row 1: Name + Mobile */}
              <div className="cf-grid-2" style={{ display: 'grid', gap: '16px' }}>
                <Field label="Name" required id="cf-name" error={errors.name}>
                  <input
                    id="cf-name"
                    className="cf-input"
                    type="text"
                    placeholder="Your full name"
                    value={fields.name}
                    onChange={set('name')}
                    maxLength={120}
                    autoComplete="name"
                    style={inputStyle('name')}
                    aria-required="true"
                    disabled={isLoading}
                  />
                </Field>

                <Field label="Mobile Number" required id="cf-mobile" error={errors.mobile}>
                  <input
                    id="cf-mobile"
                    className="cf-input"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={fields.mobile}
                    onChange={set('mobile')}
                    maxLength={15}
                    autoComplete="tel"
                    inputMode="numeric"
                    style={inputStyle('mobile')}
                    aria-required="true"
                    disabled={isLoading}
                  />
                </Field>
              </div>

              {/* Row 2: Purpose */}
              <Field label="Purpose / Query" id="cf-purpose" error={errors.purpose}>
                <textarea
                  id="cf-purpose"
                  className="cf-input"
                  placeholder="What's on your mind? (optional)"
                  value={fields.purpose}
                  onChange={set('purpose')}
                  rows={3}
                  maxLength={1000}
                  style={{ ...inputStyle('purpose'), resize: 'vertical', minHeight: '88px' }}
                  disabled={isLoading}
                />
              </Field>

              {/* Row 3: Institute + Email */}
              <div className="cf-grid-2" style={{ display: 'grid', gap: '16px' }}>
                <Field label="Institute / Company" id="cf-institute" error={errors.institute}>
                  <input
                    id="cf-institute"
                    className="cf-input"
                    type="text"
                    placeholder="Where are you from? (optional)"
                    value={fields.institute}
                    onChange={set('institute')}
                    maxLength={120}
                    style={inputStyle('institute')}
                    disabled={isLoading}
                  />
                </Field>

                <Field label="Email" id="cf-email" error={errors.email}>
                  <input
                    id="cf-email"
                    className="cf-input"
                    type="email"
                    placeholder="your@email.com (optional)"
                    value={fields.email}
                    onChange={set('email')}
                    maxLength={200}
                    autoComplete="email"
                    style={inputStyle('email')}
                    disabled={isLoading}
                  />
                </Field>
              </div>

              {/* Required note */}
              <p
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.25)',
                  margin: '2px 0 0',
                }}
              >
                <span style={{ color: 'rgba(232,32,42,0.70)' }}>*</span>
                {' '}Name and Mobile Number are required.
              </p>

              {/* Server error */}
              {status === 'error' && serverMsg && (
                <p
                  role="alert"
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    color: 'rgba(232,32,42,0.85)',
                    margin: 0,
                    padding: '10px 14px',
                    background: 'rgba(232,32,42,0.06)',
                    border: '1px solid rgba(232,32,42,0.18)',
                    borderRadius: '8px',
                  }}
                >
                  {serverMsg}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="cf-submit"
                disabled={isLoading}
                style={{
                  marginTop: '4px',
                  width: '100%',
                  padding: '14px 24px',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: isLoading ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.82)',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.13)',
                  borderRadius: '10px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'color 200ms ease, border-color 200ms ease',
                  boxSizing: 'border-box',
                }}
              >
                {isLoading ? 'Sending\u2026' : 'Send Enquiry'}
              </button>

            </div>
          </form>
        )}
      </div>

      {/* Footer line */}
      <p
        style={{
          marginTop: '64px',
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.16)',
        }}
      >
        ViewFinder by Confluenz — {new Date().getFullYear()}
      </p>
    </section>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState(PHOTOWALK_MEMORIES);
  useEffect(() => {
    let alive = true;
    api('/photowalks').then(rows => {
      if (alive) setPhotos(PHOTOWALK_MEMORIES.map((photo, slot) => ({ ...photo, ...rows.find(row => row.slot === slot) })));
    }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const [scrollData, setScrollData] = useState({
    blurPx: 20,
    overlayOpacity: 0.6,
    showFocusBar: false,
    focusProgress: 0,
    heroOpacity: 1,
    s2Opacity: 0,
    s2TranslateY: 24,
    bgScale: 1.06,
  });

  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Phase 1: Focus phase (first 0.20vh of scrolling)
      const focusDistance = 0.20 * vh;
      const focusProgress = Math.max(0, Math.min(1, scrollY / focusDistance));

      const blurPx = Math.max(0, 20 * (1 - focusProgress));
      const showFocusBar = focusProgress >= 0.8;

      let overlayOpacity = 0.6 - (0.3 * focusProgress); // 0.6 -> 0.3
      let heroOpacity = 1;

      // Phase 2: Darken & Hero dissolve (starts after focus finishes)
      if (scrollY > focusDistance) {
        const darkenDistance = 0.85 * vh;
        const darkenProgress = Math.max(0, Math.min(1, (scrollY - focusDistance) / darkenDistance));
        overlayOpacity = 0.3 + (0.56 * darkenProgress); // 0.3 -> 0.86

        // Hero dissolves smoothly as user scrolls into the next chapter
        const heroFadeStart = 0.35 * vh;
        const heroFadeDist = 0.55 * vh;
        const heroFadeProgress = Math.max(0, Math.min(1, (scrollY - heroFadeStart) / heroFadeDist));
        heroOpacity = 1 - heroFadeProgress;
      }

      // Phase 3: Section 2 entrance (smooth reveal as user scrolls past 0.7vh)
      const s2Start = 0.70 * vh;
      const s2Dist = 0.55 * vh;
      const s2Progress = Math.max(0, Math.min(1, (scrollY - s2Start) / s2Dist));
      const s2Opacity = s2Progress;
      const s2TranslateY = prefersReducedMotion ? 0 : (1 - s2Progress) * 24;

      // Background subtle slow zoom for cinematic depth (1.06 -> 1.11)
      const bgScale = prefersReducedMotion ? 1.06 : 1.06 + Math.min(0.05, (scrollY / (2.5 * vh)) * 0.05);

      setScrollData({
        blurPx,
        overlayOpacity,
        showFocusBar,
        focusProgress,
        heroOpacity,
        s2Opacity,
        s2TranslateY,
        bgScale,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full text-white">
      <GlassNavbar scrollStartRef={heroRef} />
      {/* Fixed Background for entire page — continuous across all sections */}
      <div className="fixed inset-0 -z-10">
        {/* Background Photo */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1766343672890-4a19459a4e8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(${scrollData.blurPx}px)`,
            transform: `scale(${scrollData.bgScale})`,
            transition: 'filter 0.1s ease-out, transform 0.15s ease-out',
          }}
        />
        {/* Continuous cinematic overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${scrollData.overlayOpacity})` }}
        />
      </div>

      {/* Hero section */}
      <div ref={heroRef} style={{ height: '130vh' }}>
        <div
          className="sticky top-0 h-[100vh] w-full overflow-hidden"
          style={{
            opacity: scrollData.heroOpacity,
            transition: 'opacity 0.2s ease-out',
          }}
        >
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

      {/* Second Section — Confluenz (Spacious, Minimal, Centered with Referenced 3D Reel) */}
      <section
        id="confluenz"
        className="relative z-10 w-full flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 text-center bg-transparent select-none pt-28 pb-10 sm:pb-14"
        style={{
          opacity: scrollData.s2Opacity,
          transform: `translateY(${scrollData.s2TranslateY}px)`,
          transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
        }}
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Restrained Overline */}
          <div
            className="flex items-center gap-3 text-white/45 uppercase mb-6 sm:mb-8 font-mono text-[11px] tracking-[0.24em]"
            style={{ fontFamily: '"DM Mono", monospace' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#E8202A]"
              style={{ animation: 'redPulse 1.5s ease-in-out infinite' }}
            />
            <span>Confluenz · Est. 2015 · ADGIPS</span>
          </div>

          {/* Majestic Centered Headline */}
          <h2
            className="italic text-white font-normal"
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(46px, 6.5vw, 84px)',
              lineHeight: 1.1,
              letterSpacing: '0.02em',
            }}
          >
            Every Frame Tells a Story.
          </h2>

          {/* Generous Negative Space & Refined Narrative */}
          <p
            className="mt-6 sm:mt-8 text-white/70 max-w-2xl sm:max-w-3xl mx-auto font-light"
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 'clamp(15px, 1.35vw, 18px)',
              lineHeight: 1.8,
              letterSpacing: '0.015em',
            }}
          >
            Established in 2015, Confluenz is the official photography and filmmaking society of ADGIPS.
            From capturing campus milestones and candid moments to films that tell stories worth remembering,
            we preserve the experiences that define our college community.
          </p>
        </div>

        {/* The Referenced 3D Draggable Photo Carousel */}
        <div className="w-full max-w-6xl mx-auto mt-10 sm:mt-14">
          <PhotoCarousel />
        </div>
      </section>

      {/* Third Section — Monthly Photowalks (Beyond the Frame) */}
      {/* Third Section — Monthly Photowalks (Spacious, Minimal, Beyond the Frame) */}
      <section
        id="photowalks"
        className="relative z-10 w-full flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 text-center bg-transparent select-none pt-10 sm:pt-14 pb-28"
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center mb-16 sm:mb-24">
          {/* Restrained Overline */}
          <div
            className="flex items-center gap-3 text-white/40 uppercase mb-6 sm:mb-8 font-mono text-[11px] tracking-[0.26em]"
            style={{ fontFamily: '"DM Mono", monospace' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#E8202A]"
              style={{ animation: 'redPulse 1.5s ease-in-out infinite' }}
            />
            <span>Photowalks · Monthly Expeditions · ADGIPS</span>
          </div>

          {/* Majestic Centered Headline */}
          <h2
            className="italic text-white font-normal"
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(44px, 6vw, 78px)',
              lineHeight: 1.15,
              letterSpacing: '0.02em',
            }}
          >
            Beyond the Frame.
          </h2>

          {/* Generous Negative Space & Minimal Narrative */}
          <p
            className="mt-6 sm:mt-8 text-white/60 max-w-xl mx-auto font-light"
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 'clamp(14px, 1.25vw, 17px)',
              lineHeight: 1.85,
              letterSpacing: '0.015em',
            }}
          >
            Every month, we step out with our cameras to explore new places,
            experiment with perspectives, and turn ordinary moments into extraordinary frames.
          </p>
        </div>

        {/* The Hanging Polaroid Gallery with Organic Curved Thread */}
        <div className="w-full max-w-7xl mx-auto">
          <HangingPolaroidGallery photos={photos} />
        </div>
      </section>
      <ContactSection />
      <footer className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-10 border-t border-white/10 text-white/50 text-xs">
        <button type="button" onDoubleClick={() => navigate('/admin/login')} style={{ background: 'none', border: 0, color: 'inherit', font: 'inherit', cursor: 'default' }}>Confluenz</button>
        <Link to="/events" className="hover:text-white">Explore the event archive</Link>
      </footer>
    </div>
  );
}
