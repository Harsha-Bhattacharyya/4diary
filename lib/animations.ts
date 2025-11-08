/**
 * Anime.js animation utilities for 4diary
 */

// Dynamically import anime.js to avoid SSR issues
async function getAnime(): Promise<any> {
  if (typeof window !== 'undefined') {
    try {
      const animeModule = await import('animejs');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (animeModule as any).default || animeModule;
    } catch (error) {
      console.error('Failed to load anime.js:', error);
      return null;
    }
  }
  return null;
}

// Fade in animation with fallback
export const fadeIn = async (targets: string | HTMLElement | HTMLElement[], delay = 0) => {
  const anime = await getAnime();
  
  // Fallback: just remove opacity-0 if anime fails
  if (!anime) {
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : Array.isArray(targets) ? targets : [targets];
    elements.forEach((el: any) => {
      if (el && el.classList) {
        el.classList.remove('opacity-0');
        el.style.opacity = '1';
      }
    });
    return;
  }
  
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    delay,
    easing: 'easeOutCubic',
  });
};

// Slide in from left with fallback
export const slideInLeft = async (targets: string | HTMLElement | HTMLElement[], delay = 0) => {
  const anime = await getAnime();
  
  if (!anime) {
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : Array.isArray(targets) ? targets : [targets];
    elements.forEach((el: any) => {
      if (el && el.classList) {
        el.classList.remove('opacity-0');
        el.style.opacity = '1';
      }
    });
    return;
  }
  
  return anime({
    targets,
    opacity: [0, 1],
    translateX: [-50, 0],
    duration: 800,
    delay,
    easing: 'easeOutCubic',
  });
};

// Slide in from right with fallback
export const slideInRight = async (targets: string | HTMLElement | HTMLElement[], delay = 0) => {
  const anime = await getAnime();
  
  if (!anime) {
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : Array.isArray(targets) ? targets : [targets];
    elements.forEach((el: any) => {
      if (el && el.classList) {
        el.classList.remove('opacity-0');
        el.style.opacity = '1';
      }
    });
    return;
  }
  
  return anime({
    targets,
    opacity: [0, 1],
    translateX: [50, 0],
    duration: 800,
    delay,
    easing: 'easeOutCubic',
  });
};

// Scale in animation with fallback
export const scaleIn = async (targets: string | HTMLElement | HTMLElement[], delay = 0) => {
  const anime = await getAnime();
  
  if (!anime) {
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : Array.isArray(targets) ? targets : [targets];
    elements.forEach((el: any) => {
      if (el && el.classList) {
        el.classList.remove('opacity-0');
        el.style.opacity = '1';
      }
    });
    return;
  }
  
  return anime({
    targets,
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 600,
    delay,
    easing: 'easeOutElastic(1, .6)',
  });
};

// Stagger animation for multiple elements with fallback
export const staggerFadeIn = async (targets: string | HTMLElement | HTMLElement[], staggerDelay = 100) => {
  const anime = await getAnime();
  
  if (!anime) {
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : Array.isArray(targets) ? targets : [targets];
    elements.forEach((el: any, index: number) => {
      if (el && el.classList) {
        setTimeout(() => {
          el.classList.remove('opacity-0');
          el.style.opacity = '1';
        }, index * staggerDelay);
      }
    });
    return;
  }
  
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    delay: anime.stagger(staggerDelay),
    easing: 'easeOutCubic',
  });
};

// Logo animation with fallback
export const logoAnimation = async (targets: string | HTMLElement | HTMLElement[]) => {
  const anime = await getAnime();
  
  if (!anime) {
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : Array.isArray(targets) ? targets : [targets];
    elements.forEach((el: any) => {
      if (el && el.classList) {
        el.classList.remove('opacity-0');
        el.style.opacity = '1';
      }
    });
    return;
  }
  
  return anime({
    targets,
    opacity: [0, 1],
    scale: [0.9, 1],
    rotate: [-5, 0],
    duration: 1200,
    easing: 'easeOutElastic(1, .5)',
  });
};
