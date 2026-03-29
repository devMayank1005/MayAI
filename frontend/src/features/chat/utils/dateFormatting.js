/**
 * dateFormatting.js
 * Utilities for formatting dates in a relative/human-readable format
 */

/**
 * Format a date value into a relative, human-readable string
 * @param {string|number|Date} dateValue - The date to format
 * @returns {string} Formatted relative date string
 */
export const formatRelativeDate = (dateValue) => {
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
