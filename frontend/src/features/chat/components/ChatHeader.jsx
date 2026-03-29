/**
 * ChatHeader.jsx
 * Displays current chat title and sidebar toggle button
 */
import React from 'react'
import { sanitizeChatTitle } from '../utils/messageFormatting'

export const ChatHeader = ({ activeChat, isDesktopSidebarVisible, onToggleSidebar }) => {
  return (
    <header className='border-b border-white/10 px-5 py-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='text-xs uppercase tracking-[0.12em] text-white/45'>
            MayAI Conversation
          </p>
          <h1 className='mt-1 font-display text-xl font-semibold text-white'>
            Ask MayAI Anything
          </h1>
        </div>

        <button
          type='button'
          onClick={onToggleSidebar}
          className='hidden rounded-md border border-white/20 bg-[#1d1d1d] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#262626] md:inline-flex'
          aria-label='Toggle sidebar'
        >
          {isDesktopSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
        </button>
      </div>

      <h2 className='mt-2 font-display text-base font-medium text-white/85'>
        {activeChat ? sanitizeChatTitle(activeChat.title) : 'Start a new conversation'}
      </h2>
    </header>
  )
}
