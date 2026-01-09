'use client'

import { Loader2 } from 'lucide-react'

export interface LoadingStateProps {
  /**
   * Loading message to display
   * @default 'Loading editor...'
   */
  message?: string
}

/**
 * Loading indicator shown while the Puck editor is being loaded
 *
 * Used as the fallback for dynamic import with ssr: false
 */
export function LoadingState({ message = 'Loading editor...' }: LoadingStateProps) {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}
