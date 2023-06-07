import { FormattedMessage, IntlShape } from 'react-intl'
import { Itinerary } from '@opentripplanner/types'
import coreUtils from '@opentripplanner/core-utils'
import React, { useContext } from 'react'

import { ComponentContext } from '../../../util/contexts'
import { getFormattedMode } from '../../../util/i18n'
import FormattedMode from '../../util/formatted-mode'

const { isRideshareLeg } = coreUtils.itinerary

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
  intl,
  itinerary
}: Props & { intl: IntlShape }): {
  mainMode: string
  transitMode?: string
} {
  let primaryTransitDuration = 0
  let accessModeId = 'walk'
  let transitMode
  itinerary.legs.forEach((leg, i) => {
    const { duration, mode, rentedBike, rentedVehicle } = leg
    if (
      (leg.transitLeg || isTransit(mode)) &&
      duration > primaryTransitDuration
    ) {
      primaryTransitDuration = duration
      transitMode = getFormattedMode(
        combineTransitModes ? 'transit' : mode.toLowerCase(),
        intl
      )
    }
    if (isBicycle(mode)) accessModeId = 'bicycle'
    if (rentedBike) accessModeId = 'bicycle_rent'
    if (isMicromobility(mode)) accessModeId = 'micromobility'
    if (rentedVehicle || (isMicromobility(mode) && rentedBike))
      accessModeId = 'micromobility_rent'
    if (mode === 'CAR') accessModeId = 'drive'
    if (isRideshareLeg(leg)) accessModeId = 'ride'
  })

  return { mainMode: getFormattedMode(accessModeId, intl), transitMode }
}

/**
 * Obtains the description of an itinerary in the given locale.
 */
export function ItineraryDescription({ itinerary }: Props): JSX.Element {
  // FIXME: type context
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { TransitModes } = useContext(ComponentContext)

  let primaryTransitDuration = 0
  let accessModeId = 'walk'
  let transitMode
  itinerary.legs.forEach((leg) => {
    const { duration, mode, rentedBike, rentedVehicle } = leg
    if (isTransit(mode) && duration > primaryTransitDuration) {
      primaryTransitDuration = duration

      // If custom TransitModes have been defined for the given mode/leg, attempt to use them,
      // otherwise fall back on built-in mode rendering.
      transitMode = TransitModes ? (
        <TransitModes leg={leg} />
      ) : (
        <FormattedMode mode={mode} />
      )
    }

    if (isBicycle(mode)) accessModeId = 'bicycle'
    if (rentedBike) accessModeId = 'bicycle_rent'
    if (isMicromobility(mode)) accessModeId = 'micromobility'
    if (rentedVehicle) accessModeId = 'micromobility_rent'
    if (mode === 'CAR') accessModeId = 'drive'
    if (isRideshareLeg(leg)) accessModeId = 'ride'
  })

  const mainMode = <FormattedMode mode={accessModeId} />
  return transitMode ? (
    <FormattedMessage
      id="components.DefaultItinerary.multiModeSummary"
      values={{ accessMode: mainMode, transitMode }}
    />
  ) : (
    mainMode
  )
}

export function getItineraryDescription(
  props: Props & { intl: IntlShape }
): string {
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
