import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/UseChat'
import { useAuth } from '../../auth/hook/useAuth'
import { useSidebarResize } from '../hooks/useSidebarResize'
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts'
import { sanitizeChatTitle } from '../utils/messageFormatting'
import { sortChats } from '../utils/chatFiltering'
import { ErrorBanner } from '../components/ErrorBanner'
import { ChatHeader } from '../components/ChatHeader'
import { MessageDisplay } from '../components/MessageDisplay'
import { MessageInput } from '../components/MessageInput'
import { SidebarHeader } from '../components/SidebarHeader'
import { ChatListControls } from '../components/ChatListControls'
import { ChatListItems } from '../components/ChatListItems'
import { NewChatButton } from '../components/NewChatButton'
import { SidebarResizeHandle } from '../components/SidebarResizeHandle'
import { LogoutButton } from '../components/LogoutButton'

const Dashboard = () => {
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

  // Initialize sidebar resize and keyboard shortcuts
  const { startResize, toggleSidebar } = useSidebarResize(setSidebarWidth, setIsDesktopSidebarVisible)

  useGlobalShortcuts({
    searchInputRef,
    messageInputRef,
    onNewConversation: () => {
      setIsDraftConversation(true)
      chat.handleStartNewConversation()
      setIsSidebarOpen(false)
    },
    onCloseMobileSidebar: () => setIsSidebarOpen(false),
  })

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
          <SidebarHeader
            user={user}
            isMobile={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <div className='mt-5'>
            <NewChatButton onClick={handleNewConversation} />

            <ChatListControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortMode={sortMode}
              onSortChange={setSortMode}
              searchInputRef={searchInputRef}
            />
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

            <ChatListItems
              chats={chats}
              currentChatId={currentChatId}
              filteredList={filteredChats.map((c) => c.id)}
              onSelectChat={openChat}
              isDraftConversation={isDraftConversation}
            />
          </div>

          <div className='mt-auto border-t border-white/10 pt-3'>
            <LogoutButton
              user={user}
              isLoggingOut={isLoggingOut}
              onLogout={handleLogout}
            />
          </div>

          <SidebarResizeHandle
            onMouseDown={startResize}
            isVisible={true}
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
          <ChatHeader
            activeChat={activeChat}
            isDesktopSidebarVisible={isDesktopSidebarVisible}
            onToggleSidebar={toggleSidebar}
          />

          <ErrorBanner
            chatError={chatError}
            isVisible={isErrorVisible}
            onRetry={handleRetry}
            onDismiss={() => setIsErrorVisible(false)}
          />

          <MessageDisplay
            messages={displayedMessages}
            currentChatId={currentChatId}
            isSendingMessage={isSendingMessage}
            isDraftConversation={isDraftConversation}
            activeChat={activeChat}
            user={user}
            messageContainerRef={messageEndRef}
          />

          <MessageInput
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSubmit={handleSubmitMessage}
            isSending={isSendingMessage}
            isDraftConversation={isDraftConversation}
            messageInputRef={messageInputRef}
          />
        </section>
      </section>
    </main>
  )
}

export default Dashboard