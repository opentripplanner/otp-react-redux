import React, { Component } from 'react'
import PropTypes from 'prop-types'

import AccessLeg from './access-leg'
import TransitLeg from './transit-leg'
import { isTransit } from '../../../util/itinerary'

export default class ItineraryDetails extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  render () {
    const { itinerary, activeLeg, activeStep, setActiveLeg, setActiveStep } = this.props
    return (
      <div className='detail'>
        {itinerary.legs.map((leg, index) => {
          const legIsActive = activeLeg === index
          return isTransit(leg.mode)
            ? <TransitLeg
              active={legIsActive}
              index={index}
              key={index}
              leg={leg}
              setActiveLeg={setActiveLeg} />
            : <AccessLeg
              active={legIsActive}
              activeStep={activeStep}
              index={index}
              key={index}
              leg={leg}
              setActiveLeg={setActiveLeg}
              setActiveStep={setActiveStep} />
        })}
      </div>
    )
  }
}
