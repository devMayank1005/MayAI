/**
 * SidebarHeader.jsx
 * Sidebar top section with logo, title, welcome message, and close button
 */
import React from 'react'

export const SidebarHeader = ({ user, isMobile, onClose }) => {
  return (
    <div className='flex items-start justify-between gap-3'>
      <div>
        <p className='font-display text-xs uppercase tracking-[0.2em] text-white/55'>
          MayAi
        </p>
        <h1 className='mt-2 font-display text-2xl font-semibold tracking-tight text-white'>
          Chats
        </h1>
        <p className='mt-1 text-sm text-white/60'>
          {user?.username ? `Welcome back, ${user.username}` : 'Your AI workspace'}
        </p>
      </div>

      {isMobile && (
        <button
          type='button'
          className='rounded-md border border-white/20 px-2 py-1 text-xs text-white'
          onClick={onClose}
          aria-label='Close sidebar'
        >
          Close
        </button>
      )}
    </div>
  )
}
