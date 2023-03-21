// FIXME: typescript
/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { getMostReadableTextColor } from '@opentripplanner/core-utils/lib/route'
import { Link } from '@styled-icons/fa-solid/Link'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import {
  extractHeadsignFromPattern,
  getRouteColorBasedOnSettings
} from '../../util/viewer'
import {
  findStopsForPattern,
  getVehiclePositionsForRoute
} from '../../actions/api'
import { getOperatorName } from '../../util/state'
import { setHoveredStop, setViewedRoute, setViewedStop } from '../../actions/ui'
import { StyledIconWrapper } from '../util/styledIcon'

import {
  Container,
  HeadsignSelectLabel,
  LogoLinkContainer,
  PatternContainer,
  RouteNameContainer,
  Stop,
  StopContainer,
  StopLink
} from './styled'

class RouteDetails extends Component {
  static propTypes = {
    findStopsForPattern: findStopsForPattern.type,
    operator: PropTypes.shape({
      defaultRouteColor: PropTypes.string,
      defaultRouteTextColor: PropTypes.string,
      longNameSplitter: PropTypes.string
    }),
    // There are more items in pattern and route, but none mandatory
    pattern: PropTypes.shape({ id: PropTypes.string }),
    route: PropTypes.shape({ id: PropTypes.string }),
    setHoveredStop: setHoveredStop.type,
    setViewedRoute: setViewedRoute.type,
    vehiclePositionRefreshSeconds: PropTypes.number
  }

  state = {
    refreshTimer: null
  }

  refreshVehiclePositions = () => {
    const { getVehiclePositionsForRoute, route } = this.props
    getVehiclePositionsForRoute(route.id)
  }

  componentDidMount = () => {
    const { vehiclePositionRefreshSeconds } = this.props

    // Fetch vehicle positions when initially showing component.
    this.refreshVehiclePositions()

    // Refresh vehicle positions per interval set in config.
    this.setState({
      refreshTimer: setInterval(
        this.refreshVehiclePositions,
        vehiclePositionRefreshSeconds * 1000
      )
    })
  }

  componentWillUnmount = () => {
    // Stop refreshing vehicle positions for the specified route when this component unmounts.
    const { refreshTimer } = this.state
    if (refreshTimer) {
      clearInterval(refreshTimer)
      this.setState({ refreshTimer: null })
    }
  }

  /**
   * Requests stop list for current pattern
   */
  getStops = () => {
    const { findStopsForPattern, pattern, route } = this.props
    if (pattern && route) {
      findStopsForPattern({ patternId: pattern.id, routeId: route.id })
    }
  }

  /**
   * If a headsign link is clicked, set that pattern in redux state so that the
   * view can adjust
   */
  _headSignButtonClicked = (e) => {
    const { target } = e
    const { value: id } = target
    const { route, setViewedRoute } = this.props
    setViewedRoute({ patternId: id, routeId: route.id })
  }

  /**
   * If a stop link is clicked, redirect to stop viewer
   */
  _stopLinkClicked = (stopId) => {
    const { setViewedStop } = this.props
    setViewedStop({ stopId })
  }

