import { differenceInMinutes } from 'date-fns'
import { toDate, utcToZonedTime } from 'date-fns-tz'
import coreUtils from '@opentripplanner/core-utils'

import { WEEKDAYS, WEEKEND_DAYS } from './monitored-trip'

export function isBatchRoutingEnabled(otpConfig) {
  return Boolean(otpConfig.routingTypes.find((t) => t.key === 'BATCH'))
}

/**
 * Determines whether the specified Itinerary can be monitored.
 * @returns true if at least one Leg of the specified Itinerary is a transit leg,
 *   and none of the legs is a rental or ride hail leg (e.g. CAR_RENT, CAR_HAIL, BICYCLE_RENT, etc.).
 *   (We use the corresponding fields returned by OTP to get transit legs and rental/ride hail legs.)
 */
export function itineraryCanBeMonitored(itinerary) {
  let hasTransit = false
  let hasRentalOrRideHail = false

  if (itinerary && itinerary.legs) {
    for (const leg of itinerary.legs) {
      if (leg.transitLeg) {
        hasTransit = true
      }
      if (
        leg.rentedBike ||
        leg.rentedCar ||
        leg.rentedVehicle ||
        leg.hailedCar
      ) {
        hasRentalOrRideHail = true
      }
    }
  }

  return hasTransit && !hasRentalOrRideHail
}

export function getMinutesUntilItineraryStart(itinerary) {
  return differenceInMinutes(new Date(itinerary.startTime), new Date())
}

/**
 * Gets the first transit leg of the given itinerary, or null if none found.
 */
function getFirstTransitLeg(itinerary) {
  return itinerary?.legs?.find((leg) => leg.transitLeg)
}

/**
 * Get the first stop ID from the itinerary in the underscore format required by
 * the startTransitStopId query param (e.g., TRIMET_12345 instead of TRIMET:12345).
 */
export function getFirstStopId(itinerary) {
  return getFirstTransitLeg(itinerary)?.from.stopId.replace(':', '_')
}

/**
 * Returns the set of monitored days that will be initially shown to the user
 * for the given itinerary.
 * @param itinerary The itinerary from which the default monitored days are extracted.
 * @returns ['monday' thru 'friday'] if itinerary happens on a weekday(*),
 *          ['saturday', 'sunday'] if itinerary happens on a saturday/sunday(*).
 * (*) For transit itineraries, the first transit leg is used to make
 * the determination. Otherwise, the itinerary startTime is used.
 */
export function getItineraryDefaultMonitoredDays(
  itinerary,
  timeZone = coreUtils.time.getUserTimezone()
) {
  const firstTransitLeg = getFirstTransitLeg(itinerary)
  // firstTransitLeg should be non-null because only transit trips can be monitored at this time.
  // - using serviceDate covers legs that start past midnight.
  // - The format of serviceDate can either be 'yyyyMMdd' (OTP v1) or 'yyyy-MM-dd' (OTP v2)
  //   and both formats are correctly handled by toDate from date-fns-tz.
  const startDate = firstTransitLeg
    ? toDate(firstTransitLeg.serviceDate, { timeZone })
    : utcToZonedTime(new Date(itinerary.startTime), timeZone)

  const dayOfWeek = startDate.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 ? WEEKEND_DAYS : WEEKDAYS
}

/**
 * Method iterates through all configured modes and returns only those
 * enabled by default
 */
export function getDefaultModes(configModeOptions) {
  return (
    configModeOptions?.filter((m) => !m.defaultUnselected).map((m) => m.mode) ||
    []
  )
}

function legLocationsAreEqual(legLocation, other) {
  return (
    !!legLocation &&
    !!other &&
    legLocation.lat === other.lat &&
    legLocation.lon === other.lon
  )
}

export function itinerariesAreEqual(itinerary, other) {
  return (
    itinerary.legs.length === other.legs.length &&
    itinerary.legs.every((leg, index) => {
      const otherLeg = other?.legs?.[index]
      return (
        otherLeg.mode === leg.mode &&
        legLocationsAreEqual(otherLeg?.to, leg?.to) &&
        legLocationsAreEqual(otherLeg?.from, leg?.from)
      )
    })
  )
}

export function getFirstLegStartTime(legs) {
  return legs[0].startTime
}

export function getLastLegEndTime(legs) {
  return legs[legs.length - 1].endTime
}
