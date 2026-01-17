'use client'

import { useEffect } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'

/**
 * Dark mode CSS to inject. This contains all Puck color variable overrides.
 * We inline this rather than importing a CSS file to avoid build complexity.
 */
const DARK_MODE_CSS = `
/**
 * Puck Editor Dark Mode CSS Overrides
 * Automatically injected when dark mode is detected
 */

.dark {
  /* Invert grey scale for dark mode */
  --puck-color-grey-01: #fafafa;
  --puck-color-grey-02: #f5f5f5;
  --puck-color-grey-03: #efefef;
  --puck-color-grey-04: #e8e8e8;
  --puck-color-grey-05: #d4d4d4;
  --puck-color-grey-06: #b3b3b3;
  --puck-color-grey-07: #8f8f8f;
  --puck-color-grey-08: #6b6b6b;
  --puck-color-grey-09: #525252;
  --puck-color-grey-10: #3d3d3d;
  --puck-color-grey-11: #272727;
  --puck-color-grey-12: #181818;

  /* Swap white/black */
  --puck-color-white: #1a1a1a;
  --puck-color-black: #ffffff;

  /* Azure (primary blue) */
  --puck-color-azure-01: #e0f2ff;
  --puck-color-azure-02: #c4e5ff;
  --puck-color-azure-03: #99d4ff;
  --puck-color-azure-04: #66c2ff;
  --puck-color-azure-05: #33b0ff;
  --puck-color-azure-06: #009dff;
  --puck-color-azure-07: #0080d9;
  --puck-color-azure-08: #0066b3;
  --puck-color-azure-09: #004d8c;
  --puck-color-azure-10: #003366;
  --puck-color-azure-11: #001a40;
  --puck-color-azure-12: #00101a;

  /* Rose (pink/red accents) */
  --puck-color-rose-01: #ffe0f0;
  --puck-color-rose-02: #ffc4e3;
  --puck-color-rose-03: #ff99cf;
  --puck-color-rose-04: #ff66b8;
  --puck-color-rose-05: #ff33a1;
  --puck-color-rose-06: #ff008a;
  --puck-color-rose-07: #d90075;
  --puck-color-rose-08: #b30061;
  --puck-color-rose-09: #8c004d;
  --puck-color-rose-10: #660038;
  --puck-color-rose-11: #400024;
  --puck-color-rose-12: #1a000f;

  /* Green (success states) */
  --puck-color-green-01: #e0ffe0;
  --puck-color-green-02: #c4ffc4;
  --puck-color-green-03: #99ff99;
  --puck-color-green-04: #66ff66;
  --puck-color-green-05: #33ff33;
  --puck-color-green-06: #00e600;
  --puck-color-green-07: #00c400;
  --puck-color-green-08: #00a300;
  --puck-color-green-09: #008200;
  --puck-color-green-10: #006100;
  --puck-color-green-11: #004000;
  --puck-color-green-12: #001a00;

  /* Yellow (warning states) */
  --puck-color-yellow-01: #fffde0;
  --puck-color-yellow-02: #fffbc4;
  --puck-color-yellow-03: #fff899;
  --puck-color-yellow-04: #fff566;
  --puck-color-yellow-05: #fff233;
  --puck-color-yellow-06: #e6d900;
  --puck-color-yellow-07: #c4b800;
  --puck-color-yellow-08: #a39800;
  --puck-color-yellow-09: #827800;
  --puck-color-yellow-10: #615800;
  --puck-color-yellow-11: #403900;
  --puck-color-yellow-12: #1a1700;

  /* Red (error states) */
  --puck-color-red-01: #ffe0e0;
  --puck-color-red-02: #ffc4c4;
  --puck-color-red-03: #ff9999;
  --puck-color-red-04: #ff6666;
  --puck-color-red-05: #ff3333;
  --puck-color-red-06: #e60000;
  --puck-color-red-07: #c40000;
  --puck-color-red-08: #a30000;
  --puck-color-red-09: #820000;
  --puck-color-red-10: #610000;
  --puck-color-red-11: #400000;
  --puck-color-red-12: #1a0000;
}
`.trim()

const STYLE_ID = 'puck-dark-mode-styles'

export interface DarkModeStylesProps {
  /**
   * Override automatic dark mode detection.
   * When true, always inject dark mode styles.
   * When false, never inject dark mode styles.
   * When undefined, use automatic detection.
   */
  forceEnabled?: boolean
}

/**
 * Injects dark mode CSS overrides for Puck when dark mode is detected.
 *
 * This component uses the useDarkMode hook to detect when PayloadCMS admin
 * is in dark mode (via .dark class) or when OS preference is dark mode.
 * It then injects/removes the CSS overrides accordingly.
 *
 * @example
 * ```tsx
 * function MyEditor() {
 *   return (
 *     <>
 *       <DarkModeStyles />
 *       <Puck ... />
 *     </>
 *   )
 * }
 * ```
 */
export function DarkModeStyles({ forceEnabled }: DarkModeStylesProps) {
  const { isDarkMode } = useDarkMode()

  // Determine if we should inject styles
  const shouldInject = forceEnabled ?? isDarkMode

  useEffect(() => {
    if (typeof document === 'undefined') return

    // Check if style element already exists
    let styleElement = document.getElementById(STYLE_ID) as HTMLStyleElement | null

    if (shouldInject) {
      // Inject styles if not already present
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = STYLE_ID
        styleElement.textContent = DARK_MODE_CSS
        document.head.appendChild(styleElement)
      }
    } else {
      // Remove styles if present
      if (styleElement) {
        styleElement.remove()
      }
    }

    // Cleanup on unmount
    return () => {
      const el = document.getElementById(STYLE_ID)
      if (el) {
        el.remove()
      }
    }
  }, [shouldInject])

  // This component doesn't render anything
  return null
}
