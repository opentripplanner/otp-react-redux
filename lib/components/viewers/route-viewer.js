import coreUtils from '@opentripplanner/core-utils'
import React, { Component, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Label, Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { FormattedMessage, injectIntl } from 'react-intl'

import Icon from '../util/icon'
import { getVehiclePositionsForRoute, findRoutes, findRoute } from '../../actions/api'
import { getColorAndNameFromRoute, getModeFromRoute } from '../../util/viewer'
import {
  setMainPanelContent,
  setViewedRoute,
  setRouteViewerFilter
} from '../../actions/ui'
import {
  getAgenciesFromRoutes,
  getModesForActiveAgencyFilter,
  getSortedFilteredRoutes
} from '../../util/state'
import { ComponentContext } from '../../util/contexts'

import RouteDetails from './route-details'

class RouteViewer extends Component {
  static propTypes = {
    agencies: PropTypes.array,
    filter: PropTypes.shape({
      agency: PropTypes.string,
      mode: PropTypes.string,
      search: PropTypes.string
    }),
    findRoute: findRoute.type,
    getVehiclePositionsForRoute: getVehiclePositionsForRoute.type,
    hideBackButton: PropTypes.bool,
    modes: PropTypes.array,
    routes: PropTypes.array,
    setViewedRoute: setViewedRoute.type,
    transitOperators: PropTypes.array,
    viewedRoute: PropTypes.shape({
      patternId: PropTypes.string,
      routeId: PropTypes.string
    }),
    // Routes have many more properties, but none are guaranteed
    viewedRouteObject: PropTypes.shape({ id: PropTypes.string })
  };

  state = {
    /** Used to track if all routes have been rendered */
    initialRender: true
  }

  static contextType = ComponentContext

  /**
   * If we're viewing a pattern's stops, route to
   * main route viewer, otherwise go back to main view
   */
  _backClicked = () =>
    this.props.viewedRoute === null
      ? this.props.setMainPanelContent(null)
      : this.props.setViewedRoute({...this.props.viewedRoute, patternId: null});

  componentDidMount () {
    const { findRoutes } = this.props
    findRoutes()
  }

  /** Used to scroll to actively viewed route on load */
  componentDidUpdate () {
    const { routes } = this.props
    const { initialRender } = this.state

    // Wait until more than the one route is present.
    // This ensures that there is something to scroll past!
    if (initialRender && routes.length > 1) {
      // Using requestAnimationFrame() ensures that the scroll only happens once
      // paint is complete
      window.requestAnimationFrame(() => {
        // Setting initialRender to false ensures that routeRow will not initiate
        // any more scrolling
        this.setState({initialRender: false})
      })
    }
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
    this.props.setRouteViewerFilter({ [id]: value })
  }

  /**
   * Update search state when user updates search field
   */
  onSearchChange = (event) => {
    const { target } = event
    const { value } = target
    this.props.setRouteViewerFilter({ search: value })
  }

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

    const { initialRender } = this.state
    const { ModeIcon } = this.context

    // If patternId is present, we're looking at a specific pattern's stops
    if (viewedRoute?.patternId && viewedRouteObject) {
      const { patternId } = viewedRoute
      const route = viewedRouteObject
      // Find operator based on agency_id (extracted from OTP route ID).
      const operator =
        coreUtils.route.getTransitOperatorFromOtpRoute(
          route,
          transitOperators
        ) || {}

      return (
        <div className='route-viewer'>
          {/* Header Block */}
          <div
            className='route-viewer-header'
          >
            {/* Always show back button, as we don't write a route anymore */}
            <div className='back-button-container'>
              <Button bsSize='small' onClick={this._backClicked}>
                <Icon type='arrow-left' />
                <FormattedMessage id='common.navigation.back' />
              </Button>
            </div>

            <div className='header-text route-expanded'>
              {route && ModeIcon && (
                <ModeIcon
                  aria-label={getModeFromRoute(route)}
                  mode={getModeFromRoute(route)}
                  width={22}
                />
              )}
              <RouteName operator={operator} route={route} />
            </div>
          </div>
          <RouteDetails
            operator={operator}
            pattern={route?.patterns?.[patternId]}
            route={route}
          />
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
          <div>
            <FormattedMessage id='components.RouteViewer.details' />
          </div>
          <section className='search-and-filter'>
            <span className='routeFilter'>
              <Icon type='filter' />
              <select
                aria-label={intl.formatMessage({
                  id: 'components.RouteViewer.agencyFilter'
                })}
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
                aria-label={intl.formatMessage({
                  id: 'components.RouteViewer.modeFilter'
                })}
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
                initialRender={initialRender}
                intl={intl}
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
  background-color: white;
  border-bottom: 1px solid gray;
`

const RouteRowButton = styled(Button)`
  align-items: center;
  display: flex;
  padding: 6px;
  width: 100%;
  transition: all ease-in-out 0.1s;
`

const RouteRowElement = styled.span``

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
  background-color: ${(props) =>
    props.backgroundColor === '#ffffff' || props.backgroundColor === 'white'
      ? 'rgba(0,0,0,0)'
      : props.backgroundColor};
  color: ${(props) => props.color};
  flex: 0 1 auto;
  font-size: medium;
  font-weight: 400;
  margin-left: ${(props) =>
    props.backgroundColor === '#ffffff' || props.backgroundColor === 'white'
      ? 0
      : '8px'};
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RouteName = ({operator, route}) => {
  const { backgroundColor, color, longName } = getColorAndNameFromRoute(
    operator,
    route
  )
  return (
    <RouteNameElement
      backgroundColor={backgroundColor}
      color={color}
      title={`${route.shortName} ${longName}`}
    >
      <b>{route.shortName}</b> {longName}
    </RouteNameElement>
  )
}

class RouteRow extends PureComponent {
  static contextType = ComponentContext

  constructor (props) {
    super(props)
    // Create a ref used to scroll to
    this.activeRef = React.createRef()
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

  componentDidUpdate () {
    /*
       If the initial route row list is being rendered and there is an active
       route, scroll to it. The initialRender prop prohibits the row being scrolled to
       if the user has clicked on a route
    */
    if (this.props.isActive && this.props.initialRender) {
      this.activeRef.current.scrollIntoView()
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
    const { intl, isActive, operator, route } = this.props
    const { ModeIcon } = this.context

    return (
      <StyledRouteRow
        isActive={isActive}
        ref={this.activeRef}
      >
        <RouteRowButton
          className='clear-button-formatting'
          isActive={isActive}
          onClick={this._onClick}
        >
          <RouteRowElement>
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
          </RouteRowElement>
          <ModeIconElement>
            <ModeIcon
              aria-label={getModeFromRoute(route)}
              height={22}
              mode={getModeFromRoute(route)}
              width={22}
            />
          </ModeIconElement>
          <RouteName
            operator={operator}
            route={route}
          />
        </RouteRowButton>
        <VelocityTransitionGroup
          enter={{ animation: 'slideDown' }}
          leave={{ animation: 'slideUp' }}
        >
          {isActive && <RouteDetails operator={operator} route={route} />}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RouteViewer))
