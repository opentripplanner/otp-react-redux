import moment from 'moment'

/**
 * Formats an elapsed time duration for display in narrative
 * TODO: internationalization
 * @param {number} seconds duration in seconds
 * @returns {string} formatted text representation
 */
export function formatDuration (seconds) {
  const dur = moment.duration(seconds, 'seconds')
  let text = ''
  if (dur.hours() > 0) text += dur.hours() + ' hr, '
  text += dur.minutes() + ' min'
  return text
}

/**
 * Formats a time value for display in narrative
 * TODO: internationalization/timezone
 * @param {number} seconds time value in seconds
 * @returns {string} formatted text representation
 */
export function formatTime (seconds) {
  return moment(seconds).format('h:mm a')
}

/**
 * Formats current time for use in OTP query
 * @returns {string} formatted text representation
 */
export function getCurrentTime () {
  return moment().format('HH:mm')
}

/**
 * Formats current date for use in OTP query
 * @returns {string} formatted text representation
 */
export function getCurrentDate () {
  return moment().format('YYYY-MM-DD')
}
