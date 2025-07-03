import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { Bicycle } from '@styled-icons/fa-solid/Bicycle'
import { Label as BsLabel, Button } from 'react-bootstrap'
import { Circle } from '@styled-icons/fa-solid/Circle'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { toDate } from 'date-fns-tz'
import { Wheelchair } from '@styled-icons/fa-solid/Wheelchair'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component, createRef } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as narrativeActions from '../../actions/narrative'
import * as uiActions from '../../actions/ui'
import {
  getActiveItineraries,
  getActiveSearch,
  getOperatorAndRoute
} from '../../util/state'
import { IconWithText, StyledIconWrapper } from '../util/styledIcon'
import Alert from '../util/alert'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import PageTitle from '../util/page-title'
import SpanWithSpace from '../util/span-with-space'
import Strong from '../util/strong-text'

import DepartureTime from './departure-time'
import ViewStopButton from './view-stop-button'

const { getCurrentDate } = coreUtils.time

const StopList = styled.ol`
  list-style: none;
  padding-left: 0;
`
const Stop = styled.li`
  align-items: center;
  display: flex;
`
const RouteName = styled.h2`
  font-size: inherit;
  margin: 0 0 1em 0;
`
const HeaderText = styled.h1`
  margin: 2px 0 0 0;
`
const FlexWrapper = styled.div`
  display: flex;
`

class TripViewer extends Component {
  static propTypes = {
    activeItinerary: PropTypes.object,
    activeItineraryIndex: PropTypes.number,
    findTrip: apiActions.findTrip.type,
    hideBackButton: PropTypes.bool,
    homeTimezone: PropTypes.string,
    intl: PropTypes.object,
    settingActiveItinerary: narrativeActions.settingActiveItinerary.type,
    setViewedTrip: uiActions.setViewedTrip.type,
    transitOperators: PropTypes.array,
    tripData: PropTypes.object,
    viewedTrip: PropTypes.object
  }

  firstStopRef = createRef()

  _backClicked = () => {
    this.props.setViewedTrip(null)
  }

  componentDidMount() {
    const { findTrip, viewedTrip } = this.props
    const { tripId } = viewedTrip
    findTrip({ tripId })
  }

  componentDidUpdate(prevProps) {
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
          .find((leg) => leg.tripId === tripId)
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

    const { current } = this.firstStopRef
    if (current) {
      current.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  render() {
    const { hideBackButton, homeTimezone, intl, tripData, viewedTrip } =
      this.props
    const startOfDay = toDate(getCurrentDate(homeTimezone), {
      timeZone: homeTimezone
    })
    const stopTimes = tripData?.stopTimes

    const fromIndex = stopTimes?.findIndex(
      (stopTime) => stopTime.stop.id === viewedTrip?.fromStopId
    )
    const toIndex = stopTimes?.findIndex(
      (stopTime) => stopTime.stop.id === viewedTrip?.toStopId
    )

    return (
      <div className="trip-viewer">
        <PageTitle title={this.getTitle()} />
        {/* Header Block */}
        <div className="trip-viewer-header">
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
          <HeaderText className="header-text">
            <FormattedMessage id="components.TripViewer.header" />
          </HeaderText>
          <div style={{ clear: 'both', height: '0.25ch' }} />
          {/* Basic Trip Info */}
          {tripData && (
            <div>
              <RouteName>
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
                <Alert>
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
                </Alert>
              )}

              {/* Wheelchair/bike accessibility badges, if applicable */}
              {(tripData.wheelchairAccessible === 1 ||
                tripData.bikesAllowed === 1) && (
                // eslint-disable-next-line react/jsx-indent
                <div>
                  {tripData.wheelchairAccessible === 1 && (
                    // TODO: these labels are currently insufficient for screen readers
                    <BsLabel bsStyle="primary">
                      <IconWithText Icon={Wheelchair}>
                        <FormattedMessage id="components.TripViewer.accessible" />
                      </IconWithText>
                    </BsLabel>
                  )}
                  <SpanWithSpace margin={0.25} />
                  {tripData.bikesAllowed === 1 && (
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
          <StopList
            aria-label={intl.formatMessage({
              id: 'components.TripViewer.listOfRouteStops'
            })}
          >
            {stopTimes &&
              stopTimes.map((stopTime, i) => {
                // determine whether to use special styling for first/last stop
                let stripMapLineClass = 'strip-map-line'
                if (i === 0) stripMapLineClass = 'strip-map-line-first'
                else if (i === stopTimes.length - 1) {
                  stripMapLineClass = 'strip-map-line-last'
                }

                let stopLabel = null
                let refProp = null
                if (fromIndex === i) {
                  stopLabel = (
                    <FormattedMessage id="components.TripViewer.startOfTrip" />
                  )
                  refProp = this.firstStopRef
                }
                if (toIndex === i) {
                  stopLabel = (
                    <FormattedMessage id="components.TripViewer.endOfTrip" />
                  )
                }

                // determine whether to show highlight in strip map
                let highlightClass
                if (i === fromIndex) {
                  highlightClass = 'strip-map-highlight-first'
                } else if (i > fromIndex && i < toIndex) {
                  highlightClass = 'strip-map-highlight'
                } else if (i === toIndex) {
                  highlightClass = 'strip-map-highlight-last'
                }

                return (
                  <Stop key={i}>
                    <FlexWrapper style={{ width: '80%' }}>
                      <FlexWrapper>
                        {/* the departure time */}
                        {stopLabel && (
                          <InvisibleA11yLabel>{stopLabel}</InvisibleA11yLabel>
                        )}
                        <div className="stop-time" ref={refProp}>
                          <DepartureTime
                            originDate={startOfDay}
                            stopTime={stopTime}
                          />
                        </div>
                        {/* the vertical strip map */}
                        <div className="strip-map-container">
                          {highlightClass && <div className={highlightClass} />}
                          <div className={stripMapLineClass} />
                          {/* the main stop label */}
                          <div className="strip-map-icon">
                            <StyledIconWrapper>
                              <Circle />
                            </StyledIconWrapper>
                          </div>
                        </div>
                      </FlexWrapper>
                      <div className="stop-name">{stopTime.stop.name}</div>
                    </FlexWrapper>

                    {/* the stop-viewer button */}
                    <div className="stop-button-container">
                      <ViewStopButton
                        stop={stopTime.stop}
                        text={
                          <FormattedMessage id="components.TripViewer.viewStop" />
                        }
                      />
                    </div>

                    <div style={{ clear: 'both' }} />
                  </Stop>
                )
              })}
          </StopList>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const activeSearch = getActiveSearch(state)
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
  settingActiveItinerary: narrativeActions.settingActiveItinerary,
  setViewedTrip: uiActions.setViewedTrip
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TripViewer))
