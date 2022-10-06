import { Leg } from '@opentripplanner/types'
import React from 'react'
import styled from 'styled-components'

// TODO: This should not be a section, but using div/span
// doesn't allow us to style it from within the RouteBlock
const Block = styled.section<{ color: string; hideTopBorder?: boolean }>`
  background: #${(props) => props.color}1A;
  padding: 3px 7px;
  border-top: 5px solid #${(props) => props.color};
  border-radius: 5px;
  text-align: center;
  display: inline-block;
  max-width: 12vw;

  ${(props) => props.hideTopBorder && 'border-top: none'}
`

type RouteRendererProps = {
  leg: Leg & { hideTopBorder?: boolean }
}

const DefaultRouteRenderer = ({ leg }: RouteRendererProps): JSX.Element => (
  <Block color={leg.routeColor || '333333'} hideTopBorder={leg.hideTopBorder}>
    {leg.routeShortName || leg.route || leg.routeLongName}
  </Block>
)
export default DefaultRouteRenderer
export type { RouteRendererProps }
