import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/UseChat'
import remarkGfm from 'remark-gfm'
import { useAuth } from '../../auth/hook/useAuth'

const formatRelativeDate = (dateValue) => {
  if (!dateValue) {
    return 'No activity yet'
  }

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return 'No activity yet'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

const sortChats = (chatList, sortMode) => {
  const items = [...chatList]

  if (sortMode === 'alpha') {
    return items.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  }

  return items.sort((a, b) => {
    const aTime = new Date(a.lastUpdated || 0).getTime()
    const bTime = new Date(b.lastUpdated || 0).getTime()
    return bTime - aTime
  })
}

const removeDoubleAsterisks = (content) => {
  if (typeof content !== 'string') {
    return ''
  }

  return content.replace(/\*\*/g, '')
}

const sanitizeChatTitle = (title) => {
  const cleaned = removeDoubleAsterisks(title).trim()
  const withoutWrappingQuotes = cleaned.replace(/^"+|"+$/g, '').trim()

  return withoutWrappingQuotes || 'Untitled chat'
}

const Dashboard = () => {
  const MIN_SIDEBAR_WIDTH = 240
  const MAX_SIDEBAR_WIDTH = 420
  const COLLAPSE_THRESHOLD = 170

  const chat = useChat()
  const auth = useAuth()
  const [chatInput, setChatInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState('recent')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const [isErrorVisible, setIsErrorVisible] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isDraftConversation, setIsDraftConversation] = useState(false)
  const [pendingUserMessage, setPendingUserMessage] = useState('')

  const messageEndRef = useRef(null)
  const messageInputRef = useRef(null)
  const searchInputRef = useRef(null)
  const isResizingRef = useRef(false)

  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const isLoading = useSelector((state) => state.chat.isLoading)
  const chatError = useSelector((state) => state.chat.error)
  const user = useSelector((state) => state.auth.user)

  const chatList = useMemo(() => Object.values(chats || {}), [chats])

  const filteredChats = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const sortedChats = sortChats(chatList, sortMode)

    if (!normalizedQuery) {
      return sortedChats
    }

    return sortedChats.filter((item) =>
      sanitizeChatTitle(item.title).toLowerCase().includes(normalizedQuery)
    )
  }, [chatList, searchQuery, sortMode])

  const activeChat = currentChatId ? chats[currentChatId] : null
  const activeMessages = activeChat?.messages || []
  const displayedMessages = useMemo(() => {
    if (!isSendingMessage || !pendingUserMessage) {
      return activeMessages
    }

    return [
      ...activeMessages,
      { role: 'user', content: pendingUserMessage, isPending: true },
      { role: 'assistant', content: 'Thinking...', isThinking: true },
    ]
  }, [activeMessages, isSendingMessage, pendingUserMessage])
  const desktopGridClasses = isDesktopSidebarVisible
    ? 'md:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]'
    : 'md:grid-cols-1'

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  useEffect(() => {
    if (!currentChatId && filteredChats.length > 0 && !isDraftConversation) {
      chat.handleOpenChat(filteredChats[0].id, chats)
    }
  }, [currentChatId, filteredChats, chats, isDraftConversation])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: isSendingMessage ? 'auto' : 'smooth' })
  }, [activeMessages.length, currentChatId, isSendingMessage])

  useEffect(() => {
    if (!chatError) {
      setIsErrorVisible(false)
      return
    }

    setIsErrorVisible(true)
  }, [chatError])

  useEffect(() => {
    const onKeyDown = (event) => {
      const cmdKey = event.metaKey || event.ctrlKey

      if (cmdKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }

      if (cmdKey && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setIsDraftConversation(true)
        chat.handleStartNewConversation()
        setIsSidebarOpen(false)
        messageInputRef.current?.focus()
      }

      if (event.key === 'Escape') {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onMouseMove = (event) => {
      if (!isResizingRef.current) {
        return
      }

      const nextWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, event.clientX))
      setSidebarWidth(nextWidth)
    }

    const onMouseUp = (event) => {
      if (!isResizingRef.current) {
        return
      }

      if (event.clientX < COLLAPSE_THRESHOLD) {
        setIsDesktopSidebarVisible(false)
      } else {
        setIsDesktopSidebarVisible(true)
      }

      isResizingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const handleSubmitMessage = async (event) => {
    event.preventDefault()

    if (isSendingMessage) {
      return
    }

    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage) {
      return
    }

    setIsSendingMessage(true)
    setPendingUserMessage(trimmedMessage)
    setChatInput('')

    try {
      const resolvedChatId = await chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
      if (resolvedChatId) {
        setIsDraftConversation(false)
      }

      requestAnimationFrame(() => {
        messageInputRef.current?.focus()
        messageEndRef.current?.scrollIntoView({ behavior: 'auto' })
      })
    } finally {
      setIsSendingMessage(false)
      setPendingUserMessage('')
    }
  }

  const openChat = (chatId) => {
    setIsDraftConversation(false)
    chat.handleOpenChat(chatId, chats)
    setIsSidebarOpen(false)
  }

  const handleNewConversation = () => {
    setIsDraftConversation(true)
    chat.handleStartNewConversation()
    setIsSidebarOpen(false)
    requestAnimationFrame(() => {
      messageInputRef.current?.focus()
    })
  }

  const handleRetry = () => {
    setIsErrorVisible(false)
    chat.handleGetChats()
  }

  const startSidebarResize = (event) => {
    event.preventDefault()
    isResizingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarVisible((value) => !value)
  }

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    const shouldLogout = window.confirm('Are you sure you want to logout?')
    if (!shouldLogout) {
      return
    }

    setIsLoggingOut(true)
    await auth.handleLogout()
    setIsLoggingOut(false)
  }

  return (
    <main className='h-screen w-full bg-[#111111] text-white'>
      <section
        className={`grid h-screen w-full grid-cols-1 ${desktopGridClasses}`}
        style={{ '--sidebar-width': `${sidebarWidth}px` }}
      >
        <button
          type='button'
          onClick={() => setIsSidebarOpen((value) => !value)}
          className='fixed left-3 top-3 z-40 rounded-md border border-white/20 bg-[#1a1a1a] px-3 py-1.5 text-sm text-white transition hover:bg-[#222222] md:hidden'
          aria-label='Toggle chat sidebar'
        >
          Menu
        </button>

        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-[84vw] max-w-[340px] flex-col border-r border-white/10 bg-[#171717] p-4 transition-transform duration-300 md:static md:h-screen md:w-full md:max-w-none md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isDesktopSidebarVisible ? 'md:flex' : 'md:hidden'}`}
          aria-label='Chat sidebar'
        >
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='font-display text-xs uppercase tracking-[0.2em] text-white/55'>
                MayAI
              </p>
              <h1 className='mt-2 font-display text-2xl font-semibold tracking-tight text-white'>
                Chats
              </h1>
              <p className='mt-1 text-sm text-white/60'>
                {user?.username ? `Welcome back, ${user.username}` : 'Your AI workspace'}
              </p>
            </div>

            <button
              type='button'
              className='rounded-md border border-white/20 px-2 py-1 text-xs text-white md:hidden'
              onClick={() => setIsSidebarOpen(false)}
              aria-label='Close sidebar'
            >
              Close
            </button>
          </div>

          <div className='mt-5'>
            <button
              type='button'
              onClick={handleNewConversation}
              className='mb-3 w-full rounded-lg border border-white/20 bg-[#1e1e1e] px-3 py-2 text-left text-sm font-medium text-white transition hover:border-white/35 hover:bg-[#262626]'
              aria-label='Start new chat'
            >
              + New chat
            </button>

            <label htmlFor='chat-search' className='text-xs uppercase tracking-[0.14em] text-white/50'>
              Search Chats
            </label>
            <input
              id='chat-search'
              ref={searchInputRef}
              type='text'
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder='Search by title'
              className='mt-2 w-full border-b border-white/25 bg-transparent px-0 py-2 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/60'
              aria-label='Search chat titles'
            />

            <div className='mt-3 flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => setSortMode('recent')}
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
                onClick={() => setSortMode('alpha')}
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

          <div className='mt-4 flex-1 space-y-2 overflow-y-auto pr-1'>
            {isLoading && filteredChats.length === 0 ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className='h-12 animate-pulse rounded-lg bg-white/10' />
              ))
            ) : null}

            {!isLoading && filteredChats.length === 0 ? (
              <div className='px-1 py-3 text-sm text-white/60'>
                {searchQuery
                  ? 'No chats match your search.'
                  : 'No chats yet. Send your first message to start a MayAI conversation.'}
              </div>
            ) : null}

            {filteredChats.map((chatItem) => {
              const isActive = chatItem.id === currentChatId

              return (
                <button
                  onClick={() => openChat(chatItem.id)}
                  key={chatItem.id}
                  type='button'
                  className={`w-full cursor-pointer border-l-2 px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-white/30 ${
                    isActive
                      ? 'border-l-white text-white'
                      : 'border-l-transparent text-white/75 hover:border-l-white/50 hover:text-white'
                  }`}
                  aria-label={`Open chat ${sanitizeChatTitle(chatItem.title)}`}
                >
                  <p className='line-clamp-1 text-sm font-medium'>
                    {sanitizeChatTitle(chatItem.title)}
                  </p>
                  <p className='mt-1 text-xs text-white/45'>
                    {formatRelativeDate(chatItem.lastUpdated)}
                  </p>
                </button>
              )
            })}
          </div>

          <div className='mt-auto border-t border-white/10 pt-3'>
            <button
              type='button'
              onClick={handleLogout}
              disabled={isLoggingOut}
              className='w-full py-2 text-left text-sm text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-55'
              aria-label='Logout from account'
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>

          <div
            role='separator'
            aria-orientation='vertical'
            aria-label='Resize sidebar'
            onMouseDown={startSidebarResize}
            onDoubleClick={toggleDesktopSidebar}
            className='absolute right-0 top-0 hidden h-full w-1 cursor-col-resize bg-transparent transition hover:bg-white/20 md:block'
          />
        </aside>

        {isSidebarOpen ? (
          <button
            className='fixed inset-0 z-20 bg-black/45 md:hidden'
            type='button'
            aria-label='Close sidebar overlay'
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        <section className='relative z-10 flex h-screen min-w-0 flex-1 flex-col bg-[#121212]'>
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
                onClick={toggleDesktopSidebar}
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

          {chatError && isErrorVisible ? (
            <div className='mx-4 mt-3 flex flex-wrap items-center justify-between gap-3 px-1 py-1'>
              <p className='text-sm text-rose-200/90'>
                {chatError}
              </p>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={handleRetry}
                  className='px-0 py-1 text-xs font-medium text-rose-200 underline underline-offset-4 transition hover:text-rose-100'
                >
                  Retry
                </button>
                <button
                  type='button'
                  onClick={() => setIsErrorVisible(false)}
                  className='px-0 py-1 text-xs font-medium text-rose-200 underline underline-offset-4 transition hover:text-rose-100'
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          <div className='messages mt-2 flex-1 space-y-3 overflow-y-auto px-4 pb-6 pr-3'>
            {!isLoading && activeMessages.length === 0 ? (
              <div className='mx-auto mt-8 max-w-md p-6 text-center'>
                <p className='font-display text-lg font-semibold text-white'>
                  Start Your First Prompt
                </p>
                <p className='mt-2 text-sm text-white/65'>
                  Draft ideas, summarize research, generate code, or plan your next task in one place.
                </p>
              </div>
            ) : null}

            {isLoading && activeMessages.length === 0 ? (
              <div className='space-y-2'>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className='h-12 animate-pulse rounded-xl bg-white/8' />
                ))}
              </div>
            ) : null}

            {displayedMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[82%] w-fit rounded-2xl px-4 py-3 text-sm md:text-base ${message.role === 'user'
                    ? 'ml-auto rounded-br-none border border-white/15 bg-[#2a2a2a] text-white'
                    : 'mr-auto border border-white/10 bg-[#1a1a1a] text-white/90'
                  }`}
              >
                {message.role === 'user' ? (
                  <p>{removeDoubleAsterisks(message.content)}</p>
                ) : message.isThinking ? (
                  <p className='inline-flex items-center gap-1 text-white/85'>
                    <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/65' />
                    <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/65 [animation-delay:120ms]' />
                    <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/65 [animation-delay:240ms]' />
                    <span className='ml-1 text-sm text-white/80'>Thinking...</span>
                  </p>
                ) : (
                  <ReactMarkdown
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
                  </ReactMarkdown>
                )}
                <p className='mt-2 text-[11px] uppercase tracking-[0.12em] text-white/45'>
                  {message.role === 'user' ? 'You' : 'MayAI'}
                </p>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <footer className='sticky bottom-0 border-t border-white/10 bg-[#121212] px-4 py-3'>
            <form onSubmit={handleSubmitMessage} className='flex flex-col gap-3 sm:flex-row sm:items-end'>
              <textarea
                ref={messageInputRef}
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    if (!isSendingMessage && chatInput.trim()) {
                      event.currentTarget.form?.requestSubmit()
                    }
                  }
                }}
                placeholder='Message MayAI...'
                rows={2}
                className='min-h-[52px] max-h-44 w-full resize-y rounded-lg border border-white/20 bg-[#1b1b1b] px-4 py-3 text-base text-white outline-none transition placeholder:text-white/40 focus:border-white/50'
                aria-label='Type your message'
              />
              <button
                type='submit'
                disabled={!chatInput.trim() || isSendingMessage}
                className='w-full rounded-lg border border-white/25 bg-[#262626] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
                aria-label='Send message'
              >
                {isSendingMessage ? 'Sending...' : 'Send'}
              </button>
            </form>
            <p className='mt-2 text-xs text-white/40'>
              Tips: Use Cmd/Ctrl + K to focus search, Cmd/Ctrl + N for New chat, Enter to send, Shift+Enter for a new line.
            </p>
          </footer>
        </section>
      </section>
    </main>
  )
}

export default Dashboard