import { createPortal } from 'react-dom';
import SafeImage from './SafeImage';
import usePhotoDialog from '../usePhotoDialog';
import { PHOTOWALK_MEMORIES } from '../photowalkDefaults';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion';

const CARD_WIDTH = 240;
const GAP = 56;

// Clothespin Component pinning the top of the Polaroid to the thread
const Clothespin = () => (
  <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)]">
    <svg width="12" height="30" viewBox="0 0 12 30" fill="none">
      {/* Soft back shadow */}
      <rect x="1" y="2" width="10" height="26" rx="1.5" fill="rgba(0,0,0,0.35)" filter="blur(1px)" />
      {/* Left birch wood arm */}
      <rect x="1.5" y="1" width="4" height="28" rx="1" fill="#C8A273" stroke="#875E32" strokeWidth="0.5" />
      {/* Right birch wood arm */}
      <rect x="6.5" y="1" width="4" height="28" rx="1" fill="#DFC298" stroke="#875E32" strokeWidth="0.5" />
      {/* Steel wire spring */}
      <rect x="1" y="12" width="10" height="4" rx="1" fill="#333333" stroke="#1A1A1A" strokeWidth="0.5" />
      <circle cx="6" cy="14" r="1.3" fill="#B0B0B0" />
    </svg>
  </div>
);

