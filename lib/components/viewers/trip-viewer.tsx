import { Alert } from '@opentripplanner/building-blocks'
import { Bicycle } from '@styled-icons/fa-solid/Bicycle'
import { Label as BsLabel } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { Wheelchair } from '@styled-icons/fa-solid/Wheelchair'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as narrativeActions from '../../actions/narrative'
import * as uiActions from '../../actions/ui'
import {
  getActiveItineraries,
  getActiveSearch,
  getOperatorAndRoute
} from '../../util/state'
import { IconWithText } from '../util/styledIcon'
import { Leg, TransitOperator } from '@opentripplanner/types'
import BackButton from '../util/back-button'
import PageTitle from '../util/page-title'
import SpanWithSpace from '../util/span-with-space'
import Strong from '../util/strong-text'

import StopList from './stop-list'

const AlertContainer = styled.div`
  margin: 1em 0;
  span {
    font-weight: 400;
  }
`
const RouteName = styled.h2`
  font-size: inherit;
  margin: 1em 0;
`
const HeaderText = styled.h1`
  margin: 2px 0 0 0;
`

interface Props {
  activeItinerary: any
  activeItineraryIndex: number
  findTrip: any
  hideHeader: boolean
  homeTimezone: string
  intl: IntlShape
  setMainPanelContent: (content: number | null) => void
  setViewedStop: (payload: { stopId: string } | null) => void
  setViewedTrip: (payload: any) => void
  settingActiveItinerary: (payload: { index: number } | null) => void
  transitOperators: TransitOperator[]
  tripData: any
  viewedTrip: any
}

class TripViewer extends Component<Props> {
  _backClicked = () => {
    this.props.setViewedTrip(null)
    this.props.setMainPanelContent(null)
  }

  componentDidMount() {
    const { findTrip, viewedTrip } = this.props
    const { tripId } = viewedTrip
    findTrip({ tripId })
  }

  componentDidUpdate(prevProps: Props) {
    const {
      activeItinerary,
      activeItineraryIndex,
      settingActiveItinerary,
      viewedTrip
    } = this.props
    const { fromStopId, toStopId, tripId } = viewedTrip
    // If any of the transit legs of the active itinerary match the viewed trip id,
    // then update the viewedTrip object with the start and ending stops.
    if (!fromStopId || !toStopId) {
      if (!activeItinerary) {
        // We only need to set the redux state without the other side effects brought by setActiveItinerary.
        settingActiveItinerary({ index: activeItineraryIndex })
      } else {
        const matchingLeg = activeItinerary.legs
          ?.filter(coreUtils.itinerary.isTransitLeg)
          .find((leg: Leg) => leg.tripId === tripId)
        this.props.setViewedTrip({
          fromStopId: matchingLeg.from?.stopId,
          toStopId: matchingLeg.to?.stopId,
          tripId
        })
      }
    } else if (!activeItinerary && prevProps.activeItinerary) {
      // This block gets called after the user is set and a new routing query is run.
      // During that time, the active itinerary will revert to falsy, so we unset the
      // from state until that new itinerary is available and we get the matching leg above.
      this.props.setViewedTrip({
        // Must include the nulls to overwrite those fields.
        fromStopId: null,
        toStopId: null,
        tripId
      })
    }
  }

  /**
   * Gets a breadcrumbs-like text of format (Trip Viewer - <operator> <route>)
   */
  getTitle = () => {
    const { intl, transitOperators, tripData } = this.props
    return [
      intl.formatMessage({ id: 'components.TripViewer.header' }),
      tripData?.route &&
        getOperatorAndRoute(tripData.route, transitOperators, intl)
    ]
  }

