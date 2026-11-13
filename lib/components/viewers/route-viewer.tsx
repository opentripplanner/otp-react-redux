import { connect } from 'react-redux'
import { Filter } from '@styled-icons/fa-solid/Filter'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { Route } from '@opentripplanner/types'
import { Search } from '@styled-icons/fa-solid/Search'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component, FormEvent } from 'react'

import * as apiActions from '../../actions/api'
import * as uiActions from '../../actions/ui'
import { AppReduxState, RouteViewerFilter } from '../../util/state-types'
import {
  getAgenciesFromRoutes,
  getModesForActiveAgencyFilter,
  getSortedFilteredRoutes
} from '../../util/state'
import { getFormattedMode } from '../../util/i18n'
import { getRouteOrPatternViewerTitle } from '../../util/viewer'
import { isBlank } from '../../util/ui'
import { StyledIconWrapper } from '../util/styledIcon'
import { TransitOperatorConfig } from '../../util/config-types'
import { ViewedRouteObject, ViewedRouteState } from '../util/types'
import InjectUrlParams from '../util/inject-url-params'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import PageTitle from '../util/page-title'

import { RouteRow } from './route-row'
import VehiclePositionRetriever from './vehicle-position-retriever'

interface Props {
  agencies: string[]
  filter: RouteViewerFilter
  // Not really worried about the args for findRouteIfNeeded.
  findRouteIfNeeded: () => void
  hideHeader?: boolean
  intl: IntlShape
  modes: string[]
  routes: Route[]
  rvMode?: string
  setMainPanelContent: (panelId: number | null) => void
  setRouteViewerFilter: (filter: RouteViewerFilter) => void
  setRouteViewerFilterFromUrl: () => void
  transitOperators: TransitOperatorConfig[]
  viewedRoute?: ViewedRouteState
  viewedRouteObject?: ViewedRouteObject
}

interface State {
  initialRender: boolean
}

/**
 * Maps filter params into their URL counterparts.
 * This is used to avoid conflicts with existing URL params.
 */
function toUrlParams({ agency, mode, search }: RouteViewerFilter) {
  return {
    rvAgency: agency,
    rvMode: mode,
    rvSearch: isBlank(search) ? null : search
  }
}

class RouteViewer extends Component<Props, State> {
  state = {
    /** Used to track if all routes have been rendered */
    initialRender: true
  }

  /**
   * Route back to main view.
   */
  _backClicked = () => this.props.setMainPanelContent(null)

  /** Used to scroll to actively viewed route on load */
  componentDidUpdate(prevProps: Props) {
    const { filter, routes, rvMode, setRouteViewerFilterFromUrl } = this.props
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

    // Attempt to apply the mode URL filter param if provided,
    // especially after routes fetching is complete.
    // That param can get overwritten in setRouteViewerFilter if routes have not been loaded or
    // no previously loaded routes are of the desired mode.
    const routesHaveBeenFetched =
      prevProps.routes.length === 0 && routes.length !== 0
    if (rvMode && isBlank(filter.mode) && routesHaveBeenFetched) {
      setRouteViewerFilterFromUrl()
    }
  }

  /**
   * Handle filter dropdown change. Id of the filter is equivalent to the key in the
   * route object
   */
  onFilterChange = (event: FormEvent) => {
    const { eventPhase, target } = event
    // If the dropdown changes without user interaction, don't update!
    // see https://developer.mozilla.org/en-US/docs/Web/API/Event/eventPhase
    if (eventPhase !== Event.BUBBLING_PHASE) {
      return
    }
    const { id, value } = target as HTMLSelectElement
    // id will be either 'agency' or 'mode' based on the dropdown used
    this.props.setRouteViewerFilter({ [id]: value })
  }

  /**
   * Update search state when user updates search field
   */
  onSearchChange = (event: FormEvent) => {
    const { target } = event
    const { value } = target as HTMLInputElement
    this.props.setRouteViewerFilter({ search: value })
  }

  render() {
    const {
      agencies,
      filter,
      findRouteIfNeeded,
      hideHeader,
      intl,
      modes,
      routes: sortedRoutes,
      transitOperators,
      viewedRoute,
      viewedRouteObject
    } = this.props

    const { initialRender } = this.state
    const { agency, mode, search } = filter
    const operators =
      transitOperators.length > 0
        ? Array.from(new Set(transitOperators.map((x) => x.name)))
        : agencies

    const searchRouteText = intl.formatMessage({
      id: 'components.RouteViewer.findARoute'
    })

    const listOfFilters = [
      agency,
      mode ? getFormattedMode(mode, intl) : null,
      search
    ].filter(Boolean)

    const noFilter = listOfFilters.length === 0

    return (
      <div className="route-viewer">
        <VehiclePositionRetriever />
        <InjectUrlParams params={toUrlParams(this.props.filter)} />
        <PageTitle
          title={getRouteOrPatternViewerTitle(
            transitOperators,
            viewedRouteObject,
            null,
            intl
          )}
        />
        {/* Header Block */}
        <div className="route-viewer-header">
          {/* Header Text */}
          {!hideHeader && (
            <h1 className="header-text">
              <FormattedMessage id="components.RouteViewer.title" />
            </h1>
          )}
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
                aria-label={searchRouteText}
                onChange={this.onSearchChange}
                placeholder={searchRouteText}
                type="search"
                value={search}
              />
            </span>
          </section>
        </div>
        <InvisibleA11yLabel as="div" role="status">
          {noFilter ? (
            <FormattedMessage id="components.RouteViewer.noRouteFilter" />
          ) : (
            <FormattedMessage
              id="components.RouteViewer.routesFilteredBy"
              values={{
                list: intl.formatList(listOfFilters, { type: 'conjunction' })
              }}
            />
          )}
        </InvisibleA11yLabel>
        <ul className="route-viewer-body">
          {sortedRoutes
            .filter((route) => !!route.id)
            .map((route) => {
              // Find operator based on agency_id (extracted from OTP route ID).
              const operator = coreUtils.route.getTransitOperatorFromOtpRoute(
                route,
                transitOperators
              ) as TransitOperatorConfig
              return (
                <RouteRow
                  findRouteIfNeeded={findRouteIfNeeded}
                  initialRender={initialRender}
                  intl={intl}
                  isActive={viewedRoute && viewedRoute.routeId === route.id}
                  key={route.id}
                  operator={operator}
                  route={route}
                />
              )
            })}
          {/* check modes length to differentiate between loading and over-filtered */}
          {modes.length > 0 && sortedRoutes.length === 0 && (
            <span className="noRoutesFoundMessage">
              <FormattedMessage id="components.RouteViewer.noFilteredRoutesFound" />
            </span>
          )}
        </ul>
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state: AppReduxState) => {
  const { viewedRoute } = state.otp.ui
  const { rvMode } = state.router.location.query
  return {
    agencies: getAgenciesFromRoutes(state),
    filter: state.otp.ui.routeViewer.filter,
    modes: getModesForActiveAgencyFilter(state),
    routes: getSortedFilteredRoutes(state),
    rvMode,
    transitOperators: state.otp.config.transitOperators || [],
    viewedRoute,
    viewedRouteObject: state.otp.transitIndex.routes?.[viewedRoute?.routeId]
  }
}

const mapDispatchToProps = {
  findRouteIfNeeded: apiActions.findRouteIfNeeded,
  setMainPanelContent: uiActions.setMainPanelContent,
  setRouteViewerFilter: uiActions.setRouteViewerFilter,
  setRouteViewerFilterFromUrl: uiActions.setRouteViewerFilterFromUrl
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RouteViewer))
