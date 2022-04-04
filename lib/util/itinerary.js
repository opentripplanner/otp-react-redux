import { latLngBounds } from 'leaflet'
import coreUtils from '@opentripplanner/core-utils'
import moment from 'moment'

import { WEEKDAYS, WEEKEND_DAYS } from './monitored-trip'

export function getLeafletItineraryBounds(itinerary) {
  return latLngBounds(coreUtils.itinerary.getItineraryBounds(itinerary))
}

/**
 * Return a leaflet LatLngBounds object that encloses the given leg's geometry.
 */
export function getLeafletLegBounds(leg) {
  return latLngBounds(coreUtils.itinerary.getLegBounds(leg))
}

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
  return moment(itinerary.startTime).diff(moment(), 'minutes')
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
export function getItineraryDefaultMonitoredDays(itinerary) {
  const firstTransitLeg = getFirstTransitLeg(itinerary)
  const startMoment = firstTransitLeg
    ? moment(firstTransitLeg.serviceDate, 'YYYYMMDD')
    : moment(itinerary.startTime)
  const dayOfWeek = startMoment.day()

  return dayOfWeek === 0 || dayOfWeek === 6 ? WEEKEND_DAYS : WEEKDAYS
}

export function itinerariesAreEqual(itinerary, other) {
  return itinerary.legs.every(
    (leg, index) =>
      other?.legs?.[index].from?.lat === leg.from?.lat &&
      other?.legs?.[index].to?.lat === leg.to?.lat &&
      other?.legs?.[index].from?.lon === leg.from?.lon &&
      other?.legs?.[index].to?.lon === leg.to?.lon
  )
}
