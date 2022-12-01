import { Leg } from '@opentripplanner/types'
import React from 'react'
import styled from 'styled-components'

const Block = styled.span<{ color: string }>`
  background: #${(props) => props.color}1A;
  border-radius: 5px;
  border-top: 5px solid #${(props) => props.color};
  display: inline-block;
  padding: 3px 7px;

  /* Below is for route names that are too long: cut-off and show ellipsis. */
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  /* (Change the vertical alignment when changing the overflow attribute.) */
  vertical-align: middle;
  white-space: nowrap;
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
