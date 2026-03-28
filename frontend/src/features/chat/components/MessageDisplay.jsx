/**
 * MessageDisplay.jsx
 * Renders messages with markdown parsing and thinking placeholder
 */
import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { removeDoubleAsterisks } from '../utils/messageFormatting'

const ThinkingPlaceholder = () => (
  <p className='inline-flex items-center gap-1 text-white/85'>
    <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/65' />
    <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/65 [animation-delay:120ms]' />
    <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/65 [animation-delay:240ms]' />
    <span className='ml-1 text-sm text-white/80'>Thinking...</span>
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
            <p>{removeDoubleAsterisks(message.content)}</p>
          ) : message.isThinking ? (
            <ThinkingPlaceholder />
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
            </div>
          )}
          <p className='mt-2 text-[11px] uppercase tracking-[0.12em] text-white/45'>
            {message.role === 'user' ? 'You' : 'MayAI'}
          </p>
        </div>
      ))}

      {isSendingMessage && (
        <div className='max-w-[82%] w-fit rounded-2xl px-4 py-3 text-sm mr-auto border border-white/10 bg-[#1a1a1a] text-white/90'>
          <ThinkingPlaceholder />
          <p className='mt-2 text-[11px] uppercase tracking-[0.12em] text-white/45'>
            MayAI
          </p>
        </div>
      )}

      <div ref={messageContainerRef} className='h-0' />
    </div>
  )
}
