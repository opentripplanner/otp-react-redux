import { FormattedMessage, IntlShape } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
// @ts-expect-error Not typescripted yet
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import { getFormattedMode } from '../../../util/i18n'

const { isBicycle, isMicromobility, isTransit } = coreUtils.itinerary

type Props = {
  combineTransitModes?: boolean
  intl: IntlShape
  itinerary: Itinerary
}

/**
 * Obtains the description of an itinerary in the given locale.
 */
export function getMainItineraryModes({
  combineTransitModes,
  intl,
  itinerary
}: Props): {
  mainMode: string
  transitMode?: string
} {
  let primaryTransitDuration = 0
  let accessModeId = 'walk'
  let transitMode
  itinerary.legs.forEach((leg, i) => {
    const { duration, mode, rentedBike, rentedVehicle } = leg
    if (isTransit(mode) && duration > primaryTransitDuration) {
      // TODO: convert OTP's TRAM mode to the correct wording for Portland
      primaryTransitDuration = duration
      transitMode = getFormattedMode(
        combineTransitModes ? 'transit' : mode.toLowerCase(),
        intl
      )
    }
    if (isBicycle(mode)) accessModeId = 'bicycle'
    if (isMicromobility(mode)) accessModeId = 'micromobility'
    if (rentedVehicle) accessModeId = 'micromobility_rent'
    if (rentedBike) accessModeId = 'bicycle_rent'
    if (mode === 'CAR') accessModeId = 'drive'
  })

  return { mainMode: getFormattedMode(accessModeId, intl), transitMode }
}

export function ItineraryDescription(props: Props): React.ReactNode {
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

export function getItineraryDescription(props: Props): string {
  const { intl } = props
  const { mainMode, transitMode } = getMainItineraryModes(props)

  return transitMode
    ? intl.formatMessage(
        { id: 'components.DefaultItinerary.multiModeSummary' },
        {
          accessMode: mainMode,
          transitMode
        }
      )
    : mainMode
}
