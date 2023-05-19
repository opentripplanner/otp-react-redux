import React, { ComponentType } from 'react'
import styled from 'styled-components'

import { generateFakeLegForRouteRenderer } from '../../util/viewer'
import DefaultRouteRenderer from '../narrative/metro/default-route-renderer'

import { ViewedRouteObject } from './types'

const RouteNameElement = styled.span`
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 400;
`
const RouteLongNameElement = styled.span`
  font-size: 16px;
  font-weight: 500;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
`

interface MinimalLeg {
  mode: string
  routeColor: string
}

interface RouteRendererProps {
  fullRender?: boolean
  leg: MinimalLeg
}

interface Props {
  RouteRenderer: ComponentType<RouteRendererProps>
  fullRender?: boolean
  route: ViewedRouteObject
}

/**
 * Component that renders a route name.
 */
const RouteName = ({
  fullRender,
  route,
  RouteRenderer
}: Props): JSX.Element => {
  const Route = RouteRenderer || DefaultRouteRenderer
  const { longName, shortName } = route
  return (
    <>
      <RouteNameElement title={`${shortName}`}>
        <Route
          fullRender={fullRender}
          leg={generateFakeLegForRouteRenderer(route)}
        />
      </RouteNameElement>
      {/* Only render long name if it's not already rendered by the RouteRenderer 
          (the long name is rendered by the routeRenderer if the short name does not exist) */}
      {shortName && (
        // If the route long name is the same as the route short name, then
        // hide the route long name from assistive technology to avoid repeating the same route names.
        <RouteLongNameElement aria-hidden={shortName === longName}>
          {longName}
        </RouteLongNameElement>
      )}
    </>
  )
}

export default RouteName
