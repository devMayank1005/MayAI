/**
 * MessageInput.jsx
 * Textarea composer with send button and keyboard shortcuts
 */
import React from 'react'

export const MessageInput = ({
  chatInput,
  setChatInput,
  onSubmit,
  isSending,
  isDraftConversation,
  messageInputRef,
  useInternetSearch,
  onToggleInternetSearch,
  selectedImagePreview,
  onSelectImage,
  onRemoveImage,
}) => {
  const handleImageSelection = (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      return
    }

    onSelectImage(selectedFile)
    event.target.value = ''
  }

  const handleKeyDown = (event) => {
    // Enter to send (unless Shift+Enter for newline)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!isSending && chatInput.trim()) {
        event.currentTarget.form?.requestSubmit()
      }
    }
  }

  const handleFormSubmit = (event) => {
    onSubmit(event)
  }

  return (
    <footer className='sticky bottom-0 border-t border-white/10 bg-[#121212] px-4 py-3'>
      <div className='mb-3 flex flex-wrap items-center gap-3'>
        <button
          type='button'
          onClick={onToggleInternetSearch}
          className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
            useInternetSearch
              ? 'border-emerald-300/60 bg-emerald-400/15 text-emerald-100'
              : 'border-white/20 bg-white/5 text-white/70 hover:text-white'
          }`}
          aria-label='Toggle internet search'
        >
          {useInternetSearch ? 'Web Search: ON' : 'Web Search: OFF'}
        </button>

        <label className='cursor-pointer rounded-md border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80 transition hover:text-white'>
          Attach Image
          <input
            type='file'
            accept='image/png,image/jpeg,image/jpg,image/webp,image/gif'
            onChange={handleImageSelection}
            className='hidden'
            disabled={isSending}
          />
        </label>
      </div>

      {selectedImagePreview ? (
        <div className='mb-3 inline-flex items-start gap-2 rounded-md border border-white/15 bg-white/5 p-2'>
          <img
            src={selectedImagePreview}
            alt='Selected upload preview'
            className='h-20 w-20 rounded object-cover'
          />
          <button
            type='button'
            onClick={onRemoveImage}
            className='rounded-md border border-white/20 px-2 py-1 text-xs text-white/80 transition hover:text-white'
            aria-label='Remove selected image'
          >
            Remove
          </button>
        </div>
      ) : null}

      <form onSubmit={handleFormSubmit} className='flex flex-col gap-3 sm:flex-row sm:items-end'>
        <textarea
          ref={messageInputRef}
          value={chatInput}
          onChange={(event) => setChatInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Message MayAI...'
          rows={2}
          disabled={isSending}
          className='min-h-[52px] max-h-44 w-full resize-y rounded-lg border border-white/20 bg-[#1b1b1b] px-4 py-3 text-base text-white outline-none transition placeholder:text-white/40 focus:border-white/50 disabled:opacity-50'
          aria-label='Type your message'
        />
        <button
          type='submit'
          disabled={(!chatInput.trim() && !selectedImagePreview) || isSending}
          className='w-full rounded-lg border border-white/25 bg-[#262626] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
          aria-label='Send message'
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
      <p className='mt-2 text-xs text-white/40'>
        Tips: Use Cmd/Ctrl + K to focus search, Cmd/Ctrl + N for New chat, Enter to send, Shift+Enter for a new line.
      </p>
    </footer>
  )
}
