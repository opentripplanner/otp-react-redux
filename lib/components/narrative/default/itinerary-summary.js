import React, { Component } from 'react'
import PropTypes from 'prop-types'

const modeColors = {
  BICYCLE: '#E0C3E2',
  BUS: '#CAC3DF',
  CAR: '#E4CCCC',
  PARK: '#E4CCCC',
  RAIL: '#BDDAC0',
  WALK: '#DFC486'
}
const DEFAULT_COLOR = 'grey'

function getModeColor (mode) {
  if (!mode) return DEFAULT_COLOR
  let color = modeColors[mode.toUpperCase()]
  if (typeof color === 'undefined') color = DEFAULT_COLOR
  return color
}

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
      const style = {
        margin: '0px',
        padding: '3px',
        height: '24px',
        width: '24px',
        backgroundColor: getModeColor(leg.mode)
      }
      if (i === 0) {
        style.borderTopLeftRadius = '4px'
        style.borderBottomLeftRadius = '4px'
      }
      if (i === itinerary.legs.length - 1) {
        style.borderTopRightRadius = '4px'
        style.borderBottomRightRadius = '4px'
      }
      blocks.push(
        <div
          style={style}
          title={title}
          key={blocks.length}
          className='summary-block mode-block'
        >
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
    })

    return <div className='summary'>{blocks}</div>
  }
}
