import coreUtils from '@opentripplanner/core-utils'
import React, { ReactElement, useContext } from 'react'

import { ComponentContext } from '../../../util/contexts'

import RouteBlock, { Props } from './route-block'

export default function RouteBlockWithModeDecoration(
  props: Props
): ReactElement {
  // @ts-expect-error No type on ComponentContext
  const { FlexNoticeIcon } = useContext(ComponentContext)
  const needReservation = coreUtils.itinerary.isReservationRequired(props.leg)
  const reservationWrapper = (
    <span style={{ marginLeft: '-1ch' }}>
      <FlexNoticeIcon />
    </span>
  )
  return (
    <RouteBlock
      {...props}
      modeIconDecoration={needReservation && reservationWrapper}
    />
  )
}
