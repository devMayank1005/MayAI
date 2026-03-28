/**
 * messageFormatting.js
 * Utilities for cleaning and formatting message content
 */

/**
 * Remove double asterisks from content (markdown artifact cleanup)
 * @param {string} content - The content to clean
 * @returns {string} Content with ** removed
 */
export const removeDoubleAsterisks = (content) => {
  if (typeof content !== 'string') {
    return ''
  }

  return content.replace(/\*\*/g, '')
}

/**
 * Sanitize and format a chat title
 * @param {string} title - The raw title from backend
 * @returns {string} Cleaned and sanitized title
 */
export const sanitizeChatTitle = (title) => {
  const cleaned = removeDoubleAsterisks(title).trim()
  const withoutWrappingQuotes = cleaned.replace(/^"+|"+$/g, '').trim()

  return withoutWrappingQuotes || 'Untitled chat'
}
