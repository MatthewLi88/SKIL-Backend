// Matthew Li
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Elements that fade up as they scroll into view. No markup changes needed:
// anything matching these selectors gets picked up, including cards that load later.
const REVEAL_SELECTOR = [
  '.page-header',
  '.feature',
  '.step',
  '.event-card',
  '.org-card',
  '.stat-card',
  '.dashboard-section',
  '.profile-section',
  '.event-detail',
  '.auth-card',
  '.questionnaire-card',
].join(',');

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scroll-reveal for the whole app. Call once, inside the router. */
export function useScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('motion-ok');

    const io = new IntersectionObserver(
      (entries) => {
        // Stagger items that enter together (e.g. a row of cards)
        let i = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = Math.min(i++, 5) * 70;
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('is-visible');
          io.unobserve(el);
          // Drop the delay afterwards so hover effects respond instantly
          window.setTimeout(() => {
            el.style.transitionDelay = '';
            el.dataset.reveal = 'done';
          }, delay + 650);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    // Tracked per effect run, so a re-run (React StrictMode, route change) re-observes
    const seen = new WeakSet<Element>();
    const track = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => {
        if (seen.has(el) || el.dataset.reveal === 'done') return;
        seen.add(el);
        el.dataset.reveal = '1';
        io.observe(el);
      });
    };

    const main = document.querySelector('.main');
    if (!main) return;
    track(main);
    const mo = new MutationObserver(() => track(main));
    mo.observe(main, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
}

/** True once the page has scrolled past `offset` px (for the header shadow). */
export function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return scrolled;
}

/** Counts from 0 up to `value` once the element is on screen. */
export function useCountUp(value: number, duration = 900) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(prefersReducedMotion() ? value : 0);

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const el = ref.current;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(value * eased);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return { ref, display };
}
