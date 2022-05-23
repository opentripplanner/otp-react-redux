import { Leg } from '@opentripplanner/types'
import React from 'react'
import styled from 'styled-components'

const Block = styled.section<{ color: string }>`
  background: #${(props) => props.color}1A;
  padding: 2px 5px;
  border-top: 5px solid #${(props) => props.color};
  border-radius: 5px;
  text-align: center;
  display: inline-block;
  max-width: 12vw;
`

type RouteRendererProps = {
  leg: Leg
}

const DefaultRouteRenderer = ({ leg }: RouteRendererProps): JSX.Element => (
  <Block color={leg.routeColor || '333333'}>
    {leg.routeShortName || leg.route || leg.routeLongName}
  </Block>
)
export default DefaultRouteRenderer
export type { RouteRendererProps }
