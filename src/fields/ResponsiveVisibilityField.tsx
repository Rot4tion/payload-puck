'use client'

/**
 * ResponsiveVisibilityField - Show/hide elements at different breakpoints
 *
 * Provides a compact visual interface for toggling element visibility
 * at each breakpoint (xs, sm, md, lg, xl). Simple independent toggles
 * like Elementor/Divi - each breakpoint is just on or off.
 */

import React, { useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Label } from '../components/ui/label'
import { cn } from '../lib/utils'
import type { Breakpoint, VisibilityValue } from './shared'
import { BREAKPOINTS, DEFAULT_VISIBILITY } from './shared'

// =============================================================================
// Types
// =============================================================================

interface ResponsiveVisibilityFieldProps {
  value: VisibilityValue | null
  onChange: (value: VisibilityValue | null) => void
  label?: string
  readOnly?: boolean
}

// =============================================================================
// Breakpoint Icons
// =============================================================================

const BREAKPOINT_ICONS: Record<Breakpoint, React.ComponentType<{ className?: string }>> = {
  xs: Smartphone,
  sm: Smartphone,
  md: Tablet,
  lg: Laptop,
  xl: Monitor,
}

// =============================================================================
// Visibility Toggle Button
// =============================================================================

interface VisibilityToggleProps {
  breakpoint: Breakpoint
  label: string
  minWidth: number | null
  isVisible: boolean
  onClick: () => void
  disabled?: boolean
}

function VisibilityToggle({
  breakpoint,
  label,
  minWidth,
  isVisible,
  onClick,
  disabled,
}: VisibilityToggleProps) {
  const DeviceIcon = BREAKPOINT_ICONS[breakpoint]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={`${label}${minWidth ? ` (${minWidth}px+)` : ''}: ${isVisible ? 'Visible' : 'Hidden'}`}
      className={cn(
        'relative flex flex-col items-center justify-center gap-0.5 p-2 rounded-md transition-all flex-1 min-w-[52px]',
        isVisible
          ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border border-emerald-500/40'
          : 'bg-red-500/15 text-red-500 hover:bg-red-500/25 border border-red-500/40',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <DeviceIcon className="h-4 w-4" />
      <span className="text-[10px] font-medium">{label}</span>
      {/* Visibility icon overlay */}
      <div className="absolute top-1 right-1">
        {isVisible ? (
          <Eye className="h-3 w-3" />
        ) : (
          <EyeOff className="h-3 w-3" />
        )}
      </div>
    </button>
  )
}

// =============================================================================
// ResponsiveVisibilityField Component
// =============================================================================

function ResponsiveVisibilityFieldInner({
  value,
  onChange,
  label,
  readOnly,
}: ResponsiveVisibilityFieldProps) {
  // Get visibility for a breakpoint (simple lookup, no cascade)
  const getVisibility = useCallback(
    (breakpoint: Breakpoint): boolean => {
      const val = value ?? DEFAULT_VISIBILITY
      // All breakpoints have explicit values, default to true if undefined
      return val[breakpoint] ?? true
    },
    [value]
  )

  // Toggle visibility for a breakpoint (simple toggle, no cascade)
  const toggleVisibility = useCallback(
    (breakpoint: Breakpoint) => {
      const currentVisible = getVisibility(breakpoint)
      const newValue: VisibilityValue = {
        ...(value ?? DEFAULT_VISIBILITY),
        [breakpoint]: !currentVisible,
      }
      onChange(newValue)
    },
    [value, onChange, getVisibility]
  )

  // Check if any breakpoint is hidden
  const hasHiddenBreakpoints = BREAKPOINTS.some((bp) => !getVisibility(bp.key))

  return (
    <div className="puck-field space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        {label && (
          <Label className="text-sm font-medium text-foreground">{label}</Label>
        )}
        {hasHiddenBreakpoints && (
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <EyeOff className="h-3 w-3" />
            Partially hidden
          </span>
        )}
      </div>

      {/* Visibility Grid */}
      <div className="flex gap-1">
        {BREAKPOINTS.map((bp) => (
          <VisibilityToggle
            key={bp.key}
            breakpoint={bp.key}
            label={bp.label}
            minWidth={bp.minWidth}
            isVisible={getVisibility(bp.key)}
            onClick={() => toggleVisibility(bp.key)}
            disabled={readOnly}
          />
        ))}
      </div>

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Toggle visibility per screen size. Each breakpoint is independent.
      </p>
    </div>
  )
}

export const ResponsiveVisibilityField = memo(ResponsiveVisibilityFieldInner)

// =============================================================================
// Field Configuration Factory
// =============================================================================

interface CreateResponsiveVisibilityFieldConfig {
  label?: string
}

/**
 * Creates a Puck custom field for responsive visibility control.
 *
 * @example
 * ```ts
 * fields: {
 *   visibility: createResponsiveVisibilityField({ label: 'Visibility' }),
 * }
 * ```
 */
export function createResponsiveVisibilityField(
  config: CreateResponsiveVisibilityFieldConfig = {}
): CustomField<VisibilityValue | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <ResponsiveVisibilityField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
      />
    ),
  }
}
