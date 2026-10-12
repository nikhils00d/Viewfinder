import React, { memo, useState, useEffect, useLayoutEffect } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
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

const Carousel = memo(({ handleClick, controls, cards, isCarouselActive }) => {
  const isSm = useMediaQuery('(max-width: 640px)', { defaultValue: false });
  const isMd = useMediaQuery('(max-width: 1024px)', { defaultValue: false });

  const cylinderWidth = isSm ? 1000 : isMd ? 1350 : 1600;
  const faceCount = cards.length;
  const faceWidth = cylinderWidth / faceCount;
  const radius = cylinderWidth / (2 * Math.PI);
  const rotation = useMotionValue(0);
  const transform = useTransform(rotation, (val) => `rotate3d(0, 1, 0, ${val}deg)`);

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
        drag={isCarouselActive ? 'x' : false}
        dragConstraints={{ left: -10000, right: 10000 }}
        dragElastic={0}
        className="relative flex h-full origin-center cursor-grab items-center justify-center active:cursor-grabbing"
        style={{
          transform,
          rotateY: rotation,
          width: cylinderWidth,
          transformStyle: 'preserve-3d',
        }}
        onDrag={(_, info) => {
          if (isCarouselActive) {
            rotation.set(rotation.get() + info.delta.x * 0.28);
          }
        }}
        onDragEnd={(_, info) => {
          if (isCarouselActive) {
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.08,
              transition: {
                type: 'spring',
                stiffness: 85,
                damping: 26,
                mass: 0.15,
              },
            });
          }
        }}
        animate={controls}
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
                className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.65)] transition-all duration-300 group-hover:border-white/40 group-hover:shadow-[0_20px_45px_rgba(232,32,42,0.25)]"
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
  const [isCarouselActive, setIsCarouselActive] = useState(true);
  const controls = useAnimation();

  const handleClick = (card) => {
    setActiveCard(card);
    setIsCarouselActive(false);
    controls.stop();
  };

  const handleClose = () => {
    setActiveCard(null);
    setIsCarouselActive(true);
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

      {/* 3D Carousel Stage */}
      <div className="relative h-[380px] sm:h-[440px] md:h-[480px] w-full overflow-hidden">
        <Carousel
          handleClick={handleClick}
          controls={controls}
          cards={cards}
          isCarouselActive={isCarouselActive}
        />
      </div>

      {/* Instruction indicator */}
      <div
        className="text-center font-mono text-[10px] tracking-[0.22em] text-white/30 uppercase mt-2"
        style={{ fontFamily: '"DM Mono", monospace' }}
      >
        ↔ Drag horizontally to spin · Click frame to inspect
      </div>
    </div>
  );
}
