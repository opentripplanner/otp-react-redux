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
