import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import AccessLeg from './access-leg'
import TransitLeg from './transit-leg'

export default class ItineraryDetails extends Component {
  static propTypes = {
    itinerary: PropTypes.object,
    LegIcon: PropTypes.elementType.isRequired
  }

  render () {
    const { activeLeg, activeStep, itinerary, LegIcon, setActiveLeg, setActiveStep } = this.props
    return (
      <div className='detail'>
        {itinerary.legs.map((leg, index) => {
          const legIsActive = activeLeg === index
          return coreUtils.itinerary.isTransit(leg.mode)
            ? <TransitLeg
              active={legIsActive}
              index={index}
              key={index}
              leg={leg}
              LegIcon={LegIcon}
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
