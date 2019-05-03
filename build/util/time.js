'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTimeFormat = getTimeFormat;
exports.getDateFormat = getDateFormat;
exports.getLongDateFormat = getLongDateFormat;
exports.formatDuration = formatDuration;
exports.formatTime = formatTime;
exports.formatStopTime = formatStopTime;
exports.getCurrentTime = getCurrentTime;
exports.getCurrentDate = getCurrentDate;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getTimeFormat(config) {
  return config.dateTime && config.dateTime.timeFormat ? config.dateTime.timeFormat : 'HH:mm';
}

function getDateFormat(config) {
  return config.dateTime && config.dateTime.dateFormat ? config.dateTime.dateFormat : 'YYYY-MM-DD';
}

function getLongDateFormat(config) {
  return config.dateTime && config.dateTime.longDateFormat ? config.dateTime.longDateFormat : 'D MMMM YYYY';
}

/**
 * Formats an elapsed time duration for display in narrative
 * TODO: internationalization
 * @param {number} seconds duration in seconds
 * @returns {string} formatted text representation
 */
function formatDuration(seconds) {
  var dur = _moment2.default.duration(seconds, 'seconds');
  var text = '';
  if (dur.hours() > 0) text += dur.hours() + ' hr, ';
  text += dur.minutes() + ' min';
  return text;
}

/**
 * Formats a time value for display in narrative
 * TODO: internationalization/timezone
 * @param {number} ms epoch time value in milliseconds
 * @returns {string} formatted text representation
 */
function formatTime(ms, options) {
  return (0, _moment2.default)(ms + (options && options.offset ? options.offset : 0)).format(options && options.format ? options.format : 'HH:mm');
}

/**
 * Formats a stop time value for display in narrative
 * TODO: internationalization/timezone
 * @param {number} seconds time since midnight in seconds
 * @returns {string} formatted text representation
 */
function formatStopTime(seconds) {
  return (0, _moment2.default)().startOf('day').seconds(seconds).format('h:mm a');
}

/**
 * Formats current time for use in OTP query
 * @returns {string} formatted text representation
 */
function getCurrentTime() {
  return (0, _moment2.default)().format('HH:mm');
}

/**
 * Formats current date for use in OTP query
 * @returns {string} formatted text representation
 */
function getCurrentDate() {
  return (0, _moment2.default)().format('YYYY-MM-DD');
}

//# sourceMappingURL=time.js