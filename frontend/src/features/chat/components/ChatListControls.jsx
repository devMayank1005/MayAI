/**
 * ChatListControls.jsx
 * Search input and sort toggle buttons for chat list
 */
import React from 'react'

export const ChatListControls = ({ searchQuery, onSearchChange, sortMode, onSortChange, searchInputRef }) => {
  return (
    <div className='mt-5'>
      <label htmlFor='chat-search' className='text-xs uppercase tracking-[0.14em] text-white/50'>
        Search Chats
      </label>
      <input
        id='chat-search'
        ref={searchInputRef}
        type='text'
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder='Search by title'
        className='mt-2 w-full border-b border-white/25 bg-transparent px-0 py-2 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/60'
        aria-label='Search chat titles'
      />

      <div className='mt-3 flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={() => onSortChange('recent')}
          className={`px-0 py-1.5 text-xs font-medium transition ${
            sortMode === 'recent'
              ? 'text-white underline underline-offset-4'
              : 'text-white/60 hover:text-white/85'
          }`}
          aria-label='Sort by recent activity'
        >
          Recent
        </button>
        <button
          type='button'
          onClick={() => onSortChange('alpha')}
          className={`px-0 py-1.5 text-xs font-medium transition ${
            sortMode === 'alpha'
              ? 'text-white underline underline-offset-4'
              : 'text-white/60 hover:text-white/85'
          }`}
          aria-label='Sort chats alphabetically'
        >
          A-Z
        </button>
      </div>
    </div>
  )
}
