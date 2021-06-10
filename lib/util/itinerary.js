import { latLngBounds } from 'leaflet'
import moment from 'moment'
import coreUtils from '@opentripplanner/core-utils'
import { WEEKDAYS, WEEKEND_DAYS } from './monitored-trip'

export function getLeafletItineraryBounds (itinerary) {
  return latLngBounds(coreUtils.itinerary.getItineraryBounds(itinerary))
}

/**
 * Return a leaflet LatLngBounds object that encloses the given leg's geometry.
 */
export function getLeafletLegBounds (leg) {
  return latLngBounds(coreUtils.itinerary.getLegBounds(leg))
}

export function isBatchRoutingEnabled (otpConfig) {
  return Boolean(otpConfig.routingTypes.find(t => t.key === 'BATCH'))
}

/**
 * Determines whether the specified Itinerary can be monitored.
 * @returns true if at least one Leg of the specified Itinerary is a transit leg,
 *   and none of the legs is a rental or ride hail leg (e.g. CAR_RENT, CAR_HAIL, BICYCLE_RENT, etc.).
 *   (We use the corresponding fields returned by OTP to get transit legs and rental/ride hail legs.)
 */
export function itineraryCanBeMonitored (itinerary) {
  let hasTransit = false
  let hasRentalOrRideHail = false

  if (itinerary && itinerary.legs) {
    for (const leg of itinerary.legs) {
      if (leg.transitLeg) {
        hasTransit = true
      }
      if (leg.rentedBike ||
          leg.rentedCar ||
          leg.rentedVehicle ||
          leg.hailedCar) {
        hasRentalOrRideHail = true
      }
    }
  }

  return hasTransit && !hasRentalOrRideHail
}

export function getMinutesUntilItineraryStart (itinerary) {
  return moment(itinerary.startTime).diff(moment(), 'minutes')
}

/**
 * Gets the first transit leg of the given itinerary, or null if none found.
 */
function getFirstTransitLeg (itinerary) {
  return itinerary?.legs?.find(leg => leg.transitLeg)
}

/**
 * Returns the set of monitored days that will be initially shown to the user
 * for the given transit itinerary (itinerary with transit leg).
 * @param itinerary The itinerary from which the default monitored days are extracted.
 * @returns ['monday' thru 'friday'] if itinerary happens on a weekday(*),
 *          ['saturday', 'sunday'] if itinerary happens on a saturday/sunday(*).
 * (*) The first transit leg will be used to make the determination.
 */
export function getTransitItineraryDefaultMonitoredDays (itinerary) {
  const firstTransitLeg = getFirstTransitLeg(itinerary)
  // Assume a transit leg exists.
  if (!firstTransitLeg) return null

  const dayOfWeek = moment(firstTransitLeg.serviceDate, 'YYYYMMDD').day()
  return (dayOfWeek === 0 || dayOfWeek === 6)
    ? WEEKEND_DAYS
    : WEEKDAYS
}
