import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import moment from 'moment'
import { VelocityTransitionGroup } from 'velocity-react'

import Icon from '../narrative/icon'
import LocationIcon from '../icons/location-icon'

import { clearViewedStop } from '../../actions/ui'
import { findStop } from '../../actions/api'
import { setLocation } from '../../actions/map'
import { formatDuration, formatStopTime } from '../../util/time'
import { routeComparator } from '../../util/itinerary'

class StopViewer extends Component {
  static propTypes = {
    hideBackButton: PropTypes.boolean,
    stopData: PropTypes.object,
    viewedStop: PropTypes.object
  }

  _backClicked = () => {
    this.props.clearViewedStop()
  }

  _setLocationFromStop = (type) => {
    const { setLocation, stopData } = this.props
    const location = {
      name: stopData.name,
      lat: stopData.lat,
      lon: stopData.lon
    }
    setLocation({type, location, reverseGeocode: true})
    this.setState({popupPosition: null})
  }

  _onClickPlanTo = () => this._setLocationFromStop('to')

  _onClickPlanFrom = () => this._setLocationFromStop('from')

  // load the viewed stop in the store when the Stop Viewer first mounts
  componentWillMount () {
    this.props.findStop({stopId: this.props.viewedStop.stopId})
  }

  // refresh the stop in the store if the viewed stop changes w/ the
  // Stop Viewer already mounted
  componentWillReceiveProps (nextProps) {
    if (
      this.props.viewedStop &&
      nextProps.viewedStop &&
      this.props.viewedStop.stopId !== nextProps.viewedStop.stopId
    ) {
      this.props.findStop({stopId: nextProps.viewedStop.stopId})
    }
  }

  render () {
    const { stopData, hideBackButton } = this.props

    // Rewrite stop ID to not include Agency prefix, if present
    // TODO: make this functionality configurable?
    let stopId
    if(stopData && stopData.id) {
      stopId = stopData.id.includes(':') ? stopData.id.split(':')[1] : stopData.id
    }

    // construct a lookup table mapping routeId (e.g. 'MyAgency:10') to an array of stoptimes
    const stopTimesByRoute = {}
    if (stopData && stopData.routes && stopData.stopTimes) {
      stopData.stopTimes.forEach(patternTimes => {
        const routeId = patternTimes.pattern.id.split(':')[0] + ':' + patternTimes.pattern.id.split(':')[1]
        if (!(routeId in stopTimesByRoute)) stopTimesByRoute[routeId] = []

        const now = moment().diff(moment().startOf('day'), 'seconds')
        const filteredTimes = patternTimes.times.filter(stopTime => {
          const diff = stopTime.realtimeDeparture - now
          return diff >= 0 && diff < 14400
        })
        stopTimesByRoute[routeId] = stopTimesByRoute[routeId].concat(filteredTimes)
      })
    }

    return (
      <div className='stop-viewer'>
        {/* Header Block */}
        <div className='stop-viewer-header'>
          {/* Back button */}
          {!hideBackButton && (
            <div className='back-button-container'>
              <Button
                bsSize='small'
                onClick={this._backClicked}
              ><Icon type='arrow-left' />Back</Button>
            </div>
          )}

          {/* Header Text */}
          <div className='header-text'>
            {stopData
              ? <span>{stopData.name}</span>
              : <span>Loading Stop..</span>
            }
          </div>
          <div style={{ clear: 'both' }} />
        </div>

        {stopData && (
          <div className='stop-viewer-body'>
            {/* plan trip from/to here buttons. TODO: Can this be combined w/ SetFromToButtons? */}
            <div>
              <div><b>Stop ID</b>: {stopId}</div>
              <b>Plan a trip:</b>{' '}
              <LocationIcon type='from' />{' '}
              <button className='link-button'
                onClick={this._onClickPlanFrom}>
                From here
              </button>{' '}|{' '}
              <LocationIcon type='to' />{' '}
              <button className='link-button'
                onClick={this._onClickPlanTo}>
                To here
              </button>
            </div>

            {/* route listing */}
            {stopData.routes && (
              <div style={{ marginTop: 20 }}>
                {stopData.routes.sort(routeComparator).map(route => {
                  return (
                    <RouteRow
                      route={route}
                      stopTimes={stopTimesByRoute[route.id]}
                      key={route.id}
                    />
                  )
                })}
              </div>
            )}

            {/* Future: add stop details */}
          </div>
        )}
      </div>
    )
  }
}

