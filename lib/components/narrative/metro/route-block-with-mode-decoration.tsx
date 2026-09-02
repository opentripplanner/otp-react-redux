import coreUtils from '@opentripplanner/core-utils'
import React, { ReactElement } from 'react'

import FlexDecoration from '../../util/flex-decoration'

import RouteBlock, { Props } from './route-block'

export default function RouteBlockWithModeDecoration(
  props: Props
): ReactElement {
  const needReservation = coreUtils.itinerary.isReservationRequired(props.leg)
  return (
    <RouteBlock
      {...props}
      modeIconDecoration={needReservation && <FlexDecoration />}
    />
  )
}
