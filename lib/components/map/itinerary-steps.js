import { divIcon } from 'leaflet'
import React, {Component, PropTypes} from 'react'
import { Marker } from 'react-leaflet'

import { getStepInstructions } from '../../util/itinerary'

export default class ItinerarySteps extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }
  addItineraryStop (array, item) {
    if (item.stopId && array.indexOf(item.stopId) === -1) {
      array.push(item)
    }
  }
  render () {
    const { itinerary, activeLeg, activeStep } = this.props
    let steps = []
    itinerary.legs.map((l, legIndex) => {
      steps = [
        ...steps,
        ...l.steps.map((s, stepIndex) => {
          s.legIndex = legIndex
          s.stepIndex = stepIndex
          return s
        })
      ]
    })
    return (
      <div>
        {steps.map((step, index) => {
          if (step.relativeDirection === 'DEPART') {
            return null
          }
          const active = step.legIndex === activeLeg && step.stepIndex === activeStep
          const icon = divIcon({
            html: `<i class="fa fa-circle-o" style="${active ? 'color: #ffffff' : ''}"></i>`,
            className: ''
          })
          return (
            <Marker
              icon={icon}
              title={getStepInstructions(step)}
              position={[step.lat, step.lon]}
              key={index}
            />
          )
        })}
      </div>
    )
  }
}