class RouteRow extends Component {
  constructor () {
    super()
    this.state = { expanded: false }
  }

  _toggleExpandedView = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  render () {
    const { route, stopTimes } = this.props

    // sort stop times by next departure
    let sortedStopTimes = null
    if (stopTimes) {
      sortedStopTimes = stopTimes.sort((a, b) => {
        if (a.realtimeDeparture < b.realtimeDeparture) return -1
        if (a.realtimeDeparture > b.realtimeDeparture) return 1
        return 0
      })
    }

    return (
      <div className='route-row'>
        {/* header row */}
        <div className='header'>
          {/* route name */}
          <div className='route-name'>
            <b>{route.shortName}</b> {route.longName}
          </div>

          {/* next departure preview */}
          {stopTimes && stopTimes.length > 0 && (
            <div className='next-trip-preview'>
              {getFormattedStopTime(sortedStopTimes[0])}
            </div>
          )}

          {/* expansion chevron button */}
          <div className='expansion-button-container'>
            <button className='expansion-button' onClick={this._toggleExpandedView}>
              <Icon type={`chevron-${this.state.expanded ? 'up' : 'down'}`} />
            </button>
          </div>
        </div>

        {/* expanded view */}
        <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
          {this.state.expanded && (
            <div className='trip-table'>
              {/* trips table header row */}
              <div className='trip-table-header-row'>
                <div className='trip-table-column-header'>STATUS</div>
                <div className='trip-table-column-header'>DEPARTURE</div>
                <div style={{ clear: 'both ' }} />
              </div>

              {/* list of upcoming trips */}
              {stopTimes && (
                sortedStopTimes.map((stopTime, i) => {
                  return (
                    <div className='trip-row' style={{ marginTop: 6, fontSize: 14 }} key={i}>
                      <div style={{ float: 'right', width: 80 }}>
                        {stopTime.realtimeState === 'UPDATED'
                          ? getStatusLabel(stopTime.departureDelay)
                          : <div className='status-label' style={{ backgroundColor: '#bbb' }}>Scheduled</div>
                        }
                      </div>

                      <div style={{ float: 'right', width: 80 }}>
                        {getFormattedStopTime(stopTime)}
                      </div>

                      <div key={i}>
                        To {stopTime.headsign}
                      </div>

                      <div style={{ clear: 'both ' }} />
                    </div>
                  )
                })
              )}
            </div>
          )}
        </VelocityTransitionGroup>
      </div>
    )
  }
}

// helper method to generate stop time w/ status icon
function getFormattedStopTime (stopTime) {
  return (
    <span>
      {stopTime.realtimeState === 'UPDATED'
        ? <Icon type='rss' style={{ color: '#888', fontSize: '0.8em', marginRight: 2 }} />
        : <Icon type='clock-o' style={{ color: '#888', fontSize: '0.8em', marginRight: 2 }} />
      }
      {formatStopTime(stopTime.realtimeDeparture)}
    </span>
  )
}

// helper method to generate status label
function getStatusLabel (delay) {
  // late departure
  if (delay > 60) {
    return (
      <div className='status-label' style={{ backgroundColor: '#d9534f' }}>
        {formatDuration(delay)} Late
      </div>
    )
  }

  // early departure
  if (delay < -60) {
    return (
      <div className='status-label' style={{ backgroundColor: '#337ab7' }}>
        {formatDuration(Math.abs(delay))} Early
      </div>
    )
  }

  // on-time departure
  return (
    <div className='status-label' style={{ backgroundColor: '#5cb85c' }}>
      On Time
    </div>
  )
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    viewedStop: state.otp.ui.viewedStop,
    stopData: state.otp.transitIndex.stops[state.otp.ui.viewedStop.stopId]
  }
}

const mapDispatchToProps = {
  clearViewedStop,
  findStop,
  setLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(StopViewer)
