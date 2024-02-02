// TODO: Typescript, which doesn't make sense to do in this file until common types are established
/* eslint-disable react/prop-types */
import { ArrowRight } from '@styled-icons/fa-solid'
import { Button } from 'react-bootstrap'
import React, { PureComponent } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../util/contexts'
import { getFormattedMode } from '../../util/i18n'
import { getModeFromRoute } from '../../util/viewer'
import { Icon } from '../util/styledIcon'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import OperatorLogo from '../util/operator-logo'

import RouteName from './route-name'

export const StyledRouteRow = styled.li`
  align-items: center;
  background-color: transparent;
  display: flex;
  justify-content: space-between;
  list-style: none;
  margin: 5px 0;
  min-height: 50px;
  position: relative;
`
// Route Row Button sits invisible on top of the route name and info.
export const RouteRowButton = styled(Button)`
  align-items: center;
  display: flex;
  min-height: 50px;
  padding: 5px;
  // Make sure route details always leaves enough room for pattern button
  padding-right: 55px;
  transition: all ease-out 0.1s;
  width: 100%;

  &:before {
    background-color: ${(props) =>
      props.patternActive ? '#0071d712' : 'white'};
    border-radius: 4px;
    content: '';
    height: 100%;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: -4;
  }

  }
`

export const OperatorImg = styled.img`
  height: 25px;
`

export const ModeIconElement = styled.span`
  display: inherit; // Allows for equal sizing and vertical centering of mode icons
  height: 28px;
  width: 28px;
`

const RouteDetailsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  margin-left: 5px;
  max-height: 180px;
  min-height: 36px;
  overflow: hidden;
`

const PatternButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #004f96;
  height: 40px;
  margin-right: 8px;
  position: absolute;
  right: 5px;
  transition: all ease-out 0.1s;
  z-index: ${(props) => (props.display ? 2 : -2)};
  width: 40px;

  svg {
    height: 22px !important;
    margin-top: -3px;
    opacity: ${(props) => (props.display ? '80%' : 0)};
    width: 22px !important;
  }

  :active {
    opacity: 100%;
    transition: all ease-out 0.1s;
  }

  &:hover {
    background: #fff;
    transition: all ease-out 0.1s;
  }
`

export class RouteRow extends PureComponent {
  static contextType = ComponentContext

  constructor(props) {
    super(props)
    // Create a ref used to scroll to
    this.activeRef = React.createRef()
  }

  componentDidMount = () => {
    const { isActive, route } = this.props
    if (isActive && route?.id) {
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

  _patternButtonClicked = () => {
    const { route, setViewedRoute } = this.props
    const { id, patterns } = route
    const firstPattern = route && patterns && Object.values(patterns)?.[0]?.id
    setViewedRoute({ patternId: firstPattern, routeId: id })
  }

  render() {
    const { intl, isActive, operator, route } = this.props
    const { ModeIcon, RouteRenderer } = this.context

    const patternViewerButtonText = intl.formatMessage({
      description: 'identifies the purpose of the pattern viewer button',
      id: 'components.RouteViewer.openPatternViewer'
    })
    const routeMapToggleText = intl.formatMessage({
      description: 'identifies the behavior of the route viewer button',
      id: 'components.RouteViewer.toggleRouteOnMap'
    })

    return (
      <StyledRouteRow ref={this.activeRef}>
        <RouteRowButton
          aria-pressed={isActive || false}
          className="clear-button-formatting"
          onClick={this._onClick}
          onFocus={this._onFocusOrEnter}
          onMouseEnter={this._onFocusOrEnter}
          onTouchStart={this._onFocusOrEnter}
          patternActive={isActive}
        >
          <RouteDetailsContainer>
            <OperatorLogo operator={operator} />
            {route.mode && operator.routeIcons !== false && (
              <ModeIconElement>
                <ModeIcon
                  aria-label={getFormattedMode(
                    getModeFromRoute(route).toLowerCase(),
                    intl
                  )}
                  height={28}
                  leg={{
                    routeId: route?.id,
                    routeLongName: route?.longName,
                    routeShortName: route?.shortName
                  }}
                  mode={getModeFromRoute(route)}
                  role="img"
                  width={28}
                />
              </ModeIconElement>
            )}
            <RouteName route={route} RouteRenderer={RouteRenderer} />
          </RouteDetailsContainer>
          <InvisibleA11yLabel>({routeMapToggleText})</InvisibleA11yLabel>
        </RouteRowButton>
        <PatternButton
          aria-label={patternViewerButtonText}
          display={isActive}
          id={`open-route-button-${route.shortName || route.longName}-${
            operator.name || '' // don't print 'undefined' if there is no operator.
          }`}
          onClick={this._patternButtonClicked}
          // Cannot keyboard navigate to the button unless it is visible
          tabIndex={isActive ? 0 : -1}
          title={patternViewerButtonText}
        >
          <Icon Icon={ArrowRight} />
        </PatternButton>
      </StyledRouteRow>
    )
  }
}
