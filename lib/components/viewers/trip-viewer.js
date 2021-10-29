// FIXME: Remove this eslint rule exception.
/* eslint-disable jsx-a11y/label-has-for */
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Label } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import Icon from '../util/icon'
import SpanWithSpace from '../util/span-with-space'
import { setViewedTrip } from '../../actions/ui'
import { findTrip } from '../../actions/api'
import { setLocation } from '../../actions/map'
import Strong from '../util/strong-text'

import ViewStopButton from './view-stop-button'

class TripViewer extends Component {
  static propTypes = {
    hideBackButton: PropTypes.bool,
    tripData: PropTypes.object,
    viewedTrip: PropTypes.object
  }

  _backClicked = () => {
    this.props.setViewedTrip(null)
  }

  componentDidMount () {
    const { findTrip, viewedTrip } = this.props
    const { tripId } = viewedTrip
    findTrip({ tripId })
  }

  render () {
    const {
      hideBackButton,
      tripData,
      use24HourFormat,
      viewedTrip
    } = this.props
    const timeFormat = use24HourFormat ? 'H:mm' : 'h:mm a'

    return (
      <div className='trip-viewer'>
        {/* Header Block */}
        <div className='trip-viewer-header'>
          {/* Back button */}
          {!hideBackButton && (
            <div className='back-button-container'>
              <Button
                bsSize='small'
                onClick={this._backClicked}
              >
                <Icon type='arrow-left' />
                <FormattedMessage id='common.forms.back' />
              </Button>
            </div>
          )}

          {/* Header Text */}
          <div className='header-text'>
            <FormattedMessage id={'components.TripViewer.header'} />
          </div>
          <div style={{ clear: 'both' }} />
        </div>

        <div className='trip-viewer-body'>
          {/* Basic Trip Info */}
          {tripData && (
            <div>
              {/* Route name */}
              <div>
                <FormattedMessage
                  id='components.TripViewer.routeHeader'
                  values={{
                    routeLongName: tripData.route.longName,
                    routeShortName: tripData.route.shortName,
                    strong: Strong
                  }}
                />
              </div>

              {/* Wheelchair/bike accessibility badges, if applicable */}
              <h4>
                {tripData.wheelchairAccessible === 1 &&
                  <Label bsStyle='primary'>
                    <Icon type='wheelchair-alt' withSpace />
                    <FormattedMessage id='components.TripViewer.accessible' />
                  </Label>
                }
                <SpanWithSpace margin={0.25} />
                {tripData.bikesAllowed === 1 &&
                  <Label bsStyle='success'>
                    <Icon type='bicycle' withSpace />
                    <FormattedMessage id='components.TripViewer.bicyclesAllowed' />
                  </Label>
                }
              </h4>
            </div>
          )}

          {/* Stop Listing */}
          {tripData && tripData.stops && tripData.stopTimes && (
            tripData.stops.map((stop, i) => {
              // determine whether to use special styling for first/last stop
              let stripMapLineClass = 'strip-map-line'
              if (i === 0) stripMapLineClass = 'strip-map-line-first'
              else if (i === tripData.stops.length - 1) stripMapLineClass = 'strip-map-line-last'

              // determine whether to show highlight in strip map
              let highlightClass
              if (i === viewedTrip.fromIndex) highlightClass = 'strip-map-highlight-first'
              else if (i > viewedTrip.fromIndex && i < viewedTrip.toIndex) highlightClass = 'strip-map-highlight'
              else if (i === viewedTrip.toIndex) highlightClass = 'strip-map-highlight-last'

              return (
                <div key={i}>
                  {/* the departure time */}
                  <div className='stop-time'>
                    {coreUtils.time.formatSecondsAfterMidnight(tripData.stopTimes[i].scheduledDeparture, timeFormat)}
                  </div>

                  {/* the vertical strip map */}
                  <div className='strip-map-container'>
                    { highlightClass && <div className={highlightClass} /> }
                    <div className={stripMapLineClass} />
                    <div className='strip-map-icon'><Icon type='circle' /></div>
                  </div>

                  {/* the stop-viewer button */}
                  <div className='stop-button-container'>
                    <ViewStopButton
                      stopId={stop.id}
                      text={<FormattedMessage id='components.TripViewer.viewStop' />}
                    />
                  </div>

                  {/* the main stop label */}
                  <div className='stop-name'>
                    {stop.name}
                  </div>

                  <div style={{ clear: 'both' }} />

                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const viewedTrip = state.otp.ui.viewedTrip
  return {
    tripData: state.otp.transitIndex.trips[viewedTrip.tripId],
    use24HourFormat: state.user?.loggedInUser?.use24HourFormat ?? false,
    viewedTrip
  }
}

const mapDispatchToProps = {
  findTrip,
  setLocation,
  setViewedTrip
}

export default connect(mapStateToProps, mapDispatchToProps)(TripViewer)
