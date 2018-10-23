import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import moment from 'moment'

import { calculateFares, calculatePhysicalActivity } from '../../util/itinerary'

class TripDetails extends Component {
  render () {
    const { itinerary, companies, tnc } = this.props
    const date = moment(itinerary.startTime)

    // process the transit fare
    const { centsToString, dollarsToString, maxTNCFare, minTNCFare, transitFare } = calculateFares(itinerary, tnc, companies)

    let fare
    if (transitFare || minTNCFare) {
      fare = (
        <span>
          {transitFare && (
            <span>Transit Fare: <b>{centsToString(transitFare)}</b></span>
          )}
          {minTNCFare !== 0 && (
            <span>
              <br />
              <span style={{ textTransform: 'capitalize' }}>
                {companies.toLowerCase()}
              </span>{' '}
              Fare: <b>{dollarsToString(minTNCFare)} - {dollarsToString(maxTNCFare)}</b>
            </span>
          )}
        </span>
      )
    }

    // Compute calories burned.
    const { bikeDuration, caloriesBurned, walkDuration } = calculatePhysicalActivity(itinerary)
    return (
      <div className='trip-details'>
        <div className='trip-details-header'>Trip Details</div>
        <div className='trip-details-body'>
          <TripDetail
            icon={<i className='fa fa-calendar' />}
            summary={
              <span>
                <span>Depart <b>{date.format('MMMM DD, YYYY')}</b></span>
                {this.props.routingType === 'ITINERARY' && <span> at <b>{date.format('h:mma')}</b></span>}
              </span>
            }
          />
          {fare && (
            <TripDetail
              icon={<i className='fa fa-money' />}
              summary={fare}
            />
          )}
          {caloriesBurned > 0 && (
            <TripDetail
              icon={<i className='fa fa-heartbeat' />}
              summary={<span>Calories Burned: <b>{Math.round(caloriesBurned)}</b></span>}
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
              onClick={this._onExpandClick}
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
    routingType: state.otp.currentQuery.routingType,
    companies: state.otp.currentQuery.companies,
    tnc: state.otp.tnc
  }
}

export default connect(mapStateToProps)(TripDetails)
