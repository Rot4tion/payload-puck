'use client'

/**
 * PageSegmentField - Custom Puck field for page segment editing
 *
 * Provides an editable text field with automatic slugification.
 * Integrates with @delmaredigital/payload-page-tree plugin.
 *
 * Exports:
 * - PageSegmentField: Basic editable page segment field
 * - LockedPageSegmentField: Locked by default, requires clicking lock icon to edit
 * - createPageSegmentField: Factory for basic field
 * - createLockedPageSegmentField: Factory for locked field (recommended for page-tree)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import type { CustomField } from '@puckeditor/core'
import { Lock, Unlock } from 'lucide-react'

// =============================================================================
// Slugify Utility
// =============================================================================

/**
 * Converts a string to a URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// =============================================================================
// Types
// =============================================================================

interface PageSegmentFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

interface LockedPageSegmentFieldProps extends PageSegmentFieldProps {
  warningMessage?: string
}

// =============================================================================
// PageSegmentField Component
// =============================================================================

export function PageSegmentField({
  value,
  onChange,
  label = 'Page Segment',
  placeholder = 'page-segment',
}: PageSegmentFieldProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with external value changes
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value)
    }
  }, [value, isFocused])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    // Slugify on blur
    const slugified = slugify(localValue)
    setLocalValue(slugified)
    onChange(slugified)
  }, [localValue, onChange])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
  }, [])

  return (
    <div className="puck-field">
      {/* Label */}
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--puck-color-grey-04)',
          marginBottom: '8px',
        }}
      >
        {label}
      </label>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: '14px',
          border: `1px solid ${isFocused ? 'var(--puck-color-azure-06)' : 'var(--puck-color-grey-09)'}`,
          borderRadius: '6px',
          backgroundColor: 'var(--puck-color-white)',
          color: 'var(--puck-color-grey-04)',
          outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
      />

      {/* Helper text */}
      <p
        style={{
          marginTop: '6px',
          fontSize: '12px',
          color: 'var(--puck-color-grey-06)',
        }}
      >
        Auto-slugified on blur. Used in URL path.
      </p>
    </div>
  )
}

// =============================================================================
// Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for page segment editing
 */
export function createPageSegmentField(config?: {
  label?: string
  placeholder?: string
}): CustomField<string> {
  return {
    type: 'custom',
    label: config?.label ?? 'Page Segment',
    render: ({ value, onChange }) => (
      <PageSegmentField
        value={value || ''}
        onChange={onChange}
        label={config?.label}
        placeholder={config?.placeholder}
      />
    ),
  }
}

// =============================================================================
// LockedPageSegmentField Component
// =============================================================================

/**
 * PageSegmentField with lock/unlock functionality.
 * Starts locked to prevent accidental URL changes.
 */
export function LockedPageSegmentField({
  value,
  onChange,
  label = 'Page Segment',
  placeholder = 'page-segment',
  warningMessage = 'Changing may break existing links',
}: LockedPageSegmentFieldProps) {
  const [isLocked, setIsLocked] = useState(true)
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with external value changes
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value)
    }
  }, [value, isFocused])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    // Slugify on blur
    const slugified = slugify(localValue)
    setLocalValue(slugified)
    onChange(slugified)
  }, [localValue, onChange])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
  }, [])

  return (
    <div className="puck-field">
      {/* Field header with label and lock toggle */}
      <div
        className="puck-field-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <label
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--puck-color-grey-04)',
          }}
        >
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsLocked(!isLocked)}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            color: isLocked ? 'var(--puck-color-grey-05)' : 'var(--puck-color-azure-04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'all 0.15s ease',
          }}
          title={isLocked ? 'Click to unlock' : 'Click to lock'}
        >
          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
      </div>

      {/* Input field */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={isLocked}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '8px 12px',
            paddingRight: isLocked ? '32px' : '12px',
            fontSize: '14px',
            border: `1px solid ${isFocused && !isLocked ? 'var(--puck-color-azure-06)' : 'var(--puck-color-grey-09)'}`,
            borderRadius: '6px',
            backgroundColor: isLocked ? 'var(--puck-color-grey-11)' : 'var(--puck-color-white)',
            color: isLocked ? 'var(--puck-color-grey-05)' : 'var(--puck-color-grey-04)',
            cursor: isLocked ? 'not-allowed' : 'text',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
        />
        {isLocked && (
          <Lock
            size={14}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--puck-color-grey-07)',
            }}
          />
        )}
      </div>

      {/* Helper text / Warning message */}
      <p
        style={{
          marginTop: '6px',
          fontSize: '12px',
          color: 'var(--puck-color-grey-06)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {!isLocked && warningMessage ? (
          <>
            <span style={{ color: 'var(--puck-color-rose-07)' }}>⚠</span>
            {warningMessage}
          </>
        ) : (
          'Auto-slugified on blur. Used in URL path.'
        )}
      </p>
    </div>
  )
}

// =============================================================================
// Locked Field Configuration Factory
// =============================================================================

/**
 * Creates a Puck field configuration for a locked page segment field.
 * Recommended for page-tree integration to prevent accidental URL changes.
 */
export function createLockedPageSegmentField(config?: {
  label?: string
  placeholder?: string
  warningMessage?: string
}): CustomField<string> {
  return {
    type: 'custom',
    label: config?.label ?? 'Page Segment',
    render: ({ value, onChange }) => (
      <LockedPageSegmentField
        value={value || ''}
        onChange={onChange}
        label={config?.label}
        placeholder={config?.placeholder}
        warningMessage={config?.warningMessage}
      />
    ),
  }
}
