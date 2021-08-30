import coreUtils from '@opentripplanner/core-utils'
import React, { Component, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Label, Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'
import { FormattedMessage, injectIntl } from 'react-intl'

import Icon from '../narrative/icon'
import { getVehiclePositionsForRoute, findRoutes, findRoute } from '../../actions/api'
import { setMainPanelContent, setViewedRoute, setRouteViewerFilter } from '../../actions/ui'
import { getSortedFilteredRoutes, getModesForActiveAgencyFilter, getAgenciesFromRoutes } from '../../util/state'
import { ComponentContext } from '../../util/contexts'
import { getColorAndNameFromRoute, getModeFromRoute } from '../../util/viewer'

import RouteDetails from './route-details'

class RouteViewer extends Component {
  static propTypes = {
    agencies: PropTypes.array,
    hideBackButton: PropTypes.bool,
    modes: PropTypes.array,
    routes: PropTypes.array
  };

  _backClicked = () =>
    this.props.viewedRoute === null
      ? this.props.setMainPanelContent(null)
      : this.props.setViewedRoute(null);

  componentDidMount () {
    const { findRoutes } = this.props
    findRoutes()
  }

  /**
   * Handle filter dropdown change. Id of the filter is equivalent to the key in the
   * route object
   */
  onFilterChange = (event) => {
    const { eventPhase, target } = event
    // If the dropdown changes without user interaction, don't update!
    // see https://developer.mozilla.org/en-US/docs/Web/API/Event/eventPhase
    if (eventPhase !== Event.BUBBLING_PHASE) {
      return
    }
    const { id, value } = target
    // id will be either 'agency' or 'mode' based on the dropdown used
    this.props.setRouteViewerFilter({[id]: value})
  };

  /**
   * Update search state when user updates search field
   */
  onSearchChange = (event) => {
    const { target } = event
    const { value } = target
    this.props.setRouteViewerFilter({ search: value })
  };

  render () {
    const {
      agencies,
      filter,
      findRoute,
      getVehiclePositionsForRoute,
      hideBackButton,
      intl,
      modes,
      routes: sortedRoutes,
      setViewedRoute,
      transitOperators,
      viewedRoute,
      viewedRouteObject
    } = this.props

    // If patternId is present, we're looking at a specific pattern's stops
    if (viewedRoute?.patternId && viewedRouteObject) {
      const { patternId } = viewedRoute
      const route = viewedRouteObject
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
              ><Icon type='arrow-left' /><FormattedMessage id='common.navigation.back' /></Button>
            </div>

            <div className='header-text'>
              <strong>{route.shortName}</strong>
            </div>
          </div>
          <RouteDetails operator={operator} pattern={route?.patterns?.[patternId]} route={route} />
        </div>
      )
    }
    const { search } = filter

    return (
      <div className='route-viewer'>
        {/* Header Block */}
        <div className='route-viewer-header'>
          {/* Back button */}
          {!hideBackButton && (
            <div className='back-button-container'>
              <Button bsSize='small' onClick={this._backClicked}>
                <Icon type='arrow-left' />
                <FormattedMessage id='common.navigation.back' />
              </Button>
            </div>
          )}

          {/* Header Text */}
          <div className='header-text'>
            <FormattedMessage id='components.RouteViewer.title' />
          </div>
          <div className=''><FormattedMessage id='components.RouteViewer.details' /></div>
          <section className='search-and-filter'>
            <span className='routeFilter'>
              <Icon type='filter' />
              <select
                aria-label={intl.formatMessage({id: 'components.RouteViewer.agencyFilter'})}
                id='agency'
                onBlur={this.onFilterChange}
                onChange={this.onFilterChange}
                value={filter.agency || ''}
              >
                <option value={''}>
                  {intl.formatMessage({
                    id: 'components.RouteViewer.allAgencies'
                  })}
                </option>
                {agencies.map((agency) => (
                  <option key={agency} value={agency}>
                    {agency}
                  </option>
                ))}
              </select>
              <select
                aria-label={intl.formatMessage({id: 'components.RouteViewer.modeFilter'})}
                id='mode'
                onBlur={this.onFilterChange}
                onChange={this.onFilterChange}
                value={filter.mode || ''}
              >
                <option value={''}>
                  {intl.formatMessage({
                    id: 'components.RouteViewer.allModes'
                  })}
                </option>
                {modes.map((mode) => (
                  <option key={mode} value={mode.toUpperCase()}>
                    {intl.formatMessage({
                      id: `common.otpTransitModes.${mode.toLowerCase()}`
                    })}
                  </option>
                ))}
              </select>
            </span>
            <span className='routeSearch'>
              <Icon type='search' />
              <input
                onChange={this.onSearchChange}
                placeholder={intl.formatMessage({
                  id: 'components.RouteViewer.findARoute'
                })}
                type='search'
                value={search}
              />
            </span>
          </section>
        </div>

        <div className='route-viewer-body'>
          {sortedRoutes.map((route) => {
            // Find operator based on agency_id (extracted from OTP route ID).
            const operator =
                        coreUtils.route.getTransitOperatorFromOtpRoute(
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
          })}
          {/* check modes length to differentiate between loading and over-filtered */}
          {modes.length > 0 && sortedRoutes.length === 0 && (
            <span className='noRoutesFoundMessage'>
              <FormattedMessage
                id={'components.RouteViewer.noFilteredRoutesFound'}
              />
            </span>
          )}
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
            {operator && operator.logo && (
              <OperatorImg alt={`${operator.name} logo`} src={operator.logo} />
            )}
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
        <VelocityTransitionGroup
          enter={{ animation: 'slideDown' }}
          leave={{ animation: 'slideUp' }}
        >
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
    agencies: getAgenciesFromRoutes(state),
    filter: state.otp.ui.routeViewer.filter,
    modes: getModesForActiveAgencyFilter(state),
    routes: getSortedFilteredRoutes(state),
    transitOperators: state.otp.config.transitOperators,
    viewedRoute: state.otp.ui.viewedRoute,
    viewedRouteObject: state.otp.transitIndex.routes?.[state.otp.ui.viewedRoute?.routeId]
  }
}

const mapDispatchToProps = {
  findRoute,
  findRoutes,
  getVehiclePositionsForRoute,
  setMainPanelContent,
  setRouteViewerFilter,
  setViewedRoute
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(RouteViewer))
