/**
 * ErrorBanner.jsx
 * Displays error messages with retry and dismiss actions
 */
import React from 'react'

export const ErrorBanner = ({ chatError, isVisible, onRetry, onDismiss }) => {
  if (!chatError || !isVisible) {
    return null
  }

  return (
    <div className='mx-4 mt-3 flex flex-wrap items-center justify-between gap-3 px-1 py-1'>
      <p className='text-sm text-rose-200/90'>
        {chatError}
      </p>
      <div className='flex gap-2'>
        <button
          type='button'
          onClick={onRetry}
          className='px-0 py-1 text-xs font-medium text-rose-200 underline underline-offset-4 transition hover:text-rose-100'
        >
          Retry
        </button>
        <button
          type='button'
          onClick={onDismiss}
          className='px-0 py-1 text-xs font-medium text-rose-200 underline underline-offset-4 transition hover:text-rose-100'
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
