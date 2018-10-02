import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import moment from 'moment'

import { getTNCLocation } from '../../util/itinerary'

const defaultTncRideTypes = {
  'LYFT': 'lyft',
  'UBER': 'a6eef2e1-c99a-436f-bde9-fefb9181c0b0'
}

class TripDetails extends Component {
  render () {
    const { itinerary, companies, tnc } = this.props
    const date = moment(itinerary.startTime)

    // process the transit fare
    let transitFare
    if (itinerary.fare && itinerary.fare.fare && itinerary.fare.fare.regular) {
      const reg = itinerary.fare.fare.regular
      transitFare = reg.currency.symbol + (reg.cents / Math.pow(10, reg.currency.defaultFractionDigits)).toFixed(reg.currency.defaultFractionDigits)
    }

    // Process any TNC fares
    let minTNCFare = 0
    let maxTNCFare = 0
    if (tnc) {
      for (const leg of itinerary.legs) {
        if (leg.mode === 'CAR' && leg.hailedCar) {
          const from = getTNCLocation(leg, 'from')
          const to = getTNCLocation(leg, 'to')
          if (tnc && tnc.rideEstimates && tnc.rideEstimates[from] && tnc.rideEstimates[from][to] && tnc.rideEstimates[from][to][companies]) {
            const estimate = tnc.rideEstimates[from][to][companies][defaultTncRideTypes[companies]]
            // TODO: Support non-USD
            minTNCFare += estimate.minCost
            maxTNCFare += estimate.maxCost
          }
        }
      }
      if (minTNCFare) minTNCFare = '$' + minTNCFare.toFixed(2)
      if (maxTNCFare) maxTNCFare = '$' + maxTNCFare.toFixed(2)
    }

    let fare
    if (transitFare || minTNCFare) {
      fare = (
        <span>
          {transitFare && (
            <span>Transit Fare: <b>{transitFare}</b></span>
          )}
          {minTNCFare !== 0 && (
            <span>
              <br />
              <span style={{ textTransform: 'capitalize' }}>{companies.toLowerCase()}</span> Fare: <b>{minTNCFare} - {maxTNCFare}</b>
            </span>
          )}
        </span>
      )
    }

    // compute calories burned
    let walkDuration = 0
    let bikeDuration = 0
    for (const leg of itinerary.legs) {
      if (leg.mode.startsWith('WALK')) walkDuration += leg.duration
      if (leg.mode.startsWith('BICYCLE')) bikeDuration += leg.duration
    }
    const caloriesBurned =
      walkDuration / 3600 * 280 +
      bikeDuration / 3600 * 290

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
              description={<span>Calories burned is based on <b>{Math.round(walkDuration / 60)} minute(s)</b> spent walking and <b>{Math.round(bikeDuration / 60)} minute(s)</b> spent biking during this trip. Adapted from <a href='https://health.gov/dietaryguidelines/dga2005/document/html/chapter3.htm#table4' target='_blank'>Dietary Guidelines for Americans 2005, page 16, Table 4</a>.</span>}
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
