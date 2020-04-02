import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ModeIcon } from '@opentripplanner/trip-form/lib/ModeIcon' // TODO: export this to OTP-ui package root.


export default class NarrativeProfileSummary extends Component {
  static propTypes = {
    options: PropTypes.array,
    customIcons: PropTypes.object
  }

  render () {
    const { options } = this.props

    let bestTransit = 0
    let walk = 0
    let bicycle = 0
    let bicycleRent = 0

    options.forEach((option, i) => {
      if (option.transit) {
        if (option.time < bestTransit || bestTransit === 0) {
          bestTransit = option.time
        }
      } else {
        if (option.modes.length === 1 && option.modes[0] === 'bicycle') bicycle = option.time
        else if (option.modes.length === 1 && option.modes[0] === 'walk') walk = option.time
        else if (option.modes.indexOf('bicycle_rent') !== -1) bicycleRent = option.time
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
        time: bicycleRent
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
              textAlign: 'center',
              color: 'white' }}
            >
              <div style={{ height: '24px', width: '24px', display: 'inline-block', fill: 'white', marginTop: '6px', textAlign: 'center' }}>
                <ModeIcon icons={customIcons} mode={option.icon} />
              </div>
              <div style={{ fontSize: '10px', textAlign: 'center', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '2px' }}>{option.title}</div>
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
