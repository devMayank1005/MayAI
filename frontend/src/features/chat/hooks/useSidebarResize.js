/**
 * useSidebarResize.js
 * Manages sidebar resize logic: drag events, width thresholds, collapse behavior
 */
import { useRef, useEffect } from 'react'

const MIN_SIDEBAR_WIDTH = 240
const MAX_SIDEBAR_WIDTH = 420
const COLLAPSE_THRESHOLD = 170

export const useSidebarResize = (onWidthChange, onVisibilityChange) => {
  const isResizingRef = useRef(false)

  const startResize = (event) => {
    event.preventDefault()
    isResizingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const toggleSidebar = () => {
    onVisibilityChange((value) => !value)
  }

  useEffect(() => {
    const onMouseMove = (event) => {
      if (!isResizingRef.current) {
        return
      }

      const nextWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, event.clientX))
      onWidthChange(nextWidth)
    }

    const onMouseUp = (event) => {
      if (!isResizingRef.current) {
        return
      }

      if (event.clientX < COLLAPSE_THRESHOLD) {
        onVisibilityChange(false)
      } else {
        onVisibilityChange(true)
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
  }, [onWidthChange, onVisibilityChange])

  return {
    startResize,
    toggleSidebar,
  }
}
