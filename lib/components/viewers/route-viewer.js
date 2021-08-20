import coreUtils from '@opentripplanner/core-utils'
import React, { Component, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Label, Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { FormattedMessage, injectIntl } from 'react-intl'

import Icon from '../narrative/icon'
import { setMainPanelContent, setViewedRoute, setRouteViewerFilter } from '../../actions/ui'
import { findRoutes, findRoute } from '../../actions/api'
import { getFilteredRoutes, getModesForActiveAgencyFilter, getAgenciesFromRoutes } from '../../util/state'
import { ComponentContext } from '../../util/contexts'
import { getModeFromRoute } from '../../util/viewer'

/**
 * Determine the appropriate contrast color for text (white or black) based on
 * the input hex string (e.g., '#ff00ff') value.
 *
 * From https://stackoverflow.com/a/11868398/915811
 *
 * TODO: Move to @opentripplanner/core-utils once otp-rr uses otp-ui library.
 */
function getContrastYIQ (hexcolor) {
  hexcolor = hexcolor.replace('#', '')
  const r = parseInt(hexcolor.substr(0, 2), 16)
  const g = parseInt(hexcolor.substr(2, 2), 16)
  const b = parseInt(hexcolor.substr(4, 2), 16)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return (yiq >= 128) ? '000000' : 'ffffff'
}

class RouteViewer extends Component {
  static propTypes = {
    agencies: PropTypes.array,
    hideBackButton: PropTypes.bool,
    modes: PropTypes.array,
    routes: PropTypes.array
  };

  state = {
    search: ''
  };

  _backClicked = () => this.props.setMainPanelContent(null);

  componentDidMount () {
    this.props.findRoutes()
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
    // Search field state is duplicated to ensure there is no
    // input lag while the redux store updates
    this.setState({ search: value })
    this.props.setRouteViewerFilter({ search: value })
  };

  render () {
    const {
      agencies,
      filter,
      findRoute,
      hideBackButton,
      intl,
      modes,
      routes,
      setViewedRoute,
      transitOperators,
      viewedRoute
    } = this.props
    const { search } = this.state

    const sortedRoutes = routes.sort(
      coreUtils.route.makeRouteComparator(transitOperators)
    )

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
                aria-label='Agency Filter'
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
              {/* Do not show a mode selector that can't change anything */}
              {modes.length > 2 && (
                <select
                  aria-label='Mode Filter'
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
              )}
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
                isActive={
                  viewedRoute && viewedRoute.routeId === route.id
                }
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
  background-color: ${props => props.isActive ? '#f6f8fa' : 'white'};
  border-bottom: 1px solid gray;
`

const RouteRowButton = styled(Button)`
  align-items: center;
  display: flex;
  padding: 6px;
  width: 100%;
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

const RouteDetails = styled.div`
  padding: 8px;
`

class RouteRow extends PureComponent {
  static contextType = ComponentContext

  _onClick = () => {
    const { findRoute, isActive, route, setViewedRoute } = this.props
    if (isActive) {
      // Deselect current route if active.
      setViewedRoute({ routeId: null })
    } else {
      // Otherwise, set active and fetch route patterns.
      findRoute({ routeId: route.id })
      setViewedRoute({ routeId: route.id })
    }
  }

  getCleanRouteLongName ({ longNameSplitter, route }) {
    let longName = ''
    if (route.longName) {
      // Attempt to split route name if splitter is defined for operator (to
      // remove short name value from start of long name value).
      const nameParts = route.longName.split(longNameSplitter)
      longName =
        longNameSplitter && nameParts.length > 1
          ? nameParts[1]
          : route.longName
      // If long name and short name are identical, set long name to be an empty
      // string.
      if (longName === route.shortName) longName = ''
    }
    return longName
  }

  render () {
    const { isActive, operator, route } = this.props
    const { ModeIcon } = this.context

    const { defaultRouteColor, defaultRouteTextColor, longNameSplitter } =
      operator || {}
    const backgroundColor = `#${defaultRouteColor || route.color || 'ffffff'}`
    // NOTE: text color is not a part of short response route object, so there
    // is no way to determine from OTP what the text color should be if the
    // background color is, say, black. Instead, determine the appropriate
    // contrast color and use that if no text color is available.
    const contrastColor = getContrastYIQ(backgroundColor)
    const color = `#${defaultRouteTextColor ||
      route.textColor ||
      contrastColor}`
    // Default long name is empty string (long name is an optional GTFS value).
    const longName = this.getCleanRouteLongName({ longNameSplitter, route })
    return (
      <StyledRouteRow isActive={isActive}>
        <RouteRowButton
          className='clear-button-formatting'
          onClick={this._onClick}
        >
          <RouteRowElement>
            {operator && operator.logo && (
              <OperatorImg alt={`${operator.name} logo`} src={operator.logo} />
            )}
          </RouteRowElement>
          <ModeIconElement>
            <ModeIcon height={22} label={getModeFromRoute(route)} mode={getModeFromRoute(route)} width={22} />
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
            <RouteDetails>
              {route.url ? (
                <a href={route.url} target='_blank'>
                  Route Details
                </a>
              ) : (
                <FormattedMessage id='noRouteUrl' />
              )}
            </RouteDetails>
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
    routes: getFilteredRoutes(state),
    transitOperators: state.otp.config.transitOperators,
    viewedRoute: state.otp.ui.viewedRoute
  }
}

const mapDispatchToProps = {
  findRoute,
  findRoutes,
  setMainPanelContent,
  setRouteViewerFilter,
  setViewedRoute
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(RouteViewer))
