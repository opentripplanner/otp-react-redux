import moment from 'moment'
import 'moment-timezone'

export function getTimeFormat (config) {
  return (config.dateTime && config.dateTime.timeFormat) ? config.dateTime.timeFormat : 'HH:mm'
}

export function getDateFormat (config) {
  return (config.dateTime && config.dateTime.dateFormat) ? config.dateTime.dateFormat : 'YYYY-MM-DD'
}

export function getLongDateFormat (config) {
  return (config.dateTime && config.dateTime.longDateFormat) ? config.dateTime.longDateFormat : 'D MMMM YYYY'
}

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
 * @param {number} ms epoch time value in milliseconds
 * @returns {string} formatted text representation
 */
export function formatTime (ms, options) {
  return moment(ms + (options && options.offset ? options.offset : 0))
    .format(options && options.format ? options.format : 'HH:mm')
}

/**
 * Formats a stop time value for display in narrative
 * @param  {[type]} seconds           time since midnight in seconds
 * @param  {[type]} [timezone=null]   optional time zone to include in result
 * @param  {string} [timeFormat='h:mm a'] time format
 * @return {string}                   formatted text representation
 */
export function formatStopTime (seconds, timezone = null, timeFormat = 'h:mm a') {
  const m = timezone ? moment().tz(timezone) : moment()
  const format = timezone ? `${timeFormat} z` : timeFormat
  return m.startOf('day').seconds(seconds).format(format)
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
