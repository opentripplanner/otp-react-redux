import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import moment from 'moment'

import { calculateFares, calculatePhysicalActivity, getTimeZoneOffset } from '../../util/itinerary'
import { mergeMessages } from '../../util/messages'
import { formatTime, getTimeFormat, getLongDateFormat } from '../../util/time'

class TripDetails extends Component {
  static defaultProps = {
    // Note: messages with default null values included here for visibility.
    // Overriding with a truthy string value will cause the expandable help
    // message to appear in trip details.
    messages: {
      at: 'at',
      caloriesBurned: 'Calories Burned',
      // FIXME: Add templated string description.
      caloriesBurnedDescription: null,
      depart: 'Depart',
      departDescription: null,
      title: 'Trip Details',
      fare: 'Fare',
      transitFare: 'Transit Fare',
      transitFareDescription: null
    }
  }

  render () {
    const { itinerary, timeFormat, longDateFormat } = this.props
    const messages = mergeMessages(TripDetails.defaultProps, this.props)
    const date = moment(itinerary.startTime)

    // process the transit fare
    const { centsToString, dollarsToString, maxTNCFare, minTNCFare, transitFare } = calculateFares(itinerary)
    let companies
    itinerary.legs.forEach(leg => {
      if (leg.tncData) {
        companies = leg.tncData.company
      }
    })
    let fare
    if (transitFare || minTNCFare) {
      fare = (
        <span>
          {transitFare && (
            <span>{messages.transitFare}: <b>{centsToString(transitFare)}</b></span>
          )}
          {minTNCFare !== 0 && (
            <span>
              <br />
              <span style={{ textTransform: 'capitalize' }}>
                {companies.toLowerCase()}
              </span>{' '}
              {messages.fare}:{' '}
              <b>{dollarsToString(minTNCFare)} - {dollarsToString(maxTNCFare)}</b>
            </span>
          )}
        </span>
      )
    }

    // Compute calories burned.
    const { bikeDuration, caloriesBurned, walkDuration } = calculatePhysicalActivity(itinerary)

    const timeOptions = {
      format: timeFormat,
      offset: getTimeZoneOffset(itinerary)
    }

    return (
      <div className='trip-details'>
        <div className='trip-details-header'>{messages.title}</div>
        <div className='trip-details-body'>
          <TripDetail
            description={messages.departDescription}
            icon={<i className='fa fa-calendar' />}
            summary={
              <span>
                <span>{messages.depart} <b>{date.format(longDateFormat)}</b></span>
                {this.props.routingType === 'ITINERARY' &&
                  <span>
                    {' '}{messages.at}{' '}
                    <b>{formatTime(itinerary.startTime, timeOptions)}</b>
                  </span>
                }
              </span>
            }
          />
          {fare && (
            <TripDetail
              description={messages.transitFareDescription}
              icon={<i className='fa fa-money' />}
              summary={fare}
            />
          )}
          {caloriesBurned > 0 && (
            <TripDetail
              icon={<i className='fa fa-heartbeat' />}
              summary={<span>{messages.caloriesBurned}: <b>{Math.round(caloriesBurned)}</b></span>}
              // FIXME: Come up with a way to replace the caloriesBurnedDescription text with
              // templated strings.
              description={
                <span>
                  Calories burned is based on <b>{Math.round(walkDuration / 60)} minute(s)</b>{' '}
                  spent walking and <b>{Math.round(bikeDuration / 60)} minute(s)</b>{' '}
                  spent biking during this trip. Adapted from{' '}
                  <a
                    href='https://health.gov/dietaryguidelines/dga2005/document/html/chapter3.htm#table4'
                    target='_blank'>
                    Dietary Guidelines for Americans 2005, page 16, Table 4
                  </a>.
                </span>
              }
            />
          )}
        </div>
      </div>
    )
  }
}

class TripDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  _toggle = () => this.state.expanded ? this._onHideClick() : this._onExpandClick()

  _onExpandClick = () => {
    this.setState({ expanded: true })
  }

  _onHideClick = () => {
    this.setState({ expanded: false })
  }

  render () {
    const { icon, summary, description } = this.props
    return (
      <div className='trip-detail'>
        <div className='icon'>{icon}</div>
        <div className='summary'>
          {summary}
          {description && (
            <Button
              className='expand-button clear-button-formatting'
              onClick={this._toggle}
            >
              <i className='fa fa-question-circle' />
            </Button>
          )}
          <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
            {this.state.expanded && (
              <div className='description'>
                <Button
                  className='hide-button clear-button-formatting'
                  onClick={this._onHideClick}
                >
                  <i className='fa fa-close' />
                </Button>
                {description}
              </div>
            )}
          </VelocityTransitionGroup>
        </div>
      </div>
    )
  }
}

// Connect main class to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    messages: state.otp.config.language.tripDetails,
    routingType: state.otp.currentQuery.routingType,
    tnc: state.otp.tnc,
    timeFormat: getTimeFormat(state.otp.config),
    longDateFormat: getLongDateFormat(state.otp.config)
  }
}

export default connect(mapStateToProps)(TripDetails)
