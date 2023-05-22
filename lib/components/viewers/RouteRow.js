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
import OperatorLogo from '../util/operator-logo'

import RouteName from './route-name'

export const StyledRouteRow = styled.li`
  align-items: center;
  background-color: transparent;
  display: flex;
  gap: 7px;
  justify-content: space-between;
  list-style: none;
  margin: 5px 0;
  padding: 5px;
  position: relative;
`
// Route Row Button sits invisible on top of the route name and info.
export const RouteRowButton = styled(Button)`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transition: all ease-out 0.1s;
  width: 100%;

  &:before {
    background-color: white;
    border-radius: 4px;
    content: '';
    height: 100%;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: -4;
  }

  &:active,
  &.btn-default:active:focus {
    background-color: transparent !important;
  }

  &:active:before,
  &.btn-default:active:focus:before {
    background-color: #eee;
    transition: all ease-out 0.1s;
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
  display: grid;
  grid-template-columns: repeat(4, auto);
  gap: 12px;
  justify-items: center;
  margin-left: 5px;
`

const PatternButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #004f96;
  height: 40px;
  margin-right: 8px;
  min-width: 40px;
  opacity: ${(props) => (props.display ? '80%' : 0)};
  position: relative;
  transition: all ease-out 0.1s;
  z-index: ${(props) => (props.display ? 2 : -2)};

  svg {
    margin-top: -3px;
    height: 22px !important;
    width: 22px !important;
  }

  :active {
    opacity: 100%;
    transition: all ease-out 0.1s;
  }

  &:hover {
    background: #eee;
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
      <StyledRouteRow isActive={isActive} ref={this.activeRef}>
        <RouteDetailsContainer>
          <OperatorLogo operator={operator} />
          {route.mode && (
            <ModeIconElement>
              <ModeIcon
                aria-label={getFormattedMode(
                  getModeFromRoute(route).toLowerCase(),
                  intl
                )}
                height={28}
                leg={{
                  routeLongName: route?.longName,
                  routeShortName: route?.shortName
                }}
                mode={getModeFromRoute(route)}
                width={28}
              />
            </ModeIconElement>
          )}
          <RouteName route={route} RouteRenderer={RouteRenderer} />
        </RouteDetailsContainer>
        <RouteRowButton
          aria-label={routeMapToggleText}
          className="clear-button-formatting"
          isActive={isActive}
          onClick={this._onClick}
          onFocus={this._onFocusOrEnter}
          onMouseEnter={this._onFocusOrEnter}
          onTouchStart={this._onFocusOrEnter}
          title={routeMapToggleText}
        />
        <PatternButton
          aria-label={patternViewerButtonText}
          display={isActive}
          id={`open-route-button-${route.shortName || route.longName}`}
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
