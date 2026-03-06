import { useEffect } from 'react';

/**
 * Attaches an IntersectionObserver to all .reveal elements,
 * adding the .visible class when they enter the viewport.
 * Re-runs on every render so newly mounted elements are observed.
 */
export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });
}
