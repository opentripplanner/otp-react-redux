import { latLngBounds } from 'leaflet'
import coreUtils from '@opentripplanner/core-utils'

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
      if (leg.rentedVehicle || leg.hailedCar) {
        hasRentalOrRideHail = true
      }
    }
  }

  return hasTransit && !hasRentalOrRideHail
}
