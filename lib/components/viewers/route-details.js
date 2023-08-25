// FIXME: typescript
/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { getMostReadableTextColor } from '@opentripplanner/core-utils/lib/route'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as uiActions from '../../actions/ui'
import {
  extractHeadsignFromPattern,
  getRouteColorBasedOnSettings
} from '../../util/viewer'
import { getOperatorName } from '../../util/state'
import { LinkOpensNewWindow } from '../util/externalLink'
import { SortResultsDropdown } from '../util/dropdown'
import { UnstyledButton } from '../util/unstyled-button'

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

const PatternSelectButton = styled(UnstyledButton)`
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

class RouteDetails extends Component {
  static propTypes = {
    operator: PropTypes.shape({
      defaultRouteColor: PropTypes.string,
      defaultRouteTextColor: PropTypes.string,
      longNameSplitter: PropTypes.string
    }),
    // There are more items in pattern and route, but none mandatory
    patternId: PropTypes.string,
    route: PropTypes.shape({ id: PropTypes.string })
  }

  /**
   * If a headsign link is clicked, set that pattern in redux state so that the
   * view can adjust
   */
  _headSignButtonClicked = (id) => {
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
    const { intl, operator, patternId, route, setHoveredStop } = this.props
    const { agency, patterns = {}, shortName, url } = route
    const pattern = patterns[patternId]

    const routeColor = getRouteColorBasedOnSettings(operator, route)

    const headsigns = Object.entries(patterns)
      .map(([id, pat]) => ({
        geometryLength: pat.geometry?.length,
        headsign: extractHeadsignFromPattern(pat, shortName),
        id
      }))
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

    const patternSelectLabel = intl.formatMessage({
      id: 'components.RouteDetails.selectADirection'
    })
    const patternSelectName = pattern?.headsign || patternSelectLabel

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
              <LinkOpensNewWindow
                contents={
                  <FormattedMessage id="components.RouteDetails.moreDetails" />
                }
                style={{
                  color: getMostReadableTextColor(routeColor, route?.textColor)
                }}
                url={url}
              />
            )}
          </LogoLinkContainer>
        </RouteNameContainer>
        {headsigns && headsigns.length > 0 && (
          <PatternContainer>
            <HeadsignSelectLabel htmlFor="headsign-selector-label">
              <FormattedMessage id="components.RouteDetails.stopsTo" />
            </HeadsignSelectLabel>
            <SortResultsDropdown
              id="headsign-selector"
              label={patternSelectLabel}
              name={patternSelectName}
              pullRight
              style={{ color: 'black' }}
            >
              {headsigns.map((h) => (
                <li key={h.id}>
                  <PatternSelectButton
                    onClick={() => this._headSignButtonClicked(h.id)}
                    value={h.id}
                  >
                    <span>{h.headsign}</span>
                  </PatternSelectButton>
                </li>
              ))}
            </SortResultsDropdown>
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
                    name={stop.name}
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
const mapDispatchToProps = {
  setHoveredStop: uiActions.setHoveredStop,
  setViewedRoute: uiActions.setViewedRoute,
  setViewedStop: uiActions.setViewedStop
}

export default connect(null, mapDispatchToProps)(injectIntl(RouteDetails))
