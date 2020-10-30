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

// TODO: move to OTP-UI + add tests?
/**
 * @returns true if at least one of the legs of the specified itinerary is a transit leg.
 */
export function itineraryHasTransit (itinerary) {
  if (itinerary && itinerary.legs) {
    for (const leg of itinerary.legs) {
      if (coreUtils.itinerary.isTransit(leg.mode)) {
        return true
      }
    }
  }

  return false
}

// TODO: move to OTP-UI + add tests?
/**
 * @returns true if at least one of the legs of the specified itinerary is a rental leg
 *   (e.g. CAR_RENT, BICYCLE_RENT, MICROMOBILITY_RENT).
 */
export function itineraryHasRental (itinerary) {
  if (itinerary && itinerary.legs) {
    for (const leg of itinerary.legs) {
      if (leg.mode.indexOf('_RENT') > -1) {
        return true
      }
    }
  }

  return false
}

/**
 * Determines whether an itinerary can be monitored.
 * @returns true if at least one of the legs of the specified itinerary is
 *   a transit leg, and none of the legs is a rental leg (e.g. CAR_RENT, BICYCLE_RENT, etc.).
 */
export function itineraryCanBeMonitored (itinerary) {
  return itineraryHasTransit(itinerary) && !itineraryHasRental(itinerary)
}
