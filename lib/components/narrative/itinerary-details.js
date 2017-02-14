import {Icon} from '@conveyal/woonerf'
import React, { Component, PropTypes } from 'react'

import TransitLeg from './transit-leg'
import { isTransit } from '../../util/itinerary'

export default class ItineraryDetails extends Component {

  static propTypes = {
    itinerary: PropTypes.object
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
    const { itinerary, activeLeg, activeStep } = this.props
    return (
      <div className='detail'>
        {itinerary.legs.map((leg, index) => {
          const legIsActive = activeLeg === index
          return (
            <div key={index} className={`leg${legIsActive ? ' active' : ''}`}>
              <div className='header' onClick={(e) => this._onLegClick(e, leg, index)}>
                <span><Icon type={`caret-${legIsActive ? 'down' : 'right'}`} /></span>
                {isTransit(leg.mode)
                 ? <span><b><a href={leg.agencyUrl}>{leg.agencyName}</a> {leg.routeShortName} {leg.routeLongName}</b> to {leg.headsign}</span>
                 : <span><b>{leg.mode}</b> to {leg.to.name}</span>
                }
              </div>
              <div className='step-by-step'>
                {activeLeg !== index
                  ? null
                  : isTransit(leg.mode)
                  ? <TransitLeg leg={leg} />
                  : leg.steps.map((step, index) => {
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
    )
  }
}
