import React, { Component, PropTypes } from 'react'
import { Label } from 'react-bootstrap'

import ModeIcon from './mode-icon'
import {isTransit} from '../../util/itinerary'

export default class ItinerarySummary extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  renderRoute (leg) {
    if (isTransit(leg.mode)) {
      return leg.routeShortName
        ? <Label>{leg.routeShortName}</Label>
        : leg.routeLongName
        ? <Label>{leg.routeLongName}</Label>
        : null
    } else {
      return null
    }
  }

  render () {
    const { itinerary } = this.props
    return (
      <div className='summary'>
        {itinerary.legs.map((leg, index) => {
          return (
            <span key={index}>
              <ModeIcon mode={leg.mode} />
              {this.renderRoute(leg)}
              {index < itinerary.legs.length - 1 ? ' ► ' : ''}
            </span>
          )
        })}
      </div>
    )
  }
}
