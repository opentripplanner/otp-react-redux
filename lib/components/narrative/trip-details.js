import React, {Component} from 'react'
import { Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import moment from 'moment'

export default class TripDetails extends Component {
  render () {
    const { itinerary } = this.props
    const date = moment(itinerary.startTime)

    // process the fare
    let fare
    if (itinerary.fare && itinerary.fare.fare && itinerary.fare.fare.regular) {
      const reg = itinerary.fare.fare.regular
      fare = reg.currency.symbol + (reg.cents / Math.pow(10, reg.currency.defaultFractionDigits)).toFixed(reg.currency.defaultFractionDigits)
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
            summary={<span>Depart <b>{date.format('MMMM DD, YYYY')}</b> at <b>{date.format('h:mma')}</b></span>}
          />
          {fare && (
            <TripDetail
              icon={<i className='fa fa-money' />}
              summary={<span>Fare: <b>{fare}</b></span>}
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
