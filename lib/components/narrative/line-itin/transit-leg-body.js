import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { VelocityTransitionGroup } from 'velocity-react'
import moment from 'moment'

import ViewTripButton from '../../viewers/view-trip-button'
import { getModeIcon } from '../../../util/itinerary'
import { formatDuration } from '../../../util/time'

// TODO: support multi-route legs for profile routing

class TransitLegBody extends Component {
  static propTypes = {
    leg: PropTypes.object,
    legIndex: PropTypes.number,
    setActiveLeg: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      alertsExpanded: false,
      stopsExpanded: false
    }
  }

  _onToggleStopsClick = () => {
    this.setState({ stopsExpanded: !this.state.stopsExpanded })
  }

  _onToggleAlertsClick = () => {
    this.setState({ alertsExpanded: !this.state.alertsExpanded })
  }

  _onSummaryClick = () => {
    this.props.setActiveLeg(this.props.legIndex, this.props.leg)
  }

  render () {
    const { customIcons, leg, operator } = this.props
    const {
      agencyBrandingUrl,
      agencyName,
      agencyUrl,
      alerts,
      mode,
      routeShortName,
      routeLongName,
      headsign
    } = leg
    const { alertsExpanded, stopsExpanded } = this.state
    // If the config contains an operator with a logo URL, prefer that over the
    // one provided by OTP (which is derived from agency.txt#agency_branding_url)
    const logoUrl = operator && operator.logo ? operator.logo : agencyBrandingUrl
    let iconMode = mode
    if (typeof customIcons.customModeForLeg === 'function') {
      const customMode = customIcons.customModeForLeg(leg)
      if (customMode) iconMode = customMode
    }

    return (
      <div className='leg-body'>
        {/* The Route Icon/Name Bar; clickable to set as active leg */}
        <div className='summary' onClick={this._onSummaryClick}>
          <div className='route-name leg-description'>
            <div>
              <div className='icon'>{getModeIcon(iconMode, customIcons)}</div>
            </div>
            {routeShortName && (
              <div>
                <span className='route-short-name'>{routeShortName}</span>
              </div>
            )}
            <div className='route-long-name'>
              {routeLongName}
              {headsign && <span> <span style={{ fontWeight: '200' }}>to</span> {headsign}</span>}
            </div>
          </div>
        </div>

        {/* Agency information */}
        {
          <div className='agency-info'>
            Service operated by{' '}
            <a href={agencyUrl} target='_blank'>
              {agencyName}{logoUrl &&
                <img
                  src={logoUrl}
                  height={25}
                  style={{ marginLeft: '5px' }} />
              }
            </a>
          </div>
        }

        {/* Alerts toggle */}
        {alerts && alerts.length > 0 && (
          <div onClick={this._onToggleAlertsClick} className='transit-alerts-toggle'>
            <i className='fa fa-exclamation-triangle' /> {alerts.length} {pluralize('alert', alerts)}
            {' '}
            <i className={`fa fa-caret-${this.state.alertsExpanded ? 'up' : 'down'}`} />
          </div>
        )}

        {/* The Alerts body, if visible */}
        <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
          {alertsExpanded && <AlertsBody alerts={leg.alerts} />}
        </VelocityTransitionGroup>
        {/* The "Ride X Min / X Stops" Row, including IntermediateStops body */}
        {leg.intermediateStops && leg.intermediateStops.length > 0 && (
          <div className='transit-leg-details'>

            {/* The header summary row, clickable to expand intermediate stops */}
            <div onClick={this._onToggleStopsClick} className='header'>
              {leg.duration && <span>Ride {formatDuration(leg.duration)}</span>}
              {leg.intermediateStops && (
                <span>
                  {' / '}
                  {leg.intermediateStops.length + 1}
                  {' stops '}
                  <i className={`fa fa-caret-${this.state.stopsExpanded ? 'up' : 'down'}`} />
                </span>
              )}

              {/* The ViewTripButton. TODO: make configurable */}
              <ViewTripButton
                tripId={leg.tripId}
                fromIndex={leg.from.stopIndex}
                toIndex={leg.to.stopIndex}
              />
            </div>
            {/* IntermediateStops expanded body */}
            <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
              {stopsExpanded ? <IntermediateStops stops={leg.intermediateStops} /> : null }
            </VelocityTransitionGroup>

            {/* Average wait details, if present */}
            {leg.averageWait && <span>Typical Wait: {formatDuration(leg.averageWait)}</span>}
          </div>
        )}
      </div>
    )
  }
}

// Connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    operator: state.otp.config.operators.find(operator => operator.id === ownProps.leg.agencyId)
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TransitLegBody)

class IntermediateStops extends Component {
  static propTypes = {
    stops: PropTypes.array
  }

  render () {
    return (
      <div className='intermediate-stops'>
        {this.props.stops.map((stop, k) => {
          return <div className='stop-row' key={k}>
            <div className='stop-marker'>&bull;</div>
            <div className='stop-name'>{stop.name}</div>
          </div>
        })}
      </div>
    )
  }
}

class AlertsBody extends Component {
  static propTypes = {
    alerts: PropTypes.array
  }

  render () {
    return (
      <div className='transit-alerts'>
        {this.props.alerts.sort((a, b) => (a.effectiveStartDate < b.effectiveStartDate) ? 1 : -1).map((alert, k) => {
          const effectiveStartDate = moment(alert.effectiveStartDate)
          let effectiveDateString = 'Effective as of '
          const daysAway = moment().diff(effectiveStartDate, 'days')
          if (Math.abs(daysAway) <= 1) effectiveDateString += moment(effectiveStartDate).format('h:MMa, ')
          effectiveDateString += effectiveStartDate.calendar(null, { sameElse: 'MMMM D, YYYY' }).split(' at')[0]
          return (
            <div key={k} className='transit-alert'>
              <div className='alert-icon'><i className='fa fa-exclamation-triangle' /></div>
              <div className='alert-body'>{alert.alertDescriptionText}</div>
              <div className='effective-date'>{effectiveDateString}</div>
            </div>
          )
        })}
      </div>
    )
  }
}

// TODO use pluralize that for internationalization (and complex plurals, i.e., not just adding 's')
function pluralize (str, list) {
  return `${str}${list.length > 1 ? 's' : ''}`
}
