import React, { Component, PropTypes } from 'react'

import { formatDuration } from '../../util/time'

export default class NarrativeItinerary extends Component {

  static propTypes = {
    itinerary: PropTypes.object,
    index: PropTypes.number
  }

  render () {
    const itin = this.props.itinerary
    return (
      <div className='option itinerary'>
        <div className='header'>
          <span className='title'>Itinerary {this.props.index + 1}</span>:&nbsp;
          <span className='duration'>{formatDuration(itin.duration)}</span>
        </div>

        <div className='summary'>
          {itin.legs.map((leg, index) => {
            return (
              <span key={index}>
                {leg.mode}
                {index < itin.legs.length - 1 ? ' ► ' : ''}
              </span>
            )
          })}
        </div>

        {itin.legs.map((leg, index) => {
          return (
            <div key={index} className='leg'>{isTransit(leg.mode)
             ? <span><b><a href={leg.agencyUrl}>{leg.agencyName}</a> {leg.routeShortName} {leg.routeLongName}</b> to {leg.headsign}</span>
             : <span><b>{leg.mode}</b> to {leg.to.name}</span>
            }</div>
          )
        })}
      </div>
    )
  }
}

function isTransit (mode) {
  const transitModes = ['TRAM', 'BUS']
  return transitModes.indexOf(mode) !== -1
}
