export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/**
 * Extracts the day of week fields of an object to an array.
 * Example: { monday: truthy, tuesday: falsy, wednesday: truthy ... } => ['monday', 'wednesday' ...]
 */
export function dayFieldsToArray (obj) {
  return ALL_DAYS.filter(day => obj[day])
}

/**
 * Converts an array of day of week values into an object with those fields.
 * Example: ['monday', 'wednesday' ...] => { monday: true, tuesday: false, wednesday: true ... }
 */
export function arrayToDayFields (array) {
  const result = {}
  ALL_DAYS.forEach(day => {
    result[day] = array.includes(day)
  })
  return result
}
