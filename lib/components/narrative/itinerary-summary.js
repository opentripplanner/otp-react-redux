import React, { Component, PropTypes } from 'react'

import ModeIcon from './mode-icon'

export default class ItinerarySummary extends Component {

  static propTypes = {
    itinerary: PropTypes.object
  }
  render () {
    const { itinerary } = this.props
    return (
      <div className='summary'>
        {itinerary.legs.map((leg, index) => {
          return (
            <span key={index}>
              <ModeIcon mode={leg.mode} />
              {index < itinerary.legs.length - 1 ? ' ► ' : ''}
            </span>
          )
        })}
      </div>
    )
  }
}
