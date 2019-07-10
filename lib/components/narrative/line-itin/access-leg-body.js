import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { VelocityTransitionGroup } from 'velocity-react'
import currencyFormatter from 'currency-formatter'

import LegDiagramPreview from '../leg-diagram-preview'

import { distanceString } from '../../../util/distance'
import {
  getLegModeLabel,
  getLegIcon,
  getPlaceName,
  getStepDirection,
  getStepStreetName
} from '../../../util/itinerary'
import { formatDuration, formatTime } from '../../../util/time'
import { isMobile } from '../../../util/ui'

import DirectionIcon from '../../icons/direction-icon'

/**
 * Component for access (e.g. walk/bike/etc.) leg in narrative itinerary. This
 * particular component is used in the line-itin (i.e., trimet-mod-otp) version
 * of the narrative itinerary.
 */
export default class AccessLegBody extends Component {
  static propTypes = {
    leg: PropTypes.object,
    routingType: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  _onStepsHeaderClick = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  _onSummaryClick = () => {
    this.props.setActiveLeg(this.props.legIndex, this.props.leg)
  }

  render () {
    const { config, customIcons, followsTransit, leg, timeOptions } = this.props

    if (leg.mode === 'CAR' && leg.hailedCar) {
      return (
        <TNCLeg
          config={config}
          leg={leg}
          onSummaryClick={this._onSummaryClick}
          timeOptions={timeOptions}
          followsTransit={followsTransit}
          customIcons={customIcons} />
      )
    }

    return (
      <div className='leg-body'>
        <AccessLegSummary
          config={config}
          leg={leg}
          onSummaryClick={this._onSummaryClick}
          customIcons={customIcons} />

        <div onClick={this._onStepsHeaderClick} className='steps-header'>
          {formatDuration(leg.duration)}
          {leg.steps && <span> <i className={`fa fa-caret-${this.state.expanded ? 'up' : 'down'}`} /></span>}
        </div>

        {this.props.routingType === 'ITINERARY' && <LegDiagramPreview leg={leg} />}
        <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
          {this.state.expanded && <AccessLegSteps steps={leg.steps} />}
        </VelocityTransitionGroup>
      </div>
    )
  }
}

class TNCLeg extends Component {
  render () {
    // TODO: ensure that client ID fields are populated
    const {
      config,
      LYFT_CLIENT_ID,
      UBER_CLIENT_ID,
      customIcons,
      followsTransit,
      leg,
      timeOptions
    } = this.props
    const universalLinks = {
      'UBER': `https://m.uber.com/${isMobile() ? 'ul/' : ''}?client_id=${UBER_CLIENT_ID}&action=setPickup&pickup[latitude]=${leg.from.lat}&pickup[longitude]=${leg.from.lon}&pickup[formatted_address]=${encodeURI(leg.from.name)}&dropoff[latitude]=${leg.to.lat}&dropoff[longitude]=${leg.to.lon}&dropoff[formatted_address]=${encodeURI(leg.to.name)}`,
      'LYFT': `https://lyft.com/ride?id=lyft&partner=${LYFT_CLIENT_ID}&pickup[latitude]=${leg.from.lat}&pickup[longitude]=${leg.from.lon}&destination[latitude]=${leg.to.lat}&destination[longitude]=${leg.to.lon}`
    }
    const { tncData } = leg

    if (!tncData || !tncData.estimatedArrival) return null
    return (
      <div>
        <div className='place-subheader'>
          Wait {!followsTransit && <span>{Math.round(tncData.estimatedArrival / 60)} minutes </span>}for {tncData.displayName} pickup
        </div>

        <div className='leg-body'>
          {/* The icon/summary row */}
          <AccessLegSummary
            config={config}
            leg={leg}
            onSummaryClick={this.props.onSummaryClick}
            customIcons={customIcons} />

          {/* The "Book Ride" button */}
          <div style={{ marginTop: 10, marginBottom: 10, height: 32, position: 'relative' }}>
            <a
              className='btn btn-default'
              href={universalLinks[tncData.company]}
              style={{ position: 'absolute', top: 0, left: 0, height: 32, paddingTop: 4, width: 90, textAlign: 'center' }}
              target={isMobile() ? '_self' : '_blank'}
            >
              Book Ride
            </a>
            {followsTransit && <div style={{ position: 'absolute', top: 0, left: 94, width: 0, height: 0, borderTop: '16px solid transparent', borderBottom: '16px solid transparent', borderRight: '16px solid #fcf9d3' }} />}
            {followsTransit && (
              <div style={{ position: 'absolute', top: 0, left: 110, right: 0, bottom: 0 }}>
                <div style={{ display: 'table', backgroundColor: '#fcf9d3', width: '100%', height: '100%' }}>
                  <div style={{ padding: '0px 2px', display: 'table-cell', verticalAlign: 'middle', color: '#444', fontStyle: 'italic', lineHeight: 0.95 }}>
                    Wait until {formatTime(leg.startTime - tncData.estimatedArrival * 1000, timeOptions)} to book
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* The estimated travel time */}
          <div className='steps-header'>
            Estimated travel time: {formatDuration(leg.duration)} (does not account for traffic)
          </div>

          {/* The estimated travel cost */}
          {tncData.minCost &&
            <p>Estimated cost: {
              `${currencyFormatter.format(tncData.minCost, { code: tncData.currency })} - ${currencyFormatter.format(tncData.maxCost, { code: tncData.currency })}`
            }</p>
          }
        </div>
      </div>
    )
  }
}

class AccessLegSummary extends Component {
  render () {
    const { config, customIcons, leg } = this.props
    return (
      <div className='summary leg-description' onClick={this.props.onSummaryClick}>
        {/* Mode-specific icon */}
        <div><div className='icon'>{getLegIcon(leg, customIcons)}</div></div>

        {/* Leg description, e.g. "Walk 0.5 mi to..." */}
        <div>
          {getLegModeLabel(leg)}
          {' '}
          {leg.distance && <span> {distanceString(leg.distance)}</span>}
          {` to ${getPlaceName(leg.to, config.companies)}`}
        </div>
      </div>
    )
  }
}

class AccessLegSteps extends Component {
  static propTypes = {
    steps: PropTypes.array
  }

  render () {
    return (
      <div className='steps'>
        {this.props.steps.map((step, k) => {
          return <div className='step-row' key={k}>
            <div style={{ width: 16, height: 16, float: 'left', fill: '#999999' }}>
              <DirectionIcon relativeDirection={step.relativeDirection} />
            </div>

            <div style={{ marginLeft: 24, lineHeight: 1.25, paddingTop: 1 }}>
              {getStepDirection(step)}
              <span>{step.relativeDirection === 'ELEVATOR' ? ' to ' : ' on '}</span>
              <span style={{ fontWeight: 500 }}>
                {getStepStreetName(step)}
              </span>
            </div>
          </div>
        })}
      </div>
    )
  }
}
