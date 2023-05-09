import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Filter } from '@styled-icons/fa-solid/Filter'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { Route, TransitOperator } from '@opentripplanner/types'
import { Search } from '@styled-icons/fa-solid/Search'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component, FormEvent } from 'react'

import * as apiActions from '../../actions/api'
import * as uiActions from '../../actions/ui'
import {
  getAgenciesFromRoutes,
  getModesForActiveAgencyFilter,
  getSortedFilteredRoutes
} from '../../util/state'
import { getFormattedMode } from '../../util/i18n'
import { getRouteOrPatternViewerTitle } from '../../util/viewer'
import {
  SetViewedRouteHandler,
  ViewedRouteObject,
  ViewedRouteState
} from '../util/types'
import { StyledIconWrapper } from '../util/styledIcon'
import PageTitle from '../util/page-title'

import { RouteRow } from './RouteRow'
import VehiclePositionRetriever from './vehicle-position-retriever'

interface FilterProps {
  agency?: string
  mode?: string
  search?: string
}

interface Props {
  agencies: string[]
  filter: FilterProps
  // Not really worried about the args for findRoute(s)IfNeeded.
  findRouteIfNeeded: () => void
  findRoutesIfNeeded: () => void
  hideBackButton?: boolean
  hideHeader?: boolean
  intl: IntlShape
  modes: string[]
  routes: Route[]
  setMainPanelContent: (panelId: number | null) => void
  setRouteViewerFilter: (filter: FilterProps) => void
  setViewedRoute: SetViewedRouteHandler
  transitOperators: TransitOperator[]
  viewedRoute?: ViewedRouteState
  viewedRouteObject?: ViewedRouteObject
}

interface State {
  initialRender: boolean
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
      hideBackButton,
      hideHeader,
      intl,
      modes,
      routes: sortedRoutes,
      setViewedRoute,
      transitOperators,
      viewedRoute,
      viewedRouteObject
    } = this.props

    const { initialRender } = this.state
    const { search } = filter
    const operators =
      transitOperators.length > 0
        ? Array.from(new Set(transitOperators.map((x) => x.name)))
        : agencies

    const searchRouteText = intl.formatMessage({
      id: 'components.RouteViewer.findARoute'
    })

    return (
      <div className="route-viewer">
        <VehiclePositionRetriever />
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

        <ul className="route-viewer-body">
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
        </ul>
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state: any) => {
  const { viewedRoute } = state.otp.ui
  return {
    agencies: getAgenciesFromRoutes(state),
    filter: state.otp.ui.routeViewer.filter,
    modes: getModesForActiveAgencyFilter(state),
    routes: getSortedFilteredRoutes(state),
    transitOperators: state.otp.config.transitOperators,
    viewedRoute,
    viewedRouteObject: state.otp.transitIndex.routes?.[viewedRoute?.routeId]
  }
}

const mapDispatchToProps = {
  findRouteIfNeeded: apiActions.findRouteIfNeeded,
  findRoutesIfNeeded: apiActions.findRoutesIfNeeded,
  setMainPanelContent: uiActions.setMainPanelContent,
  setRouteViewerFilter: uiActions.setRouteViewerFilter,
  setViewedRoute: uiActions.setViewedRoute
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RouteViewer))
