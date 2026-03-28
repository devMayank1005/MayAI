/**
 * ChatListItems.jsx
 * Renders filtered and sorted list of chats
 */
import React from 'react'
import { sanitizeChatTitle } from '../utils/messageFormatting'

export const ChatListItems = ({ chats, currentChatId, filteredList, onSelectChat, isDraftConversation }) => {
  if (filteredList.length === 0) {
    return (
      <div className='mt-4 flex items-center justify-center py-8'>
        <p className='text-xs text-white/40'>No chats yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className='mt-3 space-y-1'>
      {filteredList.map((chatId) => {
        const chat = chats[chatId]
        if (!chat) return null

        const isSelected = !isDraftConversation && currentChatId === chatId
        const chatTitle = sanitizeChatTitle(chat.title)

        return (
          <button
            key={chatId}
            type='button'
            onClick={() => onSelectChat(chatId)}
            className={`w-full rounded-md px-2.5 py-2 text-left transition ${
              isSelected
                ? 'border border-white/30 bg-white/8 text-white shadow-md'
                : 'border border-transparent bg-transparent text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white'
            }`}
            title={chatTitle}
          >
            <p className='truncate text-sm font-medium'>
              {chatTitle}
            </p>
          </button>
        )
      })}
    </div>
  )
}
