import { compareAsc, differenceInCalendarDays, isMatch, parse } from 'date-fns'
import { getRoutingParams } from '@opentripplanner/core-utils/lib/query'

const ENTITY_DATE_TIME_FORMATS = [
  'MMM d, yyyy h:mm:ss a',
  'MMM d, yyyy, h:mm:ss a'
]

/**
 * Only used in parseDate below and declared here to avoid repeated instantiation
 * when calling the date-fns parse function. (That argument is required and would be used
 * if the date format was missing fields, but that is not the case here.)
 */
const referenceDateForDateFns = Date.now()

/**
 * Date parsing helper, specific to calltaker/field trip entities.
 */
export function parseDate(date) {
  for (const format of ENTITY_DATE_TIME_FORMATS) {
    if (isMatch(date, format))
      return parse(date, format, referenceDateForDateFns)
  }
  return null
}

function placeToLatLonStr(place) {
  return `${place.lat.toFixed(6)},${place.lon.toFixed(6)}`
}

/**
 * @return {boolean} - whether a calltaker session is invalid
 */
export function sessionIsInvalid(session) {
  if (!session || !session.sessionId) {
    console.error('No valid OTP datastore session found.')
    return true
  }
  return false
}

/**
 * Utility to map an OTP MOD UI search object to a Call Taker datastore query
 * object.
 */
export function searchToQuery(search, call, otpConfig) {
  // FIXME: how to handle realtime updates?
  const queryParams = getRoutingParams(otpConfig, search.query, true)
  const { from, to } = search.query
  return {
    call,
    from,
    queryParams: JSON.stringify(queryParams),
    to
  }
}

/**
 * @param queryParams The query parameters string to convert (stringified JSON).
 * @returns An object with the parsed query params,
 *          where the arriveBy boolean is converted to a string
 *          per https://github.com/opentripplanner/otp-ui/blob/master/packages/core-utils/src/query.js#L285
 */
export function parseQueryParams(queryParams) {
  return JSON.parse(
    queryParams,
    // convert boolean for the 'arriveBy' field to strings
    (key, value) => (key === 'arriveBy' ? value.toString() : value) // return everything else unchanged
  )
}

/**
 * Compares end times of two call/field trip entities.
 * @param {*} a call or field trip entity to compare.
 * @param {*} b call or field trip entity to compare.
 * @returns 1 if the first end time is after the second, -1 if the first end time is before the second or 0 if end times are equal.
 */
export function compareEndTimes(a, b) {
  return compareAsc(parseDate(b.endTime), parseDate(a.endTime))
}

export const defaultDropdownConfig = [
  {
    combination: [{ mode: 'TRANSIT' }, { mode: 'WALK' }],
    label: 'Transit'
  }
]
