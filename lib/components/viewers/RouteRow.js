// TODO: Typescript, which doesn't make sense to do in this file until common types are established
/* eslint-disable react/prop-types */
import { Button } from 'react-bootstrap'
import AnimateHeight from 'react-animate-height'
import React, { PureComponent } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../util/contexts'
import {
  generateFakeLegForRouteRenderer,
  getModeFromRoute
} from '../../util/viewer'
import { getFormattedMode } from '../../util/i18n'
import DefaultRouteRenderer from '../narrative/metro/default-route-renderer'

import RouteDetails from './route-details'

export const StyledRouteRow = styled.div`
  background-color: white;
  margin: 10px;
`

export const RouteRowButton = styled(Button)`
  align-items: center;
  display: flex;
  padding: 6px;
  width: 100%;
`

export const OperatorImg = styled.img`
  height: 25px;
  margin-right: 8px;
`

export const ModeIconElement = styled.span`
  height: 22px;
`

const RouteNameElement = styled.span`
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 400;
  /* HACK: Apply a negative bottom margin as a result of displaying an ellipsis,
     even if white-space: nowrap is set. */
  margin: 0 0 -7px 8px;
`
const RouteLongNameElement = styled.span`
  font-size: 16px;
  font-weight: 500;
  /* Apply top margin so that the baseline of the default-rendered
     route short name aligns with that of the route long name. */
  margin: 4px 0 0 5px;
`

const SimpleRouteRenderer = styled.h2`
  font-size: 18px;
  margin: 0;
  padding: 0;
`

export const RouteName = ({ basicRender, route, RouteRenderer }) => {
  const Route = RouteRenderer || DefaultRouteRenderer

  return (
    <>
      <RouteNameElement title={route.shortName}>
        {!basicRender ? (
          <Route leg={generateFakeLegForRouteRenderer(route)} />
        ) : (
          <SimpleRouteRenderer>
            {route.shortName || route.longName}
          </SimpleRouteRenderer>
        )}
      </RouteNameElement>
      {/* Only render long name if it's not already rendered by the RouteRenderer 
          (the long name is rendered by the routeRenderer if the short name does not exist) */}
      {route.shortName && (
        <RouteLongNameElement>{route.longName}</RouteLongNameElement>
      )}
    </>
  )
}

export class RouteRow extends PureComponent {
  static contextType = ComponentContext

  constructor(props) {
    super(props)
    // Create a ref used to scroll to
    this.activeRef = React.createRef()
    this.state = { newHeight: 0 }
  }

  componentDidMount = () => {
    const { getVehiclePositionsForRoute, isActive, route } = this.props
    if (isActive && route?.id) {
      // Update data to populate map
      getVehiclePositionsForRoute(route.id)
      // This is fired when coming back from the route details view
      this.activeRef.current.scrollIntoView()
    }
  }

  componentDidUpdate() {
    /*
       If the initial route row list is being rendered and there is an active
       route, scroll to it. The initialRender prop prohibits the row being scrolled to
       if the user has clicked on a route
    */
    if (this.props.isActive && this.props.initialRender) {
      this.activeRef.current.scrollIntoView()
    }
  }

  _onFocusOrEnter = () => {
    const { findRouteIfNeeded, route } = this.props
    findRouteIfNeeded({ routeId: route.id })
  }

  _onClick = () => {
    const { isActive, route, setViewedRoute } = this.props
    if (isActive) {
      // Deselect current route if active.
      setViewedRoute({ patternId: null, routeId: null })
    } else {
      // Otherwise, set active and fetch route patterns.
      setViewedRoute({ routeId: route.id })
    }
  }

  // Used to ensure details are visible until animation completes
  setNewHeight = (newHeight) => {
    this.setState({ newHeight })
  }

  render() {
    const { intl, isActive, operator, route } = this.props
    const { newHeight } = this.state
    const { ModeIcon, RouteRenderer } = this.context

    return (
      <StyledRouteRow isActive={isActive} ref={this.activeRef}>
        <RouteRowButton
          className="clear-button-formatting"
          isActive={isActive}
          onClick={this._onClick}
          onFocus={this._onFocusOrEnter}
          onMouseEnter={this._onFocusOrEnter}
          onTouchStart={this._onFocusOrEnter}
        >
          {operator && operator.logo && (
            <OperatorImg
              alt={intl.formatMessage(
                {
                  id: 'components.RouteRow.operatorLogoAltText'
                },
                { operatorName: operator.name }
              )}
              src={operator.logo}
            />
          )}
          {route.mode && (
            <ModeIconElement>
              <ModeIcon
                aria-label={getFormattedMode(
                  getModeFromRoute(route).toLowerCase(),
                  intl
                )}
                height={22}
                mode={getModeFromRoute(route)}
                width={22}
              />
            </ModeIconElement>
          )}
          <RouteName route={route} RouteRenderer={RouteRenderer} />
        </RouteRowButton>
        <AnimateHeight
          duration={500}
          height={isActive ? 'auto' : 0}
          onHeightAnimationEnd={this.setNewHeight}
        >
          {(newHeight > 0 || isActive) && (
            <RouteDetails operator={operator} route={route} />
          )}
        </AnimateHeight>
      </StyledRouteRow>
    )
  }
}
