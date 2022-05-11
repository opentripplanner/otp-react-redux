import { Leg } from '@opentripplanner/types'
import { RouteLongName } from '@opentripplanner/itinerary-body/lib/defaults'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'

import DefaultRouteRenderer from './default-route-renderer'

type Props = {
  LegIcon: ({ height, leg }: { height: number; leg: Leg }) => React.ReactElement
  hideLongName?: boolean
  leg: Leg
  previousLegMode?: string
}

const Wrapper = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 7.5px;
`

const RouteBlock = ({
  hideLongName,
  leg,
  LegIcon,
  previousLegMode
}: Props): React.ReactElement | null => {
  // @ts-expect-error React context is populated dynamically
  const { RouteRenderer } = useContext(ComponentContext)
  const Route = RouteRenderer || DefaultRouteRenderer

  return (
    <Wrapper className="route-block-wrapper">
      {leg.mode !== previousLegMode && <LegIcon height={28} leg={leg} />}
      {leg.routeShortName && <Route leg={leg} />}
      {!hideLongName && leg.routeLongName && <RouteLongName leg={leg} />}
    </Wrapper>
  )
}

export default RouteBlock
