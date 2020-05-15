import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class ItinerarySummary extends Component {
  static propTypes = {
    itinerary: PropTypes.object,
    LegIcon: PropTypes.elementType.isRequired
  }

  render () {
    const { itinerary, LegIcon } = this.props

    const blocks = []
    itinerary.legs.forEach((leg, i) => {
      // Skip mid-itinerary walk transfer legs
      if (
        i > 0 &&
        i < itinerary.legs.length - 1 &&
        !leg.transitLeg &&
        itinerary.legs[i - 1].transitLeg &&
        itinerary.legs[i + 1].transitLeg) {
        return null
      }

      // Add the mode icon
      let title = leg.mode
      if (leg.transitLeg) {
        title = leg.routeShortName
          ? `${leg.routeShortName}${leg.routeLongName ? ` - ${leg.routeLongName}` : ''}`
          : leg.routeLongName
      }
      blocks.push(
        <div title={title} key={blocks.length} className='summary-block mode-block'>
          <LegIcon leg={leg} />
        </div>
      )

      // If a transit leg, add the name (only if short name exists)
      if (leg.transitLeg && leg.routeShortName) {
        blocks.push(
          <div key={blocks.length} className='summary-block name-block'>
            <span className='route-short-name'>
              {leg.routeShortName}
            </span>
          </div>
        )
      }

      // If not the last leg, add a '►'
      if (i < itinerary.legs.length - 1) {
        blocks.push(
          <div key={blocks.length} className='summary-block arrow-block'>►</div>
        )
      }
    })

    return <div className='summary'>{blocks}</div>
  }
}
