import { useState, useEffect } from 'react';

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
};

/**
 * Hook to detect current screen size breakpoint
 * - mobile: < 768px
 * - tablet: 768px - 1023px
 * - desktop: >= 1024px
 */
export const useBreakpoint = (): BreakpointState => {
  const [breakpoint, setBreakpoint] = useState<BreakpointState>(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isTablet: false, isDesktop: true };
    }
    const width = window.innerWidth;
    return {
      isMobile: width < BREAKPOINTS.mobile,
      isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
      isDesktop: width >= BREAKPOINTS.tablet,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setBreakpoint({
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.tablet,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Initial check
    handleResize();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};
