import React, { memo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function useMediaQuery(query, { defaultValue = false } = {}) {
  const [matches, setMatches] = useState(defaultValue);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

const DEFAULT_CARDS = [
  {
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=600&q=80',
    title: 'The Glass Lens',
    tag: '35mm · F/1.4',
  },
  {
    url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=600&q=80',
    title: 'Cinematics',
    tag: '24 FPS · RAW',
  },
  {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=600&q=80',
    title: 'Live Stage',
    tag: 'FESTIVAL · 2025',
  },
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=600&q=80',
    title: 'Campus Quad',
    tag: 'ADGIPS · LEGACY',
  },
  {
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=600&q=80',
    title: 'Shadow & Light',
    tag: 'PORTRAITURE',
  },
  {
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=600&q=80',
    title: 'On Location',
    tag: 'BEHIND THE SCENES',
  },
  {
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=600&q=80',
    title: 'Crowd Energy',
    tag: 'ANNUAL GALA',
  },
  {
    url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?crop=entropy&cs=tinysrgb&fit=crop&w=600&h=600&q=80',
    title: 'Analog Roots',
    tag: 'EST. 2015',
  },
];

const Carousel = memo(({ handleClick, cards, smoothRotation, smoothHoverLean }) => {
  const isSm = useMediaQuery('(max-width: 640px)', { defaultValue: false });
  const isMd = useMediaQuery('(max-width: 1024px)', { defaultValue: false });

  const cylinderWidth = isSm ? 1000 : isMd ? 1350 : 1600;
  const faceCount = cards.length;
  const faceWidth = cylinderWidth / faceCount;
  const radius = cylinderWidth / (2 * Math.PI);

  const combinedRotation = useTransform(
    [smoothRotation, smoothHoverLean],
    ([rot, lean]) => rot + lean
  );
  const transform = useTransform(combinedRotation, (val) => `rotate3d(0, 1, 0, ${val}deg)`);

  return (
    <div
      className="flex h-full items-center justify-center select-none"
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      <motion.div
        className="relative flex h-full origin-center cursor-default items-center justify-center"
        style={{
          transform,
          width: cylinderWidth,
          transformStyle: 'preserve-3d',
        }}
      >
        {cards.map((card, i) => {
          const angle = i * (360 / faceCount);
          return (
            <motion.div
              key={`card-${card.url}-${i}`}
              className="group absolute flex h-full origin-center items-center justify-center p-2.5 cursor-pointer"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                transformStyle: 'preserve-3d',
              }}
              onClick={() => handleClick(card, i)}
            >
              <div
                className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.65)] transition-all duration-300 group-hover:border-white/50 group-hover:shadow-[0_20px_45px_rgba(232,32,42,0.3)] group-hover:scale-[1.04]"
              >
                <img
                  src={card.url}
                  alt={card.title}
                  draggable={false}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                  loading="lazy"
                />
                {/* Gradient vignette & HUD metadata */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex flex-col pointer-events-none">
                  <span
                    className="text-[9px] tracking-[0.16em] uppercase text-[#E8202A] font-mono font-medium"
                    style={{ fontFamily: '"DM Mono", monospace' }}
                  >
                    {card.tag}
                  </span>
                  <span
                    className="text-xs text-white/95 font-medium tracking-wide truncate"
                    style={{ fontFamily: '"Inter", sans-serif' }}
                  >
                    {card.title}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
});

export default function PhotoCarousel({ cards = DEFAULT_CARDS }) {
  const [activeCard, setActiveCard] = useState(null);
  const stageRef = useRef(null);

  // Motion values for smooth mouse-wheel rotation & hover perspective lean
  const rawRotation = useMotionValue(0);
  const smoothRotation = useSpring(rawRotation, {
    stiffness: 125,
    damping: 24,
    mass: 0.18,
  });

  const hoverLean = useMotionValue(0);
  const smoothHoverLean = useSpring(hoverLean, {
    stiffness: 90,
    damping: 20,
    mass: 0.15,
  });

  // Attach non-passive wheel listener directly to the carousel stage
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (e) => {
      // If inspecting a card in the lightbox modal, don't rotate
      if (activeCard) return;

      // Prevent window vertical scroll when hovering over the carousel element
      e.preventDefault();

      // Read delta (supports vertical wheel and trackpad horizontal scrolling)
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

      // Smoothly update rotation (positive delta spins forward)
      const sensitivity = 0.22;
      rawRotation.set(rawRotation.get() + delta * sensitivity);
    };

    stage.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      stage.removeEventListener('wheel', handleWheel);
    };
  }, [activeCard, rawRotation]);

  // Subtle perspective lean following cursor on hover
  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to +1
    hoverLean.set(normX * 12);
  };

  const handleMouseLeave = () => {
    hoverLean.set(0);
  };

  const handleClick = (card) => {
    setActiveCard(card);
  };

  const handleClose = () => {
    setActiveCard(null);
  };

  return (
    <div className="relative w-full overflow-hidden select-none py-4">
      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#141416] border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
                <img
                  src={activeCard.url}
                  alt={activeCard.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex items-center justify-between border-t border-white/10">
                <div>
                  <div
                    className="text-[10px] tracking-[0.18em] uppercase text-[#E8202A] font-mono"
                    style={{ fontFamily: '"DM Mono", monospace' }}
                  >
                    {activeCard.tag}
                  </div>
                  <div
                    className="text-base text-white font-medium mt-0.5"
                    style={{ fontFamily: '"Inter", sans-serif' }}
                  >
                    {activeCard.title}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3.5 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 text-xs font-mono tracking-wider transition-colors"
                  style={{ fontFamily: '"DM Mono", monospace' }}
                >
                  CLOSE [ESC]
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Carousel Stage with Wheel & Hover Listeners */}
      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[380px] sm:h-[440px] md:h-[480px] w-full overflow-hidden"
      >
        <Carousel
          handleClick={handleClick}
          cards={cards}
          smoothRotation={smoothRotation}
          smoothHoverLean={smoothHoverLean}
        />
      </div>

      {/* HUD Instruction Cue */}
      <div
        className="text-center font-mono text-[10px] tracking-[0.22em] text-white/35 uppercase mt-3 flex items-center justify-center gap-2"
        style={{ fontFamily: '"DM Mono", monospace' }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E8202A]" />
        <span>Scroll mouse wheel over reel to rotate · Click frame to inspect</span>
      </div>
    </div>
  );
}
