import React, { ComponentType } from 'react'
import styled from 'styled-components'

import { generateFakeLegForRouteRenderer } from '../../util/viewer'
import { ViewedRouteObject } from '../util/types'
import DefaultRouteRenderer from '../narrative/metro/default-route-renderer'

const RouteNameElement = styled.span`
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 400;
`

const RouteNameElementTall = styled(RouteNameElement)`
  font-size: 18px;
  & > span {
    max-width: unset;
    vertical-align: text-bottom;
  }
`

const RouteLongNameElement = styled.span`
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`

interface MinimalLeg {
  mode: string
  routeColor: string
}

interface RouteRendererProps {
  leg: MinimalLeg
}

interface Props {
  RouteRenderer: ComponentType<RouteRendererProps>
  isOnColoredBackground?: boolean
  route: ViewedRouteObject
}

/**
 * Component that renders a route name.
 */
const RouteName = ({
  isOnColoredBackground,
  route,
  RouteRenderer
}: Props): JSX.Element => {
  const Route = RouteRenderer || DefaultRouteRenderer
  const { longName, shortName } = route
  const Wrapper = isOnColoredBackground
    ? RouteNameElementTall
    : RouteNameElement
  return (
    <>
      <Wrapper title={`${shortName}`}>
        <Route
          leg={generateFakeLegForRouteRenderer(route, isOnColoredBackground)}
        />
      </Wrapper>
      {/* Only render long name if it's not already rendered by the RouteRenderer,
          and if the route long name is not the same as the route short name.
          (The long name is rendered by the routeRenderer if the short name does not exist.) */}
      {shortName && (shortName !== longName || !isOnColoredBackground) && (
        <RouteLongNameElement>{longName}</RouteLongNameElement>
      )}
    </>
  )
}

export default RouteName
