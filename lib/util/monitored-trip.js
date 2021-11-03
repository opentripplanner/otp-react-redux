export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
export const WEEKEND_DAYS = ['saturday', 'sunday']
export const ALL_DAYS = [...WEEKDAYS, ...WEEKEND_DAYS]

/**
 * Extracts the day of week fields of an object (e.g. a monitoredTrip) to an array.
 * Example: { monday: truthy, tuesday: falsy, wednesday: truthy ... } => ['monday', 'wednesday' ...]
 */
export function dayFieldsToArray (monitoredTrip) {
  return ALL_DAYS.filter(day => monitoredTrip[day])
}

/**
 * Converts an array of day of week values into an object with those fields.
 * Example: ['monday', 'wednesday' ...] => { monday: true, tuesday: false, wednesday: true ... }
 */
export function arrayToDayFields (arrayOfDayTypes) {
  const result = {}
  ALL_DAYS.forEach(day => {
    result[day] = arrayOfDayTypes.includes(day)
  })
  return result
}

/**
 * Returns a FormattedMessage string for the pluralised day of week via the react-intl imperative API
 * such that i18n IDs are hardcoded and can be kept track of by format.js tools
 */
export function getFormattedDayOfWeekPlural (day, intl) {
  switch (day) {
    case 'monday':
      return intl.formatMessage({id: 'common.daysOfWeekPlural.monday'})
    case 'tuesday':
      return intl.formatMessage({id: 'common.daysOfWeekPlural.tuesday'})
    case 'wednesday':
      return intl.formatMessage({id: 'common.daysOfWeekPlural.wednesday'})
    case 'thursday':
      return intl.formatMessage({id: 'common.daysOfWeekPlural.thursday'})
    case 'friday':
      return intl.formatMessage({id: 'common.daysOfWeekPlural.friday'})
    case 'saturday':
      return intl.formatMessage({id: 'common.daysOfWeekPlural.saturday'})
    case 'sunday':
      return intl.formatMessage({id: 'common.daysOfWeekPlural.sunday'})
    default:
      return null
  }
}
