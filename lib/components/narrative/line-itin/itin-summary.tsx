import { connect } from 'react-redux'
import { FormattedMessage, FormattedNumber } from 'react-intl'
// TYPESCRIPT TODO: wait for typescripted core-utils
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import styled from 'styled-components'
import type { Itinerary, Leg, TimeOptions } from '@opentripplanner/types'

import { ComponentContext } from '../../../util/contexts'
import { getFare } from '../../../util/state'
import FormattedDuration from '../../util/formatted-duration'

// TODO: make this a prop
const defaultRouteColor = '#008'

const Container = styled.div`
  display: ${() => (coreUtils.ui.isMobile() ? 'table' : 'none')};
  height: 60px;
  margin-bottom: 15px;
  padding-right: 5px;
  width: 100%;
`

const Detail = styled.div`
  color: #676767;
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

const LegIconContainer = styled.div`
  height: 30px;
  width: 30px;
`

const NonTransitSpacer = styled.div`
  height: 30px;
  overflow: hidden;
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

const ShortName = styled.div<{ leg: Leg }>`
  background-color: ${(props) => getRouteColorForBadge(props.leg)};
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

type Props = {
  currency?: string
  defaultFareKey: string
  itinerary: Itinerary
  onClick: () => void
  timeOptions: TimeOptions
}

export class ItinerarySummary extends Component<Props> {
  static contextType = ComponentContext

  _onSummaryClicked = (): void => {
    if (typeof this.props.onClick === 'function') this.props.onClick()
  }

  render(): JSX.Element {
    const { currency, defaultFareKey, itinerary, timeOptions } = this.props
    const { LegIcon } = this.context

    const { fareCurrency, maxTNCFare, minTNCFare, transitFare } = getFare(
      itinerary,
      defaultFareKey,
      currency
    )

    const minTotalFare = minTNCFare * 100 + transitFare
    const maxTotalFare = maxTNCFare * 100 + transitFare

    const startTime = itinerary.startTime + parseInt(timeOptions?.offset || '0')
    const endTime = itinerary.endTime + parseInt(timeOptions?.offset || '0')

    const { caloriesBurned } =
      coreUtils.itinerary.calculatePhysicalActivity(itinerary)
    return (
      <Container onClick={this._onSummaryClicked}>
        <Details>
          {/* Travel time in hrs/mins */}
          <Header>
            <FormattedDuration duration={itinerary.duration} />
          </Header>

          {/* Duration as time range */}
          <Detail>
            <FormattedMessage
              id="common.time.departureArrivalTimes"
              values={{
                endTime,
                startTime
              }}
            />
          </Detail>

          {/* Fare / Calories */}
          <Detail>
            {minTotalFare > 0 && (
              <span>
                <FormattedMessage
                  id="components.ItinerarySummary.fareCost"
                  values={{
                    maxTotalFare: (
                      <FormattedNumber
                        currency={fareCurrency}
                        currencyDisplay="narrowSymbol"
                        // This isn't a "real" style prop
                        // eslint-disable-next-line react/style-prop-object
                        style="currency"
                        value={maxTotalFare / 100}
                      />
                    ),
                    minTotalFare: (
                      <FormattedNumber
                        currency={fareCurrency}
                        currencyDisplay="narrowSymbol"
                        // This isn't a "real" style prop
                        // eslint-disable-next-line react/style-prop-object
                        style="currency"
                        value={minTotalFare / 100}
                      />
                    ),
                    useMaxFare: minTotalFare !== maxTotalFare
                  }}
                />
                <span> &bull; </span>
              </span>
            )}
            <FormattedMessage
              id="common.itineraryDescriptions.calories"
              values={{ calories: Math.round(caloriesBurned) }}
            />
          </Detail>

          {/* Number of transfers, if applicable */}
          <Detail>
            <FormattedMessage
              id="common.itineraryDescriptions.transfers"
              values={{ transfers: itinerary.transfers }}
            />
          </Detail>
        </Details>
        <Routes>
          {itinerary.legs
            .filter((leg: Leg) => {
              return !(leg.mode === 'WALK' && itinerary.transitTime > 0)
            })
            .map((leg: Leg, k: number) => {
              return (
                <RoutePreview key={k}>
                  <LegIconContainer>
                    <LegIcon leg={leg} />
                  </LegIconContainer>
                  {coreUtils.itinerary.isTransit(leg.mode) ? (
                    <ShortName leg={leg}>{getRouteNameForBadge(leg)}</ShortName>
                  ) : (
                    <NonTransitSpacer />
                  )}
                </RoutePreview>
              )
            })}
        </Routes>
      </Container>
    )
  }
}

// Helper functions

// Leg is any for now until types package is updated with correct Leg type
function getRouteLongName(leg: any) {
  return leg.routes && leg.routes.length > 0
    ? leg.routes[0].longName
    : leg.routeLongName
}

function getRouteNameForBadge(leg: any) {
  const shortName =
    leg.routes && leg.routes.length > 0
      ? leg.routes[0].shortName
      : leg.routeShortName

  const longName = getRouteLongName(leg)

  // check for max
  if (longName && longName.toLowerCase().startsWith('max')) return null

  // check for streetcar
  if (longName && longName.startsWith('Portland Streetcar'))
    return longName.split('-')[1].trim().split(' ')[0]

  return shortName || longName
}

function getRouteColorForBadge(leg: Leg): string {
  return leg.routeColor ? '#' + leg.routeColor : defaultRouteColor
}

const mapStateToProps = (state: any) => {
  return {
    currency: state.otp.config.localization?.currency || 'USD',
    defaultFareKey: state.otp.config.itinerary?.defaultFareKey
  }
}

export default connect(mapStateToProps)(ItinerarySummary)
