import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import Icon from '../narrative/icon'
import { extractHeadsignFromPattern, getColorAndNameFromRoute } from '../../util/viewer'
import { getVehiclePositionsForRoute, findStopsForPattern } from '../../actions/api'
import { setHoveredStop, setViewedStop, setViewedRoute } from '../../actions/ui'

import {
  Container,
  RouteNameContainer,
  LogoLinkContainer,
  MoreDetailsLink,
  PatternContainer,
  StopContainer,
  Stop
} from './styled'

class RouteDetails extends Component {
  static propTypes = {
    className: PropTypes.string,
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
    setViewedRoute: setViewedRoute.type
  };

  componentDidMount = () => {
    const { getVehiclePositionsForRoute, pattern, route } = this.props
    if (!route.vehicles) {
      getVehiclePositionsForRoute(route.id)
    }
    if (!pattern?.stops) { this.getStops() }
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.pattern?.id !== this.props.pattern?.id) {
      this.getStops()
    }
  };

  /**
   * Requests stop list for current pattern
   */
  getStops = () => {
    const { findStopsForPattern, pattern, route } = this.props
    if (pattern && route) {
      findStopsForPattern({ patternId: pattern.id, routeId: route.id })
    }
  };

  /**
   * If a headsign link is clicked, set that pattern in redux state so that the
   * view can adjust
   */
  _headSignButtonClicked = (id) => {
    const { route, setViewedRoute } = this.props
    setViewedRoute({ patternId: id, routeId: route.id })
  };

  /**
   * If a stop link is clicked, redirect to stop viewer
   */
  _stopLinkClicked = (stopId) => {
    const { setViewedStop } = this.props
    setViewedStop({ stopId })
  };

  render () {
    const { className, operator, pattern, route, setHoveredStop } = this.props
    const { agency, patterns, url } = route

    const {
      backgroundColor: routeColor,
      color: textColor
    } = getColorAndNameFromRoute(operator, route)

    const headsigns =
      patterns &&
      Object.entries(patterns)
        .map((pattern) => {
          return {
            geometryLength: pattern[1].geometry?.length,
            headsign: extractHeadsignFromPattern(pattern[1]),
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

    return (
      <Container backgroundColor={routeColor} textColor={textColor}>
        <RouteNameContainer className={className} textColor={textColor}>
          <LogoLinkContainer backgroundColor={routeColor}>
            {agency && <span><FormattedMessage
              id='components.RouteDetails.runBy'
              values={{
                agencyName: agency.name
              }}
            /></span>}
            {url && (
              <span>
                <MoreDetailsLink color={textColor} href={url} target='_blank'>
                  <Icon type='link' />
                  <FormattedMessage id='components.RouteDetails.moreDetails' />
                </MoreDetailsLink>
              </span>
            )}
          </LogoLinkContainer>
        </RouteNameContainer>
        <PatternContainer color={routeColor} textColor={textColor}>
          <h4><FormattedMessage id='components.RouteDetails.stopsTo' /></h4>
          {headsigns &&
            headsigns.map((h) => (
              <Button
                bsStyle='link'
                className={h.id === pattern?.id ? 'active' : ''}
                key={h.id}
                onClick={() => this._headSignButtonClicked(h.id)}
              >
                {h.headsign}
              </Button>
            ))}
        </PatternContainer>
        {pattern && (
          <StopContainer
            onMouseLeave={() => setHoveredStop(null)}
            routeColor={routeColor}
          >
            {pattern?.stops?.map((stop) => (
              <Stop
                key={stop.id}
                onClick={() => this._stopLinkClicked(stop.id)}
                onFocus={() => setHoveredStop(stop.id)}
                onMouseOver={() => setHoveredStop(stop.id)}
                routeColor={routeColor.includes('ffffff') ? '#333' : routeColor}
              >
                {stop.name}
              </Stop>
            ))}
          </StopContainer>
        )}
      </Container>
    )
  }
}

// connect to redux store
const mapStateToProps = (state, ownProps) => {
  return {
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

export default connect(mapStateToProps, mapDispatchToProps)(RouteDetails)
