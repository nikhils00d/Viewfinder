import { useEffect, useRef } from 'react';
export default function usePhotoDialog(active, close) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => [...(ref.current?.querySelectorAll('button, a[href], [tabindex="0"]') || [])];
    const raf = requestAnimationFrame(() => focusable()[0]?.focus());
    function keydown(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const items = focusable();
        if (!items.length) { e.preventDefault(); return; }
        if (e.shiftKey && (document.activeElement === items[0] || !ref.current?.contains(document.activeElement))) { e.preventDefault(); items.at(-1).focus(); }
        else if (!e.shiftKey && (document.activeElement === items.at(-1) || !ref.current?.contains(document.activeElement))) { e.preventDefault(); items[0].focus(); }
      }
    }
    document.addEventListener('keydown', keydown);
    return () => { cancelAnimationFrame(raf); document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [active, close]);
  return ref;
}
