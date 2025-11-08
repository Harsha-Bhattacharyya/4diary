/**
 * Anime.js animation utilities for 4diary
 */

// Dynamically import anime.js to avoid SSR issues
async function getAnime(): Promise<unknown> {
  if (typeof window !== 'undefined') {
    const animeModule = await import('animejs');
    // Handle both default and named exports
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (animeModule as any).default || animeModule;
  }
  return null;
}

// Fade in animation
export const fadeIn = async (targets: string | HTMLElement | HTMLElement[], delay = 0) => {
  const anime = await getAnime();
  if (!anime) return;
  
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    delay,
    easing: 'easeOutCubic',
  });
};

// Slide in from left
export const slideInLeft = async (targets: string | HTMLElement | HTMLElement[], delay = 0) => {
  const anime = await getAnime();
  if (!anime) return;
  
  return anime({
    targets,
    opacity: [0, 1],
    translateX: [-50, 0],
    duration: 800,
    delay,
    easing: 'easeOutCubic',
  });
};

// Slide in from right
export const slideInRight = async (targets: string | HTMLElement | HTMLElement[], delay = 0) => {
  const anime = await getAnime();
  if (!anime) return;
  
  return anime({
    targets,
    opacity: [0, 1],
    translateX: [50, 0],
    duration: 800,
    delay,
    easing: 'easeOutCubic',
  });
};

// Scale in animation
export const scaleIn = async (targets: string | HTMLElement | HTMLElement[], delay = 0) => {
  const anime = await getAnime();
  if (!anime) return;
  
  return anime({
    targets,
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 600,
    delay,
    easing: 'easeOutElastic(1, .6)',
  });
};

// Stagger animation for multiple elements
export const staggerFadeIn = async (targets: string | HTMLElement | HTMLElement[], staggerDelay = 100) => {
  const anime = await getAnime();
  if (!anime) return;
  
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    delay: anime.stagger(staggerDelay),
    easing: 'easeOutCubic',
  });
};

// Logo animation
export const logoAnimation = async (targets: string | HTMLElement | HTMLElement[]) => {
  const anime = await getAnime();
  if (!anime) return;
  
  return anime({
    targets,
    opacity: [0, 1],
    scale: [0.9, 1],
    rotate: [-5, 0],
    duration: 1200,
    easing: 'easeOutElastic(1, .5)',
  });
};