  render() {
    const { intl, operator, pattern, route, setHoveredStop, viewedRoute } =
      this.props
    const { agency, patterns, shortName, url } = route

    const routeColor = getRouteColorBasedOnSettings(operator, route)

    const headsigns =
      patterns &&
      Object.entries(patterns)
        .map((pattern) => {
          return {
            geometryLength: pattern[1].geometry?.length,
            headsign: extractHeadsignFromPattern(pattern[1], shortName),
            id: pattern[0]
          }
        })
        // Remove duplicate headsigns. Using a reducer means that the first pattern
        // with a specific headsign is the accepted one. TODO: is this good behavior?
        .reduce((prev, cur) => {
          const amended = prev
          const alreadyExistingIndex = prev.findIndex(
            (h) => h.headsign === cur.headsign
          )
          // If the item we're replacing has less geometry, replace it!
          if (alreadyExistingIndex >= 0) {
            // Only replace if new pattern has greater geometry
            if (
              amended[alreadyExistingIndex].geometryLength < cur.geometryLength
            ) {
              amended[alreadyExistingIndex] = cur
            }
          } else {
            amended.push(cur)
          }
          return amended
        }, [])
        .sort((a, b) => {
          // sort by number of vehicles on that pattern
          const aVehicleCount = route.vehicles?.filter(
            (vehicle) => vehicle.patternId === a.id
          ).length
          const bVehicleCount = route.vehicles?.filter(
            (vehicle) => vehicle.patternId === b.id
          ).length

          // if both have the same count, sort by pattern geometry length
          if (aVehicleCount === bVehicleCount) {
            return b.geometryLength - a.geometryLength
          }
          return bVehicleCount - aVehicleCount
        })

    // if no pattern is set, we are in the routeRow
    return (
      <Container
        backgroundColor={routeColor}
        full={pattern != null}
        textColor={getMostReadableTextColor(routeColor, route?.textColor)}
      >
        <RouteNameContainer>
          <LogoLinkContainer>
            {agency && (
              <>
                {/** TODO: use <OperatorLogo /> here? */}
                <FormattedMessage
                  id="components.RouteDetails.operatedBy"
                  values={{
                    agencyName: getOperatorName(operator, route)
                  }}
                />
              </>
            )}
            {url && (
              <a
                href={url}
                rel="noreferrer"
                style={{
                  color: getMostReadableTextColor(routeColor, route?.textColor),
                  whiteSpace: 'nowrap'
                }}
                target="_blank"
              >
                <StyledIconWrapper>
                  <Link />
                </StyledIconWrapper>
                <FormattedMessage id="components.RouteDetails.moreDetails" />
              </a>
            )}
          </LogoLinkContainer>
        </RouteNameContainer>
        {headsigns && headsigns.length > 0 && (
          <PatternContainer>
            <HeadsignSelectLabel
              htmlFor="headsign-selector"
              id="headsign-selector-label"
            >
              <FormattedMessage id="components.RouteDetails.stopsTo" />
            </HeadsignSelectLabel>
            <select
              id="headsign-selector"
              name="headsigns"
              onBlur={this._headSignButtonClicked}
              onChange={this._headSignButtonClicked}
              value={viewedRoute?.patternId}
            >
              {!viewedRoute?.patternId && (
                <option value="">
                  {intl.formatMessage({
                    id: 'components.RouteDetails.selectADirection'
                  })}
                </option>
              )}
              {headsigns.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.headsign}
                </option>
              ))}
            </select>
          </PatternContainer>
        )}
        {pattern && (
          <>
            <h2
              style={{
                fontSize: 'inherit',
                fontWeight: '400',
                margin: '0 0 10px 8px'
              }}
            >
              <FormattedMessage id="components.RouteViewer.stopsInDirectionOfTravel" />
            </h2>
            <StopContainer
              backgroundColor={routeColor}
              onMouseLeave={() => setHoveredStop(null)}
              textColor={getMostReadableTextColor(routeColor, route?.textColor)}
            >
              {pattern?.stops?.map((stop) => (
                <Stop
                  key={stop.id}
                  onClick={() => this._stopLinkClicked(stop.id)}
                  onFocus={() => setHoveredStop(stop.id)}
                  onMouseOver={() => setHoveredStop(stop.id)}
                  routeColor={
                    routeColor.includes('ffffff') ? '#333' : routeColor
                  }
                  textColor={getMostReadableTextColor(
                    routeColor,
                    route?.textColor
                  )}
                >
                  <StopLink
                    onClick={() => this._stopLinkClicked(stop.id)}
                    textColor={getMostReadableTextColor(
                      routeColor,
                      route?.textColor
                    )}
                  >
                    {stop.name}
                  </StopLink>
                </Stop>
              ))}
            </StopContainer>
          </>
        )}
      </Container>
    )
  }
}

// connect to redux store
const mapStateToProps = (state) => {
  return {
    vehiclePositionRefreshSeconds:
      state.otp.config.routeViewer?.vehiclePositionRefreshSeconds || 30,
    viewedRoute: state.otp.ui.viewedRoute
  }
}

const mapDispatchToProps = {
  findStopsForPattern,
  getVehiclePositionsForRoute,
  setHoveredStop,
  setViewedRoute,
  setViewedStop
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RouteDetails))
