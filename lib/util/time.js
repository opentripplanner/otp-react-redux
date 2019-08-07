import moment from 'moment'
import 'moment-timezone'

const TIME_FORMAT_24_HR = 'HH:mm'

/**
 * @param  {[type]} config the OTP config object found in store
 * @return {string}        the config-defined time formatter or HH:mm (24-hr time)
 */
export function getTimeFormat (config) {
  return (config.dateTime && config.dateTime.timeFormat)
    ? config.dateTime.timeFormat
    : TIME_FORMAT_24_HR
}

export function getDateFormat (config) {
  return (config.dateTime && config.dateTime.dateFormat)
    ? config.dateTime.dateFormat
    : 'YYYY-MM-DD'
}

export function getLongDateFormat (config) {
  return (config.dateTime && config.dateTime.longDateFormat)
    ? config.dateTime.longDateFormat
    : 'D MMMM YYYY'
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
    .format(options && options.format ? options.format : TIME_FORMAT_24_HR)
}

/**
 * Formats a stop time value for display in narrative
 * @param  {number} seconds  time since midnight in seconds
 * @param  {string} timeFormat  A valid moment.js time format
 * @param  {string} [timezone=null] optional time zone to initialize moment with
 * @return {string}                   formatted text representation
 */
export function formatStopTime (seconds, timeFormat, timezone = null) {
  const m = timezone ? moment().tz(timezone) : moment()
  return m.startOf('day').seconds(seconds).format(timeFormat)
}

/**
 * Formats current time for use in OTP query based on the given config.
 *
 * @param config the config in the otp-rr store.
 * @returns {string} formatted text representation
 */
export function getCurrentTime (config) {
  return moment().tz(config.homeTimezone).format(getTimeFormat(config))
}

/**
 * Formats current date for use in OTP query based on the given config.
 *
 * @param config the config in the otp-rr store.
 * @returns {string} formatted text representation
 */
export function getCurrentDate (config) {
  return moment().tz(config.homeTimezone).format(getDateFormat(config))
}

/**
 * Get the timezone name that is set for the user that is currently looking at
 * this website. Use a bit of hackery to force a specific timezone if in a
 * test environment.
 */
export function getUserTimezone () {
  return process.env.NODE_ENV === 'test' ? process.env.TZ : moment.tz.guess()
}
