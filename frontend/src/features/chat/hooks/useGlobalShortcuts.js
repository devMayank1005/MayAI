/**
 * useGlobalShortcuts.js
 * Manages global keyboard shortcuts: Cmd/Ctrl+K (search focus), Cmd/Ctrl+N (new chat), Escape (close mobile sidebar)
 */
import { useEffect } from 'react'

export const useGlobalShortcuts = ({
  searchInputRef,
  messageInputRef,
  onNewConversation,
  onCloseMobileSidebar,
}) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      const cmdKey = event.metaKey || event.ctrlKey

      // Cmd/Ctrl + K: focus search
      if (cmdKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }

      // Cmd/Ctrl + N: start new conversation
      if (cmdKey && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        onNewConversation()
        messageInputRef.current?.focus()
      }

      // Escape: close mobile sidebar
      if (event.key === 'Escape') {
        onCloseMobileSidebar()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [searchInputRef, messageInputRef, onNewConversation, onCloseMobileSidebar])
}
