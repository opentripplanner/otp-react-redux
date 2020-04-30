import coreUtils from '@opentripplanner/core-utils'
import TriMetModeIcon from '@opentripplanner/icons/lib/trimet-mode-icon'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

// TODO: make this a prop
const defaultRouteColor = '#008'

const Container = styled.div`
  display: ${() => coreUtils.ui.isMobile() ? 'table' : 'none'};
  height: 60px;
  margin-bottom: 15px;
  padding-right: 5px;
  width: 100%;
`

const Detail = styled.div`
  color: #999999;
  font-size: 13px;
`

const Details = styled.div`
  display: table-cell;
  vertical-align: top;
`

const Header = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-top: -3px;
`

const ModeIcon = styled.div`
  height: 30px;
  width: 30px;
`

const NonTransitSpacer = styled.div`
  height: 30px;
  overflow: hidden
`

const RoutePreview = styled.div`
  display: inline-block;
  margin-left: 8px;
  vertical-align: top;
`

const Routes = styled.div`
  display: table-cell;
  text-align: right;
`

const ShortName = styled.div`
  background-color: ${props => getRouteColorForBadge(props.leg)};
  border-radius: 15px;
  border: 2px solid white;
  box-shadow: 0 0 0.5em #000;
  color: white;
  font-size: 15px;
  font-weight: 500;
  height: 30px;
  margin-top: 6px;
  overflow: hidden;
  padding-top: 4px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 30px;
`

export default class ItinerarySummary extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  _onSummaryClicked = () => {
    if (typeof this.props.onClick === 'function') this.props.onClick()
  }

  render () {
    const { customIcons, itinerary, timeOptions } = this.props
    const {
      centsToString,
      maxTNCFare,
      minTNCFare,
      transitFare
    } = coreUtils.itinerary.calculateFares(itinerary)
    // TODO: support non-USD
    const minTotalFare = minTNCFare * 100 + transitFare
    const maxTotalFare = maxTNCFare * 100 + transitFare

    const { caloriesBurned } = coreUtils.itinerary.calculatePhysicalActivity(itinerary)

    return (
      <Container onClick={this._onSummaryClicked}>
        <Details>
          {/* Travel time in hrs/mins */}
          <Header>{coreUtils.time.formatDuration(itinerary.duration)}</Header>

          {/* Duration as time range */}
          <Detail>
            {coreUtils.time.formatTime(itinerary.startTime, timeOptions)} - {coreUtils.time.formatTime(itinerary.endTime, timeOptions)}
          </Detail>

          {/* Fare / Calories */}
          <Detail>
            {minTotalFare > 0 && <span>
              {centsToString(minTotalFare)}
              {minTotalFare !== maxTotalFare && <span> - {centsToString(maxTotalFare)}</span>}
              <span> &bull; </span>
            </span>}
            {Math.round(caloriesBurned)} Cals
          </Detail>

          {/* Number of transfers, if applicable */}
          {itinerary.transfers > 0 && (
            <Detail>
              {itinerary.transfers} transfer{itinerary.transfers > 1 ? 's' : ''}
            </Detail>
          )}

        </Details>
        <Routes>
          {itinerary.legs.filter(leg => {
            return !(leg.mode === 'WALK' && itinerary.transitTime > 0)
          }).map((leg, k) => {
            return (
              <RoutePreview key={k}>
                <ModeIcon>{this.getIcon(leg.mode, customIcons)}</ModeIcon>
                <ModeIcon>{getLegIcon(leg, customIcons)}</ModeIcon>
                {coreUtils.itinerary.isTransit(leg.mode)
                  ? (
                    <ShortName leg={leg} >
                      {getRouteNameForBadge(leg)}
                    </ShortName>
                  )
                  : (<NonTransitSpacer />)
                }
              </RoutePreview>
            )
          })}
        </Routes>
      </Container>
    )
  }
}

// Helper functions

function getRouteLongName (leg) {
  return leg.routes && leg.routes.length > 0
    ? leg.routes[0].longName
    : leg.routeLongName
}

function getRouteNameForBadge (leg) {
  const shortName = leg.routes && leg.routes.length > 0
    ? leg.routes[0].shortName : leg.routeShortName

  const longName = getRouteLongName(leg)

  // check for max
  if (longName && longName.toLowerCase().startsWith('max')) return null

  // check for streetcar
  if (longName && longName.startsWith('Portland Streetcar')) return longName.split('-')[1].trim().split(' ')[0]

  return shortName || longName
}

function getRouteColorForBadge (leg) {
  return leg.routeColor ? '#' + leg.routeColor : defaultRouteColor
}
