/**
 * SidebarResizeHandle.jsx
 * Draggable resize separator for desktop sidebar
 */
import React from 'react'

export const SidebarResizeHandle = ({ onMouseDown, isVisible = false }) => {
  if (!isVisible) {
    return null
  }

  return (
    <div
      onMouseDown={onMouseDown}
      className='group absolute bottom-0 right-0 top-0 w-1 cursor-col-resize bg-transparent transition hover:bg-white/20'
      aria-label='Drag to resize sidebar'
      role='separator'
      aria-orientation='vertical'
    />
  )
}
