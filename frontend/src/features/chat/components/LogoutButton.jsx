/**
 * LogoutButton.jsx
 * Bottom sidebar button for user logout with confirmation dialog
 */
import React, { useState } from 'react'

export const LogoutButton = ({ user, isLoggingOut, onLogout }) => {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogoutClick = () => {
    if (showConfirm) {
      onLogout()
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <div className='space-y-3'>
      {showConfirm && (
        <div className='rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2'>
          <p className='text-xs text-amber-200'>
            This will log you out.
          </p>
        </div>
      )}

      <div className='flex gap-2'>
        <button
          type='button'
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className='flex-1 rounded-md border border-white/20 bg-[#1e1e1e] px-3 py-2 text-sm font-medium text-white transition hover:border-white/35 hover:bg-[#262626] disabled:opacity-50'
        >
          {isLoggingOut ? 'Logging out...' : showConfirm ? 'Confirm' : 'Logout'}
        </button>

        {showConfirm && (
          <button
            type='button'
            onClick={handleCancel}
            className='flex-1 rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm font-medium text-white/60 transition hover:bg-white/5'
          >
            Cancel
          </button>
        )}
      </div>

      <div className='border-t border-white/10 pt-3'>
        <p className='text-xs text-white/50'>
          {user?.username ? `Logged in as ${user.username}` : 'Not logged in'}
        </p>
      </div>
    </div>
  )
}