export default function HangingPolaroidGallery({ photos = PHOTOWALK_MEMORIES }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const closePhoto = useCallback(() => setActivePhoto(null), []);
  const dialogRef = usePhotoDialog(activePhoto, closePhoto);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [maxScroll, setMaxScroll] = useState(1200);

  // Smooth scroll offset for the hanging line
  const rawX = useMotionValue(0);
  const smoothX = useSpring(rawX, {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  });

  // Calculate maximum horizontal scroll bounds
  const updateBounds = () => {
    if (!containerRef.current || !trackRef.current) return;
    const containerW = containerRef.current.clientWidth;
    const trackW = trackRef.current.scrollWidth;
    const max = Math.max(0, trackW - containerW + 140);
    setMaxScroll(max);
  };

  useEffect(() => {
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Wheel listener with boundary hand-off so user is never trapped
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (activePhoto) return;

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const current = rawX.get();

      // Check boundaries
      const atStart = current >= -5;
      const atEnd = current <= -maxScroll + 5;

      // If scrolling UP and at the beginning -> let page scroll up naturally
      if (delta < 0 && atStart) {
        return;
      }

      // If scrolling DOWN and at the end -> let page scroll down naturally
      if (delta > 0 && atEnd) {
        return;
      }

      // Inside the gallery: prevent page scroll and advance the Polaroids along the string
      e.preventDefault();
      const sensitivity = 0.85;
      const next = Math.max(-maxScroll, Math.min(0, current - delta * sensitivity));
      rawX.set(next);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [activePhoto, maxScroll, rawX]);

  // Touch handlers for mobile devices
  const touchStartX = useRef(0);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const currentTouchX = e.touches[0].clientX;
    const deltaX = currentTouchX - touchStartX.current;
    touchStartX.current = currentTouchX;

    const current = rawX.get();
    const next = Math.max(-maxScroll, Math.min(0, current + deltaX * 1.3));
    rawX.set(next);
  };

  // Generate continuous natural gravity-curved thread path
  const threadSvgData = useMemo(() => {
    const points = photos.map((m, idx) => ({
      x: idx * (CARD_WIDTH + GAP) + CARD_WIDTH / 2,
      y: m.hangY - 2, // Exactly aligns with clothespin spring clip
    }));

    if (points.length === 0) return { d: '', width: 2000 };

    const first = points[0];
    const last = points[points.length - 1];
    const leftPad = 260;
    const rightPad = 320;
    const totalW = last.x + rightPad;

    // Start with gentle lead-in from the left off-screen
    let path = `M ${first.x - leftPad} ${first.y - 12} `;
    path += `C ${first.x - 140} ${first.y + 4}, ${first.x - 60} ${first.y + 6}, ${first.x} ${first.y} `;

    // Create sagging catenary curves between each pair of pins under gravity
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dx = p2.x - p1.x;
      const sag = 13; // Natural gentle gravity sag between clothespins

      const cp1x = p1.x + dx * 0.35;
      const cp1y = p1.y + sag;
      const cp2x = p1.x + dx * 0.65;
      const cp2y = p2.y + sag;

      path += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y} `;
    }

    // Lead-out off-screen to the right
    path += `C ${last.x + 80} ${last.y + 6}, ${last.x + 180} ${last.y + 4}, ${last.x + rightPad} ${last.y - 12}`;

    return { d: path, width: totalW };
  }, [photos]);

  return (
    <div className="relative w-full select-none">
      {/* Lightbox Modal */}
      {createPortal(<AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            className="photo-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, rotate: activePhoto.rotation }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              ref={dialogRef}
              role="dialog" aria-modal="true" aria-label={activePhoto.title}
              className="photo-dialog-card relative max-w-md w-full bg-[#FAF8F5] text-neutral-900 rounded-sm p-4 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/20"
            >
              {/* Clothespin atop modal Polaroid */}
              <Clothespin />

              {/* Photo Frame */}
              <div className="relative aspect-square w-full bg-neutral-900 overflow-hidden shadow-inner">
                <SafeImage
                  src={activePhoto.url}
                  alt={activePhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Polaroid Bottom Caption Strip */}
              <div className="pt-4 pb-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] tracking-[0.2em] uppercase text-[#E8202A] font-mono font-medium"
                    style={{ fontFamily: '"DM Mono", monospace' }}
                  >
                    {activePhoto.tag}
                  </span>
                  <span
                    className="text-[11px] text-neutral-500 font-mono tracking-wider"
                    style={{ fontFamily: '"DM Mono", monospace' }}
                  >
                    {activePhoto.date}
                  </span>
                </div>

                <h3
                  className="italic text-xl sm:text-2xl text-neutral-900 font-normal mt-1.5"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  {activePhoto.title}
                </h3>

                <p
                  className="text-xs text-neutral-600 mt-1 leading-relaxed font-light"
                  style={{ fontFamily: '"Inter", sans-serif' }}
                >
                  {activePhoto.note}
                </p>

                <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                  <span>{activePhoto.location}</span>
                  <button
                    type="button"
                    onClick={() => setActivePhoto(null)}
                    className="photo-dialog-close rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                  >
                    CLOSE [ESC]
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}

      {/* Hanging Gallery Interactive Stage */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[470px] sm:h-[500px] overflow-hidden cursor-default"
      >
        {/* Moving Horizontal Track containing the Organic Curved Thread & Hanging Polaroids */}
        <motion.div
          ref={trackRef}
          style={{ x: smoothX }}
          className="absolute top-0 left-[40px] h-full"
        >
          {/* Continuous Organic Curved Thread SVG (Lockstep with scrolling) */}
          <svg
            className="absolute top-0 left-0 h-[100px] pointer-events-none z-10 overflow-visible"
            style={{ width: `${threadSvgData.width}px` }}
          >
            {/* Soft thread shadow under gravity */}
            <path
              d={threadSvgData.d}
              stroke="rgba(0,0,0,0.4)"
              strokeWidth="2.5"
              fill="none"
              style={{ transform: 'translateY(1.5px)' }}
            />
            {/* Natural warm organic thread line */}
            <path
              d={threadSvgData.d}
              stroke="rgba(235, 230, 220, 0.45)"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Hanging Polaroids pinned to the thread */}
          <div className="relative z-20 flex items-start pl-2 pr-24" style={{ gap: `${GAP}px` }}>
            {photos.map((photo) => (
              <div
                key={photo.id}
                role={photo.link ? 'link' : 'button'}
                tabIndex={0}
                aria-label={`Open ${photo.title}`}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (photo.link) window.open(photo.link, '_blank', 'noopener,noreferrer'); else setActivePhoto(photo); } }}
                onClick={() => { if (photo.link) window.open(photo.link, '_blank', 'noopener,noreferrer'); else setActivePhoto(photo); }}
                className="relative shrink-0 cursor-pointer group transition-transform duration-300 hover:scale-[1.03] hover:z-40"
                style={{
                  width: `${CARD_WIDTH}px`,
                  marginTop: `${photo.hangY}px`,
                  transform: `rotate(${photo.rotation}deg)`,
                  transformOrigin: 'top center',
                }}
              >
                {/* Clothespin pinned over the thread */}
                <Clothespin />

                {/* Polaroid Frame */}
                <div
                  className="w-full bg-[#FAF8F5] p-3 sm:p-3.5 pb-5 sm:pb-6 rounded-[2px] shadow-[0_12px_30px_rgba(0,0,0,0.65)] group-hover:shadow-[0_20px_45px_rgba(232,32,42,0.28)] transition-all duration-300 border border-white/20 select-none text-left"
                >
                  {/* Square Photo Print */}
                  <div className="relative aspect-square w-full bg-neutral-900 overflow-hidden">
                    <SafeImage
                      src={photo.url}
                      alt={photo.title}
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                      loading="lazy"
                    />
                    {/* Subtle warm film tone */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Minimal, spacious Polaroid caption */}
                  <div className="mt-3 flex items-center justify-between text-neutral-800 pointer-events-none">
                    <span
                      className="text-[15px] font-normal italic truncate"
                      style={{ fontFamily: '"Playfair Display", serif' }}
                    >
                      {photo.title}
                    </span>
                    <span
                      className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase shrink-0 ml-2"
                      style={{ fontFamily: '"DM Mono", monospace' }}
                    >
                      {photo.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Subtle, spacious instruction cue */}

    </div>
  );
}