  // eslint-disable-next-line complexity
  render() {
    const {
      hideHeader,
      homeTimezone,
      intl,
      setViewedStop,
      tripData,
      viewedTrip
    } = this.props
    const stopTimes = tripData?.stopTimes

    const fromIndex = stopTimes?.findIndex(
      (stopTime: any) => stopTime.stop.id === viewedTrip?.fromStopId
    )
    const toIndex = stopTimes?.findIndex(
      (stopTime: any) => stopTime.stop.id === viewedTrip?.toStopId
    )

    const bikesAreAllowed = tripData?.bikesAllowed === 'ALLOWED'
    const wheelchairsAreAllowed = tripData?.wheelchairAccessible === 'POSSIBLE'

    return (
      <div className="trip-viewer">
        <PageTitle title={this.getTitle()} />
        {/* Header Block */}
        <div className="trip-viewer-header">
          <div
            className="header-with-back-button"
            style={{ float: hideHeader ? 'left' : undefined }}
          >
            <BackButton
              backButtonText={intl.formatMessage({
                id: 'common.forms.back'
              })}
              onClick={this._backClicked}
            />
            {/* Header Text */}
            {!hideHeader && (
              <HeaderText className="header-text">
                <FormattedMessage id="components.TripViewer.header" />
              </HeaderText>
            )}
          </div>
          {/* Basic Trip Info */}
          {tripData && (
            <div>
              <RouteName
                style={{ margin: hideHeader ? '.25em 0 1em 3em' : 'auto' }}
              >
                {tripData.route && (
                  <FormattedMessage
                    id="components.TripViewer.routeHeader"
                    values={{
                      routeLongName: tripData.route.longName,
                      routeShortName: tripData.route.shortName,
                      strong: Strong
                    }}
                  />
                )}
              </RouteName>

              {/* TODO: In Trip Description, add links to the stop in the list of stops so when navigating by 
              screenreader or keyboard nav, the departure, arrival, and stop viewer links 
              are all accessible without having to go through all the stops not on the trip. */}

              {fromIndex > -1 && (
                <AlertContainer>
                  <Alert
                    alertHeader={
                      <FormattedMessage
                        id="components.TripViewer.tripDescription"
                        values={{
                          boardAtStop: (
                            <strong>{stopTimes?.[fromIndex]?.stop.name}</strong>
                          ),
                          disembarkAtStop: (
                            <strong>{stopTimes?.[toIndex]?.stop.name}</strong>
                          )
                        }}
                      />
                    }
                  />
                </AlertContainer>
              )}

              {/* Wheelchair/bike accessibility badges, if applicable */}
              {(wheelchairsAreAllowed || bikesAreAllowed) && (
                // eslint-disable-next-line react/jsx-indent
                <div>
                  {wheelchairsAreAllowed && (
                    // TODO: these labels are currently insufficient for screen readers
                    <BsLabel bsStyle="primary">
                      <IconWithText Icon={Wheelchair}>
                        <FormattedMessage id="components.TripViewer.accessible" />
                      </IconWithText>
                    </BsLabel>
                  )}
                  <SpanWithSpace margin={0.25} />
                  {bikesAreAllowed && (
                    // Bootstrap's default green ('success') does not pass a11y contrast checks
                    <BsLabel style={{ background: 'green' }}>
                      <IconWithText Icon={Bicycle}>
                        <FormattedMessage id="components.TripViewer.bicyclesAllowed" />
                      </IconWithText>
                    </BsLabel>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="trip-viewer-body">
          {/* Stop Listing */}
          {tripData && (
            <StopList
              fromIndex={fromIndex}
              homeTimezone={homeTimezone}
              routeColor={`#${tripData?.route?.color}`}
              routePattern={stopTimes}
              stopLinkClicked={setViewedStop}
              toIndex={toIndex}
            />
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: any) => {
  const activeSearch: any = getActiveSearch(state)
  const pending = activeSearch?.pending
  const activeItineraryIndex = Number.parseInt(
    coreUtils.query.getUrlParams().ui_activeItinerary
  )
  const itineraries = getActiveItineraries(state) || []
  const viewedTrip = state.otp.ui.viewedTrip

  return {
    activeItinerary: !pending && itineraries[activeItineraryIndex],
    activeItineraryIndex,
    homeTimezone: state.otp.config.homeTimezone,
    transitOperators: state.otp.config.transitOperators,
    tripData: state.otp.transitIndex.trips[viewedTrip.tripId],
    viewedTrip
  }
}

const mapDispatchToProps = {
  findTrip: apiActions.findTrip,
  setMainPanelContent: uiActions.setMainPanelContent,
  settingActiveItinerary: narrativeActions.settingActiveItinerary,
  setViewedStop: uiActions.setViewedStop,
  setViewedTrip: uiActions.setViewedTrip
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TripViewer))
