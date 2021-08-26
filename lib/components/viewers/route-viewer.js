import coreUtils from '@opentripplanner/core-utils'
import React, { Component, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Label, Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import Icon from '../narrative/icon'
import { setMainPanelContent, setViewedRoute } from '../../actions/ui'
import { getVehiclePositionsForRoute, findRoutes, findRoute } from '../../actions/api'
import { ComponentContext } from '../../util/contexts'
import { getColorAndNameFromRoute, getModeFromRoute } from '../../util/viewer'

import RouteDetails from './route-details'

class RouteViewer extends Component {
  static propTypes = {
    hideBackButton: PropTypes.bool,
    routes: PropTypes.object
  }

  _backClicked = () =>
    this.props.viewedRoute === null
      ? this.props.setMainPanelContent(null)
      : this.props.setViewedRoute(null);

  componentDidMount () {
    const { findRoutes } = this.props
    findRoutes()
  }

  render () {
    const {
      findRoute,
      getVehiclePositionsForRoute,
      hideBackButton,
      languageConfig,
      routes,
      setViewedRoute,
      transitOperators,
      viewedRoute
    } = this.props
    const sortedRoutes = routes
      ? Object.values(routes).sort(
        coreUtils.route.makeRouteComparator(transitOperators)
      )
      : []

    // If patternId is present, we're looking at a specific pattern's stops
    if (viewedRoute?.patternId) {
      const {patternId, routeId} = viewedRoute
      const route = routes[routeId]
      // Find operator based on agency_id (extracted from OTP route ID).
      const operator = coreUtils.route.getTransitOperatorFromOtpRoute(
        route,
        transitOperators
      ) || {}
      const { backgroundColor, color } = getColorAndNameFromRoute(
        operator,
        route
      )

      return (
        <div className='route-viewer'>
          {/* Header Block */}
          <div className='route-viewer-header' style={{backgroundColor, color}}>
            {/* Always show back button, as we don't write a route anymore */}
            <div className='back-button-container'>
              <Button
                bsSize='small'
                onClick={this._backClicked}
              ><Icon type='arrow-left' />Back</Button>
            </div>

            <div className='header-text'>
              <strong>{route.shortName}</strong>
            </div>
          </div>
          <RouteDetails operator={operator} pattern={route.patterns[patternId]} route={route} />
        </div>
      )
    }

    return (
      <div className='route-viewer'>
        {/* Header Block */}
        <div className='route-viewer-header'>
          {/* Back button */}
          {!hideBackButton && (
            <div className='back-button-container'>
              <Button
                bsSize='small'
                onClick={this._backClicked}
              ><Icon type='arrow-left' />Back</Button>
            </div>
          )}

          {/* Header Text */}
          <div className='header-text'>
            {languageConfig.routeViewer || 'Route Viewer'}
          </div>
          <div className=''>
            {languageConfig.routeViewerDetails}
          </div>
          <div style={{ clear: 'both' }} />
        </div>

        <div className='route-viewer-body'>
          {sortedRoutes
            .map(route => {
              // Find operator based on agency_id (extracted from OTP route ID).
              const operator = coreUtils.route.getTransitOperatorFromOtpRoute(
                route,
                transitOperators
              ) || {}
              return (
                <RouteRow
                  findRoute={findRoute}
                  getVehiclePositionsForRoute={getVehiclePositionsForRoute}
                  isActive={viewedRoute && viewedRoute.routeId === route.id}
                  key={route.id}
                  operator={operator}
                  route={route}
                  setViewedRoute={setViewedRoute}
                />
              )
            })
          }
        </div>
      </div>
    )
  }
}

const StyledRouteRow = styled.div`
  background-color: ${props => props.isActive ? props.routeColor : 'white'};
  border-bottom: 1px solid gray;
`

const RouteRowButton = styled(Button)`
  align-items: center;
  display: flex;
  padding: 6px;
  width: 100%;
  transition: all ease-in-out 0.1s;

  &:hover {
    background-color: ${(props) =>
    !props.isActive && tinycolor(props.routeColor)
      .lighten(50)
      .toHexString()};
    border-radius: 0;
  }

  &:active:focus,
  &:active:hover {
    background-color: ${(props) => props.routeColor};
    border-radius: 0;
  }
`

const RouteRowElement = styled.span`
`

const OperatorImg = styled.img`
  height: 25px;
  margin-right: 8px;
`

const ModeIconElement = styled.span`
  display: inline-block;
  vertical-align: bottom;
  height: 22px;
`

const RouteNameElement = styled(Label)`
  background-color: ${props => (
    props.backgroundColor === '#ffffff' || props.backgroundColor === 'white'
      ? 'rgba(0,0,0,0)'
      : props.backgroundColor
  )};
  color: ${props => props.color};
  flex: 0 1 auto;
  font-size: medium;
  font-weight: 400;
  margin-left: ${props => (
    props.backgroundColor === '#ffffff' || props.backgroundColor === 'white'
      ? 0
      : '8px'
  )};
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
`

class RouteRow extends PureComponent {
  static contextType = ComponentContext

  componentDidMount = () => {
    const { getVehiclePositionsForRoute, isActive, route } = this.props
    if (isActive && route?.id) {
      // Update data to populate map
      getVehiclePositionsForRoute(route.id)
    }
  }

  _onClick = () => {
    const { findRoute, getVehiclePositionsForRoute, isActive, route, setViewedRoute } = this.props
    if (isActive) {
      // Deselect current route if active.
      setViewedRoute({ patternId: null, routeId: null })
    } else {
      // Otherwise, set active and fetch route patterns.
      findRoute({ routeId: route.id })
      getVehiclePositionsForRoute(route.id)
      setViewedRoute({ routeId: route.id })
    }
  }

  render () {
    const { isActive, operator, route } = this.props
    const { ModeIcon } = this.context

    const { backgroundColor, color, longName } = getColorAndNameFromRoute(
      operator,
      route
    )

    return (
      <StyledRouteRow isActive={isActive} routeColor={backgroundColor}>
        <RouteRowButton
          className='clear-button-formatting'
          isActive={isActive}
          onClick={this._onClick}
          routeColor={backgroundColor}
        >
          <RouteRowElement>
            {operator && operator.logo &&
              <OperatorImg
                alt={`${operator.name} logo`}
                src={operator.logo}
              />
            }
          </RouteRowElement>
          <ModeIconElement>
            <ModeIcon height={22} mode={getModeFromRoute(route)} style={{fill: isActive && color}} width={22} />
          </ModeIconElement>
          <RouteNameElement
            backgroundColor={backgroundColor}
            color={color}
            title={`${route.shortName} ${longName}`}
          >
            <b>{route.shortName}</b> {longName}
          </RouteNameElement>
        </RouteRowButton>
        <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
          {isActive && (
            <RouteDetails operator={operator} route={route} />
          )}
        </VelocityTransitionGroup>
      </StyledRouteRow>
    )
  }
}
// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    languageConfig: state.otp.config.language,
    routes: state.otp.transitIndex.routes,
    transitOperators: state.otp.config.transitOperators,
    viewedRoute: state.otp.ui.viewedRoute
  }
}

const mapDispatchToProps = {
  findRoute,
  findRoutes,
  getVehiclePositionsForRoute,
  setMainPanelContent,
  setViewedRoute
}

export default connect(mapStateToProps, mapDispatchToProps)(RouteViewer)
