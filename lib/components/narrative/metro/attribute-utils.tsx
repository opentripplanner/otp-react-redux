import { IntlShape } from 'react-intl'
import { Itinerary, Leg } from '@opentripplanner/types'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

export const getFirstTransitLeg = (itinerary: Itinerary): Leg | undefined =>
  itinerary.legs?.find((leg: Leg) => leg?.from?.vertexType === 'TRANSIT')

export const getFirstTransitLegStop = (
  itinerary: Itinerary
): string | undefined => getFirstTransitLeg(itinerary)?.from?.name

export const getFlexAttributes = (
  itinerary: Itinerary
): {
  isCallAhead: boolean
  isContinuousDropoff: boolean
  isFlexItinerary: boolean
  phone: string
} => {
  const isCallAhead = itinerary.legs?.some(
    coreUtils.itinerary.isReservationRequired
  )

  let phone = itinerary.legs
    .map((leg: Leg) => leg?.agencyName)
    .filter((name: string | undefined) => !!name)[0]

  if (isCallAhead) {
    // Picking 0 ensures that if multiple flex legs with
    // different phone numbers, the first leg is prioritized
    phone = itinerary.legs
      .map((leg: Leg) => leg.pickupBookingInfo?.contactInfo?.phoneNumber)
      .filter((number: string | undefined) => !!number)[0]
  }

  return {
    isCallAhead,
    isContinuousDropoff: itinerary.legs?.some(
      coreUtils.itinerary.isCoordinationRequired
    ),
    isFlexItinerary: itinerary.legs?.some(coreUtils.itinerary.isFlex),
    phone: phone || ''
  }
}

export const removeInsignificantWalkLegs = (leg: Leg): boolean =>
  // Return true only for non walk-legs or walking legs over 400 meters
  // TODO: Make the 400 meters configurable?
  leg.mode !== 'WALK' || leg.distance > 400

/**
 * Generate text for all routes used in an itinerary.
 */
export const getItineraryRoutes = (
  itinerary: Itinerary,
  intl: IntlShape
): React.ReactNode => {
  return intl.formatList(
    itinerary.legs
      .map((leg: Leg & { alternateRoutes?: any }) => {
        const alternateRouteNames =
          leg.alternateRoutes &&
          Object.entries(leg.alternateRoutes).map(
            (route: any) => route[1].routeShortName
          )

        return !alternateRouteNames
          ? leg.routeShortName
          : intl.formatList([leg.routeShortName, ...alternateRouteNames], {
              type: 'disjunction'
            })
      })
      .filter((name) => !!name)
  )
}
