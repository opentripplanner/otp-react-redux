/* eslint-disable react/jsx-indent */
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
import React, { Component } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../actions/api'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import { getOperatorAndRoute } from '../../util/state'
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
    findTrip: apiActions.findTrip.type,
    hideBackButton: PropTypes.bool,
    homeTimezone: PropTypes.string,
    intl: PropTypes.object,
    setViewedTrip: uiActions.setViewedTrip.type,
    transitOperators: PropTypes.array,
    tripData: PropTypes.object,
    viewedTrip: PropTypes.object
  }

  _backClicked = () => {
    this.props.setViewedTrip(null)
  }

  componentDidMount() {
    const { findTrip, viewedTrip } = this.props
    const { tripId } = viewedTrip
    findTrip({ tripId })
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
          <div style={{ clear: 'both' }} />
        </div>

        <div className="trip-viewer-body">
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

              {viewedTrip?.fromIndex && (
                <Alert>
                  <FormattedMessage
                    id="components.TripViewer.tripDescription"
                    values={{
                      boardAtStop: (
                        <strong>
                          {tripData.stops?.[viewedTrip?.fromIndex]?.name}
                        </strong>
                      ),
                      disembarkAtStop: (
                        <strong>
                          {tripData.stops?.[viewedTrip?.toIndex]?.name}
                        </strong>
                      )
                    }}
                  />
                </Alert>
              )}

              {/* Wheelchair/bike accessibility badges, if applicable */}
              {(tripData.wheelchairAccessible === 1 ||
                tripData.bikesAllowed === 1) && (
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
                    <BsLabel bsStyle="success">
                      <IconWithText Icon={Bicycle}>
                        <FormattedMessage id="components.TripViewer.bicyclesAllowed" />
                      </IconWithText>
                    </BsLabel>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stop Listing */}
          <StopList
            aria-label={intl.formatMessage({
              id: 'components.TripViewer.listOfRouteStops'
            })}
          >
            {tripData &&
              tripData.stops &&
              tripData.stopTimes &&
              tripData.stops.map((stop, i) => {
                // determine whether to use special styling for first/last stop
                let stripMapLineClass = 'strip-map-line'
                if (i === 0) stripMapLineClass = 'strip-map-line-first'
                else if (i === tripData.stops.length - 1) {
                  stripMapLineClass = 'strip-map-line-last'
                }

                let stopLabel = null
                if (viewedTrip?.fromIndex === i) {
                  stopLabel = (
                    <FormattedMessage id="components.TripViewer.startOfTrip" />
                  )
                }
                if (viewedTrip?.toIndex === i) {
                  stopLabel = (
                    <FormattedMessage id="components.TripViewer.endOfTrip" />
                  )
                }

                // determine whether to show highlight in strip map
                let highlightClass
                if (i === viewedTrip?.fromIndex) {
                  highlightClass = 'strip-map-highlight-first'
                } else if (
                  i > viewedTrip?.fromIndex &&
                  i < viewedTrip.toIndex
                ) {
                  highlightClass = 'strip-map-highlight'
                } else if (i === viewedTrip?.toIndex) {
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
                        <div className="stop-time">
                          <DepartureTime
                            originDate={startOfDay}
                            stopTime={tripData.stopTimes[i]}
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
                      <div className="stop-name">{stop.name}</div>
                    </FlexWrapper>

                    {/* the stop-viewer button */}
                    <div className="stop-button-container">
                      <ViewStopButton
                        stopId={stop.id}
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
  const viewedTrip = state.otp.ui.viewedTrip
  return {
    homeTimezone: state.otp.config.homeTimezone,
    transitOperators: state.otp.config.transitOperators,
    tripData: state.otp.transitIndex.trips[viewedTrip.tripId],
    viewedTrip
  }
}

const mapDispatchToProps = {
  findTrip: apiActions.findTrip,
  setLocation: mapActions.setLocation,
  setViewedTrip: uiActions.setViewedTrip
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TripViewer))
