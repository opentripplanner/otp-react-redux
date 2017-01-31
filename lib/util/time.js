import moment from 'moment'

/**
 * Formats an elapsed time duration for display in narrative
 * TODO: internationalization
 * @param {number} seconds duration in seconds
 * @returns {string} formatted text representation
 */
export function formatDuration (seconds) {
  const dur = moment.duration(seconds, 'seconds')
  return dur.hours() > 0 ? dur.hours() + ' hr, ' : '' + dur.minutes() + ' min'
}
