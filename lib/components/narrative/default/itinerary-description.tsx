import { FormattedMessage } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
// @ts-expect-error Not typescripted yet
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import FormattedMode from '../../util/formatted-mode'
const { isBicycle, isMicromobility, isTransit } = coreUtils.itinerary

type Props = {
  combineTransitModes?: boolean
  itinerary: Itinerary
}

/**
 * Obtains the description of an itinerary in the given locale.
 */
export function getMainItineraryModes({
  combineTransitModes,
  itinerary
}: Props): {
  mainMode: string | JSX.Element
  transitMode?: string | JSX.Element
} {
  let primaryTransitDuration = 0
  let accessModeId = 'walk'
  let transitMode
  itinerary.legs.forEach((leg, i) => {
    const { duration, mode, rentedBike, rentedVehicle } = leg
    if (isTransit(mode) && duration > primaryTransitDuration) {
      // TODO: convert OTP's TRAM mode to the correct wording for Portland
      primaryTransitDuration = duration
      transitMode = (
        <FormattedMode
          mode={combineTransitModes ? 'transit' : mode.toLowerCase()}
        />
      )
    }
    if (isBicycle(mode)) accessModeId = 'bicycle'
    if (isMicromobility(mode)) accessModeId = 'micromobility'
    if (rentedVehicle) accessModeId = 'micromobility_rent'
    if (rentedBike) accessModeId = 'bicycle_rent'
    if (mode === 'CAR') accessModeId = 'drive'
  })

  return { mainMode: <FormattedMode mode={accessModeId} />, transitMode }
}

export function ItineraryDescription(props: Props) {
  const { mainMode, transitMode } = getMainItineraryModes(props)

  return transitMode ? (
    <FormattedMessage
      id="components.DefaultItinerary.multiModeSummary"
      values={{ accessMode: mainMode, transitMode }}
    />
  ) : (
    mainMode
  )
}
