/* eslint-disable react/prop-types */
import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Filter } from '@styled-icons/fa-solid/Filter'
import { FormattedMessage, injectIntl } from 'react-intl'
import { getMostReadableTextColor } from '@opentripplanner/core-utils/lib/route'
import { Search } from '@styled-icons/fa-solid/Search'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import * as apiActions from '../../actions/api'
import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import {
  getAgenciesFromRoutes,
  getModesForActiveAgencyFilter,
  getSortedFilteredRoutes
} from '../../util/state'
import { getFormattedMode } from '../../util/i18n'
import {
  getModeFromRoute,
  getRouteColorBasedOnSettings
} from '../../util/viewer'
import { StyledIconWrapper } from '../util/styledIcon'

import { RouteName, RouteRow } from './RouteRow'
import RouteDetails from './route-details'

class RouteViewer extends Component {
  static propTypes = {
    agencies: PropTypes.array,
    filter: PropTypes.shape({
      agency: PropTypes.string,
      mode: PropTypes.string,
      search: PropTypes.string
    }),
    findRouteIfNeeded: PropTypes.func,
    getVehiclePositionsForRoute: PropTypes.func,
    hideBackButton: PropTypes.bool,
    modes: PropTypes.array,
    routes: PropTypes.array,
    setViewedRoute: PropTypes.func,
    transitOperators: PropTypes.array,
    viewedRoute: PropTypes.shape({
      patternId: PropTypes.string,
      routeId: PropTypes.string
    }),
    // Routes have many more properties, but none are guaranteed
    viewedRouteObject: PropTypes.shape({ id: PropTypes.string })
  }

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
      : this.props.setViewedRoute({
          ...this.props.viewedRoute,
          patternId: null
        })

  componentDidMount() {
    this.props.findRoutesIfNeeded()
  }

  /** Used to scroll to actively viewed route on load */
  componentDidUpdate() {
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
        this.setState({ initialRender: false })
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

  render() {
    const {
      agencies,
      filter,
      findRouteIfNeeded,
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
    const { ModeIcon, RouteRenderer } = this.context

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
      const routeColor = getRouteColorBasedOnSettings(operator, route)
      const textColor = getMostReadableTextColor(routeColor, route?.textColor)

      return (
        <div
          className="route-viewer"
          style={{
            backgroundColor: routeColor,
            color: textColor,
            fill: textColor
          }}
        >
          {/* Header Block */}
          <div
            className="route-viewer-header"
            style={{ backgroundColor: routeColor }}
          >
            {/* Always show back button, as we don't write a route anymore */}
            <div className="back-button-container">
              <Button bsSize="small" onClick={this._backClicked}>
                <StyledIconWrapper>
                  <ArrowLeft />
                </StyledIconWrapper>
                <FormattedMessage id="common.forms.back" />
              </Button>
            </div>

            <div className="header-text route-expanded">
              {route && !route.pending && ModeIcon && (
                <ModeIcon
                  aria-label={getFormattedMode(
                    getModeFromRoute(route).toLowerCase(),
                    intl
                  )}
                  mode={getModeFromRoute(route)}
                  width={22}
                />
              )}
              <RouteName
                basicRender
                route={route}
                RouteRenderer={RouteRenderer}
              />
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
    const operators =
      transitOperators.length > 0
        ? [...new Set(transitOperators.map((x) => x.name))]
        : agencies

    return (
      <div className="route-viewer">
        {/* Header Block */}
        <div className="route-viewer-header">
          {/* Back button */}
          {!hideBackButton && (
            <div className="back-button-container">
              <Button bsSize="small" onClick={this._backClicked}>
                <StyledIconWrapper>
                  <ArrowLeft />
                </StyledIconWrapper>
                <FormattedMessage id="common.forms.back" />
              </Button>
            </div>
          )}

          {/* Header Text */}
          <div className="header-text">
            <FormattedMessage id="components.RouteViewer.title" />
          </div>
          <div>
            <FormattedMessage id="components.RouteViewer.details" />
          </div>
          <section className="search-and-filter">
            <span className="routeFilter">
              <StyledIconWrapper>
                <Filter />
              </StyledIconWrapper>
              <select
                aria-label={intl.formatMessage({
                  id: 'components.RouteViewer.agencyFilter'
                })}
                id="agency"
                onBlur={this.onFilterChange}
                onChange={this.onFilterChange}
                value={filter.agency || ''}
              >
                <option value="">
                  {intl.formatMessage({
                    id: 'components.RouteViewer.allAgencies'
                  })}
                </option>
                {operators.map((operator) => (
                  <option key={operator} value={operator}>
                    {operator}
                  </option>
                ))}
              </select>
              <select
                aria-label={intl.formatMessage({
                  id: 'components.RouteViewer.modeFilter'
                })}
                id="mode"
                onBlur={this.onFilterChange}
                onChange={this.onFilterChange}
                value={filter.mode || ''}
              >
                <option value="">
                  {intl.formatMessage({
                    id: 'components.RouteViewer.allModes'
                  })}
                </option>
                {modes.map((mode) => (
                  <option key={mode} value={mode.toUpperCase()}>
                    {getFormattedMode(mode.toLowerCase(), intl)}
                  </option>
                ))}
              </select>
            </span>
            <span className="routeSearch">
              <StyledIconWrapper>
                <Search />
              </StyledIconWrapper>
              <input
                onChange={this.onSearchChange}
                placeholder={intl.formatMessage({
                  id: 'components.RouteViewer.findARoute'
                })}
                type="search"
                value={search}
              />
            </span>
          </section>
        </div>

        <div className="route-viewer-body">
          {sortedRoutes.map((route) => {
            // Find operator based on agency_id (extracted from OTP route ID).
            const operator =
              coreUtils.route.getTransitOperatorFromOtpRoute(
                route,
                transitOperators
              ) || {}
            return (
              <RouteRow
                findRouteIfNeeded={findRouteIfNeeded}
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
            <span className="noRoutesFoundMessage">
              <FormattedMessage id="components.RouteViewer.noFilteredRoutesFound" />
            </span>
          )}
        </div>
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state) => {
  return {
    agencies: getAgenciesFromRoutes(state),
    filter: state.otp.ui.routeViewer.filter,
    modes: getModesForActiveAgencyFilter(state),
    routes: getSortedFilteredRoutes(state),
    transitOperators: state.otp.config.transitOperators,
    viewedRoute: state.otp.ui.viewedRoute,
    viewedRouteObject:
      state.otp.transitIndex.routes?.[state.otp.ui.viewedRoute?.routeId]
  }
}

const mapDispatchToProps = {
  findRouteIfNeeded: apiActions.findRouteIfNeeded,
  findRoutesIfNeeded: apiActions.findRoutesIfNeeded,
  getVehiclePositionsForRoute: apiActions.getVehiclePositionsForRoute,
  setMainPanelContent: uiActions.setMainPanelContent,
  setRouteViewerFilter: uiActions.setRouteViewerFilter,
  setViewedRoute: uiActions.setViewedRoute
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RouteViewer))
