import TriMetLegIcon from '@opentripplanner/icons/lib/trimet-leg-icon'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

// TODO: add the custom icons hook found in print-layout.

export default class ItinerarySummary extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  render () {
    const { itinerary } = this.props

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
      blocks.push(
        <div key={blocks.length} className='summary-block mode-block'>
          <TriMetLegIcon leg={leg} />
        </div>
      )

      // If a transit leg, add the name (preferably short; long if needed)
      if (leg.transitLeg) {
        blocks.push(
          <div key={blocks.length} className='summary-block name-block'>
            <span className='route-short-name'>
              {leg.routeShortName || leg.routeLongName}
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
