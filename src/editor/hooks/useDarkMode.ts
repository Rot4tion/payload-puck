'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Source of dark mode detection
 */
export type DarkModeSource = 'class' | 'media-query' | 'none'

/**
 * Return type for useDarkMode hook
 */
export interface UseDarkModeReturn {
  /**
   * Whether dark mode is currently active
   */
  isDarkMode: boolean
  /**
   * How dark mode was detected
   */
  source: DarkModeSource
}

/**
 * Detects dark mode state from PayloadCMS admin or OS preferences.
 *
 * Detection priority:
 * 1. `.dark` class on `document.documentElement` (PayloadCMS admin)
 * 2. `prefers-color-scheme: dark` media query (OS preference)
 *
 * Uses MutationObserver to track class changes in real-time.
 *
 * @example
 * ```tsx
 * const { isDarkMode, source } = useDarkMode()
 *
 * if (isDarkMode) {
 *   // Apply dark mode styles
 * }
 * ```
 */
export function useDarkMode(): UseDarkModeReturn {
  const [state, setState] = useState<UseDarkModeReturn>({
    isDarkMode: false,
    source: 'none',
  })

  // Check for dark mode class on document element
  const checkDarkModeClass = useCallback((): boolean => {
    if (typeof document === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  }, [])

  // Check for OS dark mode preference
  const checkMediaQuery = useCallback((): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [])

  // Compute current dark mode state
  const computeState = useCallback((): UseDarkModeReturn => {
    // Priority 1: Check for .dark class (PayloadCMS)
    if (checkDarkModeClass()) {
      return { isDarkMode: true, source: 'class' }
    }

    // Priority 2: Check OS preference
    if (checkMediaQuery()) {
      return { isDarkMode: true, source: 'media-query' }
    }

    return { isDarkMode: false, source: 'none' }
  }, [checkDarkModeClass, checkMediaQuery])

  useEffect(() => {
    // Set initial state
    setState(computeState())

    // Watch for class changes on document element
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          setState(computeState())
          break
        }
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Watch for OS preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = () => {
      setState(computeState())
    }
    mediaQuery.addEventListener('change', handleMediaChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [computeState])

  return state
}
