/**
 * MessageDisplay.jsx
 * Renders messages with markdown parsing and thinking placeholder
 */
import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { removeDoubleAsterisks } from '../utils/messageFormatting'

const ThinkingPlaceholder = ({ isSearching = false }) => (
  <p className='inline-flex items-center gap-1 text-white/85'>
    <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/65' />
    <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/65 [animation-delay:120ms]' />
    <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/65 [animation-delay:240ms]' />
    <span className='ml-1 text-sm text-white/80'>
      {isSearching ? 'Searching internet...' : 'Thinking...'}
    </span>
  </p>
)

export const MessageDisplay = ({
  messages,
  currentChatId,
  isSendingMessage,
  isDraftConversation,
  activeChat,
  user,
  messageContainerRef,
}) => {
  const nothingToShow = !messages || messages.length === 0

  if (nothingToShow && !isSendingMessage && !currentChatId && !isDraftConversation) {
    return (
      <div className='messages mt-2 flex-1 space-y-3 overflow-y-auto px-4 pb-6 pr-3 flex flex-col items-center justify-center'>
        <p className='font-display text-4xl font-bold text-white/20'>MayAI</p>
        <p className='mt-2 text-sm text-white/40'>
          Start a new conversation or select an existing one
        </p>
      </div>
    )
  }

  if (nothingToShow && isDraftConversation) {
    return (
      <div className='messages mt-2 flex-1 space-y-3 overflow-y-auto px-4 pb-6 pr-3 flex flex-col items-center justify-center'>
        <p className='font-display text-2xl font-semibold text-white/60'>Ready to chat!</p>
        <p className='mt-2 text-sm text-white/40'>Type your first message below</p>
      </div>
    )
  }

  if (nothingToShow && !isSendingMessage) {
    return (
      <div className='messages mt-2 flex-1 space-y-3 overflow-y-auto px-4 pb-6 pr-3 flex flex-col items-center justify-center mx-auto max-w-md p-6 text-center'>
        <p className='font-display text-lg font-semibold text-white'>
          Start Your First Prompt
        </p>
        <p className='mt-2 text-sm text-white/65'>
          Draft ideas, summarize research, generate code, or plan your next task in one place.
        </p>
      </div>
    )
  }

  return (
    <div className='messages mt-2 flex-1 space-y-3 overflow-y-auto px-4 pb-6 pr-3'>
      {messages && messages.length > 0 && messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={`max-w-[82%] w-fit rounded-2xl px-4 py-3 text-sm md:text-base ${
            message.role === 'user'
              ? 'ml-auto rounded-br-none border border-white/15 bg-[#2a2a2a] text-white'
              : 'mr-auto border border-white/10 bg-[#1a1a1a] text-white/90'
          }`}
        >
          {message.role === 'user' ? (
            <div className='space-y-2'>
              {message.content ? <p>{removeDoubleAsterisks(message.content)}</p> : null}
              {message.imageUrl ? (
                <img
                  src={message.imageUrl}
                  alt='Uploaded by user'
                  className='max-h-64 w-full max-w-xs rounded-lg object-cover'
                />
              ) : null}
            </div>
          ) : message.isThinking ? (
            <ThinkingPlaceholder isSearching={Boolean(message.isSearching)} />
          ) : (
            <div className='prose prose-invert max-w-none text-sm'>
              <Markdown
                components={{
                  p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
                  ul: ({ children }) => <ul className='mb-2 list-disc pl-5'>{children}</ul>,
                  ol: ({ children }) => <ol className='mb-2 list-decimal pl-5'>{children}</ol>,
                  code: ({ children }) => <code className='rounded bg-white/10 px-1 py-0.5 text-white'>{children}</code>,
                  pre: ({ children }) => <pre className='mb-2 overflow-x-auto rounded-xl bg-black/30 p-3'>{children}</pre>
                }}
                remarkPlugins={[remarkGfm]}
              >
                {removeDoubleAsterisks(message.content)}
              </Markdown>

              {Array.isArray(message.sources) && message.sources.length > 0 ? (
                <div className='mt-3 border-t border-white/10 pt-2 not-prose'>
                  <p className='text-xs uppercase tracking-[0.12em] text-white/60'>Sources</p>
                  <div className='mt-2 space-y-1'>
                    {message.sources.map((source, sourceIndex) => (
                      <a
                        key={`${source.url}-${sourceIndex}`}
                        href={source.url}
                        target='_blank'
                        rel='noreferrer'
                        className='block text-xs text-sky-300 hover:text-sky-200 hover:underline'
                      >
                        {source.title || source.url}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
          <p className='mt-2 text-[11px] uppercase tracking-[0.12em] text-white/45'>
            {message.role === 'user' ? 'You' : 'MayAI'}
          </p>
        </div>
      ))}

      <div ref={messageContainerRef} className='h-0' />
    </div>
  )
}
