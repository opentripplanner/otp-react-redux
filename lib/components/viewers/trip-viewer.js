// FIXME: Remove this eslint rule exception.
/* eslint-disable jsx-a11y/label-has-for */
import { Button, Label } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedTime } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { findGraphQLTrip, findTrip } from '../../actions/api'
import { setLocation } from '../../actions/map'
import { setViewedTrip } from '../../actions/ui'
import Icon from '../util/icon'
import SpanWithSpace from '../util/span-with-space'
import Strong from '../util/strong-text'

import ViewStopButton from './view-stop-button'

const { getUserTimezone } = coreUtils.time

class TripViewer extends Component {
  static propTypes = {
    findGraphQLTrip: findGraphQLTrip.type,
    findTrip: findTrip.type,
    hideBackButton: PropTypes.bool,
    setViewedTrip: setViewedTrip.type,
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

  componentDidUpdate() {
    const { findGraphQLTrip, tripData, viewedTrip } = this.props
    const { tripId } = viewedTrip
    if (!tripData.route) {
      findGraphQLTrip({ tripId })
    }
  }

  render() {
    const { hideBackButton, tripData, viewedTrip } = this.props

    return (
      <div className="trip-viewer">
        {/* Header Block */}
        <div className="trip-viewer-header">
          {/* Back button */}
          {!hideBackButton && (
            <div className="back-button-container">
              <Button bsSize="small" onClick={this._backClicked}>
                <Icon type="arrow-left" />
                <FormattedMessage id="common.forms.back" />
              </Button>
            </div>
          )}

          {/* Header Text */}
          <div className="header-text">
            <FormattedMessage id="components.TripViewer.header" />
          </div>
          <div style={{ clear: 'both' }} />
        </div>

        <div className="trip-viewer-body">
          {/* Basic Trip Info */}
          {tripData && (
            <div>
              {/* Route name */}
              <div>
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
              </div>

              {/* Wheelchair/bike accessibility badges, if applicable */}
              <h4>
                {tripData.wheelchairAccessible === 1 && (
                  <Label bsStyle="primary">
                    <Icon type="wheelchair-alt" withSpace />
                    <FormattedMessage id="components.TripViewer.accessible" />
                  </Label>
                )}
                <SpanWithSpace margin={0.25} />
                {tripData.bikesAllowed === 1 && (
                  <Label bsStyle="success">
                    <Icon type="bicycle" withSpace />
                    <FormattedMessage id="components.TripViewer.bicyclesAllowed" />
                  </Label>
                )}
              </h4>
            </div>
          )}

          {/* Stop Listing */}
          {tripData &&
            tripData.stops &&
            tripData.stopTimes &&
            tripData.stops.map((stop, i) => {
              // determine whether to use special styling for first/last stop
              let stripMapLineClass = 'strip-map-line'
              if (i === 0) stripMapLineClass = 'strip-map-line-first'
              else if (i === tripData.stops.length - 1)
                stripMapLineClass = 'strip-map-line-last'

              // determine whether to show highlight in strip map
              let highlightClass
              if (i === viewedTrip.fromIndex)
                highlightClass = 'strip-map-highlight-first'
              else if (i > viewedTrip.fromIndex && i < viewedTrip.toIndex)
                highlightClass = 'strip-map-highlight'
              else if (i === viewedTrip.toIndex)
                highlightClass = 'strip-map-highlight-last'

              // Convert to unix (millisceonds) for FormattedTime
              // Use timezone to avoid spying on startOf in future tests
              const userTimezone = getUserTimezone()
              const departureMoment = moment().tz(userTimezone).startOf('day')
              departureMoment.add(tripData.stopTimes[i].scheduledDeparture, 's')
              const departureTimestamp = departureMoment.valueOf()

              return (
                <div key={i}>
                  {/* the departure time */}
                  <div className="stop-time">
                    <FormattedTime
                      timeStyle="short"
                      value={departureTimestamp}
                    />
                  </div>

                  {/* the vertical strip map */}
                  <div className="strip-map-container">
                    {highlightClass && <div className={highlightClass} />}
                    <div className={stripMapLineClass} />
                    <div className="strip-map-icon">
                      <Icon type="circle" />
                    </div>
                  </div>

                  {/* the stop-viewer button */}
                  <div className="stop-button-container">
                    <ViewStopButton
                      stopId={stop.id}
                      text={
                        <FormattedMessage id="components.TripViewer.viewStop" />
                      }
                    />
                  </div>

                  {/* the main stop label */}
                  <div className="stop-name">{stop.name}</div>

                  <div style={{ clear: 'both' }} />
                </div>
              )
            })}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const viewedTrip = state.otp.ui.viewedTrip
  return {
    tripData: state.otp.transitIndex.trips[viewedTrip.tripId],
    viewedTrip
  }
}

const mapDispatchToProps = {
  findGraphQLTrip,
  findTrip,
  setLocation,
  setViewedTrip
}

export default connect(mapStateToProps, mapDispatchToProps)(TripViewer)
