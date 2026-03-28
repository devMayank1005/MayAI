/**
 * NewChatButton.jsx
 * Button to start a new conversation
 */
import React from 'react'

export const NewChatButton = ({ onClick }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='mb-3 w-full rounded-lg border border-white/20 bg-[#1e1e1e] px-3 py-2 text-left text-sm font-medium text-white transition hover:border-white/35 hover:bg-[#262626]'
      aria-label='Start new chat'
    >
      + New chat
    </button>
  )
}
