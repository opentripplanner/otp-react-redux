import { Leg } from '@opentripplanner/types'
import React from 'react'
import styled from 'styled-components'

// TODO: This should not be a section, but using div/span
// doesn't allow us to style it from within the RouteBlock
const Block = styled.section<{ color: string; onColoredBackground?: boolean }>`
  background: #${(props) => props.color}1A;
  border-radius: 5px;
  border-top: 5px solid #${(props) => props.color};
  display: inline-block;
  max-width: 12vw;
  padding: 3px 7px;
  text-align: center;
  white-space: break-spaces;

  ${(props) => props.onColoredBackground && 'border-top: none'}
`

type RouteRendererProps = {
  leg: Leg & { onColoredBackground?: boolean }
}

const DefaultRouteRenderer = ({ leg }: RouteRendererProps): JSX.Element => (
  <Block
    color={leg.routeColor || '333333'}
    onColoredBackground={leg.onColoredBackground}
  >
    {leg.routeShortName || leg.route || leg.routeLongName}
  </Block>
)
export default DefaultRouteRenderer
export type { RouteRendererProps }
