import React, { Component, PropTypes } from 'react'

import { getModeIcon } from '../../util/itinerary'

export default class NarrativeProfileSummary extends Component {
  static propTypes = {
    options: PropTypes.array
  }

  render () {
    const { options } = this.props

    let bestTransit = 0
    let walk = 0
    let bicycle = 0
    let bicycle_rent = 0

    options.forEach((option, i) => {
      if (option.transit) {
        if (option.time < bestTransit || bestTransit === 0) {
          bestTransit = option.time
        }
      } else {
        if (option.modes.length === 1 && option.modes[0] === 'bicycle') bicycle = option.time
        else if (option.modes.length === 1 && option.modes[0] === 'walk') walk = option.time
        else if (option.modes.indexOf('bicycle_rent') !== -1) bicycle_rent = option.time
      }
    })

    const summary = [
      {
        icon: 'BUS',
        title: 'Transit',
        time: bestTransit
      }, {
        icon: 'BICYCLE',
        title: 'Bicycle',
        time: bicycle
      }, {
        icon: 'BICYCLE_RENT',
        title: 'Bikeshare',
        time: bicycle_rent
      }, {
        icon: 'WALK',
        title: 'Walk',
        time: walk
      }
    ]

    return (
      <div style={{ }}>
        {summary.map((option, k) => {
          return (
            <div key={k} style={{
              backgroundColor: option.time > 0 ? '#084C8D' : '#bbb',
              width: '22%',
              display: 'inline-block',
              verticalAlign: 'top',
              marginRight: (k < 3 ? '4%' : 0),
              padding: '3px',
              color: 'white' }}
            >
              <div style={{ height: '20px', fill: 'white', marginTop: '6px' }}>{getModeIcon(option.icon, this.props.customIcons)}</div>
              <div style={{ fontSize: '10px', textAlign: 'center', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>{option.title}</div>
              <div style={{ textAlign: 'center', marginTop: '2px', height: '30px' }}>
                {option.time > 0
                  ? <span><span style={{ fontSize: 24, fontWeight: '500' }}>{Math.round(option.time / 60)}</span> min</span>
                  : <span style={{ fontSize: '11px' }}>(Not Found)</span>
                }
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
