import { Leg } from '@opentripplanner/types'
import React from 'react'

type Props = {
  RouteRenderer?: ({ leg }: { leg: Leg }) => React.ReactElement
  leg: Leg
}

const RouteBlock = ({ leg, RouteRenderer }: Props): React.ReactElement => {
  if (RouteRenderer) return <RouteRenderer leg={leg} />
  return <span>{leg.mode}</span>
}

export default RouteBlock
