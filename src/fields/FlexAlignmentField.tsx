'use client'

/**
 * FlexAlignmentField - Icon toggle buttons for flexbox alignment properties
 *
 * Provides two specialized fields:
 * - JustifyContentField: Controls main-axis distribution (horizontal in row, vertical in column)
 * - AlignItemsField: Controls cross-axis alignment (vertical in row, horizontal in column)
 */

import React, { useCallback, memo } from 'react'
import type { CustomField } from '@measured/puck'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalDistributeCenter,
  GripHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  MoveVertical,
  X,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { cn } from '../lib/utils'

// =============================================================================
// Types
// =============================================================================

export type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
export type AlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch'

interface JustifyContentFieldProps {
  value: JustifyContent | null
  onChange: (value: JustifyContent | null) => void
  label?: string
  readOnly?: boolean
  defaultValue?: JustifyContent
}

interface AlignItemsFieldProps {
  value: AlignItems | null
  onChange: (value: AlignItems | null) => void
  label?: string
  readOnly?: boolean
  defaultValue?: AlignItems
}

// =============================================================================
// JustifyContentField Component
// =============================================================================

function JustifyContentFieldInner({
  value,
  onChange,
  label = 'Justify Content',
  readOnly,
  defaultValue = 'flex-start',
}: JustifyContentFieldProps) {
  const currentValue = value ?? defaultValue

  const handleChange = useCallback((justifyContent: JustifyContent) => {
    onChange(justifyContent)
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const options = [
    { value: 'flex-start' as JustifyContent, icon: AlignLeft, title: 'Start' },
    { value: 'center' as JustifyContent, icon: AlignCenter, title: 'Center' },
    { value: 'flex-end' as JustifyContent, icon: AlignRight, title: 'End' },
    { value: 'space-between' as JustifyContent, icon: AlignHorizontalDistributeCenter, title: 'Space Between' },
    { value: 'space-around' as JustifyContent, icon: GripHorizontal, title: 'Space Around' },
  ]

  return (
    <div className="puck-field space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {value && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
            title="Reset to default"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex gap-1">
        {options.map(({ value: optionValue, icon: Icon, title }) => {
          const isActive = currentValue === optionValue
          return (
            <Button
              key={optionValue}
              type="button"
              variant={isActive ? 'default' : 'secondary'}
              size="icon"
              onClick={() => handleChange(optionValue)}
              disabled={readOnly}
              className={cn(
                "h-8 w-8",
                isActive && "bg-primary hover:bg-primary/90"
              )}
              title={title}
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export const JustifyContentField = memo(JustifyContentFieldInner)

// =============================================================================
// AlignItemsField Component
// =============================================================================

function AlignItemsFieldInner({
  value,
  onChange,
  label = 'Align Items',
  readOnly,
  defaultValue = 'center',
}: AlignItemsFieldProps) {
  const currentValue = value ?? defaultValue

  const handleChange = useCallback((alignItems: AlignItems) => {
    onChange(alignItems)
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange(null)
  }, [onChange])

  const options = [
    { value: 'flex-start' as AlignItems, icon: AlignStartVertical, title: 'Start' },
    { value: 'center' as AlignItems, icon: AlignCenterVertical, title: 'Center' },
    { value: 'flex-end' as AlignItems, icon: AlignEndVertical, title: 'End' },
    { value: 'stretch' as AlignItems, icon: MoveVertical, title: 'Stretch' },
  ]

  return (
    <div className="puck-field space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {value && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
            title="Reset to default"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex gap-1">
        {options.map(({ value: optionValue, icon: Icon, title }) => {
          const isActive = currentValue === optionValue
          return (
            <Button
              key={optionValue}
              type="button"
              variant={isActive ? 'default' : 'secondary'}
              size="icon"
              onClick={() => handleChange(optionValue)}
              disabled={readOnly}
              className={cn(
                "h-8 w-8",
                isActive && "bg-primary hover:bg-primary/90"
              )}
              title={title}
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export const AlignItemsField = memo(AlignItemsFieldInner)

// =============================================================================
// Field Configuration Factories
// =============================================================================

interface CreateJustifyContentFieldConfig {
  label?: string
  defaultValue?: JustifyContent
}

interface CreateAlignItemsFieldConfig {
  label?: string
  defaultValue?: AlignItems
}

/**
 * Creates a Puck field configuration for flex justify-content control
 *
 * @example
 * ```ts
 * fields: {
 *   justifyContent: createJustifyContentField({ label: 'Justify Content' }),
 * }
 * ```
 */
export function createJustifyContentField(
  config: CreateJustifyContentFieldConfig = {}
): CustomField<JustifyContent | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <JustifyContentField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        defaultValue={config.defaultValue}
      />
    ),
  }
}

/**
 * Creates a Puck field configuration for flex align-items control
 *
 * @example
 * ```ts
 * fields: {
 *   alignItems: createAlignItemsField({ label: 'Align Items' }),
 * }
 * ```
 */
export function createAlignItemsField(
  config: CreateAlignItemsFieldConfig = {}
): CustomField<AlignItems | null> {
  return {
    type: 'custom',
    label: config.label,
    render: ({ value, onChange, readOnly }) => (
      <AlignItemsField
        value={value}
        onChange={onChange}
        label={config.label}
        readOnly={readOnly}
        defaultValue={config.defaultValue}
      />
    ),
  }
}
