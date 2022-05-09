import { Leg } from '@opentripplanner/types'
import React from 'react'
import styled from 'styled-components'

const Route = styled.section<{ color: string }>`
  background: #${(props) => props.color}1A;
  padding: 2px 5px;
  border-top: 5px solid #${(props) => props.color};
  border-radius: 5px;
  min-width: 25px;
  text-align: center;
`

type RouteRendererProps = {
  leg: Leg
}

const DefaultRouteRenderer = ({ leg }: RouteRendererProps): JSX.Element => (
  <Route color={leg.routeColor || '#33333333'}>{leg.routeShortName}</Route>
)
export default DefaultRouteRenderer
export type { RouteRendererProps }
