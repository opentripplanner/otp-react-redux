import React, { Component, PropTypes } from 'react'
import Icon from '@conveyal/woonerf'

import { formatDuration, formatTime } from '../../util/time'
import { isTransit } from '../../util/itinerary'

export default class NarrativeItinerary extends Component {

  static propTypes = {
    itinerary: PropTypes.object,
    index: PropTypes.number,
    active: PropTypes.bool
  }
  constructor (props) {
    super(props)
  }
  _onHeaderClick = () => {
    if (!this.props.active) {
      this.props.setActiveItinerary(this.props.index)
    } else {
      this.props.setActiveItinerary(null)
    }
  }
  _onLegClick (e, leg, index) {
    if (index === this.props.activeLeg) {
      this.props.setActiveLeg(null)
    } else {
      this.props.setActiveLeg(index, leg)
    }
  }
  _onStepClick (e, step, index) {
    if (index === this.props.activeStep) {
      this.props.setActiveStep(null)
    } else {
      this.props.setActiveStep(index, step)
    }
  }
  render () {
    const { itinerary, index, active, activeLeg, activeStep } = this.props
    return (
      <div className='option itinerary'>
        <div
          className='header'
          onClick={this._onHeaderClick}
        >
          <span className='title'>Itinerary {index + 1}</span>{' '}
          <span className='duration'>{formatDuration(itinerary.duration)}</span>{' '}
          <span className='arrivalTime pull-right'>arrive at {formatTime(itinerary.endTime)}</span>
        </div>
        {active &&
          <div className='body'>
            <div className='summary'>
              {itinerary.legs.map((leg, index) => {
                return (
                  <span key={index}>
                    <span>{leg.mode}</span>
                    {index < itinerary.legs.length - 1 ? ' ► ' : ''}
                  </span>
                )
              })}
            </div>
            <div className='detail'>
              {itinerary.legs.map((leg, index) => {
                return (
                  <div key={index} className='leg'>
                    {
                      // <Icon type={`caret-${activeLeg === index ? 'down' : 'right'}`} />
                    }
                    <div className='header' onClick={(e) => this._onLegClick(e, leg, index)}>
                      {isTransit(leg.mode)
                       ? <span><b><a href={leg.agencyUrl}>{leg.agencyName}</a> {leg.routeShortName} {leg.routeLongName}</b> to {leg.headsign}</span>
                       : <span><b>{leg.mode}</b> to {leg.to.name}</span>
                      }
                    </div>
                    <div className='step-by-step'>
                      {activeLeg === index &&
                        leg.steps.map((step, index) => {
                          const active = activeStep === index
                          return (
                            <div key={index} className={`step ${active ? 'active' : ''}`} onClick={(e) => this._onStepClick(e, step, index)}>
                              <span>{step.relativeDirection} on {step.streetName}</span>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        }
      </div>
    )
  }
}

function getModeIcon (mode) {
  switch (mode) {
    case 'BICYCLE':
      return <span><Icon type='bicycle' /></span>
    case 'WALK':
      return <span><Icon type='male' /></span>
    default:
      return <span>{mode}</span>

  }
}
