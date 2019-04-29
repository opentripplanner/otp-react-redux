import React, { Component } from 'react'
import PropTypes from 'prop-types'
import isEqual from 'lodash.isequal'

import TripDetails from '../trip-details'
import TripTools from '../trip-tools'

import PlaceRow from './place-row'

export default class ItineraryBody extends Component {
  static propTypes = {
    companies: PropTypes.string,
    itinerary: PropTypes.object,
    routingType: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.rowKey = 0
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !isEqual(this.props.companies, nextProps.companies) ||
      !isEqual(this.props.itinerary, nextProps.itinerary)
  }

  render () {
    const { itinerary, setActiveLeg, timeOptions } = this.props

    const rows = []
    let followsTransit = false
    itinerary.legs.forEach((leg, i) => {
      // Create a row containing this leg's start place and leg traversal details
      rows.push(
        <PlaceRow key={i}
          place={leg.from}
          time={leg.startTime}
          leg={leg}
          legIndex={i}
          followsTransit={followsTransit}
          {...this.props}
        />
      )
      // If this is the last leg, create a special PlaceRow for the destination only
      if (i === itinerary.legs.length - 1) {
        rows.push(<PlaceRow place={leg.to} time={leg.endTime} timeOptions={timeOptions} setActiveLeg={setActiveLeg} key={i + 1} />)
      }
      if (leg.transitLeg) followsTransit = true
    })

    return (
      <div className='itin-body'>
        {rows}
        <TripDetails itinerary={itinerary} />
        <TripTools itinerary={itinerary} />
      </div>
    )
  }
}
