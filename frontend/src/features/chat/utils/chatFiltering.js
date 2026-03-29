/**
 * chatFiltering.js
 * Utilities for sorting and filtering chat lists
 */

/**
 * Sort chat list by mode
 * @param {Array} chatList - Array of chat objects
 * @param {string} sortMode - 'recent' or 'alpha'
 * @returns {Array} Sorted chat list
 */
export const sortChats = (chatList, sortMode) => {
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
