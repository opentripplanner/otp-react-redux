import { Leg } from '@opentripplanner/types'
import React from 'react'

import DefaultRouteRenderer, {
  RouteRendererProps
} from './default-route-renderer'

type Props = {
  LegIcon: ({ height, leg }: { height: number; leg: Leg }) => React.ReactElement
  RouteRenderer?: ({ leg }: RouteRendererProps) => React.ReactElement
  last: boolean
  leg: Leg
  previousLegMode?: string
}

const RouteBlock = ({
  last,
  leg,
  LegIcon,
  previousLegMode,
  RouteRenderer
}: Props): React.ReactElement => {
  const RouteBlock = RouteRenderer || DefaultRouteRenderer
  return (
    <span>
      {leg.mode !== previousLegMode && <LegIcon height={28} leg={leg} />}
      {leg.routeShortName && <RouteBlock leg={leg} />}
    </span>
  )
}

export default RouteBlock
